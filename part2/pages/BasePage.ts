import { Page } from '@playwright/test';

/**
 * Shared functionality every page object inherits. Kept deliberately thin —
 * page-specific selectors and assertions belong in the subclasses, not here.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async waitForLoad(): Promise<void> {
    // This app hydrates client-side; interacting with inputs before that
    // finishes silently drops the value, so 'load' alone isn't enough.
    await this.page.waitForLoadState('networkidle');
  }
}
