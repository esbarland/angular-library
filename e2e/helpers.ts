import { Page } from '@playwright/test';

export async function initFr(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('app-lang', 'fr');
  });
}

export async function initEn(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('app-lang', 'en');
  });
}

export async function waitForList(page: Page) {
  await page.goto('/books');
  await page.locator('.book-row').first().waitFor();
}
