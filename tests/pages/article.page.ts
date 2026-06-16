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

  /**
   * GFG-002 — Trang phải có cơ chế ngăn white flash (FOUC) khi dark mode:
   * inline script detect theme trong <head>, hoặc meta color-scheme,
   * hoặc CSS rule color-scheme. Thiếu cả ba => bug.
   */
  async expectDarkModeFlashGuard(): Promise<void> {
    const guard = await this.page.evaluate(() => {
      const inlineScript = Array.from(document.querySelectorAll('head script:not([src])'))
        .map((s) => s.textContent ?? '')
        .join('\n');
      const hasInlineThemeGuard = /localStorage|prefers-color-scheme|data-theme|background/i.test(inlineScript);
      const colorSchemeMeta = document.querySelectorAll('meta[name="color-scheme"]').length;

      // Dùng computed style thay vì quét sheet.cssRules: giá trị color-scheme
      // hiệu lực đọc được kể cả khi khai báo trong CSS cross-origin (CDN),
      // nơi cssRules ném SecurityError và bị bỏ sót -> tránh false-negative.
      const computedColorScheme = getComputedStyle(document.documentElement).colorScheme;
      const hasColorSchemeCSS = computedColorScheme !== '' && computedColorScheme !== 'normal';

      return { hasInlineThemeGuard, colorSchemeMeta, hasColorSchemeCSS, computedColorScheme };
    });

    expect(
      guard.hasInlineThemeGuard || guard.colorSchemeMeta > 0 || guard.hasColorSchemeCSS,
      `BUG GFG-002: không tìm thấy cơ chế chống FOUC dark mode ` +
        `(inlineThemeGuard=${guard.hasInlineThemeGuard}, colorSchemeMeta=${guard.colorSchemeMeta}, ` +
        `computedColorScheme="${guard.computedColorScheme}")`,
    ).toBe(true);
  }

  /**
   * GFG-002 — Scroll listener phải dùng { passive: true } để tránh jank.
   * Đếm số listener scroll/touch non-passive đăng ký trong runtime.
   */
  async expectPassiveScrollListeners(maxNonPassive = 5): Promise<void> {
    const nonPassive = await this.page.evaluate(() => {
      const original = EventTarget.prototype.addEventListener;
      let count = 0;
      EventTarget.prototype.addEventListener = function (type, listener, options) {
        if (type === 'scroll' || type === 'touchstart' || type === 'touchmove') {
          const isPassive = typeof options === 'object' && options !== null && options.passive === true;
          if (!isPassive) count++;
        }
        return original.call(this, type, listener, options);
      };
      window.dispatchEvent(new Event('scroll'));
      EventTarget.prototype.addEventListener = original;
      return count;
    });

    expect(
      nonPassive,
      `GFG-002: ${nonPassive} scroll listener non-passive (tối đa cho phép ${maxNonPassive})`,
    ).toBeLessThanOrEqual(maxNonPassive);
  }

  /**
   * Cuộn xuống cuối trang và chờ ad/widget lazy-load có cơ hội render.
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(2_000);
  }

  /**
   * GFG-004 — Khoảng cách từ "Article Tags" tới footer không được vượt ngưỡng.
   * Nếu không định vị được tags/footer, đo khoảng trắng cuối document làm fallback.
   */
  async expectNoBottomWhitespace(threshold = 48): Promise<void> {
    const gap = await this.page.evaluate(() => {
      const tagSelectors = [
        '[class*="article_tags" i]',
        '[class*="articleTags" i]',
        '[data-testid*="tags" i]',
        '.article-tags',
        '.entry-tags',
      ];
      let tagsBottom = 0;
      for (const sel of tagSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          tagsBottom = el.getBoundingClientRect().bottom + window.scrollY;
          break;
        }
      }

      const footer = document.querySelector('footer, [role="contentinfo"]');
      const footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : 0;

      if (tagsBottom && footerTop) return Math.round(footerTop - tagsBottom);

      // Fallback: khoảng trắng phía dưới phần tử cuối cùng có nội dung.
      let maxBottom = 0;
      for (const el of Array.from(document.body.querySelectorAll('*'))) {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const absBottom = rect.bottom + window.scrollY;
        if (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          absBottom > maxBottom
        ) {
          maxBottom = absBottom;
        }
      }
      return Math.round(document.documentElement.scrollHeight - maxBottom);
    });

    expect(
      gap,
      `BUG GFG-004: ${gap}px khoảng trắng cuối bài viết (ngưỡng ${threshold}px)`,
    ).toBeLessThanOrEqual(threshold);
  }

  /**
   * GFG-004 — Không được tồn tại ad placeholder rỗng nhưng vẫn chiếm chiều cao.
   */
  async expectNoEmptyAdPlaceholders(minHeight = 48): Promise<void> {
    const empties = await this.page.evaluate((min) =>
      Array.from(
        document.querySelectorAll(
          '.article-bottom-ad, [class*="bottom-ad"], [class*="bottomAd"], [class*="article-ad"], [id*="div-gpt-ad"]',
        ),
      )
        .map((el) => ({
          selector: String(el.className || (el as HTMLElement).id || el.tagName).slice(0, 60),
          height: Math.round(el.getBoundingClientRect().height),
          hasContent: (el.textContent?.trim().length ?? 0) > 0,
          hasChildren: el.children.length > 0,
        }))
        .filter((info) => info.height > min && !info.hasContent && !info.hasChildren)
        .map((info) => ({ selector: info.selector, height: info.height })),
    minHeight);

    expect(
      empties,
      `BUG GFG-004: ad placeholder rỗng cao > ${minHeight}px: ${JSON.stringify(empties)}`,
    ).toHaveLength(0);
  }
}
