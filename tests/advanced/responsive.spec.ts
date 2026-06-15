import { expect, test } from '../fixtures/pages.fixture';

test.describe('@advanced responsive-ui', () => {

  test('TC3_01 - Menu Navigation Desktop', async ({ homePage, page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await homePage.open();
    
    // Tìm thanh menu điều hướng
    const navMenu = page.locator('header, nav, .navbar, [class*="nav" i], [class*="header" i], [class*="menu" i]').first();
    await expect(navMenu).toBeVisible();
    
    // Nút hamburger menu cho mobile không nên xuất hiện trên desktop
    const hamburgerBtn = page.locator('.hamburger-menu, .menu-icon, [class*="hamburger" i]').first();
    const isVisible = await hamburgerBtn.isVisible().catch(() => false);
    if (isVisible) {
      // Nếu có xuất hiện, nó phải bị ẩn đi hoặc không thể nhấn được
      await expect(hamburgerBtn).not.toBeVisible();
    }
  });

  test('TC3_02 - Menu Navigation Mobile', async ({ homePage, page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await homePage.open();
    
    // Nút hamburger menu xuất hiện trên giao diện mobile
    const hamburgerBtn = page.getByRole('button', { name: /menu|navigation/i }).first()
      .or(page.locator('.hamburger-menu, .menu-icon, [class*="hamburger" i], [aria-label*="menu" i]').first());
    await expect(hamburgerBtn).toBeVisible();
  });

  test('TC3_03 - Mở Hamburger Menu', async ({ homePage, page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await homePage.open();
    
    const hamburgerBtn = page.getByRole('button', { name: /menu|navigation/i }).first()
      .or(page.locator('.hamburger-menu, .menu-icon, [class*="hamburger" i], [aria-label*="menu" i]').first());
    await expect(hamburgerBtn).toBeVisible();
    
    // Click mở menu
    await hamburgerBtn.click();
    
    // Chờ panel menu xuất hiện
    const drawerMenu = page.locator('[class*="drawer" i], [class*="sidebar" i], [class*="mobile-menu" i], .navigation').first();
    await expect(drawerMenu).toBeVisible();
  });

  test('TC3_04 - Hình ảnh co giãn', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    
    // Lấy tất cả hình ảnh trong phần content
    const images = page.locator('img');
    const count = await images.count();
    if (count > 0) {
      const img = images.first();
      await expect(img).toBeVisible();
      const box = await img.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(768);
      }
    }
  });

  test('TC3_05 - Thanh tìm kiếm', async ({ homePage, page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await homePage.open();
    
    // Tìm và mở ô tìm kiếm trên mobile nếu có trigger
    const searchTrigger = page.locator('.search-icon, [aria-label*="search" i], button:has-text("Search")').first();
    if (await searchTrigger.isVisible().catch(() => false)) {
      await searchTrigger.click();
    }
    
    const searchInput = homePage.searchInput;
    await expect(searchInput).toBeVisible();
  });

  test('TC3_06 - Font chữ đọc được', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    
    // Lấy thẻ div chứa nội dung chính để test font size
    const mainParagraph = page.locator('main p, article p, body').first();
    const fontSize = await mainParagraph.evaluate(el => window.getComputedStyle(el).fontSize);
    const size = parseFloat(fontSize);
    
    expect(size).toBeGreaterThanOrEqual(12);
  });

  test('TC3_07 - Nút bấm đủ lớn', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    
    // Lấy nút hoặc link đầu tiên
    const button = page.locator('button, a[href]').first();
    if (await button.isVisible().catch(() => false)) {
      const box = await button.boundingBox();
      if (box) {
        // WCAG khuyến nghị kích thước target click tối thiểu 44px, nhưng ở web có thể 32px
        expect(box.width).toBeGreaterThanOrEqual(30);
        expect(box.height).toBeGreaterThanOrEqual(30);
      }
    }
  });

  test('TC3_08 - Không cuộn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    
    // Đảm bảo document.documentElement.scrollWidth bằng với window.innerWidth
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});
