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

  /**
   * Cuộn qua trang theo từng bước để kích hoạt lazy-load ảnh trước khi kiểm tra.
   */
  async scrollThroughPage(steps = 5, pauseMs = 600): Promise<void> {
    for (let i = 1; i <= steps; i++) {
      await this.page.evaluate(
        (frac) => window.scrollTo(0, document.body.scrollHeight * frac),
        i / steps,
      );
      await this.page.waitForTimeout(pauseMs);
    }
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * GFG-008 — Mọi ảnh NỘI DUNG do GFG sở hữu phải có thuộc tính `alt` (a11y/SEO).
   * Loại trừ các trường hợp GFG không kiểm soát hoặc không phải ảnh nội dung:
   *  - pixel tracking bên thứ ba (t.co, twitter, bing…) — không thuộc domain GFG
   *  - pixel 1×1 (spacer/tracking)
   *  - data-URI placeholder của cơ chế lazy-load
   */
  async expectContentImagesHaveAlt(): Promise<void> {
    const offenders = await this.page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => !img.hasAttribute('alt'))
        .map((img) => {
          let domain = '';
          try {
            domain = new URL(img.currentSrc || img.src, location.href).host;
          } catch {
            domain = '';
          }
          return {
            domain,
            w: img.naturalWidth,
            h: img.naturalHeight,
            src: (img.currentSrc || img.src).slice(0, 100),
          };
        })
        // media.geeksforgeeks.org là CDN của GFG nên cũng tính là ảnh do GFG sở hữu
        .filter((info) => /(^|\.)geeksforgeeks\.org$/.test(info.domain))
        .filter((info) => !(info.w <= 1 && info.h <= 1))
        .filter((info) => !info.src.startsWith('data:')),
    );

    expect(
      offenders,
      `BUG GFG-008: ${offenders.length} ảnh nội dung GFG thiếu thuộc tính alt ` +
        `(rào cản screen reader, mất SEO ảnh): ${JSON.stringify(offenders.slice(0, 15), null, 1)}`,
    ).toHaveLength(0);
  }

  /**
   * GFG-003 — Điều hướng tới một URL slug cũ và xác nhận nó KHÔNG trả về 404.
   * URL hợp lệ phải hoặc redirect (3xx) hoặc serve nội dung trực tiếp (200).
   * Trả về thông tin chuỗi response để spec đánh giá chi tiết (301 vs 302...).
   */
  async expectLegacyUrlResolves(
    path: string,
  ): Promise<{ finalStatus: number; redirected: boolean; permanent: boolean }> {
    const documentStatuses: number[] = [];
    const handler = (response: Response): void => {
      if (response.request().resourceType() === 'document') {
        documentStatuses.push(response.status());
      }
    };

    this.page.on('response', handler);
    const finalResponse = await this.goto(path);
    this.page.off('response', handler);

    const finalStatus = finalResponse?.status() ?? 0;
    expect(
      finalStatus,
      `BUG GFG-003: ${path} trả về HTTP ${finalStatus}; URL cũ không được là 404 (phải redirect hoặc serve 200)`,
    ).not.toBe(404);

    return {
      finalStatus,
      redirected: documentStatuses.some((status) => status >= 300 && status < 400),
      permanent: documentStatuses.includes(301),
    };
  }
}

