import { expect, test } from '../fixtures/pages.fixture';

test.describe('@smoke primary navigation', () => {
  for (const item of [
    { name: /practice problems/i, url: /explore|practice|problems/i },
    { name: /courses/i, url: /courses/i },
  ]) {
    test(`opens ${item.name}`, async ({ homePage, page }) => {
      await homePage.open();
      await homePage.openPrimaryLink(item.name);
      await expect(page).toHaveURL(item.url);
      await homePage.expectCorePage();
    });
  }
});
