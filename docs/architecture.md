# Architecture

Decided with the user on 2026-10-31; **changed the same day**: no availability and no date search for visitors.

## Decisions

| Question                    | Decision                                                                                     | Why                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Availability                | **Not shown on the site, to anyone, for now.** No calendar, no date search, no public API.   | The user's rule (2026-10-31). The owner keeps the bookings in his own Google Calendars, which only he sees.                |
| An admin who sees it        | **Not built.** It needs a sign-in, which is a separate feature with its own plan and security work. | The site has no accounts today. See "If an admin view is wanted" below.                                          |
| How a guest books           | A WhatsApp link (`wa.me`) and an email link (`mailto:`), each with a pre-filled message; the guest writes the dates in it | The site collects no personal data; the conversation happens where the owner already works.      |
| Payment                     | None on the site; between the guest and the owner                                            | No PCI scope, no webhooks, no invoices from the site. The cancellation policy is still published (`compliance.md`, H4).      |
| Stack                       | Astro (static pages, TypeScript)                                                             | Fast pages that work without JavaScript, MIT licence.                                                                       |
| Host                        | **Proposed:** Cloudflare Pages                                                               | Free tier, HTTPS and HSTS, a headers file, rate-limiting rules. To confirm with the user.                                    |

## Languages (2026-10-31)

Hebrew at `/`, English at `/en/`. The address is the language choice: a plain link on every page leads to the same page in the
other language; nothing is stored and nobody is redirected by the browser's language. Every text comes from one dictionary
per language (`src/i18n/messages/he.ts`, `en.ts`: the same keys, enforced by the type check and a test); every cabin is one file
with both languages inside it, so a missing translation fails the build; the legal pages are one file per language
(`legal/he`, `legal/en`). English says "apartment", as the logo does, until the owner's choice of name is known. The English
texts are drafts for the owner and the lawyer. Routes are thin files (`src/pages/*` and `src/pages/en/*`) over shared page
components (`src/components/pages/`) that take a `locale`.

## What a visitor gets

Pages built ahead of time, no request to any server of ours after the page loads:

- `/` home: the place, the cabins as cards, contact. The same pages exist under `/en/`.
- `/cabins/<id>`: photos, description, capacity, features, and the booking panel (a guest count and the two links).
- `/privacy`, `/terms`, `/cancellation`, `/accessibility`, and a footer with the business details.

`tests/policy/no-public-availability.test.ts` fails the build if a page or component imports the availability code,
if an API route or an on-request page appears, if a native date field appears, if the calendar leaves the booking request's
date picker (changed 2026-11-10: that one calendar only fills the message), or if "free / taken" wording reaches a visitor.

## What was removed (2026-10-31) and where it is

Removed: the availability calendar, the date selection, the booking panel's date summary, the `/api/availability`
route, the browser's API client, the month grid, and their tests. A zip of the files as they were:
`docs/archive/visitor-availability-2026-10-31.zip` (also in git, once the first commit exists).

Kept, unwired, for a future admin view: `src/domain/availability/` (iCal parsing that reads only dates, freshness,
"unknown, never free") and `src/server/` (the calendar source with its host allow-list, the fetch with a timeout and a
size limit, the cache, the service). Both are pure or injected, fully tested, and unreachable from any page.

## If an admin view is wanted

The owner would sign in and see which nights are taken. That needs, from the client's checklist: a sign-in with the
password stored as an Argon2id hash, two-factor for the admin, sessions that end when unused, rate limits and a lock on
the sign-in, every read checked against its owner, the calendar addresses as secrets on the host, a server route that
runs on request, and logs that never hold a password. It is a feature of its own, planned with Opus and shipped through
the full lifecycle. A cheaper alternative with the same effect: the owner keeps looking at Google Calendar, which is
already private to him.
