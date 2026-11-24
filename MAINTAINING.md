# Maintaining

- Edit files here and push to `main`. `site/` is published to GitHub Pages automatically.
- **Count AI channel reports** runs daily and opens a pull request when a channel reaches 3 reporters.
  Review each channel before merging: merging publishes it to every Pro user within 12 hours.
- Disputes (`dispute` label): if a listed channel is not AI, remove it from `site/blocklist.json`,
  increase `version` by 1, and update `updatedAt`.
- Tests: `node --test scripts/*.test.mjs`
