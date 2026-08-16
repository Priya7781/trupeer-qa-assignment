# Trupeer QA Assignment — Project Context

## What this project is
A QA engineer take-home assignment testing Trupeer (a video editing SaaS).
Submission is a single repo with three parts. Part 1 (bug report) is done —
this file only governs Part 2 and Part 3 work.

## Stack
- Playwright + TypeScript
- Page Object Model pattern
- Part 3 integrates an LLM API (Claude/Gemini) as a test oracle/judge —
  not just for writing code, but as a runtime component of the test itself

## Folder structure
- part1/  — exploratory bug report (already complete, do not touch)
- part2/  — Playwright E2E suite
  - pages/   — Page Object classes (LoginPage, DashboardPage, EditorPage)
  - tests/   — spec files
- part3/  — AI-augmented validation script (validate.ts) + sample output + README

## Hard rules — always follow these
- NEVER hardcode credentials, API keys, or URLs with secrets. Always read from
  environment variables. Update .env.example whenever a new env var is introduced.
- NEVER use waitForTimeout() or sleep(). Use explicit waits / Playwright's
  auto-retrying assertions (expect(locator).toBeVisible(), etc.) exclusively.
- Prefer 3 solid, reliable tests over many flaky ones. Do not over-engineer —
  no unnecessary abstraction layers, no speculative helpers "just in case."
- Every piece of code must be simple enough that I can personally explain it,
  line by line, in a follow-up interview. When implementing something non-trivial,
  briefly explain your reasoning before writing the code.
- Selectors should prefer role/text/test-id based locators over brittle CSS/XPath
  where possible.
- Write meaningful assertion messages, not bare expect() calls.
- Part 2 must be fully runnable via a single command: `npx playwright test`
  (run from part2/).
- Part 3 must be fully runnable via a single command: `npm run validate`
  (run from part3/).

## Workflow expectations
- Work incrementally: scaffold structure first, then fill in one method/test
  at a time. Do not generate entire test suites in one pass.
- Reuse Part 2 page objects, login flow, and utilities in Part 3 rather than
  duplicating logic.
- After any non-trivial change, give a short summary of what changed and why.

## Commands
- Install deps (part2): `cd part2 && npm install`
- Run E2E tests: `cd part2 && npx playwright test`
- Install deps (part3): `cd part3 && npm install`
- Run AI validation: `cd part3 && npm run validate`

## Environment variables (see .env.example)
- TRUPEER_EMAIL / TRUPEER_PASSWORD — test account login
- TRUPEER_BASE_URL — app URL
- LLM_API_KEY — API key for the LLM used in Part 3 as the judge
- LLM_PROVIDER — which provider (claude / gemini / etc.)