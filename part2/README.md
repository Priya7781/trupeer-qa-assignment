# Part 2 — Playwright E2E Suite

Playwright + TypeScript end-to-end tests for Trupeer, using the Page Object
Model pattern.

## Setup

```bash
cd part2
npm install
npx playwright install chromium
```

Copy `.env.example` (at the repo root) to `.env` and fill in real values.

## Run

```bash
npx playwright test
```

View the HTML report after a run:

```bash
npm run report
```

## Structure

- `pages/` — Page Object classes (`BasePage`, `LoginPage`, `DashboardPage`, `EditorPage`)
- `tests/` — spec files
- `fixtures/` — custom Playwright fixtures that wire page objects into tests
- `utils/` — helpers (e.g. environment variable loading)
