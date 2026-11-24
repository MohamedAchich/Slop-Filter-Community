// Run by .github/workflows/count-reports.yml. Reads open "ai-report" issues,
// counts independent reporters per channel and updates site/blocklist.json.
// The workflow then opens a pull request for the maintainer to review.
import { readFile, writeFile } from 'node:fs/promises';
import { buildBlocklist, isOldEnough, reportFromIssue } from './blocklist-lib.mjs';

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const file = new URL('../site/blocklist.json', import.meta.url);

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}`);
  return res.json();
}

const issues = [];
for (let page = 1; page <= 20; page++) {
  const batch = await gh(`/repos/${repo}/issues?labels=ai-report&state=open&per_page=100&page=${page}`);
  issues.push(...batch.filter((i) => !i.pull_request));
  if (batch.length < 100) break;
}

const ageCache = new Map();
const reports = [];
for (const issue of issues) {
  const r = reportFromIssue(issue);
  if (!r) continue;
  if (!ageCache.has(r.author)) {
    const user = await gh(`/users/${encodeURIComponent(r.author)}`);
    ageCache.set(r.author, isOldEnough(user.created_at));
  }
  if (ageCache.get(r.author)) reports.push(r);
}

const current = JSON.parse(await readFile(file, 'utf8'));
const next = buildBlocklist(current, reports);
if (next) {
  await writeFile(file, JSON.stringify(next, null, 2) + '\n');
  console.log(`Blocklist updated to version ${next.version}: ${next.channels.length} channels.`);
} else {
  console.log(`No change. ${reports.length} valid reports in ${issues.length} open issues.`);
}
