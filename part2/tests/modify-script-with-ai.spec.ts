import { test, expect } from '../fixtures/pages.fixture';
import { getEnvVar } from '../utils/env';

test('user can modify the script with AI and see the updated text', async ({
  loginPage,
  dashboardPage,
  editorPage,
}) => {
  await loginPage.navigate();
  await loginPage.enterCredentials(getEnvVar('TRUPEER_EMAIL'), getEnvVar('TRUPEER_PASSWORD'));
  await loginPage.submit();
  await dashboardPage.verifyLanded();
  await dashboardPage.openExistingVideo('Playwright Automation Project Setup');
  await editorPage.verifyKeyElementsLoaded();

  const originalScript = await editorPage.getScriptText();

  await editorPage.modifyScriptWithAI('Make this script more concise');

  const updatedScript = await editorPage.getScriptText();
  expect(
    updatedScript,
    'Expected the script text to be non-empty after an AI rewrite'
  ).not.toBe('');
  expect(
    updatedScript,
    'Expected the script text to change after asking the AI to rewrite it'
  ).not.toBe(originalScript);
});

test('submitting the AI rewrite with an empty prompt is accepted rather than blocked', async ({
  loginPage,
  dashboardPage,
  editorPage,
}) => {
  await loginPage.navigate();
  await loginPage.enterCredentials(getEnvVar('TRUPEER_EMAIL'), getEnvVar('TRUPEER_PASSWORD'));
  await loginPage.submit();
  await dashboardPage.verifyLanded();
  await dashboardPage.openExistingVideo('Playwright Automation Project Setup');
  await editorPage.verifyKeyElementsLoaded();

  const originalScript = await editorPage.getScriptText();

  // Documented actual behavior (confirmed by hand, not assumed): the
  // "Rewrite script" button stays enabled with an empty prompt, and
  // submitting it silently runs a generic rewrite instead of being blocked
  // by a validation error or disabled button. That's a real gap worth
  // flagging — a user who clicks it by mistake gets an unannounced rewrite.
  await editorPage.modifyScriptWithAI('');

  const updatedScript = await editorPage.getScriptText();
  expect(
    updatedScript,
    'Expected an empty-prompt rewrite to still return script text — the app does not validate against this'
  ).not.toBe('');
  expect(
    updatedScript,
    'Expected the empty-prompt rewrite to change the script text rather than being a no-op'
  ).not.toBe(originalScript);
});

test('the AI rewrite prompt silently truncates input beyond 300 characters', async ({
  loginPage,
  dashboardPage,
  editorPage,
}) => {
  await loginPage.navigate();
  await loginPage.enterCredentials(getEnvVar('TRUPEER_EMAIL'), getEnvVar('TRUPEER_PASSWORD'));
  await loginPage.submit();
  await dashboardPage.verifyLanded();
  await dashboardPage.openExistingVideo('Playwright Automation Project Setup');
  await editorPage.verifyKeyElementsLoaded();

  await editorPage.openScriptRewritePopover();

  // Documented actual behavior (confirmed by hand, not assumed): the
  // textarea has a hard maxlength of 300 and silently drops everything past
  // it — mid-word, with no warning or toast telling the user their prompt
  // was cut off. This never reaches the AI, so no API call happens here.
  const longPrompt = 'Make this script more concise. '.repeat(20); // 640 chars
  await editorPage.fillScriptRewritePrompt(longPrompt);

  const actualValue = await editorPage.getScriptRewritePromptValue();
  expect(
    actualValue.length,
    'Expected the prompt field to silently truncate input at 300 characters'
  ).toBe(300);
});
