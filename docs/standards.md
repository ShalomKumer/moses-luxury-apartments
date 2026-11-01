# Development and security standards

Source: the user's documents of 2026-11-01 (development and security standards; Git standards; the fixed work
cycle; UI/UX and design), merged with the rules already in `CLAUDE.md`, the skills in `.claude/skills/` and `docs/compliance.md`. Where two
said the same thing, the more precise one is kept and the other points here ("What was merged", at the end).

**Precedence:** the user's explicit instruction in the conversation > the iron rules (law, privacy, accessibility,
licences: `docs/compliance.md`) > this file > the working style in `CLAUDE.md`. A standard that cannot be met because of
missing infrastructure, configuration or information is **reported explicitly, never skipped silently**.

**What applies today.** The site is static: no database, no sign-in, no server code, no payment, no upload (`docs/architecture.md`).
Sections 4 to 6 are written for the day a backend appears (an admin view, a form, a payment); each marks what is true now.

## 1. The work cycle (every task)

1. **Git check:** `git branch --show-current`, `git status`, `git diff`, unpushed commits. Never assume the working tree is clean.
2. **Understand:** read the relevant architecture (`docs/structure.md`, `docs/architecture.md`) and files; ask the graph first.
3. **Plan:** show the files and the folder structure before any code. A feature waits for the user's "מאשר"; a small fix
   states its files in two lines and proceeds.
4. **Build:** focused changes only. No unrelated edits, no unneeded dependencies.
5. **Test:** run the relevant tests and `npm run verify`; confirm no regression. Use the security checks of section 7.
6. **Final Git check:** `git status` and `git diff` to confirm exactly what changed.
7. **Summary, then wait:** report (section 7) and wait for the user before any commit or push (`/ship` is that request).

## 2. Architecture and code quality

1. Modular, component-based. No monolithic files; no unrelated logic in one file. One responsibility per component,
   function and module (SRP).
2. UI, business logic, data access, API calls and helpers are separate (`docs/structure.md`; `tests/policy/layers.test.ts`
   fails on a forbidden import).
3. Small, reusable, testable functions. No duplicated code (DRY).
4. Clear, consistent names for variables, functions, components and files.
5. A short comment on each function (what it is for) and on any complex logic.
6. Keep the existing architecture and conventions. Show the proposed folder structure and the split of responsibility
   before implementing a feature.
7. Do not change code unrelated to the task; add no unneeded dependency (each one passes `npm run licenses:check` and `npm audit`).
8. Prefer stable, extensible, maintainable solutions over temporary quick ones.

## 3. Git and version control

**Branches.** `main` = production only, never touched in development. `dev` = integration. One branch per task, lower-case
English, words joined by hyphens, never reused once merged; do not create a new branch when a fitting one exists.
Prefixes: `feature/`, `fix/`, `hotfix/` (urgent, from `main`), `refactor/` (no change in behaviour), `docs/`, `chore/`.
Examples: `feature/user-authentication`, `fix/login-validation`, `refactor/api-service`.

**Before changing anything:** the checks of step 1 of the work cycle, plus a pull of the relevant branch when it fits the
flow. Never overwrite or delete the user's local changes. Changes unrelated to the task stay as they are and out of the
commit. If the state of the repository is unclear, stop and ask.

**Commits.**
- Only when the user asks (`/ship` is the request). Never assume the user wants a commit, push, merge or rebase.
- One commit per logical, meaningful unit; one clear change each; no mixing of features, fixes and unrelated docs.
- Conventional Commits in English, `<type>(<scope>): <description>`, subject at most 72 characters, descriptive and short.
  Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`, `build`, `ci`.
- No commit of code that does not work or was not verified (`npm run verify` is green first).

**Push.** Never automatic. Before it: the branch is the right one, it is in sync with its remote, remote changes that could
conflict were checked, and the relevant tests pass. No force push by default; never to a shared or production branch;
`--force-with-lease` only after the impact is understood and approved. Never push keys, passwords, `.env` or personal data.
Never push to another user's branch without approval.

**Pull requests.** Opened by the user through `<repo>/compare/dev...<branch>?expand=1` (no `gh`). Every significant
feature or sensitive fix goes through one. `/ship` prints the text to paste:
- what changed and why; the main files and components;
- the tests run;
- database or configuration changes, if any;
- security implications;
and the diff holds nothing unrelated. All automated checks pass before merge; conflicts are resolved knowingly, never by
overwriting. **Squash merge** into `dev` is preferred; the PR title is the conventional commit.

**Protected branches (set on GitHub by the user):** protect `main`; no direct push; a pull request before merge; CI must
pass; a review when the project is a team's; no deletion or history rewrite of a protected branch; permissions by role.

**Merge conflicts.** Understand both sides and each change's purpose first. Never delete existing code only to resolve one.
A conflict in business logic or sensitive code: stop and show it. Run the tests afterwards and make sure no `<<<<<<<`,
`=======`, `>>>>>>>` is left.

**Dangerous operations need the user's explicit approval, after the AI says what the operation does, which files or
commits may be hurt, whether it can be undone, and the safer alternative:** `git reset --hard`, `git clean -fd`,
`git push --force` and `--force-with-lease`, `git rebase` of a shared or remote branch, deleting a remote branch,
deleting or rewriting shared commits, `git checkout -- .` or `git restore .` that could discard changes, a `git stash`
that could lose changes, and anything else that could lose code, overwrite changes or rewrite shared history.
**Deleting any branch, local or remote, merged or not, is the user's alone** (stricter than the general standard).

**Secrets and files.** A suitable `.gitignore`; no `.env`, private keys, passwords, credentials, `node_modules`, build
output, logs, temporary files or personal data in git. Check every file before it enters a commit. Use secret scanning
where available. A secret that reached git history is **revoked and rotated even if a later commit removed it**; deleting a
file does not remove it from history; rewriting history to remove a secret needs a plan, coordination and approval.

**Tags and releases.** Git tags mark stable versions, Semantic Versioning `MAJOR.MINOR.PATCH` (MAJOR: incompatible change;
MINOR: backward-compatible feature; PATCH: fix). Each release records its significant changes, comes after tests, and a
published tag is not moved without reason and coordination.

## 4. Security of data access, sign-in and the API (for the day a backend exists)

**Data access.** Parameterized queries, prepared statements or a trusted ORM, always; never raw user input concatenated
into a query. Validate and sanitise every external input before use or storage. Enforce permissions on the server before
every sensitive access. Never trust a user id from the URL, parameters, body or client state: take the identity only from
a server-verified session or token. Before every read, update or delete, check the resource belongs to the user or the
role grants it (no IDOR/BOLA). Least privilege for database users and the app. Connection strings never reach the client.
*Today: no database.*

**Sign-in, authorization, sessions.** Role-based access (RBAC) where levels differ; authorization checked on the server only
(hiding a route or a component is not a control). Passwords hashed with Argon2id or bcrypt. Signing keys and tokens
protected and never exposed. Cookies `HttpOnly`, `Secure`, `SameSite`. Sessions expire after inactivity and have an
absolute maximum. Secure password reset and account recovery. Protection against session hijacking, token theft, brute
force and credential stuffing. Double opt-in on registration. MFA for admin and sensitive actions. No default passwords or
predictable keys. After sign-out nothing of the person stays on the device (iron rule 30, `docs/compliance.md` S9).
*Today: no sign-in. An admin view (`docs/architecture.md`) wakes all of this.*

**API and application.** Audit every endpoint, controller, server action and backend operation. Validate all incoming
data against explicit schemas. Defend against SQL and NoSQL injection, XSS, CSRF, SSRF, path traversal, IDOR/BOLA, brute
force and denial of service. CORS by an **explicit allowlist of origins**, never an open wildcard on a sensitive or
authenticated API. Rate limiting on sign-in, registration, password reset and sensitive endpoints. Verify incoming webhooks
by cryptographic signature and defend against replay. Never trust payment data from the client. Errors: generic messages
only, no stack traces, internal paths, database details or technical data. Log security events without passwords, access
tokens, session ids or sensitive personal data. Security headers including a CSP.
*Today: no endpoint; headers and CSP are in `public/_headers` and pinned by `headers.test.ts`.*

**Secrets and environment.** No API key, password, token, private key, connection string or other secret in frontend code
or in a client-side environment variable; every sensitive variable stays on the server; privileged operations go through
the backend. Scan the whole project for exposed credentials: sources, build output, logs, source maps and git history.
When one is found, report **file, location, risk level and the required fix, without printing the full key**. Every key
exposed in the past is revoked and rotated; removing it from code is not enough. `.env` and private keys never enter
version control. Provide `.env.example` with names and non-secret example values only. In production prefer a secrets manager.
*Today: no secret exists; `.env.example` is empty.*

**Frontend and input.** Client-side validation is never a security control: re-check on the server. Escape or render
untrusted content safely; avoid unsafe HTML injection unless necessary and sanitised. Validate uploads by type, size,
extension and actual content; block web shells and execution; store uploads outside executable folders and serve them
through a controlled mechanism. Protect forms from bots (a privacy-respecting CAPTCHA such as Turnstile, rule 24). Filter
abusive content where users publish. Expose no internal implementation detail or privileged data in frontend responses.
Disable source maps in production or restrict them.

**Payments.** External, trusted payment providers only. Never store full card numbers, CVV or sensitive verification data.
Tokenization and the provider's secure payment pages or components. Never trust a status, price, discount or amount from
the frontend: verify every payment on the server through the provider's API or a verified webhook (signature and replay
checked); an order or subscription is "paid" only on a verified confirmation. PCI DSS as relevant and the provider's rules.
*Today: no payment on the site.*

**Infrastructure and availability.** HTTPS everywhere, HTTP redirected, secure TLS settings. No admin interface, internal
service or sensitive endpoint exposed without authentication and authorization. Separate development, testing and
production. Servers and databases configured securely. Automatic database backups and **periodic restore tests**. Monitor
health, errors, suspicious activity and availability. Update libraries, dependencies, operating systems and server software
regularly. Resource limits against abnormal load. No detailed errors or debug information in production. Critical services
recover safely after failures.

## 5. SEO and metadata for sharing

Every public page has: a title and a meta description; Open Graph tags and Twitter/X Cards; per-page dynamic titles and
descriptions; an absolute preview-image URL; a canonical URL (no duplicate content; with the two languages, `hreflang`
alternates too); a `sitemap.xml` and suitable robots rules. Public pages are indexable; private and authenticated pages are
not exposed to search engines. The metadata is generated in the way that fits the rendering architecture (static: at build).
**Honest:** structured data (`LodgingBusiness`) and every claim use real details only; no rating, review or price markup
without a real source (H1, H2). Needs the domain (`site` in `astro.config.mjs`) and a preview image of ours; scheduled in
`docs/roadmap.md` (rows E1-E6 of `docs/compliance.md`).

## 6. Law, privacy and accessibility

The iron rules in `docs/compliance.md` are the precise form of these requirements (licences of fonts, icons, images and
code with an allow-list script; privacy policy and terms; account deletion; accessibility statement and WCAG 2.1 AA, with 2.2 AA as the target: section 8.7;
affiliate disclosure; age; minimum data; third-party services). The new standard adds two points, now rows L13 and the
deletion note: **a clear policy for how long data is kept and when it is deleted**, and **deletion of an account must
remove or anonymise personal data as the law requires, while allowing for legitimate retention duties.**

## 7. Review, testing and reporting

1. Before a feature: check the existing architecture and identify the relevant components and dependencies.
2. Before completing a feature: check its effect on information security (the plan's "Security impact" line).
3. When changing a feature: confirm no breakage and no weakening of an existing security mechanism.
4. Periodic security audits of the whole codebase; every endpoint and database operation checked for authorization gaps;
   look for exposed credentials, insecure settings, outdated dependencies and dangerous code patterns.
5. Run the relevant tests after every significant change. Add automated tests for authentication, authorization, input
   validation and access to resources.
6. **A vulnerability is reported with:** severity; file and line; an explanation; the possible effect on the system and
   users; the recommended fix. A fix is reported with the change made and how it solves the problem.
7. **Never claim the system is fully secure** without the matching tests and verification.
8. If a requirement cannot be met for lack of infrastructure, configuration or information, say so explicitly.
9. **Before declaring a task done:** confirm it meets this file and report plainly the **remaining risks, requirements not
   yet implemented, and settings that need manual intervention.** The final summary also lists: the files changed and what
   changed in each, new files, the tests run, and the current Git state.

Secure by Design, server-side authorization, least privilege, a modular architecture and long-term maintainability are
defaults, not extras.

## 8. UI/UX and design

Source: the user's UI/UX document of 2026-11-01, merged with `CLAUDE.md` ("Design"), `docs/design/brand.md`, the tokens in
`src/styles/tokens.css` and the rules added on 2026-10-31. Design is product thinking, not decoration: every choice is
justified by use, hierarchy, consistency or fit to the product, and nothing is called "modern" or "professional" without
that reason.

**8.1 Choosing a concept (before any new site, system or significant area).**
Understand the purpose, the audience and the main actions first. Then show **five options that really differ** (in at
least three of structure, type, colour world, density, the one memorable element - never five colourings of one layout),
as live mockups in one artifact, one tab each, working on a phone. Each option gives: name and style; the concept; palette;
type; structure and layout; the style of buttons, cards, forms and components; pros and cons; fit to the audience and the
purpose. Then a **comparison table** scored 1-10 on usability, aesthetics, accessibility, fit to the product, performance
and maintainability, and **one recommendation with its reasons** (what makes it fit the product, not only that it is
prettier), plus what to take from the runner-up. **Nothing is built before the user picks an option or approves the
recommendation in words.** The approved design is the Design Reference (`docs/design/`): its language is kept for the
whole project; colours, fonts, spacing and components already approved are not changed arbitrarily, a change is a focused
proposal, and a problem found in the chosen design is explained to the user with a fix, never altered silently. Five
options are for the first page of each kind (a new significant area counts as a new kind); later pages are drawn in the
approved language with all their states and approved on their own.

**8.2 Principles.** An interface the visitor does not have to learn; simplicity over visual load; every element serves a
purpose; a clear hierarchy of headings, content, actions and secondary information; the primary action stands out from the
secondary; restrained use of buttons, colours, borders, shadows and motion; consistent spacing and deliberate whitespace;
alignment and proportion; visible feedback for every action, and never a state where the visitor cannot tell whether an
action worked, failed or is still running; short flows.

**8.3 Design system.** One system, changed centrally. `src/styles/tokens.css` holds the tokens; no raw value in a
component. It must cover: primary, secondary and accent colours; background, surface, text and border colours; success,
warning, error and info colours; type families, weights and sizes; a spacing scale; one radius scale; a restrained shadow
scale; standard sizes of buttons, inputs, cards and dialogs; the breakpoints. **Today** it has colours (brand, notice,
focus, selected), `--font-body`, five text sizes, a spacing scale, `--radius`, `--target-size` and `--content-width`.
**Missing, added in the change that first needs each (not in advance):** semantic success/warning/error/info colours,
shadows, a second radius, named breakpoints (today one, 62rem), font tokens for the display face. Each new colour pair
goes into `contrast.test.ts` in the same change. Reusable components in `src/components`; no copied markup, no giant
stylesheet (global rules in `global.css`, a component's own rules next to it), no inline styles, no second styling
technology without a reason.

**8.4 Components and their states.** Buttons (primary, secondary, tertiary, danger), forms (visible labels, clear error
messages, focus), inputs, cards, tables (readable, sortable and filterable where there is a list), navigation (the current
page marked), dialogs only when justified, notifications, status badges (the same colour always means the same thing),
loading, empty and error states (what is missing and what to do next). Every interactive element has hover, focus, active
and disabled states. Today the site has no form, table, badge or loading state; the booking panel has its message preview
and its notice, and its WhatsApp and email actions are the only primary actions.

**8.5 Responsive.** Mobile first; clear and consistent breakpoints; never a fixed width that breaks the layout; no
unintended horizontal scroll; forms, menus, cards and tables adapt to a small screen; the hierarchy and navigation fit
each size; **every action works on a phone.** Tested at several widths, not desktop only.

**8.6 Motion.** Moderate and purposeful; smooth transitions between states; no heavy effects; nothing long or excessive for
a simple action; `prefers-reduced-motion` respected (met: `global.css`); motion never harms accessibility.

**8.7 Accessibility.** The target is **WCAG 2.2 AA** where relevant (the iron rules say 2.1 AA at least, so 2.2 is the
stricter reading and is the target). Semantic HTML; contrast (A1); keyboard-only use; clear focus indicators, **and focus
never hidden behind another element (2.4.11)**; a target of at least 24 px (2.5.8; `--target-size` is larger); a label on
every field; meaningful alt text; information never by colour alone; ARIA only where HTML cannot say it; dialogs, menus and
forms accessible; nothing that assistive technology cannot operate. Rows A1-A7 of `docs/compliance.md` are the status.

**8.8 Hebrew, English and direction.** Full RTL and LTR; direction set on the page (met: `lang` and `dir` per language);
logical CSS properties only (met: a policy test); icons and arrows mirrored where the meaning is directional; numbers,
dates, prices, phone numbers and addresses correct inside Hebrew text; fonts that support Hebrew well (a licence decision:
iron rule 26); no uncontrolled mixing of the two languages on one line.

**8.9 Performance of the interface.** No heavy design library without need; lazy-load images and what is below the fold;
optimised images (the photo pipeline); no costly effects; short load and quick response; checked on a weak phone. The
budget and its check are rule 3 of `CLAUDE.md`.

**8.10 Done means checked.** Before a page or a significant component is called done: consistency with the design system;
several screen sizes; RTL and LTR; keyboard and screen-reader pass; readable text and clear hierarchy; hover, focus, active
and disabled; loading, empty, success and error states where they exist; no unwanted horizontal scroll; no needless
re-render or script; fit to the product's purpose. The skills `design-critique` and `accessibility-review`, the Browser
pane at 375 px and desktop, and (`npm run test:e2e`, from `chore/browser-tests`) Playwright with axe carry it out. Before starting a design the AI
confirms the purpose of the page; it never designs on its own initiative.

## What was merged (existing rule -> kept wording)

| Topic | Before | The new document | Kept |
| ----- | ------ | ---------------- | ---- |
| Architecture, SRP, layers, comments, structure first | `CLAUDE.md` (2026-10-19) + the layers test | the same, plus DRY, naming, no unrelated edits, no unneeded dependencies, stable over quick | the existing rule, enforced by a test, with the four additions (section 2) |
| Main branches | `main`, `dev`; `feature/ fix/ chore/` | `main`, `develop`; `feature/ bugfix/ hotfix/ refactor/ docs/` | **`dev` and `fix/`** (the user's other project and both skills use them) plus `hotfix/ refactor/ docs/ chore/`. To prefer `develop` and `bugfix`, change three files |
| Deleting branches | never, any branch | a remote branch only with approval | the existing rule (stricter) |
| Commit types | feat fix chore docs test | ten types | the ten types |
| When to commit and push | `/ship` commits and pushes; "one commit per chunk" | only when asked; not every small change; one logical unit each | only on `/ship` or an explicit request; **"one commit per chunk" removed** |
| Check Git before work | a clean-slate check in `/new-feature` | branch, status, diff, unpushed commits; never assume clean | the new, wider check, in the work cycle and `/new-feature` |
| Force push, dangerous operations | not covered | a full list with an explanation first | added (section 3) |
| Secrets in git | `/ship` greps the diff; never commit `.env` | plus history, revoke and rotate | merged (section 3 and the secrets paragraph) |
| Pull request text | a link only | a required content list | `/ship` prints the text; squash merge preferred |
| Tags, releases | none | semver | added |
| Reviews before push | `/code-review` + `/security-review` mandatory | review through a PR | the existing, stronger rule, plus the PR text |
| Final summary | the stage report and the test count | files, changes, tests, Git state, remaining risks | merged (section 7) |
| Work order | plan, confirm, build, tests, reviews, PR | a 7-step cycle | merged (section 1); a feature still waits for "מאשר" |
| Security (database, sign-in, API, payments) | rows S1-S17, H5 for a static site | a full standard | the standard, with "today" notes; the S rows stay as the status record |
| Secrets | S13: no calendar address in the repo or the build | scan sources, build, logs, source maps and history; report format | the new, wider rule (row S19) |
| SEO | rule 8 "honest SEO" | Open Graph, Twitter Cards, canonical, sitemap, robots, dynamic metadata | the new list with the honesty constraint (section 5; rows E1-E6) |
| Law, privacy, accessibility, licences | iron rules 1-17 and 26-30 | the same topics, less precisely | the iron rules; the two additions are row L13 and the deletion note |
| Infrastructure | iron rules 19 and 25; rows S2, S3, S8, S17 | plus environments, dependency updates, resource limits, no debug in production, recovery | the new points added as row S18 |
| UI/UX and design | `CLAUDE.md` "Design" (five layouts, the logo dictates the style), `brand.md`, tokens | a 12-part document: five concepts and a comparison, principles, design system, components and states, responsive, motion, accessibility, RTL/LTR, performance, code organisation, a quality checklist, the AI's conduct | the existing method, plus the comparison table with scores, the Design Reference rule, the states list and the done-checklist (section 8). **WCAG 2.2 AA** is the target (the iron rules say 2.1 AA at least). "Five options for a new significant area" kept as "for the first page of each kind" |
| Design tokens, components, no inline styles | rule in `CLAUDE.md` (colours only through tokens) | the full token list (semantic colours, shadows, sizes, breakpoints) | the rule, plus the list of what is still missing and is added when first needed (8.3) |
