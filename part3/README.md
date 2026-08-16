# Part 3 — AI-Augmented Validation Script

Drives the real "Modify Script with AI" feature end-to-end and uses Claude as
an LLM judge to score each rewrite against a 5-criterion rubric. Reuses the
`LoginPage` / `DashboardPage` / `EditorPage` page objects from `part2/` for
login and navigation — no duplicated automation logic.

## Setup

```bash
cd part3
npm install
```

Requires `TRUPEER_EMAIL`, `TRUPEER_PASSWORD`, `TRUPEER_BASE_URL`,
`LLM_API_KEY`, and `LLM_PROVIDER=claude` set in the `.env` file at the repo
root (shared with `part2`). See `.env.example` there.

## Run

```bash
npm run validate
```

This logs in, opens the same video used by the Part 2 suite, captures the
original script, then for each of 4 prompts:

1. Triggers "Modify Script with AI" with that prompt (reusing `EditorPage.modifyScriptWithAI`).
2. Reads back the resulting script text.
3. Sends the original script, the prompt, and the resulting script to Claude
   (`claude-sonnet-5`, structured output via a Zod schema) to judge against 5
   criteria: intent match, coherence & grammar, information preservation,
   meaningful transformation, and length/scope sanity.
4. Discards the rewrite so the next prompt is judged against the original
   script, not a compounded previous rewrite — and so the shared test video
   is left unchanged when the script finishes.

Results print to the console per-prompt (pass/fail per criterion, plus a
confidence score) and a final `X/4 prompts passed all criteria` summary. The
same output is also written to `sample-output.txt` on every run, so that file
always reflects the most recent run rather than a stale manual copy.

## Files

- `validate.ts` — orchestrates the Playwright flow and prints results.
- `llmJudge.ts` — the Zod rubric schema and the Claude API call.
