# Third-party skills

Three skills in this folder are copied, unchanged, from another project. Everything else here (`new-feature`, `ship`) is
ours.

| Skill                          | Source                                              | Pinned commit                              | Licence |
| ------------------------------ | --------------------------------------------------- | ------------------------------------------ | ------- |
| `debugging-and-error-recovery` | https://github.com/addyosmani/agent-skills (skills) | `aeac41d4d005999432bb7312f7ff06383a91d59d` | MIT     |
| `test-driven-development`      | the same                                            | the same                                   | MIT     |
| `performance-optimization`     | the same (also its `references/` file)              | the same                                   | MIT     |

Copied into the trading-bot project on 2026-10-17 after reading the files and the upstream repository's hooks and
scripts, and from there into this project on 2026-10-31, byte for byte. The copies are Markdown only (frontmatter `name`
and `description`), with no script, hook or code that runs by itself, and no network call of their own.

They are still instructions that tell the agent to run commands, and some of those commands are not ours to run: the
debugging skill suggests `git bisect` (moves the working tree to other commits) and `npm install`; the performance skill
suggests `npx lhci autorun` and `npx bundlesize` (download and execute an unpinned npm package). See the rules below.

Files the skills point to that were **not** copied: `references/testing-patterns.md`, `references/performance-checklist.md`
and the `browser-testing-with-devtools` skill. A skill that mentions them works without them; do not fetch them at run
time.

## Rules for these copies

- They are text the model follows, so they are **never edited here and never updated silently**. A newer version is
  read in full, then copied under a new pinned commit in the same PR that updates this table.
- A command in them that downloads or runs a package (`npx ...`, `npm install`) or moves the working tree (`git bisect`,
  checkout of another commit) is **not run** without the user's yes; a dependency is added only through the normal
  flow, with `npm run licenses:check`. Bisecting is done in a separate worktree, never on the feature branch.
- If one of them disagrees with `CLAUDE.md`, `CLAUDE.md` wins. Example: the skills say `npm test`; before a commit the
  command here is `npm run verify`.
- Iron rule C5 (`docs/compliance.md`): nothing is copied from another project without its licence being checked and its
  text kept beside the copy.

## Licence text (MIT, as published at the pinned commit)

MIT License

Copyright (c) 2025 Addy Osmani

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
