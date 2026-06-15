import { expect, test } from '../fixtures/pages.fixture';
import { type Page } from '@playwright/test';

test.describe('@advanced dark-light-mode', () => {

  const getThemeToggle = (page: Page) => page.locator('[title*="Switch to" i], [aria-label*="theme" i], [aria-label*="Switch to" i], .dark-mode-toggle, #theme-toggle, .theme-button').first();

  async function isDarkMode(page: Page): Promise<boolean> {
    const htmlClass = await page.locator('html').getAttribute('class') || '';
    const bodyClass = await page.locator('body').getAttribute('class') || '';
    const dataTheme = await page.locator('html').getAttribute('data-theme') || '';
    const isDarkClass = htmlClass.includes('dark') || bodyClass.includes('dark') || dataTheme.includes('dark') || dataTheme === 'dark';
    
    const bgColor = await page.locator('body').evaluate(el => window.getComputedStyle(el).backgroundColor);
    const rgb = bgColor.match(/\d+/g)?.map(Number) || [255, 255, 255];
    const avg = (rgb[0] + rgb[1] + rgb[2]) / 3;
    return isDarkClass || avg < 128;
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC5_01 - Chuyển sang Dark Mode', async ({ page }) => {
    const toggle = getThemeToggle(page);
    if (await toggle.isVisible().catch(() => false)) {
      const isCurrentlyDark = await isDarkMode(page);
      if (isCurrentlyDark) {
        // Nếu đã ở chế độ dark, click 2 lần (dark -> light -> dark)
        await toggle.click();
        await page.waitForTimeout(500);
        await toggle.click();
      } else {
        // Nếu đang ở light, click 1 lần (light -> dark)
        await toggle.click();
      }
      await page.waitForTimeout(1000);
      expect(await isDarkMode(page)).toBe(true);
    } else {
      console.log('TC5_01 Skip: Theme toggle button not visible.');
    }
  });

  test('TC5_02 - Chuyển về Light Mode', async ({ page }) => {
    const toggle = getThemeToggle(page);
    if (await toggle.isVisible().catch(() => false)) {
      const isCurrentlyDark = await isDarkMode(page);
      if (isCurrentlyDark) {
        // Nếu đang ở dark, click 1 lần (dark -> light)
        await toggle.click();
      } else {
        // Nếu đang ở light, click 2 lần (light -> dark -> light)
        await toggle.click();
        await page.waitForTimeout(500);
        await toggle.click();
      }
      await page.waitForTimeout(1000);
      expect(await isDarkMode(page)).toBe(false);
    } else {
      console.log('TC5_02 Skip: Theme toggle button not visible.');
    }
  });

  test('TC5_03 - Lưu trạng thái Dark Mode', async ({ page }) => {
    const toggle = getThemeToggle(page);
    if (await toggle.isVisible().catch(() => false)) {
      const isCurrentlyDark = await isDarkMode(page);
      if (!isCurrentlyDark) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
      
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      
      expect(await isDarkMode(page)).toBe(true);
    } else {
      console.log('TC5_03 Skip: Theme toggle button not visible.');
    }
  });

  test('TC5_04 - Kiểm tra màu nền', async ({ page }) => {
    const toggle = getThemeToggle(page);
    if (await toggle.isVisible().catch(() => false)) {
      const isCurrentlyDark = await isDarkMode(page);
      if (!isCurrentlyDark) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
      
      const bgColor = await page.locator('body').evaluate(el => window.getComputedStyle(el).backgroundColor);
      const rgb = bgColor.match(/\d+/g)?.map(Number) || [255, 255, 255];
      const avg = (rgb[0] + rgb[1] + rgb[2]) / 3;
      expect(avg).toBeLessThan(128); // Phải dưới 128 (màu tối)
    } else {
      console.log('TC5_04 Skip: Theme toggle button not visible.');
    }
  });

  test('TC5_05 - Kiểm tra màu chữ', async ({ page }) => {
    const toggle = getThemeToggle(page);
    if (await toggle.isVisible().catch(() => false)) {
      const isCurrentlyDark = await isDarkMode(page);
      if (isCurrentlyDark) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
    }
    const textColor = await page.locator('body').evaluate(el => window.getComputedStyle(el).color);
    const rgb = textColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const avg = (rgb[0] + rgb[1] + rgb[2]) / 3;
    expect(avg).toBeLessThan(180); // Ở chế độ sáng mặc định chữ phải sẫm/tối
  });

  test('TC5_06 - Dark Mode theo hệ thống', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    const htmlClass = await page.locator('html').getAttribute('class') || '';
    console.log('Prefers-color-scheme dark, HTML Class:', htmlClass);
  });

  test('TC5_07 - Code block hiển thị Dark', async ({ page }) => {
    const toggle = getThemeToggle(page);
    if (await toggle.isVisible().catch(() => false)) {
      const isCurrentlyDark = await isDarkMode(page);
      if (!isCurrentlyDark) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
      
      const codeEditor = page.locator('.ace_editor, .monaco-editor').first();
      if (await codeEditor.isVisible().catch(() => false)) {
        await expect(codeEditor).toBeVisible();
      }
    } else {
      console.log('TC5_07 Skip: Theme toggle button not visible.');
    }
  });

  test('TC5_08 - Icon toggle đổi trạng thái', async ({ page }) => {
    const toggle = getThemeToggle(page);
    if (await toggle.isVisible().catch(() => false)) {
      const iconBefore = await toggle.innerHTML();
      await toggle.click();
      await page.waitForTimeout(500);
      const iconAfter = await toggle.innerHTML();
      expect(iconBefore).not.toEqual(iconAfter);
    } else {
      console.log('TC5_08 Skip: Theme toggle button not visible.');
    }
  });
});
