import { expect, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CoursesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    const response = await this.goto('/courses');
    await this.expectSuccessfulResponse(response);
  }

  async expectLoaded(): Promise<void> {
    await this.expectCorePage();
    await expect(this.page).toHaveURL(/courses/i);
    await expect(this.page.locator('main, [role="main"], body').first()).toContainText(/course/i);
  }

  async openFirstCourse(): Promise<void> {
    const course = this.page.locator('main a[href*="/courses/"], a[href*="course"]').filter({
      hasText: /\S+/,
    }).first();
    await expect(course).toBeVisible();
    await course.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.dismissOverlays();
  }
}

