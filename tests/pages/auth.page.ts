import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AuthPage extends BasePage {
  readonly email: Locator;
  readonly password: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByLabel(/email/i).first()
      .or(page.getByPlaceholder(/email/i).first())
      .or(page.locator('input[type="email"]').first());
    this.password = page.getByLabel(/^password/i).first()
      .or(page.getByPlaceholder(/^password/i).first())
      .or(page.locator('input[type="password"]').first());
  }

  async openLogin(): Promise<void> {
    await this.goto('/');
    const trigger = this.page.getByRole('button', { name: /sign in|login/i }).first()
      .or(this.page.getByRole('link', { name: /sign in|login/i }).first())
      .or(this.page.getByText(/sign in|login/i).first());
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(this.email).toBeVisible();
  }

  async submitLogin(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    const modal = this.page.locator('#login, [role="dialog"]').first();
    await modal.getByRole('button', { name: /^(sign in|login)$/i }).click();
  }

  async expectValidationOrError(): Promise<void> {
    const invalidField = this.page.locator('input:invalid').first();
    const message = this.page.getByText(/required|invalid|incorrect|not valid|wrong/i).first();
    await expect(invalidField.or(message)).toBeVisible();
  }

  async expectLoggedIn(): Promise<void> {
    // GFG shows a user-initial avatar after login; the Sign In button disappears
    await expect(
      this.page.getByRole('button', { name: /sign in|login/i }).first()
    ).not.toBeVisible({ timeout: 15_000 });
  }

  async logout(): Promise<void> {
    // GFG avatar shows the account's first initial (e.g. "L"); clicking it opens the menu
    const initial = (process.env.GFG_TEST_EMAIL ?? '').charAt(0).toUpperCase();
    await this.page.getByText(initial, { exact: true }).first().click();

    // The Logout link is identified reliably by its href, not by visible text
    const logout = this.page.locator('a[href*="logout" i]').first();
    await expect(logout).toBeVisible({ timeout: 5_000 });
    await logout.click();
  }

  async openForgotPassword(): Promise<void> {
    await this.page.getByRole('link', { name: /forgot.*password/i }).first()
      .or(this.page.getByText(/forgot.*password/i).first())
      .click();
    await expect(this.email).toBeVisible();
  }

  async submitRecovery(email: string): Promise<void> {
    await this.email.fill(email);
    await this.page.getByRole('button', { name: /^reset password$/i }).click();
  }

  async openRegistration(): Promise<void> {
    const trigger = this.page.getByRole('link', { name: /register|sign up|create account/i }).first()
      .or(this.page.getByRole('button', { name: /register|sign up|create account/i }).first())
      .or(this.page.getByText(/register|sign up|create account/i).first());
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(this.email).toBeVisible();
  }

  async expectOtpStep(): Promise<void> {
    // waitForFunction reads live DOM text — catches transient notifications getByText() misses
    const pattern = /otp|verification code|check your email|enter otp|sent to your email|reset link has been sent/i;
    const textFound = await this.page.waitForFunction(
      (p) => new RegExp(p, 'i').test(document.body.innerText),
      pattern.source,
      { timeout: 10_000 },
    ).then(() => true).catch(() => false);

    const captcha = await this.page.locator('iframe[title*="captcha" i], [class*="captcha" i]').first()
      .isVisible({ timeout: 1_000 }).catch(() => false);

    // GFG may redirect to an external OAuth provider (Google, etc.) for registration
    const onExternalAuth = /accounts\.google\.com|accounts\.facebook\.com|github\.com\/login/i.test(this.page.url());

    expect(
      textFound || captcha || onExternalAuth,
      'Expected an OTP step, a reset-link confirmation, a CAPTCHA, or an external OAuth redirect',
    ).toBeTruthy();
  }
}
