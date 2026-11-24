// Pure helpers for the community blocklist. Used by count-reports.mjs (GitHub Action) and tests.

export const MIN_REPORTS = 3;
export const MIN_ACCOUNT_AGE_DAYS = 30;
const KEY = /^(id:UC[\w-]{10,}|h:@[^\s]{1,100}|n:.{1,100})$/;

/** Reads the fields of a GitHub issue-form body ("### Label\n\nvalue"). */
export function parseIssueForm(body) {
  const fields = {};
  const parts = (body ?? '').split(/^###\s+/m).slice(1);
  for (const part of parts) {
    const [label, ...rest] = part.split('\n');
    const value = rest.join('\n').trim();
    fields[label.trim().toLowerCase()] = value === '_No response_' ? '' : value;
  }
  return fields;
}

export function reportFromIssue(issue) {
  const f = parseIssueForm(issue.body);
  const key = (f['channel key'] ?? '').trim();
  if (!KEY.test(key)) return null;
  return {
    key: key.startsWith('n:') || key.startsWith('h:') ? key.toLowerCase() : key,
    name: (f['channel name'] ?? '').trim().slice(0, 100) || key,
    author: issue.user?.login ?? '',
    issue: issue.number,
  };
}

export function isOldEnough(createdAt, now = Date.now()) {
  return now - new Date(createdAt).getTime() >= MIN_ACCOUNT_AGE_DAYS * 86400000;
}

/**
 * Counts independent reporters per channel and returns the new blocklist, or
 * null when nothing changed. Channels already listed keep their entry.
 */
export function buildBlocklist(current, reports, now = new Date()) {
  const byKey = new Map();
  for (const r of reports) {
    if (!r || !r.author) continue;
    const entry = byKey.get(r.key) ?? { name: r.name, authors: new Set() };
    entry.authors.add(r.author);
    byKey.set(r.key, entry);
  }
  const channels = new Map(current.channels.map((c) => [c.key, { ...c }]));
  let changed = false;
  for (const [key, { name, authors }] of byKey) {
    const existing = channels.get(key);
    if (existing) {
      if (authors.size > existing.reports) {
        existing.reports = authors.size;
        changed = true;
      }
    } else if (authors.size >= MIN_REPORTS) {
      channels.set(key, { key, name, reports: authors.size });
      changed = true;
    }
  }
  if (!changed) return null;
  return {
    version: current.version + 1,
    updatedAt: now.toISOString(),
    channels: [...channels.values()].sort((a, b) => a.key.localeCompare(b.key)),
  };
}
