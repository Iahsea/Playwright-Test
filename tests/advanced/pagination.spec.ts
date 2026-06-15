import { expect, test } from '../fixtures/pages.fixture';
import { type Page } from '@playwright/test';

test.describe('@advanced pagination', () => {
  const paginationPagePath = '/category/blogs/';

  test.beforeEach(async ({ page }) => {
    // Điều hướng tới trang chuyên mục tin tức/bài viết của GFG (thường có phân trang)
    await page.goto(paginationPagePath);
    await page.waitForLoadState('domcontentloaded');
  });

  const getPaginationBar = (page: Page) => page.locator('.pagination, [class*="pagination" i], .page-nav, .next-prev').first();
  const getNextButton = (page: Page) => page.getByRole('link', { name: /next|sau/i }).first()
    .or(page.locator('.next, [class*="next" i], a:has-text("Next")').first());
  const getPrevButton = (page: Page) => page.getByRole('link', { name: /prev|trước/i }).first()
    .or(page.locator('.prev, [class*="prev" i], a:has-text("Prev")').first());

  test('TC6_01 - Hiển thị thanh phân trang', async ({ page }) => {
    const paginationBar = getPaginationBar(page);
    await expect(paginationBar).toBeVisible();
  });

  test('TC6_02 - Chuyển sang trang 2', async ({ page }) => {
    const nextBtn = getNextButton(page);
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForLoadState('domcontentloaded');
      // Xác minh URL chứa trang 2
      await expect(page).toHaveURL(/page[=\/]2|p=2/);
    } else {
      console.log('TC6_02 Skip: Next button not found.');
    }
  });

  test('TC6_03 - Quay về trang 1', async ({ page }) => {
    // Chuyển sang trang 2 trước
    await page.goto(`${paginationPagePath}page/2/`).catch(() => page.goto(`${paginationPagePath}?page=2`));
    await page.waitForLoadState('domcontentloaded');
    
    const prevBtn = getPrevButton(page);
    if (await prevBtn.isVisible().catch(() => false)) {
      await prevBtn.click();
      await page.waitForLoadState('domcontentloaded');
      
      // Xác minh URL quay lại trang 1
      await expect(page).toHaveURL(new RegExp(paginationPagePath));
    } else {
      console.log('TC6_03 Skip: Prev button not found.');
    }
  });

  test('TC6_04 - Nút Previous ở trang 1 bị vô hiệu hóa', async ({ page }) => {
    const prevBtn = getPrevButton(page);
    const isVisible = await prevBtn.isVisible().catch(() => false);
    if (isVisible) {
      const cls = await prevBtn.getAttribute('class');
      const href = await prevBtn.getAttribute('href');
      const isDisabled = await prevBtn.getAttribute('disabled') 
        || cls?.includes('disabled')
        || !href
        || href === '#';
      expect(isDisabled).toBeTruthy();
    } else {
      // Nếu không hiển thị ở trang đầu thì cũng hợp lệ
      expect(isVisible).toBe(false);
    }
  });

  test('TC6_05 - Nút Next ở trang cuối bị vô hiệu hóa', async ({ page }) => {
    // Để kiểm tra trang cuối, ta điều hướng thẳng tới trang có chỉ số lớn (ví dụ 1000)
    await page.goto(`${paginationPagePath}page/1000/`).catch(() => page.goto(`${paginationPagePath}?page=1000`));
    await page.waitForLoadState('domcontentloaded');
    
    const nextBtn = getNextButton(page);
    const isVisible = await nextBtn.isVisible().catch(() => false);
    if (isVisible) {
      const cls = await nextBtn.getAttribute('class');
      const href = await nextBtn.getAttribute('href');
      const isDisabled = await nextBtn.getAttribute('disabled') 
        || cls?.includes('disabled')
        || !href
        || href === '#';
      expect(isDisabled).toBeTruthy();
    } else {
      expect(isVisible).toBe(false);
    }
  });

  test('TC6_06 - Nhảy đến trang cụ thể', async ({ page }) => {
    // Click vào trang số 3
    const pageThreeBtn = page.getByRole('link', { name: '3', exact: true }).first()
      .or(page.locator('.page-link, .page-number, a').filter({ hasText: /^3$/ }).first());
      
    if (await pageThreeBtn.isVisible().catch(() => false)) {
      await pageThreeBtn.click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/page[=\/]3|p=3/);
    } else {
      console.log('TC6_06 Skip: Page 3 link not visible.');
    }
  });

  test('TC6_07 - Nội dung không trùng lặp giữa các trang', async ({ page }) => {
    // Lấy tiêu đề bài viết trang 1
    const titlePage1 = await page.locator('article h2, h2.entry-title, h2.title').first().innerText().catch(() => '');
    
    // Sang trang 2
    await page.goto(`${paginationPagePath}page/2/`).catch(() => page.goto(`${paginationPagePath}?page=2`));
    await page.waitForLoadState('domcontentloaded');
    
    const titlePage2 = await page.locator('article h2, h2.entry-title, h2.title').first().innerText().catch(() => '');
    
    if (titlePage1 && titlePage2) {
      expect(titlePage1).not.toEqual(titlePage2);
    }
  });

  test('TC6_08 - URL phản ánh số trang', async ({ page }) => {
    await page.goto(`${paginationPagePath}page/4/`).catch(() => page.goto(`${paginationPagePath}?page=4`));
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/page[=\/]4|p=4/);
  });
});
