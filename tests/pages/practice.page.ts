import { expect, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class PracticePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    const response = await this.goto('/explore');
    await this.expectSuccessfulResponse(response);
  }

  async expectLoaded(): Promise<void> {
    await this.expectCorePage();
    await expect(this.page).toHaveURL(/explore|practice|problems/i);
    await expect(this.page.locator('main, [role="main"], body').first()).toContainText(/problem|practice/i);
  }

  async search(term: string): Promise<void> {
    const input = this.page.getByPlaceholder(/search.*problem|search/i).first()
      .or(this.page.getByRole('searchbox').first());
    await expect(input).toBeVisible();
    await input.fill(term);
    await input.press('Enter').catch(() => undefined);
  }
}
