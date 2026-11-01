---
name: ship
description: Finish the current feature branch - secret check, full verify, conventional commit, push, PR link to dev, then hand off for merge + /compact. Use at the end of EVERY feature.
---

# /ship

Run every step in order. Stop and report on the first failure - a red step is never skipped.

## 1. Right branch

```bash
git branch --show-current
```

Must be a `feature/*`, `fix/*`, or `chore/*` branch. On `dev` or `main`: stop - nothing is ever committed there
directly.

## 2. Nothing sensitive staged

```bash
git status --porcelain
git diff --stat
```

Stop if any of these appear: `.env`, `.env.*` (except `.env.example`), `.dev.vars*`, `node_modules/`, `dist/`,
`.wrangler/`, `graphify-out/`, or any file that looks like a key or credential dump. Also grep the diff for accidental
secrets: a calendar's secret address (`calendar.google.com/calendar/ical/`), `BEGIN (RSA|EC|OPENSSH) PRIVATE`,
`api[_-]?(key|secret)\s*[:=]\s*['"][^'"<]{8,}`. If a secret is found, report the **file, the location, the risk level and
the fix, without printing the full key**; it is revoked and rotated even after it is removed from the code (a deleted
file stays in history).

## 3. Review

Run `/code-review` and `/security-review` against this branch's diff (`dev...HEAD` plus any uncommitted changes) -
every time, no exceptions. Fix what they find, or tell the user why a finding doesn't apply, before moving on.

## 3b. Iron rules

Open `docs/compliance.md` and go through the rows the plan named under "Iron rules touched", plus any row the diff
touched without the plan saying so (a new cookie or storage key, an external host in a script, link, font or image, a
new stored field, a new form, a new `<img>` or photo, text shown to other visitors). For each: is it still true, and is
the row's status and "how it is met" still accurate? Update the row in this same PR when the answer changed, and tell
the user in the hand-off what moved. If the diff changes `package.json` or the lockfile, `npm run licenses:check`
(inside `npm run verify`) must pass; a licence it refuses is decided by the user, never added silently.

## 4. Verify

```bash
npm run verify
```

Read the tail of the output. If anything is red: fix it, then rerun - do not commit until it is fully green. Report the
test count to the user.

## 4a. Final Git check

```bash
git status
git diff --stat
```

Confirm that exactly the files of this feature changed and nothing unrelated is staged (changes that belong to other work
stay out of the commit, untouched). Look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) in the changed files.

## 4b. Refresh the graph

```bash
graphify update .
```

Code only, no LLM, no cost (`graphify-out/` is git-ignored). If the command is not on the PATH use
`~/.local/bin/graphify`. Tell the user in the hand-off whether the graph was refreshed; if it could not be, say so.

## 5. Commit

- Stage only the files that belong to this feature.
- One commit per logical unit, one clear change each (never features, fixes and unrelated docs mixed). Conventional
  commit in English: `<type>(<scope>): <description>`, types `feat fix refactor docs style test chore perf build ci`.
  Subject at most 72 characters; the body explains the _why_ when it is not obvious. Never commit code that is not
  verified: `npm run verify` is green first.
- End the message with the attribution line required by the session.

## 6. Push and hand off

```bash
git push -u origin $(git branch --show-current)
git log --oneline -1
```

Then reply in Hebrew with exactly:

1. What shipped (1-3 lines) and the test count; the files changed and what changed in each, the new files, and the
   current Git state.
2. The PR link: `<repo>/compare/dev...<branch>?expand=1` (base is **dev**, never main), and the text to paste into it:
   what changed and why; the main files and components; the tests run; database or configuration changes (or "none");
   the security implications (or "none"). Squash merge is preferred; the PR title is the conventional commit.
3. The stage report (`CLAUDE.md`, "Working style"): the open stage, what was done, what is left, the percent.
4. **Remaining risks, requirements not yet implemented, and settings that need manual intervention** (or "none"), never
   a claim that the system is fully secure (`docs/standards.md`, section 7).
5. The hand-off checklist for the user:
   - Open the PR and merge it into `dev`.
   - Say "מוזג" so the merge can be verified.
   - Run `/compact` (or open a new session) - required before the next feature starts.

Do not start any new work until the user confirms the merge and the context was compacted.
