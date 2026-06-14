import { expect, test } from '../fixtures/pages.fixture';

test.describe('@functional courses', () => {
  test('browses from the catalog to a course detail page', async ({ coursesPage, page }) => {
    await coursesPage.open();
    await coursesPage.expectLoaded();
    await coursesPage.openFirstCourse();
    await expect(page).toHaveURL(/course/i);
    await coursesPage.expectCorePage();
    await expect(page.locator('body')).toContainText(/enroll|register|course|batch/i);
  });
});

