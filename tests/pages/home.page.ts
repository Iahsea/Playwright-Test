import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly logo: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.getByRole('link', { name: /geeksforgeeks/i }).first()
      .or(page.locator('a[href="/"]').filter({ has: page.locator('img') }).first());
    this.searchInput = page.getByRole('searchbox').first()
      .or(page.getByPlaceholder(/search/i).first())
      .or(page.locator('input[type="search"]').first());
  }

  async open(): Promise<void> {
    const response = await this.goto('/');
    await this.expectSuccessfulResponse(response);
  }

  async expectLoaded(): Promise<void> {
    await this.expectCorePage();
    await expect(this.page).toHaveTitle(/geeksforgeeks/i);
    await expect(this.logo).toBeVisible();
    await expect(this.searchInput).toBeVisible();
    await expect(this.page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(this.page.locator('main, [role="main"], body').first()).toContainText(/\S+/);
  }

  async openPrimaryLink(name: RegExp): Promise<void> {
    const link = this.page.getByRole('link', { name }).first();
    await expect(link).toBeVisible();
    await link.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.dismissOverlays();
  }

  async search(term: string): Promise<void> {
    if (!(await this.searchInput.isVisible({ timeout: 2_000 }).catch(() => false))) {
      const trigger = this.page.getByRole('button', { name: /search/i }).first()
        .or(this.page.locator('[aria-label*="search" i]').first());
      await trigger.click();
    }
    await expect(this.searchInput).toBeVisible();
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
  }
}
