import { Page } from '@playwright/test';

/**
 * Vide le localStorage avant chargement pour repartir des 5 livres de démo.
 * (L'app sert une seule locale par build — pas de bascule de langue runtime.)
 */
export async function resetData(page: Page) {
  await page.addInitScript(() => localStorage.clear());
}

export async function waitForList(page: Page) {
  await page.goto('/books');
  await page.locator('.book-row').first().waitFor();
}
