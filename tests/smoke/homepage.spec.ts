import { test } from '../fixtures/pages.fixture';

test.describe('@smoke homepage', () => {
  test('loads the public home page and core landmarks', async ({ homePage }) => {
    await homePage.open();
    await homePage.expectLoaded();
  });
});

