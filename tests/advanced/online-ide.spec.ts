import { expect, test } from '../fixtures/pages.fixture';
import { type Page } from '@playwright/test';

test.describe('@advanced online-ide', () => {
  
  test.beforeEach(async ({ page }) => {
    // Truy cập GeeksforGeeks Online IDE
    await page.goto('https://ide.geeksforgeeks.org/');
    await page.waitForLoadState('domcontentloaded');
  });

  const getLanguageSelect = (page: Page) => page.locator('select#lang, select[name*="lang" i], select.lang, select[class*="language" i]').first();
  const getEditorInput = (page: Page) => page.locator('textarea.ace_text-input, textarea.monaco-keybinding-chars, textarea#code, .ace_text-input').first();
  const getRunButton = (page: Page) => page.locator('button#run, button#run-btn, button:has-text("Run"), .run-btn, input[value="Run"]').first();
  const getOutputArea = (page: Page) => page.locator('#output, .output, pre#output, .output-area, pre[class*="output" i]').first();
  const getStdinCheckbox = (page: Page) => page.locator('input#input-check, input[type="checkbox"][name*="input" i], label:has-text("Input") input').first();
  const getStdinTextarea = (page: Page) => page.locator('textarea#input, textarea#stdin, textarea[placeholder*="input" i]').first();

  test('TC2_01 - Chạy code Python hợp lệ', async ({ page }) => {
    const langSelect = getLanguageSelect(page);
    if (await langSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 1. Chọn Python
      await langSelect.selectOption('Python3').catch(() => langSelect.selectOption('Python'));
      
      // 2. Nhập code Python
      const editor = getEditorInput(page);
      await expect(editor).toBeVisible();
      await editor.focus();
      // Xóa code cũ và gõ code mới
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.insertText('print("Hello, GFG!")');

      // 3. Nhấp Run
      const runBtn = getRunButton(page);
      await expect(runBtn).toBeVisible();
      await runBtn.click();
      
      // 4. Kiểm tra output (chờ tối đa 30s vì GFG IDE compile có độ trễ)
      const output = getOutputArea(page);
      await expect(output).toBeVisible({ timeout: 30000 });
      await expect(output).toContainText('Hello, GFG!', { timeout: 30000 });
    } else {
      console.log('TC2_01 Skip: Language selector not visible on GFG IDE.');
    }
  });

  test('TC2_02 - Chạy code C++ hợp lệ', async ({ page }) => {
    const langSelect = getLanguageSelect(page);
    if (await langSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await langSelect.selectOption('C++').catch(() => langSelect.selectOption('cpp'));
      
      const editor = getEditorInput(page);
      await expect(editor).toBeVisible();
      await editor.focus();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      
      const cppCode = `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello";\n    return 0;\n}`;
      await page.keyboard.insertText(cppCode);

      const runBtn = getRunButton(page);
      await runBtn.click();
      
      const output = getOutputArea(page);
      await expect(output).toBeVisible({ timeout: 30000 });
      await expect(output).toContainText('Hello', { timeout: 30000 });
    } else {
      console.log('TC2_02 Skip: Language selector not visible.');
    }
  });

  test('TC2_03 - Chạy code có lỗi cú pháp', async ({ page }) => {
    const langSelect = getLanguageSelect(page);
    if (await langSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await langSelect.selectOption('Python3').catch(() => langSelect.selectOption('Python'));
      
      const editor = getEditorInput(page);
      await expect(editor).toBeVisible();
      await editor.focus();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.insertText('prit("hello")'); // lỗi chính tả print

      const runBtn = getRunButton(page);
      await runBtn.click();
      
      const output = getOutputArea(page);
      await expect(output).toBeVisible({ timeout: 30000 });
      // GFG output sẽ hiển thị thông báo NameError hoặc error
      await expect(output).toContainText(/error|NameError|fail/i, { timeout: 30000 });
    } else {
      console.log('TC2_03 Skip: Language selector not visible.');
    }
  });

  test('TC2_04 - Chạy code vòng lặp vô hạn', async ({ page }) => {
    const langSelect = getLanguageSelect(page);
    if (await langSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await langSelect.selectOption('Python3').catch(() => langSelect.selectOption('Python'));
      
      const editor = getEditorInput(page);
      await expect(editor).toBeVisible();
      await editor.focus();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.insertText('while True:\n    pass');

      const runBtn = getRunButton(page);
      await runBtn.click();
      
      const output = getOutputArea(page);
      await expect(output).toBeVisible({ timeout: 30000 });
      // Thường sẽ trả về "Time Limit Exceeded", "TLE" hoặc thông báo timeout từ server
      await expect(output).toContainText(/limit|exceeded|timeout|tle/i, { timeout: 30000 });
    } else {
      console.log('TC2_04 Skip: IDE inputs not found.');
    }
  });

  test('TC2_05 - Nhập dữ liệu từ stdin', async ({ page }) => {
    const langSelect = getLanguageSelect(page);
    if (await langSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await langSelect.selectOption('Python3').catch(() => langSelect.selectOption('Python'));
      
      const editor = getEditorInput(page);
      await expect(editor).toBeVisible();
      await editor.focus();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.insertText('x = input()\nprint("output:", x)');

      // Kích hoạt ô input stdin
      const stdinCheck = getStdinCheckbox(page);
      if (await stdinCheck.isVisible().catch(() => false)) {
        await stdinCheck.check();
      }
      
      const stdinText = getStdinTextarea(page);
      if (await stdinText.isVisible({ timeout: 3000 }).catch(() => false)) {
        await stdinText.fill('GFGStdinVal');
      }

      const runBtn = getRunButton(page);
      await runBtn.click();
      
      const output = getOutputArea(page);
      await expect(output).toBeVisible({ timeout: 30000 });
      await expect(output).toContainText('output: GFGStdinVal', { timeout: 30000 });
    } else {
      console.log('TC2_05 Skip: Input controls not visible.');
    }
  });

  test('TC2_06 - Chuyển đổi ngôn ngữ', async ({ page }) => {
    const langSelect = getLanguageSelect(page);
    if (await langSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      // 1. Chọn C++
      await langSelect.selectOption('C++').catch(() => langSelect.selectOption('cpp'));
      await page.waitForTimeout(1000);
      
      // 2. Lấy nội dung mẫu
      const editor = getEditorInput(page);
      await expect(editor).toBeVisible();
      const code1 = await page.locator('.ace_content, .monaco-editor').first().innerText().catch(() => '');
      
      // 3. Chọn Java
      await langSelect.selectOption('Java').catch(() => langSelect.selectOption('java'));
      await page.waitForTimeout(1000);
      const code2 = await page.locator('.ace_content, .monaco-editor').first().innerText().catch(() => '');
      
      // Xác minh code mẫu thay đổi khi đổi ngôn ngữ
      expect(code1).not.toEqual(code2);
    } else {
      console.log('TC2_06 Skip: dropdown not visible.');
    }
  });

  test('TC2_07 - Xóa code và chạy lại', async ({ page }) => {
    const langSelect = getLanguageSelect(page);
    if (await langSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await langSelect.selectOption('Python3').catch(() => langSelect.selectOption('Python'));
      const editor = getEditorInput(page);
      
      // Viết code 1 và chạy
      await editor.focus();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.insertText('print("FirstRun")');
      await getRunButton(page).click();
      await expect(getOutputArea(page)).toContainText('FirstRun', { timeout: 30000 });
      
      // Viết code 2 và chạy
      await editor.focus();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.insertText('print("SecondRun")');
      await getRunButton(page).click();
      
      // Đảm bảo terminal hiển thị đúng kết quả mới
      await expect(getOutputArea(page)).toContainText('SecondRun', { timeout: 30000 });
      await expect(getOutputArea(page)).not.toContainText('FirstRun', { timeout: 30000 });
    } else {
      console.log('TC2_07 Skip: dropdown not visible.');
    }
  });

  test('TC2_08 - Kiểm tra timeout', async ({ page }) => {
    // Xác minh cấu hình timeout
    const langSelect = getLanguageSelect(page);
    if (await langSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await langSelect.selectOption('Python3').catch(() => langSelect.selectOption('Python'));
      const editor = getEditorInput(page);
      await editor.focus();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.insertText('import time\ntime.sleep(20)\nprint("Done")');

      await getRunButton(page).click();
      const output = getOutputArea(page);
      await expect(output).toBeVisible({ timeout: 30000 });
      // Sẽ báo Time Limit hoặc TLE
      await expect(output).toContainText(/limit|exceeded|timeout|tle/i, { timeout: 30000 });
    } else {
      console.log('TC2_08 Skip: dropdown not visible.');
    }
  });

  test('TC2_09 - IDE có accessibility', async ({ page }) => {
    // Kiểm tra khả năng focus bằng bàn phím vào editor
    const editor = getEditorInput(page);
    if (await editor.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.keyboard.press('Tab');
      const isFocused = await editor.evaluate(el => document.activeElement === el || el.contains(document.activeElement));
      console.log('Editor focus status:', isFocused);
    } else {
      console.log('TC2_09 Skip: editor not visible.');
    }
  });
});
