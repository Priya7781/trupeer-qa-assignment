# Trupeer QA Assignment

A QA take-home assignment for [Trupeer](https://trupeer.ai) (a video editing SaaS),
covering exploratory testing, automated end-to-end tests, and an AI-augmented
validation script. Submitted as a single repo with three parts.

## Structure

```
part1/   Exploratory bug report
part2/   Playwright + TypeScript E2E suite (Page Object Model)
part3/   AI-augmented validation script (uses Claude as an LLM judge)
```

### Part 1 — Bug report ([part1/](part1/))

Manual exploratory testing of the live app, written up as individual bug
reports (steps to reproduce, expected vs. actual behaviour, severity). See
[part1/bugs.md](part1/bugs.md).

### Part 2 — E2E test suite ([part2/](part2/))

6 Playwright tests covering login, dashboard → editor navigation, changing
the editor background, and the "Modify Script with AI" feature (one
happy-path test plus two negative cases). Built with the Page Object Model —
`LoginPage`, `DashboardPage`, and `EditorPage` hold all the selectors and
waits, so the tests themselves read as plain steps.

```bash
cd part2
npm install
npx playwright install chromium
npx playwright test
```

See [part2/README.md](part2/README.md) for details.

### Part 3 — AI-augmented validation ([part3/](part3/))

A standalone script that drives the real "Modify Script with AI" feature
with 4 different prompts, then uses Claude as an LLM judge to grade each
rewrite against a 5-criterion rubric (intent match, coherence & grammar,
information preservation, meaningful transformation, length/scope sanity).
Reuses Part 2's page objects for login and navigation — no duplicated
automation logic.

```bash
cd part3
npm install
npm run validate
```

See [part3/README.md](part3/README.md) for details, and
[part3/sample-output.txt](part3/sample-output.txt) for real output from a
full run.

## Environment variables

Both Part 2 and Part 3 read from a single `.env` file at the repo root.
Copy `.env.example` to `.env` and fill in real values:

| Variable | Used by | Purpose |
|---|---|---|
| `TRUPEER_EMAIL` / `TRUPEER_PASSWORD` | Part 2, Part 3 | Test account login |
| `TRUPEER_BASE_URL` | Part 2, Part 3 | App URL (`https://app.trupeer.ai/`) |
| `LLM_API_KEY` | Part 3 | API key for the LLM used as the judge |
| `LLM_PROVIDER` | Part 3 | Which LLM provider to use (currently `claude`) |

`.env` is gitignored — never commit real credentials.

## Stack

- Playwright + TypeScript for browser automation
- Page Object Model for the E2E suite
- Anthropic's Claude API as the LLM judge in Part 3
