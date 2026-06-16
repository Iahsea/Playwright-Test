import { test as base } from '@playwright/test';
import { ArticlePage } from '../pages/article.page';
import { AuthPage } from '../pages/auth.page';
import { CoursesPage } from '../pages/courses.page';
import { HomePage } from '../pages/home.page';
import { IdePage } from '../pages/ide.page';
import { PracticePage } from '../pages/practice.page';
import { SearchPage } from '../pages/search.page';

type Pages = {
  articlePage: ArticlePage;
  authPage: AuthPage;
  coursesPage: CoursesPage;
  homePage: HomePage;
  idePage: IdePage;
  practicePage: PracticePage;
  searchPage: SearchPage;
};

export const test = base.extend<Pages>({
  articlePage: async ({ page }, use) => use(new ArticlePage(page)),
  authPage: async ({ page }, use) => use(new AuthPage(page)),
  coursesPage: async ({ page }, use) => use(new CoursesPage(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  idePage: async ({ page }, use) => use(new IdePage(page)),
  practicePage: async ({ page }, use) => use(new PracticePage(page)),
  searchPage: async ({ page }, use) => use(new SearchPage(page)),
});

export { expect } from '@playwright/test';

