import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class EditorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Verify the timeline, preview, and script panel have all loaded. */
  async verifyKeyElementsLoaded(): Promise<void> {
    await this.waitForLoad();

    // The editor boots a canvas-based video engine after the initial network
    // request settles, so it can render loading skeletons for a while after
    // 'networkidle'. Give these a longer explicit timeout than the global
    // default rather than treating that boot time as a failure.
    const editorReadyTimeout = 15_000;

    // The entire preview (including its "Made with Trupeer.ai" watermark) is
    // painted onto a <canvas> rather than real DOM text/images, so the only
    // meaningful thing to assert on is the canvas element itself. There are
    // two <canvas> elements (a visible preview and an offscreen render
    // buffer marked with an "invisible" class) and their DOM order isn't
    // guaranteed, so `.first()` isn't reliable — excluding the offscreen one
    // by class is.
    await expect(
      this.page.locator('canvas:not(.invisible)'),
      'Expected the video preview canvas to be visible in the editor'
    ).toBeVisible({ timeout: editorReadyTimeout });
    await expect(
      this.page.getByRole('tab', { name: /script/i }),
      'Expected the Script panel tab to be visible in the editor'
    ).toBeVisible({ timeout: editorReadyTimeout });
    await expect(
      this.page.getByText('Add Scenes'),
      'Expected the timeline (Add Scenes control) to be visible in the editor'
    ).toBeVisible({ timeout: editorReadyTimeout });
  }

  /**
   * The wand icon that opens the "Rewrite with AI" popover has no accessible
   * name or title — only a hover tooltip rendered outside the button itself.
   * It's anchored here relative to the "Revert script version" button (the
   * only labeled control in the same toolbar) instead of a brittle position
   * index.
   */
  private rewriteWithAIButton() {
    return this.page
      .getByRole('button', { name: 'Revert script version' })
      .locator('xpath=following-sibling::button[1]');
  }

  private scriptRewritePromptInput() {
    return this.page.getByPlaceholder(/make it more conversational/i);
  }

  /** Open the "Rewrite with AI" popover without submitting anything. */
  async openScriptRewritePopover(): Promise<void> {
    await this.rewriteWithAIButton().click();
  }

  /** Type into the "Rewrite with AI" prompt field. */
  async fillScriptRewritePrompt(text: string): Promise<void> {
    await this.scriptRewritePromptInput().fill(text);
  }

  /** Read back whatever the prompt field actually holds right now. */
  async getScriptRewritePromptValue(): Promise<string> {
    return this.scriptRewritePromptInput().inputValue();
  }

  /** Trigger the "Modify Script with AI" action. */
  async modifyScriptWithAI(prompt: string): Promise<void> {
    await this.openScriptRewritePopover();
    await this.fillScriptRewritePrompt(prompt);
    await this.page.getByRole('button', { name: 'Rewrite script' }).click();

    // The rewritten text replaces the script panel in place, and "Keep
    // changes" / "Discard changes" controls appear once it has — that's the
    // reliable signal the new script is now displayed, rather than a fixed
    // wait for the AI call to "probably" be done.
    await expect(
      this.page.getByRole('button', { name: 'Keep changes' }),
      'Expected "Keep changes" to appear once the AI rewrite is applied to the script panel'
    ).toBeVisible({ timeout: 30_000 });
  }

  /**
   * Discard a pending AI rewrite, reverting the script panel to its last
   * saved state. Only valid right after `modifyScriptWithAI` — the
   * "Discard changes" button only exists while a rewrite is pending review.
   */
  async discardScriptChanges(): Promise<void> {
    const discardButton = this.page.getByRole('button', { name: 'Discard changes' });
    await discardButton.click();
    await expect(
      discardButton,
      'Expected "Discard changes" to disappear once the rewrite is discarded'
    ).toBeHidden();
  }

  /** Read back the resulting script text after an AI modification. */
  async getScriptText(): Promise<string> {
    // Each script line is its own Slate.js editor instance; empty lines
    // render literal placeholder text ("Enter script text...") as real
    // textContent, so those are filtered out rather than joined in.
    const lines = await this.page.locator('[class*="slateEditor"]').allTextContents();
    return lines
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line !== 'Enter script text...')
      .join(' ');
  }

  /**
   * Select a different preset background than whichever one is currently
   * active, under Visuals > Background. This is marked up as a real ARIA
   * radiogroup, but `aria-checked` never actually flips on click — verified
   * by hand, it reads "false" for every swatch both before and after
   * selecting one, which is an accessibility bug in the app. Selection is
   * tracked via the green checkmark badge the UI visually renders on the
   * active swatch instead.
   *
   * Indices (not a locator filtered by the checkmark) are used to track
   * which swatch was previously selected: locators re-query the live DOM on
   * every use, so a locator built from "has a checkmark" before the click
   * would silently point at the *new* selection by the time it's asserted
   * on. Position in the grid doesn't change when selection does, so indices
   * stay stable across the click.
   */
  async changeBackground(): Promise<void> {
    await this.page.getByRole('tab', { name: /visuals/i }).click();

    const backgroundOptions = this.page
      .getByRole('radiogroup', { name: 'Image selector' })
      .getByRole('radio');
    await expect(
      backgroundOptions.first(),
      'Expected at least one background swatch to be visible'
    ).toBeVisible();

    const optionCount = await backgroundOptions.count();
    const checkmarkPath = 'path[d^="M7 0C3.143"]';
    const previouslySelectedIndex = await backgroundOptions.evaluateAll(
      (radios, selector) => radios.findIndex((radio) => !!radio.querySelector(selector)),
      checkmarkPath
    );
    const indexToSelect = (previouslySelectedIndex + 1) % optionCount;

    await backgroundOptions.nth(indexToSelect).click();

    await expect(
      backgroundOptions.nth(indexToSelect).locator(checkmarkPath),
      'Expected the newly clicked background swatch to show the selected checkmark'
    ).toBeVisible();
    if (previouslySelectedIndex < 0) {
      return;
    }
    await expect(
      backgroundOptions.nth(previouslySelectedIndex).locator(checkmarkPath),
      'Expected the previously selected background swatch to no longer show the selected checkmark'
    ).toBeHidden();

    // Unlike the AI script rewrite, background selection saves immediately
    // (a POST to /api/update/metadata fires on click, with no "keep/discard"
    // review step) — restore the original swatch so this test doesn't leave
    // a permanent side effect on the shared test video.
    await backgroundOptions.nth(previouslySelectedIndex).click();
    await expect(
      backgroundOptions.nth(previouslySelectedIndex).locator(checkmarkPath),
      'Expected the original background swatch to be restored'
    ).toBeVisible();
  }
}
