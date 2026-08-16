import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * A "what's new" promo modal appears on every fresh login session (no
   * dismissal flag yet in the new browser context) and sets the rest of the
   * page aria-hidden while open, which hides it from role-based locators and
   * blocks clicks. Dismiss it if present before interacting with the dashboard.
   */
  private async dismissWelcomeModalIfPresent(): Promise<void> {
    const closeButton = this.page.getByRole('button', { name: 'Close' });
    try {
      await closeButton.waitFor({ state: 'visible', timeout: 5_000 });
      await closeButton.click();
    } catch {
      // Modal didn't appear this session — nothing to dismiss.
    }
  }

  /** Verify the user has landed on the dashboard after a successful login. */
  async verifyLanded(): Promise<void> {
    await this.dismissWelcomeModalIfPresent();

    await expect(
      this.page,
      'Expected to land on the dashboard home URL after login'
    ).toHaveURL(/app\.trupeer\.ai\/?$/);
    await expect(
      this.page.getByRole('heading', { name: /welcome back/i }),
      'Expected the "Welcome back" dashboard heading to be visible after login'
    ).toBeVisible();
  }

  /** Open an existing video from the dashboard into the editor. */
  async openExistingVideo(videoTitle: string): Promise<void> {
    await this.dismissWelcomeModalIfPresent();

    await this.page.getByRole('link', { name: 'Library' }).click();
    await this.page.getByText(videoTitle).click();
    await this.page.getByRole('link', { name: 'Edit video' }).click();
  }
}
