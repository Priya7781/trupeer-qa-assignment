import { test } from '../fixtures/pages.fixture';
import { getEnvVar } from '../utils/env';

test('user can open an existing video from the dashboard into the editor', async ({
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
});
