// Run with: node --test scripts/*.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildBlocklist, isOldEnough, parseIssueForm, reportFromIssue } from './blocklist-lib.mjs';

const body = (key, name = 'Prompt History') =>
  `### Channel key\n\n${key}\n\n### Channel name\n\n${name}\n\n### Example video\n\n_No response_\n`;
const issue = (n, author, key = 'h:@prompthistory') => ({ number: n, user: { login: author }, body: body(key) });

test('parses GitHub issue-form bodies', () => {
  assert.deepEqual(parseIssueForm(body('h:@x')), { 'channel key': 'h:@x', 'channel name': 'Prompt History', 'example video': '' });
});

test('rejects malformed channel keys', () => {
  assert.equal(reportFromIssue(issue(1, 'a', 'javascript:alert(1)')), null);
  assert.equal(reportFromIssue(issue(1, 'a', 'h:@PromptHistory'))?.key, 'h:@prompthistory');
});

test('adds a channel only after 3 different people report it', () => {
  const empty = { version: 1, updatedAt: '', channels: [] };
  const two = [issue(1, 'a'), issue(2, 'b'), issue(3, 'b')].map(reportFromIssue);
  assert.equal(buildBlocklist(empty, two), null);
  const three = [...two, reportFromIssue(issue(4, 'c'))];
  assert.deepEqual(buildBlocklist(empty, three, new Date('2026-11-23T00:00:00Z')), {
    version: 2,
    updatedAt: '2026-11-23T00:00:00.000Z',
    channels: [{ key: 'h:@prompthistory', name: 'Prompt History', reports: 3 }],
  });
});

test('ignores brand-new GitHub accounts', () => {
  const now = Date.parse('2026-11-23');
  assert.equal(isOldEnough('2026-11-01', now), false);
  assert.equal(isOldEnough('2026-09-01', now), true);
});
