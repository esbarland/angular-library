import { test, expect } from '@playwright/test';
import { initFr, initEn, waitForList } from './helpers';

// ── Compteur de livres ─────────────────────────────────────────────────────

test('affiche le nombre de livres dans la toolbar', async ({ page }) => {
  await initFr(page);
  await waitForList(page);
  await expect(page.locator('.book-count')).toContainText('5');
});

test('le compteur se met à jour après suppression d\'un livre', async ({ page }) => {
  await initFr(page);
  await waitForList(page);
  await page.locator('.book-row').first().locator('.delete-btn').click();
  await page.locator('mat-dialog-container button.danger-btn').click();
  await expect(page.locator('.book-row')).toHaveCount(4);
  await expect(page.locator('.book-count')).toContainText('4');
});

test('le compteur se met à jour après ajout d\'un livre', async ({ page }) => {
  await initFr(page);
  await waitForList(page);
  await page.locator('.add-btn').click();
  await page.getByPlaceholder('Le titre du livre').fill('Nouveau Livre');
  await page.getByPlaceholder("Prénom et nom de l'auteur").fill('Auteur');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.book-count')).toContainText('6');
});

// ── Changement de langue ───────────────────────────────────────────────────

test('démarre en français si app-lang=fr dans localStorage', async ({ page }) => {
  await initFr(page);
  await waitForList(page);
  await expect(page.locator('.page-title').first()).toContainText('Ma Bibliothèque');
  await expect(page.locator('.add-btn')).toContainText('Nouveau livre');
});

test('démarre en anglais si app-lang=en dans localStorage', async ({ page }) => {
  await initEn(page);
  await waitForList(page);
  await expect(page.locator('.page-title').first()).toContainText('My Library');
  await expect(page.locator('.add-btn')).toContainText('New book');
});

test('basculer de FR vers EN traduit l\'interface', async ({ page }) => {
  await initFr(page);
  await waitForList(page);
  await expect(page.locator('.page-title').first()).toContainText('Ma Bibliothèque');
  await page.locator('mat-toolbar button').filter({ hasText: 'English' }).click();
  await expect(page.locator('.page-title').first()).toContainText('My Library');
  await expect(page.locator('.add-btn')).toContainText('New book');
});

test('basculer de EN vers FR retraduit l\'interface', async ({ page }) => {
  await initEn(page);
  await waitForList(page);
  await expect(page.locator('.page-title').first()).toContainText('My Library');
  await page.locator('mat-toolbar button').filter({ hasText: 'Français' }).click();
  await expect(page.locator('.page-title').first()).toContainText('Ma Bibliothèque');
});

test('la préférence de langue est sauvegardée dans localStorage', async ({ page }) => {
  await initFr(page);
  await waitForList(page);
  await page.locator('mat-toolbar button').filter({ hasText: 'English' }).click();
  const lang = await page.evaluate(() => localStorage.getItem('app-lang'));
  expect(lang).toBe('en');
});

test('la langue persiste après un rechargement de la page', async ({ page }) => {
  // addInitScript re-s'exécute sur chaque reload, on set 'en' directement sans clear
  await page.addInitScript(() => {
    localStorage.setItem('app-lang', 'en');
  });
  await page.goto('/books');
  await page.locator('.book-row').first().waitFor();
  await expect(page.locator('.page-title').first()).toContainText('My Library');
  await page.reload();
  await page.locator('.book-row').first().waitFor();
  await expect(page.locator('.page-title').first()).toContainText('My Library');
});

// ── Thème sombre / clair ──────────────────────────────────────────────────

test('le bouton de thème ajoute la classe dark-theme au html', async ({ page }) => {
  await initFr(page);
  await waitForList(page);
  const isDarkBefore = await page.evaluate(() =>
    document.documentElement.classList.contains('dark-theme')
  );
  await page.locator('mat-toolbar button[mat-icon-button]').last().click();
  const isDarkAfter = await page.evaluate(() =>
    document.documentElement.classList.contains('dark-theme')
  );
  expect(isDarkAfter).not.toBe(isDarkBefore);
});

test('cliquer deux fois sur le thème revient à l\'état initial', async ({ page }) => {
  await initFr(page);
  await waitForList(page);
  const initialDark = await page.evaluate(() =>
    document.documentElement.classList.contains('dark-theme')
  );
  const themeBtn = () => page.locator('mat-toolbar').getByRole('button').last();
  await themeBtn().click();
  const afterFirst = await page.evaluate(() =>
    document.documentElement.classList.contains('dark-theme')
  );
  expect(afterFirst).not.toBe(initialDark);
  await themeBtn().click();
  const finalDark = await page.evaluate(() =>
    document.documentElement.classList.contains('dark-theme')
  );
  expect(finalDark).toBe(initialDark);
});
