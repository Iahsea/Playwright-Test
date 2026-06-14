import { expect, type Page, type Response } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<Response | null> {
    const response = await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlays();
    return response;
  }

  async expectSuccessfulResponse(response: Response | null): Promise<void> {
    expect(response, 'Navigation should produce a main-document response').not.toBeNull();
    expect(response!.status(), `Unexpected HTTP status for ${response!.url()}`).toBeLessThan(400);
  }

  async dismissOverlays(): Promise<void> {
    const buttons = [
      this.page.getByRole('button', { name: /accept|agree|got it/i }),
      this.page.getByRole('button', { name: /close|dismiss|not now/i }),
      this.page.locator('[aria-label*="close" i]'),
    ];

    for (const candidate of buttons) {
      const button = candidate.first();
      if (await button.isVisible({ timeout: 800 }).catch(() => false)) {
        await button.click({ timeout: 2_000 }).catch(() => undefined);
      }
    }
  }

  async expectCorePage(): Promise<void> {
    await expect(this.page.locator('body')).toBeVisible();
    await expect(this.page.locator('body')).not.toContainText(/404\s*(page)?\s*not found|500\s*internal server error/i);
  }
}

