# Slop Filter Community

Public home of [Slop Filter](https://mohamedachich.github.io/Slop-Filter-Community/), a browser extension that hides AI-generated videos on YouTube.

- **Report an AI channel:** [open a report](../../issues/new?template=report-ai-channel.yml). A channel joins the shared list after 3 different people report it and a maintainer reviews it.
- **A channel isn't AI?** [Tell us](../../issues/new?template=dispute.yml).
- **The shared list:** [`site/blocklist.json`](site/blocklist.json), published at `https://mohamedachich.github.io/Slop-Filter-Community/blocklist.json`.
- **Privacy policy:** [`site/privacy.html`](site/privacy.html)

## For the maintainer: setting up this repo

This folder lives inside the private code repo as `community/`. Its contents are the root of the public repo.

1. On GitHub, create a **public** repository named `Slop-Filter-Community` (no README).
2. Push this folder as that repo's root:
   ```bash
   cd /home/admin1/projects/slop-filter && git subtree split --prefix community -b community-public && git push https://github.com/MohamedAchich/Slop-Filter-Community.git community-public:main
   ```
   Repeat the same command whenever `community/` changes.
3. In the public repo: **Settings → Pages → Source: GitHub Actions**, then **Actions → Publish site → Run workflow**.
4. **Settings → Actions → General → Workflow permissions:** "Read and write" and "Allow GitHub Actions to create pull requests" (needed by the report counter).
5. Create the labels `ai-report` and `dispute` (Issues → Labels) if GitHub didn't create them from the templates.
