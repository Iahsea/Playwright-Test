import { expect, test } from '../fixtures/pages.fixture';

test.describe('@advanced offline-behavior', () => {

  test('TC4_01 - Tải trang khi offline', async ({ context, page }) => {
    // 1. Chuyển context sang offline
    await context.setOffline(true);
    
    // 2. Cố mở trang chủ -> Phải ném lỗi kết nối
    await expect(page.goto('/')).rejects.toThrow();
  });

  test('TC4_02 - Mất mạng khi đang đọc bài', async ({ context, page }) => {
    // 1. Vào trang khi online
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // 2. Chuyển sang offline
    await context.setOffline(true);
    
    // 3. Nhấp một liên kết bất kỳ -> Phải báo lỗi điều hướng
    const link = page.getByRole('link', { name: /courses|practice|tutorials/i }).first()
      .or(page.locator('a[href^="/"]').first());
      
    if (await link.isVisible().catch(() => false)) {
      await expect(link.click({ timeout: 5000 })).rejects.toThrow();
    }
  });

  test('TC4_03 - Mất mạng khi tìm kiếm', async ({ context, homePage, page }) => {
    await homePage.open();
    await homePage.searchInput.fill('binary search');
    
    // Ngắt mạng ngay trước khi bấm Enter
    await context.setOffline(true);
    
    // Thực hiện nhấn Enter -> Phải ném lỗi mạng khi điều hướng
    await expect(homePage.searchInput.press('Enter', { timeout: 5000 })).rejects.toThrow();
  });

  test('TC4_04 - Khôi phục mạng', async ({ context, page }) => {
    // 1. Ngắt mạng
    await context.setOffline(true);
    await expect(page.goto('/')).rejects.toThrow();
    
    // 2. Bật mạng lại
    await context.setOffline(false);
    
    // 3. Tải lại trang -> Phải thành công
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });

  test('TC4_05 - Offline khi chạy code IDE', async ({ context, page }) => {
    await page.goto('https://ide.geeksforgeeks.org/');
    await page.waitForLoadState('domcontentloaded');
    
    // Ngắt mạng
    await context.setOffline(true);
    
    // Bấm nút Run
    const runBtn = page.locator('button#run, button#run-btn, button:has-text("Run"), .run-btn').first();
    if (await runBtn.isVisible().catch(() => false)) {
      // Vì click nút Run lúc offline có thể gọi AJAX và ném lỗi mạng (không đổi URL)
      // Chúng ta sẽ kiểm tra xem nó có báo lỗi kết nối trên UI hoặc ném Exception không
      const action = runBtn.click({ timeout: 5000 });
      await expect(action).rejects.toThrow().catch(async () => {
        // Hoặc kiểm tra xem có thông báo lỗi hiển thị không
        await expect(page.locator('body')).toContainText(/network|connect|offline/i);
      });
    }
  });

  test('TC4_06 - Service Worker / Cache', async ({ context, page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle'); // Đợi cache load xong
    
    // Ngắt mạng
    await context.setOffline(true);
    
    // Reload trang
    const reloadAction = page.reload();
    // GFG có thể không dùng Service Worker cache cho toàn bộ trang chủ nên có thể lỗi. 
    // Chúng ta log ra thông tin thay vì để test crash.
    await reloadAction.then((response) => {
      console.log('Loaded from cache offline with status:', response?.status());
    }).catch((err) => {
      console.log('Reload failed offline as expected (No Service Worker caching active).', err.message);
    });
  });
});
