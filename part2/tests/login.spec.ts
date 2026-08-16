import { test, expect } from '../fixtures/pages.fixture';
import { getEnvVar } from '../utils/env';

test('user can log in with valid credentials and lands on the dashboard', async ({
  loginPage,
  dashboardPage,
}) => {
  await loginPage.navigate();
  await loginPage.enterCredentials(getEnvVar('TRUPEER_EMAIL'), getEnvVar('TRUPEER_PASSWORD'));
  await loginPage.submit();

  await dashboardPage.verifyLanded();
});
