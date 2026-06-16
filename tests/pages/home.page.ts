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

  /**
   * GFG-001 — Trang không được có overflow ngang: body scrollWidth không vượt
   * viewport, và không thanh nav nào tràn ra ngoài mép phải.
   */
  async expectNoLayoutOverflow(): Promise<void> {
    const overflow = await this.page.evaluate(() => {
      const vw = window.innerWidth;
      const overflowingNavs = Array.from(
        document.querySelectorAll('nav, [class*="nav" i], [class*="menu" i], [role="navigation"]'),
      )
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            cls: String(el.className).slice(0, 80),
            right: Math.round(rect.right + window.scrollX),
          };
        })
        .filter((info) => info.right > vw + 2);
      return { vw, bodyScrollWidth: document.body.scrollWidth, overflowingNavs };
    });

    expect(
      overflow.bodyScrollWidth,
      `BUG GFG-001: body scrollWidth ${overflow.bodyScrollWidth}px vượt viewport ${overflow.vw}px (overflow ngang)`,
    ).toBeLessThanOrEqual(overflow.vw + 1);

    expect(
      overflow.overflowingNavs,
      `BUG GFG-001: nav tràn ngoài viewport: ${JSON.stringify(overflow.overflowingNavs)}`,
    ).toHaveLength(0);
  }

  /**
   * GFG-001 — Không link điều hướng nào bị cắt ký tự đầu (mép trái < 0),
   * ví dụ "Practice Problems" bị cắt thành "ractice Problems".
   */
  async expectNavLinksNotClipped(): Promise<void> {
    const clipped = await this.page.evaluate(() =>
      Array.from(document.querySelectorAll('nav a, [class*="nav" i] a, [class*="menu" i] a'))
        .slice(0, 20)
        .map((a) => ({
          text: (a.textContent ?? '').trim().slice(0, 30),
          left: Math.round(a.getBoundingClientRect().left),
        }))
        .filter((info) => info.left < -2 && info.text.length > 0),
    );

    expect(
      clipped,
      `BUG GFG-001: link nav bị cắt mép trái: ${JSON.stringify(clipped)}`,
    ).toHaveLength(0);
  }
}
