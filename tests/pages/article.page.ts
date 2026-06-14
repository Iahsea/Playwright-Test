import { expect, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ArticlePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async expectArticle(title: RegExp): Promise<void> {
    await this.expectCorePage();
    await expect(this.page.getByRole('heading', { level: 1 }).first()).toContainText(title);
    await expect(this.page.getByRole('paragraph').filter({ hasText: /binary search/i }).first()).toBeVisible();
    const activeCodePanel = this.page.getByRole('tabpanel', { name: 'C++' }).first();
    await expect(activeCodePanel).toBeVisible();
    await expect(activeCodePanel).toContainText(/binarySearch|#include/);
  }

  async expectInternalLinks(): Promise<void> {
    const link = this.page.getByRole('link', { name: /searching algorithm|try it yourself/i }).first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /\S+/);
  }
}
