import { test, expect } from '@playwright/test';
import { mockApi, waitForList } from './helpers';

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

// ── Compteur de livres ─────────────────────────────────────────────────────

test('affiche le nombre de livres dans la toolbar', async ({ page }) => {
  await waitForList(page);
  await expect(page.locator('.book-count')).toContainText('5');
});

test('le compteur se met à jour après suppression d\'un livre', async ({ page }) => {
  await waitForList(page);
  await page.locator('.book-row').first().locator('.delete-btn').click();
  await page.getByTestId('dialog-confirm').click();
  await expect(page.locator('.book-row')).toHaveCount(4);
  await expect(page.locator('.book-count')).toContainText('4');
});

test('le compteur se met à jour après ajout d\'un livre', async ({ page }) => {
  await waitForList(page);
  await page.locator('.add-btn').click();
  await page.getByTestId('field-title').fill('Nouveau Livre');
  await page.getByTestId('field-isbn').fill('978-0-000-00000-0');
  await page.getByTestId('field-pages').fill('250');
  await page.getByTestId('field-year').fill('2020');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.book-count')).toContainText('6');
});

// ── Thème sombre / clair ──────────────────────────────────────────────────

test('le bouton de thème bascule la classe dark-theme du html', async ({ page }) => {
  await waitForList(page);
  const html = page.locator('html');
  const wasDark = await html.evaluate(el => el.classList.contains('dark-theme'));
  await page.locator('mat-toolbar button[mat-icon-button]').last().click();
  // Assertions web-first (re-essayées) pour éviter la course avec le flush d'effet.
  if (wasDark) {
    await expect(html).not.toHaveClass(/dark-theme/);
  } else {
    await expect(html).toHaveClass(/dark-theme/);
  }
});

test('cliquer deux fois sur le thème revient à l\'état initial', async ({ page }) => {
  await waitForList(page);
  const html = page.locator('html');
  const initialDark = await html.evaluate(el => el.classList.contains('dark-theme'));
  const themeBtn = () => page.locator('mat-toolbar button[mat-icon-button]').last();

  await themeBtn().click();
  if (initialDark) {
    await expect(html).not.toHaveClass(/dark-theme/);
  } else {
    await expect(html).toHaveClass(/dark-theme/);
  }

  await themeBtn().click();
  if (initialDark) {
    await expect(html).toHaveClass(/dark-theme/);
  } else {
    await expect(html).not.toHaveClass(/dark-theme/);
  }
});
