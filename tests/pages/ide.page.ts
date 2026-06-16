import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Mẫu nhận diện lỗi toolchain nội bộ (linker/compiler driver) bị rò rỉ
 * thẳng ra output cho người dùng cuối. Đây là thứ KHÔNG nên xuất hiện khi
 * input không hợp lệ (ví dụ code rỗng) — IDE phải báo lỗi thân thiện thay vì
 * phơi bày đường dẫn hệ thống và thông điệp của `ld`.
 */
const RAW_TOOLCHAIN_ERROR =
  /\/usr\/bin\/ld|crt1\.o|undefined reference to `?main|collect2:\s*error|ld returned \d+ exit status/i;

/**
 * Page Object cho online compiler của GFG (/ide/online-cpp-compiler).
 * IDE dùng Ace editor: editor code và panel Output/Input đều là các instance
 * Ace riêng biệt. Lưu ý: bấm Run YÊU CẦU đăng nhập — spec phải login trước.
 */
export class IdePage extends BasePage {
  readonly editor: Locator;
  readonly runButton: Locator;
  readonly outputContent: Locator;

  constructor(page: Page) {
    super(page);

    // Editor code = Ace editor đầu tiên trong DOM.
    this.editor = page.locator('.ace_editor').first();

    this.runButton = page
      .getByRole('button', { name: /^\s*run\s*$/i })
      .first()
      .or(page.locator('button:has-text("Run")').first());

    // Panel Output nằm trong vùng IO (io_parent); khối editor đầu tiên ở đó là
    // "Output", khối thứ hai là "Input". Đọc nội dung qua .ace_content của nó.
    this.outputContent = page
      .locator('[class*="io_parent"] [class*="editor__"]')
      .first()
      .locator('.ace_content');
  }

  async open(): Promise<void> {
    const response = await this.goto('/ide/online-cpp-compiler');
    await this.expectSuccessfulResponse(response);
    await expect(this.editor, 'Không tìm thấy code editor trên trang IDE').toBeVisible({
      timeout: 20_000,
    });

    await this.page.waitForFunction(
      () => !!(window as any).ace,
      null,
      { timeout: 15_000 },
    );
    await this.page.waitForTimeout(3_000);
  }

  /**
   * Đặt toàn bộ nội dung editor qua Ace API. Đáng tin cậy hơn mô phỏng bàn phím
   * (Ace nuốt một số phím tắt trong môi trường automation) và Run đọc đúng
   * giá trị editor.getValue() nên giá trị set qua API được biên dịch chính xác.
   */
  async setCode(code: string): Promise<void> {
    await this.page.evaluate((value) => {
      const el = document.querySelector('.ace_editor');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).ace.edit(el).setValue(value, -1);
    }, code);
  }

  async clearCode(): Promise<void> {
    await this.setCode('');
  }

  async getCode(): Promise<string> {
    return (
      await this.page.evaluate(() => {
        const el = document.querySelector('.ace_editor');
        return (window as any).ace.edit(el).getValue() as string;
      })
    ).trim();
  }

  /** Đọc text trong panel Output. */
  async getOutput(): Promise<string> {
    return (await this.outputContent.innerText().catch(() => '')).trim();
  }

  /** Bấm Run và chờ backend trả về kết quả vào panel Output. */
  async run(): Promise<void> {
    await expect(this.runButton).toBeVisible();
    await this.runButton.click();
    await expect
      .poll(async () => (await this.getOutput()).length, {
        timeout: 40_000,
        message: 'Panel Output không nhận được kết quả sau khi bấm Run (đã đăng nhập chưa?)',
      })
      .toBeGreaterThan(0);
  }


  async expectRunsCode(code: string, expectedOutput: RegExp): Promise<void> {
    await this.setCode(code);
    await this.run();
    const output = await this.getOutput();
    expect(output, `Output không khớp mong đợi. Nhận được: "${output}"`).toMatch(expectedOutput);
  }

  /**
   * GFG-005 — Khi editor rỗng và người dùng bấm Run, IDE KHÔNG được rò rỉ lỗi
   * linker nội bộ (`/usr/bin/ld ... undefined reference to 'main'`). Hành vi
   * đúng là hiện thông báo thân thiện (ví dụ "code không được để trống") hoặc
   * vô hiệu hóa nút Run. Output chứa lỗi toolchain thô => bug còn tồn tại.
   */
  async expectEmptyCodeHandledGracefully(): Promise<void> {
    await this.clearCode();
    expect(await this.getCode(), 'Editor chưa được xóa sạch trước khi Run').toBe('');

    await this.run();
    const output = await this.getOutput();

    expect(
      output,
      `BUG GFG-005: code rỗng làm IDE phơi bày lỗi linker nội bộ thay vì thông báo ` +
      `thân thiện cho người dùng. Output thực tế: "${output}"`,
    ).not.toMatch(RAW_TOOLCHAIN_ERROR);
  }
}
