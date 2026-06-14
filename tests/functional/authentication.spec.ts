import { expect, test } from '../fixtures/pages.fixture';

test.describe('@functional authentication form', () => {
  test('rejects malformed credentials', async ({ authPage }) => {
    await authPage.openLogin();
    await authPage.submitLogin('not-an-email', 'wrong');
    await authPage.expectValidationOrError();
  });
});

test.describe('@account account workflows', () => {
  test.describe.configure({ mode: 'serial' });

  test('logs in and logs out with a test account', async ({ authPage, page }) => {
    const email = process.env.GFG_TEST_EMAIL;
    const password = process.env.GFG_TEST_PASSWORD;
    test.skip(!email || !password, 'Set GFG_TEST_EMAIL and GFG_TEST_PASSWORD');

    await authPage.openLogin();
    await authPage.submitLogin(email!, password!);
    await expect(page.getByRole('button', { name: /profile|account|user/i }).first()
      .or(page.getByText(/logout|sign out/i).first())).toBeVisible();

    const accountMenu = page.getByRole('button', { name: /profile|account|user/i }).first();
    if (await accountMenu.isVisible().catch(() => false)) await accountMenu.click();
    await page.getByText(/logout|sign out/i).first().click();
    await expect(page.getByText(/sign in|login/i).first()).toBeVisible();
  });

  test('requests password recovery and stops at OTP', async ({ authPage }) => {
    const email = process.env.GFG_TEST_EMAIL;
    test.skip(!email, 'Set GFG_TEST_EMAIL');

    await authPage.openLogin();
    await authPage.openForgotPassword();
    await authPage.submitRecovery(email!);
    await authPage.expectOtpStep();
  });

  test('starts registration and stops at OTP', async ({ authPage, page }) => {
    const email = process.env.GFG_REGISTRATION_EMAIL;
    test.skip(!email, 'Set GFG_REGISTRATION_EMAIL to an address safe for OTP delivery');

    await authPage.openLogin();
    await authPage.openRegistration();
    await authPage.email.fill(email!);

    const continueButton = page.getByRole('button', { name: /continue|register|sign up|send/i }).last();
    await continueButton.click();
    await authPage.expectOtpStep();
  });
});
