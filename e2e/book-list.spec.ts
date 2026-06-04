import { test, expect } from '@playwright/test';
import { resetData, waitForList } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetData(page);
  await waitForList(page);
});

// ── Affichage initial ──────────────────────────────────────────────────────

test('affiche les 5 livres de démonstration', async ({ page }) => {
  await expect(page.locator('.book-row')).toHaveCount(5);
});

test('affiche le compteur de livres dans la toolbar', async ({ page }) => {
  await expect(page.locator('.book-count')).toContainText('5');
});

test('affiche les titres des livres dans les lignes', async ({ page }) => {
  const titles = await page.locator('.row-title').allTextContents();
  expect(titles).toContain('Le Seigneur des Anneaux');
  expect(titles).toContain('Dune');
  expect(titles).toContain('Le Petit Prince');
});

test('affiche le badge statut de chaque livre', async ({ page }) => {
  await expect(page.locator('.status-badge').first()).toBeVisible();
  await expect(page.locator('.status-badge.status-read').first()).toBeVisible();
});

// ── Recherche ──────────────────────────────────────────────────────────────

test('filtre les livres par titre', async ({ page }) => {
  await page.locator('.search-field input').fill('Dune');
  await expect(page.locator('.book-row')).toHaveCount(1);
  await expect(page.locator('.row-title')).toHaveText('Dune');
});

test('filtre les livres par auteur', async ({ page }) => {
  await page.locator('.search-field input').fill('Tolkien');
  await expect(page.locator('.book-row')).toHaveCount(1);
  await expect(page.locator('.row-title')).toHaveText('Le Seigneur des Anneaux');
});

test('efface la recherche et affiche tous les livres', async ({ page }) => {
  await page.locator('.search-field input').fill('Dune');
  await expect(page.locator('.book-row')).toHaveCount(1);
  await page.getByTestId('search-clear').click();
  await expect(page.locator('.book-row')).toHaveCount(5);
});

test('affiche l\'état vide si aucun résultat', async ({ page }) => {
  await page.locator('.search-field input').fill('livre inexistant xyzabc');
  await expect(page.locator('.empty-state')).toBeVisible();
  await expect(page.locator('.book-row')).toHaveCount(0);
});

test('le bouton effacer depuis l\'état vide restaure la liste', async ({ page }) => {
  await page.locator('.search-field input').fill('rien');
  await expect(page.locator('.empty-state')).toBeVisible();
  await page.locator('.empty-actions button').first().click();
  await expect(page.locator('.book-row')).toHaveCount(5);
});

// ── Filtre par genre ───────────────────────────────────────────────────────
// Les genres sont des données (non traduites), on peut filtrer par leur texte.

test('filtre par genre Fantasy affiche 1 livre', async ({ page }) => {
  await page.locator('mat-chip-option').filter({ hasText: 'Fantasy' }).click();
  await expect(page.locator('.book-row')).toHaveCount(1);
  await expect(page.locator('.row-title')).toHaveText('Le Seigneur des Anneaux');
});

test('filtre par genre Fiction affiche 2 livres', async ({ page }) => {
  await page.locator('mat-chip-option').filter({ hasText: /^Fiction$/ }).click();
  await expect(page.locator('.book-row')).toHaveCount(2);
});

test('chip "Tous" réinitialise le filtre genre', async ({ page }) => {
  await page.locator('mat-chip-option').filter({ hasText: 'Fantasy' }).click();
  await expect(page.locator('.book-row')).toHaveCount(1);
  await page.getByTestId('genre-all').click();
  await expect(page.locator('.book-row')).toHaveCount(5);
});

test('combine recherche et filtre genre', async ({ page }) => {
  await page.locator('mat-chip-option').filter({ hasText: /^Fiction$/ }).click();
  await page.locator('.search-field input').fill('1984');
  await expect(page.locator('.book-row')).toHaveCount(1);
  await expect(page.locator('.row-title')).toHaveText('1984');
});

// ── Tri ───────────────────────────────────────────────────────────────────

test('tri par titre A→Z réordonne la liste', async ({ page }) => {
  await page.locator('.sort-field mat-select').click();
  await page.getByTestId('sort-title-asc').click();
  const titles = await page.locator('.row-title').allTextContents();
  const sorted = [...titles].sort((a, b) => a.localeCompare(b, 'fr'));
  expect(titles).toEqual(sorted);
});

test('tri par auteur A→Z réordonne la liste', async ({ page }) => {
  await page.locator('.sort-field mat-select').click();
  await page.getByTestId('sort-author-asc').click();
  const authors = await page.locator('.row-author').allTextContents();
  const sorted = [...authors].sort((a, b) => a.localeCompare(b, 'fr'));
  expect(authors).toEqual(sorted);
});

test('tri par date d\'ajout (défaut) — ordre par défaut', async ({ page }) => {
  const titles = await page.locator('.row-title').allTextContents();
  expect(titles[0]).toBe('Le Petit Prince');
  expect(titles[4]).toBe('Le Seigneur des Anneaux');
});

// ── Navigation ─────────────────────────────────────────────────────────────

test('cliquer sur une ligne navigue vers la page détail', async ({ page }) => {
  await page.locator('.book-row').first().click();
  await expect(page).toHaveURL(/\/books\/\d+$/);
});

test('le bouton modifier navigue vers le formulaire d\'édition', async ({ page }) => {
  await page.locator('.book-row').first().locator('.row-actions button').first().click();
  await expect(page).toHaveURL(/\/books\/\d+\/edit$/);
});

test('le bouton Nouveau livre navigue vers /books/new', async ({ page }) => {
  await page.locator('.add-btn').click();
  await expect(page).toHaveURL('/books/new');
});

// ── Suppression ───────────────────────────────────────────────────────────

test('supprimer un livre avec confirmation le retire de la liste', async ({ page }) => {
  const firstTitle = await page.locator('.row-title').first().textContent();
  await page.locator('.book-row').first().locator('.delete-btn').click();
  const dialog = page.locator('mat-dialog-container');
  await expect(dialog).toBeVisible();
  await page.getByTestId('dialog-confirm').click();
  await expect(page.locator('.book-row')).toHaveCount(4);
  const remaining = await page.locator('.row-title').allTextContents();
  expect(remaining).not.toContain(firstTitle);
});

test('annuler la suppression conserve le livre dans la liste', async ({ page }) => {
  await page.locator('.book-row').first().locator('.delete-btn').click();
  const dialog = page.locator('mat-dialog-container');
  await expect(dialog).toBeVisible();
  await page.getByTestId('dialog-cancel').click();
  await expect(page.locator('.book-row')).toHaveCount(5);
});

test('la modale de confirmation affiche le titre du livre', async ({ page }) => {
  const bookTitle = await page.locator('.row-title').first().textContent();
  await page.locator('.book-row').first().locator('.delete-btn').click();
  const dialog = page.locator('mat-dialog-container');
  await expect(dialog.locator('mat-dialog-content')).toContainText(bookTitle!);
});
