import { expect, test } from '../fixtures/pages.fixture';
import { testData } from '../fixtures/test-data';

test.describe('@functional search', () => {
  test('finds and opens relevant content', async ({ articlePage, homePage, page, searchPage }) => {
    await homePage.open();
    await homePage.search(`  ${testData.searchTerm}  `);
    await searchPage.expectResultsFor(testData.searchTerm);
    await searchPage.openFirstResult();
    await expect(page).toHaveURL(/^https:\/\/www\.geeksforgeeks\.org\//);
    await articlePage.expectCorePage();
  });

  test('handles a search term with no expected match', async ({ homePage, page }) => {
    await homePage.open();
    await homePage.search(testData.missingSearchTerm);
    await expect(page.locator('body')).toContainText(/no result|not found|nothing here|search/i);
    await homePage.expectCorePage();
  });
});
