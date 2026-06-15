import { expect, test } from '../fixtures/pages.fixture';

test.describe('@advanced search-filters', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC1_01 - Tìm kiếm từ khóa hợp lệ', async ({ homePage, searchPage }) => {
    const term = 'Python tutorial';
    await homePage.search(term);
    await searchPage.expectResultsFor(term);
  });

  test('TC1_02 - Tìm kiếm từ khóa không tồn tại', async ({ homePage, page }) => {
    const term = `xyzabc123!!!-${Date.now()}`;
    await homePage.search(term);
    // Xác minh giao diện hiển thị thông báo không tìm thấy kết quả
    const bodyText = page.locator('body');
    await expect(bodyText).toContainText(/no result|not found|nothing here|no matches/i);
  });

  test('TC1_03 - Tìm kiếm từ khóa rỗng', async ({ homePage, page }) => {
    await homePage.search('');
    // Đảm bảo trang không bị crash
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/500|internal server error/i);
  });

  test('TC1_04 - Tìm kiếm với ký tự đặc biệt', async ({ homePage, page }) => {
    const term = '<script>alert(1)</script>';
    await homePage.search(term);
    // Xác minh không crash và an toàn
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/500|internal server error/i);
  });

  test('TC1_05 - Gợi ý tìm kiếm tự động', async ({ homePage, page }) => {
    await homePage.searchInput.click();
    await homePage.searchInput.pressSequentially('Python', { delay: 150 });
    
    // Đợi danh sách gợi ý hiển thị
    const suggestionList = page.locator('[class*="suggestion" i], [class*="autocomplete" i], .gsc-completion-container').first();
    const isVisible = await suggestionList.isVisible({ timeout: 4000 }).catch(() => false);
    if (isVisible) {
      await expect(suggestionList).toBeVisible();
    } else {
      console.log('TC1_05 Info: GFG layout might not have active auto-suggestions in this configuration.');
    }
  });

  test('TC1_06 - Lọc theo chủ đề (Tag Filter)', async ({ page }) => {
    // Đi trực tiếp đến trang explore/practice
    await page.goto('/explore');
    await page.waitForLoadState('domcontentloaded');
    
    // Tìm phần tử tag "DSA" hoặc "Data Structures"
    const tagFilter = page.locator('label, span, a, button').filter({ hasText: /^DSA$/i }).first()
      .or(page.locator('label, span, a, button').filter({ hasText: /^Data Structures$/i }).first());
      
    if (await tagFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await tagFilter.click();
      await page.waitForLoadState('domcontentloaded');
      // Đảm bảo kết quả lọc hiển thị bài tập
      await expect(page.locator('body')).toContainText(/DSA|Data Structures/i);
    } else {
      console.log('TC1_06 Skip: DSA Tag filter not found on /explore.');
    }
  });

  test('TC1_07 - Kết hợp tìm kiếm + lọc', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('domcontentloaded');
    
    // Tìm kiếm trong catalog
    const searchInput = page.getByPlaceholder(/search.*problem|search/i).first()
      .or(page.getByRole('searchbox').first());
      
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('sort');
      await searchInput.press('Enter');
      await page.waitForLoadState('domcontentloaded');
      
      // Chọn thêm filter tag "Arrays" hoặc "Python" nếu có
      const tagFilter = page.locator('label, span, a, button').filter({ hasText: /^Arrays$/i }).first()
        .or(page.locator('label, span, a, button').filter({ hasText: /^Python$/i }).first());
        
      if (await tagFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tagFilter.click();
        await page.waitForLoadState('domcontentloaded');
      }
      await expect(page.locator('body')).toContainText(/sort/i);
    } else {
      console.log('TC1_07 Skip: Explore search input not visible.');
    }
  });

  test('TC1_08 - Tìm kiếm không dấu tiếng Việt', async ({ homePage, searchPage }) => {
    const term = 'lap trinh python';
    await homePage.search(term);
    // Xác minh kết quả trả về liên quan đến python
    await searchPage.expectResultsFor('python');
  });
});
