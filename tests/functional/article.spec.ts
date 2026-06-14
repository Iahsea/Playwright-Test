import { test } from '../fixtures/pages.fixture';
import { testData } from '../fixtures/test-data';

test.describe('@functional article', () => {
  test('renders article content, code and internal links', async ({ articlePage }) => {
    const response = await articlePage.goto('/binary-search/');
    await articlePage.expectSuccessfulResponse(response);
    await articlePage.expectArticle(testData.articleTitle);
    await articlePage.expectInternalLinks();
  });
});

