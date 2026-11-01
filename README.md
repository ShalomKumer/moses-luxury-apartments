# דירת מוזס (Moses Luxury Apartments)

A public Hebrew site for the owner's apartments (the folder and first brief say "Ahuzot Moses" and cabins; the name is
being confirmed): each unit's photos and details, and booking by WhatsApp or email, in **Hebrew (`/`) and English (`/en/`)**. **It shows no availability and has no
date search**: the owner keeps the bookings in his own Google Calendars (`docs/architecture.md`).

- [Architecture](docs/architecture.md): static pages, no server code, no forms, no sign-in, no payment on the site.
- [Brand](docs/design/brand.md): what the owner's logo dictates (palette, type, shapes).
- [Iron rules and the client checklist](docs/compliance.md): law, privacy, accessibility, security, licences; the
  status of each.
- [Code structure](docs/structure.md): the folder tree and which layer may import which.
- [Roadmap](docs/roadmap.md).

## Running it

Node 22.23 or later. No environment variables are needed today.

- `npm run dev`: the site at http://localhost:4321
- `npm test`: unit and policy tests
- `npm run verify`: type check, tests, build, build-output check, secret scan (files, build and git history), licence allow-list, `npm audit`
- `npm run launch:check`: fails while any placeholder or sample content is left (expected until launch)
