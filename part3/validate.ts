import { chromium } from 'playwright';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// .env lives at the repo root and is shared with part2
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { LoginPage } from '../part2/pages/LoginPage';
import { DashboardPage } from '../part2/pages/DashboardPage';
import { EditorPage } from '../part2/pages/EditorPage';
import { getEnvVar } from '../part2/utils/env';
import { judgeScriptModification, Judgment } from './llmJudge';

const VIDEO_TITLE = 'Playwright Automation Project Setup';
const OUTPUT_FILE = path.resolve(__dirname, 'sample-output.txt');

const PROMPTS = [
  'Make this more professional',
  'Add a call to action at the end',
  'Translate to Spanish',
  'Make this script more concise',
];

type PromptResult = {
  prompt: string;
  judgment: Judgment | null;
  error?: string;
};

// Every line printed during the run is also collected here so the exact same
// output can be written to sample-output.txt at the end — one source of
// truth instead of a separate "build the file" step that could drift from
// what actually printed.
const outputLines: string[] = [];
function log(line: string = ''): void {
  console.log(line);
  outputLines.push(line);
}

async function main(): Promise<void> {
  const browser = await chromium.launch();
  // BasePage.goto() navigates with relative paths, relying on a baseURL —
  // the Playwright test runner injects that automatically, but this script
  // drives a browser directly, so it has to be set explicitly here.
  const context = await browser.newContext({ baseURL: getEnvVar('TRUPEER_BASE_URL') });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const editorPage = new EditorPage(page);

  log('Logging in and opening the editor...');
  await loginPage.navigate();
  await loginPage.enterCredentials(getEnvVar('TRUPEER_EMAIL'), getEnvVar('TRUPEER_PASSWORD'));
  await loginPage.submit();
  await dashboardPage.verifyLanded();
  await dashboardPage.openExistingVideo(VIDEO_TITLE);
  await editorPage.verifyKeyElementsLoaded();

  const originalScript = await editorPage.getScriptText();
  log(`Captured original script (${originalScript.length} chars).\n`);

  const results: PromptResult[] = [];

  for (const prompt of PROMPTS) {
    log(`Running prompt: "${prompt}"`);
    try {
      await editorPage.modifyScriptWithAI(prompt);
      const modifiedScript = await editorPage.getScriptText();

      const judgment = await judgeScriptModification({ originalScript, prompt, modifiedScript });
      results.push({ prompt, judgment });
    } catch (err) {
      results.push({ prompt, judgment: null, error: err instanceof Error ? err.message : String(err) });
    } finally {
      // Reset to the original script before the next prompt, regardless of
      // whether this one succeeded — otherwise prompts would compound on
      // each other's output instead of each being judged against the original.
      await editorPage.discardScriptChanges().catch(() => {});
    }
  }

  await browser.close();

  printResults(originalScript, results);

  fs.writeFileSync(OUTPUT_FILE, outputLines.join('\n') + '\n');
  console.log(`\nSaved output to ${OUTPUT_FILE}`);
}

function printResults(originalScript: string, results: PromptResult[]): void {
  log('\n=== AI Script Rewrite Validation Results ===');
  log(`Original script (${originalScript.length} chars): "${originalScript}"\n`);

  let passCount = 0;

  for (const { prompt, judgment, error } of results) {
    log(`Prompt: "${prompt}"`);

    if (!judgment) {
      log(`  ERROR: ${error}\n`);
      continue;
    }

    const criteria: [string, Judgment['intentMatch']][] = [
      ['Intent match', judgment.intentMatch],
      ['Coherence & grammar', judgment.coherenceAndGrammar],
      ['Information preservation', judgment.informationPreservation],
      ['Meaningful transformation', judgment.meaningfulTransformation],
      ['Length/scope sanity', judgment.lengthScopeSanity],
    ];

    const overallPass = criteria.every(([, c]) => c.pass);
    if (overallPass) passCount++;

    for (const [label, c] of criteria) {
      log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${label} — ${c.reason}`);
    }
    log(`  Confidence: ${judgment.confidence.toFixed(2)}`);
    log(`  Overall: ${overallPass ? 'PASS' : 'FAIL'}\n`);
  }

  log(`Summary: ${passCount}/${results.length} prompts passed all criteria.`);
}

main().catch((err) => {
  console.error('validate.ts failed:', err);
  process.exit(1);
});
