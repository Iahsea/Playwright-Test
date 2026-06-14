import { expect, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SearchPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async expectResultsFor(term: string): Promise<void> {
    await this.expectCorePage();
    await expect(this.page.locator('main, [role="main"], body').first()).toContainText(
      new RegExp(term.replace(/\s+/g, '\\s*'), 'i'),
    );
    await expect(this.resultLinks().first()).toBeVisible();
  }

  resultLinks() {
    return this.page.locator('article > a[href]').filter({ hasText: /\S+/ });
  }

  async openFirstResult(): Promise<void> {
    const link = this.resultLinks().first();
    await expect(link).toBeVisible();
    await link.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.dismissOverlays();
  }
}
