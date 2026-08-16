import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Navigate to the login page. */
  async navigate(): Promise<void> {
    await this.goto('/auth?tab=login');
    await this.waitForLoad();
  }

  /** Fill in the email and password fields. */
  async enterCredentials(email: string, password: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
  }

  /** Submit the login form. */
  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
}
