---
name: new-feature
description: Start a new feature branch from a fresh dev. Verifies the previous branch was merged, syncs dev, creates the branch, then plans before coding. Use at the start of EVERY feature.
---

# /new-feature <branch-name>

Branch name: `$ARGUMENTS`. Must match `(feature|fix|hotfix|refactor|docs|chore)/<kebab-case>` (lower-case English, words
joined by hyphens; `hotfix/` is cut from `main`, the rest from `dev`). If missing or invalid, ask the user for a name and
stop. If a branch that fits the task already exists, say so instead of creating another.

Run every step in order. Stop and report on the first failure - never "work around" a red step.

## 1. Git check (never assume the tree is clean)

```bash
git branch --show-current
git status --porcelain
git diff --stat
git log --branches --not --remotes --oneline
```

If anything is uncommitted or unpushed, stop: tell the user what it is and ask whether to `/ship` it first or leave it.
Never stash, discard or overwrite the user's changes; a stash that could lose work is a dangerous operation and needs
the user's approval (`docs/standards.md`, section 3).

## 2. Verify the previous feature landed

```bash
git fetch --prune
git branch -r --merged origin/dev
git branch -r --no-merged origin/dev
```

- If any `origin/feature/*`, `origin/fix/*`, or `origin/chore/*` branch is NOT merged into `origin/dev`, stop and show
  the user the open PR link `<repo>/compare/dev...<branch>?expand=1` (the address is in `CLAUDE.md`, "Git flow").
  Rule: the next feature does not start until the previous one is merged.
- Confirm `origin/main` was not touched: `git log --oneline -1 origin/main` must still be the last production merge.
  If `main` moved unexpectedly, stop and tell the user.

## 3. Check the roadmap commitment

Read `docs/roadmap.md`'s "Committed next" section. If it names a branch and `$ARGUMENTS` is a different one, stop and
ask the user directly: name what was committed, and proceed only if they confirm. Once that commitment ships (or the
user explicitly drops it), remove it from the roadmap in the same PR.

## 4. Sync dev and branch

```bash
git checkout dev
git pull --ff-only
git checkout -b $ARGUMENTS
git branch --show-current
```

Never delete a branch here or anywhere else - not even one already merged into `dev`. A closed branch is simply never
reused; if it should go, the user removes it themselves.

## 5. Plan before code

Tell the user to switch to **Opus** for this planning step (architecture/design work), and wait for their confirmation
before writing the plan.

Reply in Hebrew with a short plan (max ~15 lines):

- Goal in one sentence.
- **The folder structure first**, as a short tree of what is added or moved, before any code (`CLAUDE.md`, "Code
  conventions"): one job per file, UI, logic and API calls apart.
- Files to add/change (paths).
- Tests to write (including edge cases).
- **Security impact** (`docs/standards.md`, section 7): what the change does to authentication, authorization, input
  validation, secrets, headers or data exposure, or "none"; and any standard that cannot be met yet (reported, not skipped).
- **Iron rules touched:** the ids from `docs/compliance.md` (for example `L7, A1, C3`), or "none". Read the rows of the
  area first. Adding a cookie, a stored field, a third-party script, a font, an icon, an image, a form, or text that
  other visitors will see always touches at least one. A row that the feature would turn from _Met_ into something
  else is a reason to stop and ask.
- Open questions, if any.

Wait for the user's approval ("מאשר"). Once approved, tell the user to switch to **Sonnet** for the execution
(regular coding/mechanical work) and wait for their confirmation before writing any code.
