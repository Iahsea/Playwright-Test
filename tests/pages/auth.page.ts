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

  async openForgotPassword(): Promise<void> {
    await this.page.getByRole('link', { name: /forgot.*password/i }).first()
      .or(this.page.getByText(/forgot.*password/i).first())
      .click();
    await expect(this.email).toBeVisible();
  }

  async submitRecovery(email: string): Promise<void> {
    await this.email.fill(email);
    await this.page.getByRole('button', { name: /continue|submit|send|reset/i }).last().click();
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
    const otp = this.page.getByText(/otp|verification code|check your email/i).first()
      .or(this.page.locator('input[autocomplete="one-time-code"]').first());
    const captcha = this.page.locator('iframe[title*="captcha" i], [class*="captcha" i]').first();
    expect(
      await otp.isVisible({ timeout: 10_000 }).catch(() => false)
        || await captcha.isVisible({ timeout: 1_000 }).catch(() => false),
      'Expected an OTP step or a CAPTCHA external blocker',
    ).toBeTruthy();
  }
}
