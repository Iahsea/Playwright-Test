import { test } from '@playwright/test';

/**
 * Spec chẩn đoán tạm thời (KHÔNG thuộc bộ regression chính thức).
 * Mục tiêu: dò các trang công khai chính của GFG để phát hiện bug/issue
 * ngoài 4 bug đã biết. Mọi phát hiện được log ra console, không assert
 * (để thu thập đầy đủ thay vì dừng ở lỗi đầu tiên).
 */

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Article', path: '/python/python-program-to-add-two-numbers/' },
  { name: 'Practice', path: '/explore' },
  { name: 'Courses', path: '/courses' },
];

for (const target of PAGES) {
  test(`audit ${target.name} (${target.path})`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const failedRequests: { url: string; status: number; type: string }[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200));
    });
    page.on('pageerror', (err) => pageErrors.push(err.message.slice(0, 200)));
    page.on('response', (res) => {
      if (res.status() >= 400) {
        failedRequests.push({
          url: res.url().slice(0, 120),
          status: res.status(),
          type: res.request().resourceType(),
        });
      }
    });

    await page.goto(target.path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3_000);
    // Cuộn để kích hoạt lazy-load
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(2_000);

    const audit = await page.evaluate(() => {
      const result: Record<string, unknown> = {};

      // 1. Thẻ <html lang> (accessibility / SEO)
      result.htmlLang = document.documentElement.getAttribute('lang') || '(MISSING)';

      // 2. Tiêu đề và meta description (SEO)
      result.title = document.title || '(MISSING)';
      result.metaDescription =
        document.querySelector('meta[name="description"]')?.getAttribute('content')?.slice(0, 80) ||
        '(MISSING)';

      // 3. Ảnh hỏng (đã load nhưng naturalWidth = 0) và ảnh thiếu alt
      const imgs = Array.from(document.images);
      result.totalImages = imgs.length;
      result.brokenImages = imgs
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc.slice(0, 100))
        .slice(0, 10);
      result.imagesWithoutAlt = imgs.filter((img) => !img.hasAttribute('alt')).length;

      // 4. Nút không có accessible name
      const buttons = Array.from(document.querySelectorAll('button'));
      result.buttonsWithoutLabel = buttons.filter((b) => {
        const text = (b.textContent ?? '').trim();
        const aria = b.getAttribute('aria-label') || b.getAttribute('title');
        return !text && !aria && b.children.length === 0;
      }).length;

      // 5. ID trùng lặp (DOM invalid)
      const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
      const seen = new Set<string>();
      const dupes = new Set<string>();
      for (const id of ids) {
        if (seen.has(id)) dupes.add(id);
        seen.add(id);
      }
      result.duplicateIds = Array.from(dupes).slice(0, 10);

      // 6. Link rỗng (href="#" hoặc href trống)
      const links = Array.from(document.querySelectorAll('a'));
      result.emptyHrefLinks = links.filter((a) => {
        const href = a.getAttribute('href');
        return href === '#' || href === '' || href === 'javascript:void(0)';
      }).length;

      // 7. Mixed content (http trên trang https)
      result.mixedContent = [
        ...Array.from(document.querySelectorAll('img[src^="http:"]')),
        ...Array.from(document.querySelectorAll('script[src^="http:"]')),
        ...Array.from(document.querySelectorAll('link[href^="http:"]')),
      ].length;

      // 8. Có viewport meta không (responsive)
      result.hasViewportMeta = !!document.querySelector('meta[name="viewport"]');

      return result;
    });

    console.log(`\n========== AUDIT: ${target.name} (${target.path}) ==========`);
    console.log('HTML lang:', audit.htmlLang);
    console.log('Title:', String(audit.title).slice(0, 80));
    console.log('Meta description:', audit.metaDescription);
    console.log('Has viewport meta:', audit.hasViewportMeta);
    console.log('Total images:', audit.totalImages);
    console.log('Broken images:', JSON.stringify(audit.brokenImages));
    console.log('Images without alt:', audit.imagesWithoutAlt);
    console.log('Buttons without accessible name:', audit.buttonsWithoutLabel);
    console.log('Duplicate IDs:', JSON.stringify(audit.duplicateIds));
    console.log('Empty/placeholder href links:', audit.emptyHrefLinks);
    console.log('Mixed content (http on https):', audit.mixedContent);
    console.log(`Console errors (${consoleErrors.length}):`, JSON.stringify(consoleErrors.slice(0, 8), null, 1));
    console.log(`Page (JS) errors (${pageErrors.length}):`, JSON.stringify(pageErrors.slice(0, 8), null, 1));
    console.log(
      `Failed requests (${failedRequests.length}):`,
      JSON.stringify(failedRequests.slice(0, 12), null, 1),
    );
    console.log('=============================================\n');
  });
}
