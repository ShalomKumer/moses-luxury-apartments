# Ahuzot Moses (אחוזות מוזס)

A public Hebrew site for a client's holiday units (the logo says "דירת מוזס / Moses Luxury Apartments"; the first brief said
"אחוזות מוזס" and cabins - being confirmed): each unit's photos and details, and booking by WhatsApp or email.
**The site shows no availability and has no date search or calendar** (the user, 2026-10-31); the owner sees his bookings
in his own Google Calendars. No form, no sign-in, no database, no server code, no payment on the site. An admin view of
availability would need a sign-in: a separate feature, not built (`docs/architecture.md`).

The working rules below were taken from the user's trading-bot project (`New-Bot---09.26`) on 2026-10-31, at the user's
request, and adapted to this project. A rule that does not fit here says so; a new rule is added only with the user's
approval, one rule at a time.

## Stack

Astro (static pages, Cloudflare adapter, no on-demand route), TypeScript strict, Vitest. Node 22.23
or later (Astro 7). UI: Hebrew RTL, mobile first. See `docs/architecture.md`.

## Commands

- `npm run verify`: Prettier check + ESLint + type check + tests + build + build-output check + browser tests + performance
  budget + photo check + secret scan + licence allow-list + `npm audit`. Must be green before every commit.
- `npm test`: unit and policy tests (the fast loop).
- `npm run test:e2e`: the browser tests (Playwright + axe, WCAG 2.2 AA) over every page of `dist/client`, at 1280 px and
  375 px, plus the photo viewer by keyboard; run `npm run build` first. Once per machine: `npx playwright install chromium
  --only-shell`. Inside `verify`.
- `npm run dev`: the site on :4321.
- `npm run format` writes the Prettier formatting (code, not `.md`/`.html`); `npm run format:check` and `npm run lint` are inside `verify`.
- `npm run photos:add -- <file> <apartment> <name>`: the only way a photo enters the repo (WebP, three widths, no EXIF or GPS,
  at most 250 KB a file); `npm run photos:check` (inside `verify`) fails on a picture that skipped it (C3, L8).
- `npm run fonts:build -- <folder>`: rebuilds `public/fonts/` (the three web fonts, Hebrew and Latin only, with their OFL texts)
  from the full `.ttf` files in the folder (C1, L7); the full files are not kept in the repo.
- `npm run budget:check`: after a build, fails when a page is over its JS, code or total weight (`scripts/budget/limits.mjs`).
- `npm run secrets:check`: the secret scan (iron rule S19) over the files, `dist/` and the whole git history; prints
  file, place and risk, never the value. Inside `verify`. `secret-scan:allow` on a line marks a reviewed false positive.
- `npm run licenses:check`: fails on a package whose licence is not on the allow-list (iron rule C4).
- `npm run launch:check`: fails while any placeholder or sample content is left (expected until launch).

## Git flow (non-negotiable; the full standard is `docs/standards.md`, section 3)

- `main` = production only. Never commit, merge, or open PRs against it during development.
- `dev` = integration. Cut branches from `dev`; merge back via PR with `base: dev`, squash merge preferred.
- One branch per task, lower-case English with hyphens: `feature/`, `fix/`, `hotfix/` (from `main`), `refactor/`,
  `docs/`, `chore/`. Once merged, never reuse it; do not open a new branch when a fitting one exists.
- **Never delete a branch, local or remote, merged or not**, not even a closed one. If it must go, the user does it
  themselves.
- **Before any task:** `git branch --show-current`, `git status`, `git diff`, unpushed commits. Never assume a clean tree;
  never overwrite or discard the user's changes; keep unrelated changes out of the commit.
- **No commit, push, merge or rebase unless the user asks** (`/ship` is that request). After a task: summarise, then wait.
- **Dangerous operations** (`reset --hard`, `clean -fd`, any force push, rebase of a shared branch, `checkout -- .`,
  `restore .`, a stash that can lose work, rewriting shared history) need the user's explicit approval after you say what
  they do, what may be lost, whether it can be undone, and the safer alternative. A secret that reached git is revoked and
  rotated, not just deleted.
- Conventional commits (`feat fix refactor docs style test chore perf build ci`), English, subject at most 72 characters.
- No `gh` CLI. The repository is `https://github.com/ShalomKumer/moses-luxury-apartments` (private; remote `origin`). PRs
  are opened by the user via `https://github.com/ShalomKumer/moses-luxury-apartments/compare/dev...<branch>?expand=1`
  (`<repo>` in the skills means that address); `/ship` prints the PR text.
- Never commit `.env`. Review `git status` before every commit.

## Code conventions

- **Architecture (the user's rule, 2026-10-19 in the bot project, 2026-10-31 here):** act as a Senior Software
  Architect. A modular, component-based structure; no monolithic files: small reusable functions in distinct files, one
  job each; UI components, business logic and API calls kept apart; a concise comment on each function; and the folder
  structure shown BEFORE any code is generated (every plan opens with it). The tree and the layer rules are
  `docs/structure.md`; `tests/policy/layers.test.ts` fails on an import across a forbidden line.
- `src/domain/` is pure (no I/O, no DOM) and fully unit-tested; `src/server/` gets its world injected
  (`createX({ ... })`), never reads the environment itself; only an API route (none today) reads `astro:env`.
- Tests cover edge cases (empty, malformed, boundaries, failure of the outside world).
- The security, secrets, payments, infrastructure and review standards are `docs/standards.md` (sections 4 to 7): read the
  relevant one before touching anything they cover, and report a standard that cannot be met instead of skipping it.
- Every `<ul>` and `<ol>` carries `role="list"`. Text the visitor sees comes from the dictionaries of `src/i18n` (Hebrew
  and English) or from the content files, chosen by a code, never text from a server.
- Colours only through tokens (`src/styles/tokens.css`); never a raw hex in a component. A new pair of colours is added
  to `contrast.test.ts` in the same change.

## Iron rules (the user's, 2026-10-15, for every project)

The full table - id, status, how each is met, how to check it - is `docs/compliance.md`, merged with the client's own
checklist. Every plan ends with one line, "Iron rules touched: <ids>" (or "none"), and `/ship` checks those rows before a
push. A row that is not _Met_ is scheduled in `docs/roadmap.md`, never just remembered. A new rule goes into
`docs/compliance.md` and into the user-level `~/.claude/CLAUDE.md`.

## Feature lifecycle (use the repo skills, every time)

1. `/new-feature <feature/x>`: verifies the previous branch was merged, syncs `dev`, branches, then plans (the plan shows
   the folder structure first, and names the iron rules it touches). **Tell the user to switch to Opus for this planning
   step**, and wait for confirmation.
2. The user approves the plan ("מאשר") -> **tell the user to switch to Sonnet for the execution**, wait for confirmation
   -> build in small chunks with tests, `npm run verify` after every chunk (commits are made only at `/ship` or on the
   user's request, one per logical unit). An independent **QA
   agent** (Agent tool, Sonnet, read-only) is spent only where it earns its tokens - rare:
   - **When:** a change to the availability service, the API, security headers or anything a secret passes through, or
     a change that touches many modules at once. Not for UI-only work, docs, tests, or a small fix.
   - **How often:** once per feature, on the finished diff against `dev`, before step 3. Never after every chunk.
   - **Re-check:** only after a BLOCKER or MAJOR, by `SendMessage` to the same agent, about the fixing commit alone.
   - If unsure whether a feature qualifies, ask the user in the plan instead of spawning it.
3. `/code-review` and `/security-review` on the branch's diff against `dev`: **mandatory before anything is pushed**,
   for every feature. Fix what they find, or tell the user why a finding does not apply. Never push, and never open a
   PR, on a branch that has not been through both.
4. `/ship`: secret check, `npm run verify`, conventional commit, push, PR link (base `dev`).
5. The user merges the PR and says "מוזג" -> verify the merge -> the user runs `/compact` (or opens a new session).

Never start the next feature before the previous one is pushed, merged, and the context was compacted.

## Model protocol (remind every time - the user forgets to switch)

Before starting a task, classify it and tell the user which model to switch to, then **wait for their confirmation**
before proceeding. Both directions matter, not just switching up:

- Planning, architecture, security review, design decisions, system design -> **Opus**.
- Regular coding, components, pages, bug fixes, tests, running skills, mechanical refactors -> **Sonnet**.
- Trivial edits, phrasing, file organizing, simple factual questions -> **Haiku**.

## Plugins and skills (installed on purpose - use them every time they apply)

Check the session's skill list at the start of every session for their exact names.

- `context7`: look up the library's current docs before writing code against any API (Astro, the Cloudflare adapter).
- `security-guidance`: hook-driven warnings. Never suppress or work around a warning; fix the code.
- `modern-web-guidance`: load before writing components or CSS.
- `engineering`: its architecture-decision skill when a design choice is made; its documentation skill for `docs/*.md`.
- `design`: `design-critique` + `accessibility-review` on every UI feature, against `docs/design.md` once it exists.
- The Browser pane: walk the golden path and the edge cases in a real browser (desktop and 375 px) before reporting UI
  work as done.
- `Product Management`: for planning and specs (`write-spec`, `roadmap-update`, `product-brainstorming`) every time,
  unless you know it and recommend against it - say why.
- `Figma`: whenever a feature plans or uses a design, unless you recommend against it - say why. The page design method
  here is live HTML in artifacts (below), as in the bot project; Figma stays optional.
- `debugging-and-error-recovery`, `test-driven-development`, `performance-optimization` (copied from
  `addyosmani/agent-skills`, MIT, pinned, never edited - `.claude/skills/THIRD_PARTY.md`): a failing test or an
  unexpected error: debugging first. New logic or a bug fix: test first. A speed or size claim: measure before and
  after. Where one disagrees with this file, this file wins (`npm run verify`), and a command in them that installs or
  runs a package (`npx`, `npm install`) or checks out another commit waits for the user's yes.
- `graphify` (the graph is `graphify-out/`, never committed): ask the graph before reading many files, and **after every
  chunk that changes code run `graphify update .`** (code only, no LLM, no cost; `/ship` runs it again). Never
  `extract` with an LLM, never the hosted platform, never `graphify claude install` or `hook install` without the user's
  decision. Say so when the graph is stale.
- `/code-review` + `/security-review`: before every `/ship` (lifecycle step 3).

## Working style

- **Start of an interactive session:** read the "Where we stopped" section of `docs/roadmap.md` (find it with `grep -n`
  and read only that section) and make the skill and plugin check above. Unless the user's first message already names a
  task, tell them in Hebrew where things stand and wait for their decision; never start a feature or a stage on your
  own. Every feature's last docs commit refreshes that section.
- **The work cycle (every task, `docs/standards.md` section 1):** 1 Git check; 2 understand (architecture, relevant files);
  3 plan (files and structure first; a feature waits for "מאשר", a small fix states its files in two lines); 4 build,
  focused changes only; 5 tests, no regressions; 6 a final `git status` and `git diff`; 7 a summary (files changed and
  what, new files, tests, Git state, remaining risks, what is not implemented, what needs manual setup), then wait before
  any commit or push. Ask when unclear.
- Reply to the user in Hebrew; code, docs and commits in English; site text in Hebrew.
- **Stages** (`docs/roadmap.md`, "Stages"; the user, 2026-11-01): seven stages, one stage open at a time, **one session
  per stage** (inside a stage, `/compact` when the context fills). After every merge, before any further work, report two
  figures: the open stage's percent and the whole project's percent (points done over points; a small feature counts 1, a
  medium 2, a large 3; say it is an estimate), with what is left. When a stage is finished, describe everything it holds
  and ask whether to move on - **never start the next stage without the user's explicit approval**; the next stage opens
  in a new session (or after `/compact`).
- Keep context lean: `tail`/`grep` tool output, don't re-read unchanged files. No subagents for ordinary exploration -
  but use the Agent tool where a skill's own instructions call for it, and for the QA agent.
- **New rules:** a rule that would help the project is proposed to the user one at a time and added only with their
  approval.

## Rules added for this project (approved by the user, 2026-10-31)

1. **A reference site is layout only.** From a site the user shows as an example we take the arrangement of elements,
   never its logo, colours, font, icons, photos or wording (C5).
2. **Photo pipeline.** Every photo enters the repo through one script: resized to fixed widths, converted to WebP,
   its metadata stripped (EXIF, including the camera's GPS position). A hero photo is at most about 250 KB. A check in
   `npm run verify` fails on a photo that skipped the script (C3, L8).
3. **Performance budget.** Each page has a ceiling for its JavaScript and its total weight on a phone's first load; a
   check over `dist/` in `npm run verify` fails above it. A UI change measures the page's load on a phone before and
   after (the `performance-optimization` skill).
4. **Format and lint in verify.** Prettier and ESLint run inside `npm run verify`, as in the bot project.
5. **The owner's guide.** A change that affects what the owner does (marking a booking in the calendar, which photos to
   send, what to do if a calendar address leaks) updates `docs/owner-guide.md`, in plain Hebrew, in the same change.
6. **Automated browser tests from the design stage on.** Playwright with axe walks every page (desktop and 375 px)
   inside `npm run verify`; a page that axe fails does not ship (A3-A5).
7. **A real calendar before launch.** An end-to-end check against a test Google Calendar (an all-day event, a timed
   event, a cancelled one, a moved one) and the page showing exactly what the calendar says (H7, stage 7).
8. **Honest SEO.** The full list (titles, descriptions, Open Graph, Twitter Cards, canonical, sitemap, robots, a preview
   image of ours) is `docs/standards.md` section 5; structured data (LodgingBusiness) carries real details only, and no
   rating, review or price markup appears without a real source (H1, H2).

Where each is built: `docs/roadmap.md`, "Committed next" (`chore/tooling` built rules 2 to 5; `chore/browser-tests` built rule 6).

## Design

One page at a time, each in full before the next (the user's method from the bot project):

- No questionnaire: a missing fact is an assumption written in two lines.
- **Five layouts that really differ** (in at least three of structure, type, colour world, density, the one memorable
  element), all in one artifact with a tab each, working on a phone; the first page sets the language, so from the
  second page the five vary the layout inside the approved DNA, not five new worlds. Five layouts only for the first page
  of each kind; the other pages of that kind are drawn in the chosen layout, with all their states, and approved on
  their own.
- The site's own real texts; never invented numbers, reviews or claims (H1, H2). Sample content is labelled as sample.
- Then my pick with three short reasons and what to take from the runner-up; the user decides (my pick, another, or a
  mix); the approved page is recorded under `docs/design/` (the decision, the layout, the states).
- **The owner's logo dictates the style** (the user, 2026-10-31): palette, type, shapes and tone follow
  `docs/design/brand.md`. Gold is a fill and an ornament, never small text; the site is light only.
- **The full UI/UX standard is `docs/standards.md`, section 8** (the user's document of 2026-11-01): a comparison table
  with scores and a recommendation before any build; the approved design is the Design Reference and is never changed
  silently; the design-system token list; component states (hover, focus, active, disabled, loading, empty, error);
  **WCAG 2.2 AA** as the accessibility target; the "done means checked" list. Read it before any UI work.

## Docs

- `docs/architecture.md`: decisions, the availability flow, the pages.
- `docs/standards.md`: the development, security, Git and UI/UX standards (the user's documents of 2026-11-01, merged with
  the rules above); what was merged is its last section.
- `docs/structure.md`: the folder tree and the layer rules.
- `docs/design/brand.md`: what the logo dictates (palette measured from it, type, shapes, the logo file and its rights).
- `docs/design/home.md`: the home page's five layouts and the decision.
- `docs/design/apartment.md`: the apartment page's five layouts, the comparison and the decision.
- `docs/design/legal.md`: the one reading layout of the legal pages and the 404 page, its states and the decision.
- `docs/compliance.md`: the iron rules merged with the client's checklist; status, how met, how checked, where scheduled.
- `docs/new-apartment-prompt.md`: the prompt to fill in and send to add an apartment (name, photo folder, texts, main and secondary photos).
- `docs/roadmap.md`: the stages, "Where we stopped", "Committed next", and the owner's and lawyer's list before launch.
