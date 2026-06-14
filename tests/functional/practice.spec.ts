import { expect, test } from '../fixtures/pages.fixture';
import { testData } from '../fixtures/test-data';

test.describe('@functional practice', () => {
  test('loads the problem catalog', async ({ practicePage }) => {
    await practicePage.open();
    await practicePage.expectLoaded();
  });

  test('searches the problem catalog when search is available', async ({ page, practicePage }) => {
    await practicePage.open();
    await practicePage.search(testData.practiceTerm);
    await expect(page.locator('body')).toContainText(/two sum|problem/i);
  });
});

