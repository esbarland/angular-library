import { test, expect, Page } from '@playwright/test';
import { mockApi, waitForList } from './helpers';

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

async function fillTitle(page: Page, value: string) {
  await page.getByTestId('field-title').fill(value);
}
async function fillAuthor(page: Page, value: string) {
  await page.getByTestId('field-author').fill(value);
}
async function fillRequired(page: Page) {
  await page.getByTestId('field-isbn').fill('978-0-000-00000-0');
  await page.getByTestId('field-pages').fill('250');
  await page.getByTestId('field-year').fill('2020');
}
// Sélection par index d'option (ordre des énumérations) → indépendant de la locale servie.
const CATEGORY_ORDER = ['NOVEL', 'FANTASY', 'SCIENCE_FICTION', 'THRILLER', 'CRIME', 'HORROR', 'BIOGRAPHY', 'HISTORY', 'POETRY', 'CHILDREN'];
const STATUS_ORDER = ['TO_READ', 'READING', 'READ'];

async function selectCategory(page: Page, value: string) {
  await page.getByTestId('field-genre').click();
  // 1re option = « -- None -- », puis les catégories dans l'ordre de BOOK_CATEGORIES.
  await page.locator('mat-option').nth(CATEGORY_ORDER.indexOf(value) + 1).click();
}
async function selectStatus(page: Page, value: string) {
  await page.getByTestId('field-status').click();
  await page.locator('mat-option').nth(STATUS_ORDER.indexOf(value)).click();
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
  await fillRequired(page);
  await submit(page);
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.row-title').filter({ hasText: 'Mon Nouveau Livre' })).toBeVisible();
});

test('crée un livre avec tous les champs remplis', async ({ page }) => {
  await page.goto('/books/new');
  await fillTitle(page, 'Livre Complet');
  await fillAuthor(page, 'Auteur Complet');
  await selectCategory(page, 'FANTASY');
  await page.getByTestId('field-year').fill('2020');
  await page.getByTestId('field-isbn').fill('978-0-000-00000-0');
  await page.getByTestId('field-pages').fill('420');
  await page.getByTestId('field-description').fill('Une belle description');
  await selectStatus(page, 'READ');
  await page.locator('.formly-star-wrap .star').nth(3).click();
  await submit(page);
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.row-title').filter({ hasText: 'Livre Complet' })).toBeVisible();
});

// ── Validation ─────────────────────────────────────────────────────────────

test('le titre est obligatoire — le submit est désactivé', async ({ page }) => {
  await page.goto('/books/new');
  await fillRequired(page);
  await expect(page.locator('button[type="submit"]')).toBeDisabled();
});

test('l\'ISBN est obligatoire — le submit est désactivé', async ({ page }) => {
  await page.goto('/books/new');
  await fillTitle(page, 'Titre');
  await page.getByTestId('field-pages').fill('250');
  await page.getByTestId('field-year').fill('2020');
  await expect(page.locator('button[type="submit"]')).toBeDisabled();
});

test('le nombre de pages est obligatoire — le submit est désactivé', async ({ page }) => {
  await page.goto('/books/new');
  await fillTitle(page, 'Titre');
  await page.getByTestId('field-isbn').fill('978-0-000-00000-0');
  await page.getByTestId('field-year').fill('2020');
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
  await fillRequired(page);
  await page.getByTestId('field-year').fill('999');
  await page.getByTestId('field-year').blur();
  await expect(page.locator('mat-error')).toBeVisible();
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
