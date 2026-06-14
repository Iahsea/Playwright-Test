# GeeksforGeeks Playwright Tests

Smoke and functional browser tests for `https://www.geeksforgeeks.org`.

## Documentation

- [Architecture](ARCHITECTURE.md)
- [Usage guide](USAGE.md)

## Requirements

- Node.js 20 or newer
- Playwright Chromium: `npx playwright install chromium`

## Commands

```powershell
npm test
npm run test:smoke
npm run test:functional
npm run test:account
npm run test:headed
npm run report
```

Account tests are skipped unless the required environment variables exist:

```powershell
$env:GFG_TEST_EMAIL = "test-account@example.com"
$env:GFG_TEST_PASSWORD = "secret"
$env:GFG_REGISTRATION_EMAIL = "new-test-account@example.com"
npm run test:account
```

`GFG_REGISTRATION_EMAIL` must be an address that may safely receive an OTP.
Registration and password recovery stop before OTP verification. CAPTCHA is
reported as an external blocker and is never bypassed.

Use `GFG_BASE_URL` to override the production URL.
