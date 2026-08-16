import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EditorPage } from '../pages/EditorPage';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  editorPage: EditorPage;
};

/**
 * Extends Playwright's base `test` so specs can request a ready-to-use page
 * object directly, instead of constructing one in every test.
 */
export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  editorPage: async ({ page }, use) => {
    await use(new EditorPage(page));
  },
});

export { expect } from '@playwright/test';
