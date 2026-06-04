import { test, expect, Page } from '@playwright/test';
import { resetData, waitForList } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetData(page);
});

async function fillTitle(page: Page, value: string) {
  await page.getByTestId('field-title').fill(value);
}
async function fillAuthor(page: Page, value: string) {
  await page.getByTestId('field-author').fill(value);
}
async function selectGenre(page: Page, genre: string) {
  await page.getByTestId('field-genre').click();
  // Les genres sont des données (non traduites).
  await page.locator('mat-option').filter({ hasText: genre }).click();
}
async function selectStatus(page: Page, label: string) {
  await page.getByTestId('field-status').click();
  // Libellés dans la locale servie (anglais par défaut) — correspondance exacte
  // car "Read" est une sous-chaîne de "To read" et "Reading".
  await page.getByRole('option', { name: label, exact: true }).click();
}
async function submit(page: Page) {
  await page.locator('button[type="submit"]').click();
}

// ── Formulaire d'ajout ────────────────────────────────────────────────────

test('accède au formulaire d\'ajout via /books/new', async ({ page }) => {
  await page.goto('/books/new');
  await expect(page).toHaveURL('/books/new');
  await expect(page.getByTestId('field-title')).toBeVisible();
});

test('crée un livre avec les champs obligatoires', async ({ page }) => {
  await page.goto('/books/new');
  await fillTitle(page, 'Mon Nouveau Livre');
  await fillAuthor(page, 'Mon Auteur Test');
  await submit(page);
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.row-title').filter({ hasText: 'Mon Nouveau Livre' })).toBeVisible();
});

test('crée un livre avec tous les champs remplis', async ({ page }) => {
  await page.goto('/books/new');
  await fillTitle(page, 'Livre Complet');
  await fillAuthor(page, 'Auteur Complet');
  await selectGenre(page, 'Fantasy');
  await page.getByTestId('field-year').fill('2020');
  await page.getByTestId('field-isbn').fill('978-0-000-00000-0');
  await page.getByTestId('field-description').fill('Une belle description');
  await selectStatus(page, 'Read');
  await page.locator('input[type="date"]').fill('2023-06-15');
  await page.locator('.formly-star-wrap .star').nth(3).click();
  await submit(page);
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.row-title').filter({ hasText: 'Livre Complet' })).toBeVisible();
});

// ── Validation ─────────────────────────────────────────────────────────────

test('le titre est obligatoire — le submit est désactivé', async ({ page }) => {
  await page.goto('/books/new');
  await fillAuthor(page, 'Auteur');
  await expect(page.locator('button[type="submit"]')).toBeDisabled();
});

test('l\'auteur est obligatoire — le submit est désactivé', async ({ page }) => {
  await page.goto('/books/new');
  await fillTitle(page, 'Titre');
  await expect(page.locator('button[type="submit"]')).toBeDisabled();
});

test('affiche une erreur si le titre est touché puis vidé', async ({ page }) => {
  await page.goto('/books/new');
  await fillTitle(page, 'a');
  await page.getByTestId('field-title').clear();
  await page.getByTestId('field-title').blur();
  await expect(page.locator('mat-error').first()).toBeVisible();
});

test('affiche une erreur si l\'année est invalide', async ({ page }) => {
  await page.goto('/books/new');
  await fillTitle(page, 'Titre');
  await fillAuthor(page, 'Auteur');
  await page.getByTestId('field-year').fill('999');
  await page.getByTestId('field-year').blur();
  await expect(page.locator('mat-error')).toBeVisible();
});

// ── Champ conditionnel finishedAt ──────────────────────────────────────────

test('le champ date de fin est caché par défaut (statut À lire)', async ({ page }) => {
  await page.goto('/books/new');
  await expect(page.locator('input[type="date"]')).toBeHidden();
});

test('le champ date de fin apparaît quand le statut est Lu', async ({ page }) => {
  await page.goto('/books/new');
  await selectStatus(page, 'Read');
  await expect(page.locator('input[type="date"]')).toBeVisible();
});

test('le champ date de fin disparaît si on rechange le statut', async ({ page }) => {
  await page.goto('/books/new');
  await selectStatus(page, 'Read');
  await expect(page.locator('input[type="date"]')).toBeVisible();
  await selectStatus(page, 'Reading');
  await expect(page.locator('input[type="date"]')).toBeHidden();
});

// ── Note étoiles dans le formulaire ───────────────────────────────────────

test('cliquer sur une étoile sélectionne la note', async ({ page }) => {
  await page.goto('/books/new');
  await page.locator('.formly-star-wrap .star').nth(2).click();
  await expect(page.locator('.formly-star-wrap .star.active')).toHaveCount(3);
  await expect(page.locator('.formly-star-value')).toHaveText('3/5');
});

test('cliquer sur la même étoile retire la note', async ({ page }) => {
  await page.goto('/books/new');
  await page.locator('.formly-star-wrap .star').nth(2).click();
  await page.locator('.formly-star-wrap .star').nth(2).click();
  await expect(page.locator('.formly-star-wrap .star.active')).toHaveCount(0);
});

// ── Annulation ─────────────────────────────────────────────────────────────

test('annuler retourne à la liste sans créer de livre', async ({ page }) => {
  await waitForList(page);
  await page.locator('.add-btn').click();
  await fillTitle(page, 'Titre Non Sauvegardé');
  await page.getByTestId('form-cancel').click();
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.row-title').filter({ hasText: 'Titre Non Sauvegardé' })).toHaveCount(0);
});

// ── Formulaire d'édition ───────────────────────────────────────────────────

test('le formulaire d\'édition est pré-rempli avec les données du livre', async ({ page }) => {
  await waitForList(page);
  await page.locator('.book-row').first().locator('.row-actions button').first().click();
  await expect(page).toHaveURL(/\/books\/\d+\/edit$/);
  const titleValue = await page.getByTestId('field-title').inputValue();
  expect(titleValue).toBeTruthy();
});

test('modifier le titre d\'un livre met à jour la liste', async ({ page }) => {
  await waitForList(page);
  const originalTitle = await page.locator('.row-title').first().textContent();
  await page.locator('.book-row').first().locator('.row-actions button').first().click();
  await page.getByTestId('field-title').fill('Titre Modifié E2E');
  await submit(page);
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.row-title').filter({ hasText: 'Titre Modifié E2E' })).toBeVisible();
  await expect(page.locator('.row-title').filter({ hasText: originalTitle! })).toHaveCount(0);
});

test('la note étoiles d\'un livre édité est conservée dans la liste', async ({ page }) => {
  await waitForList(page);
  // On édite le 2e livre et on définit une note
  await page.locator('.book-row').nth(1).locator('.row-actions button').first().click();
  await page.locator('.formly-star-wrap .star').nth(4).click();
  await submit(page);
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.book-row').nth(1).locator('.star.active').first()).toBeVisible();
});
