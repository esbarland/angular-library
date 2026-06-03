import { test, expect } from '@playwright/test';
import { initFr, waitForList } from './helpers';

test.beforeEach(async ({ page }) => {
  await initFr(page);
});

async function fillTitle(page: any, value: string) {
  await page.getByPlaceholder('Le titre du livre').fill(value);
}
async function fillAuthor(page: any, value: string) {
  await page.getByPlaceholder("Prénom et nom de l'auteur").fill(value);
}
async function selectGenre(page: any, genre: string) {
  await page.locator('mat-form-field').filter({ hasText: 'Genre' }).locator('mat-select').click();
  await page.locator('mat-option').filter({ hasText: genre }).click();
}
async function selectStatus(page: any, label: string) {
  await page.locator('mat-form-field').filter({ hasText: 'Statut' }).locator('mat-select').click();
  await page.locator('mat-option').filter({ hasText: label }).click();
}
async function submit(page: any) {
  await page.locator('button[type="submit"]').click();
}

// ── Formulaire d'ajout ────────────────────────────────────────────────────

test('accède au formulaire d\'ajout via /books/new', async ({ page }) => {
  await page.goto('/books/new');
  await expect(page.locator('.page-title')).toContainText('Ajouter un livre');
  await expect(page.getByPlaceholder('Le titre du livre')).toBeVisible();
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
  await page.getByPlaceholder('ex : 2024').fill('2020');
  await page.getByPlaceholder('ex : 978-2-07-036024-3').fill('978-0-000-00000-0');
  await page.getByPlaceholder('Résumé ou description du livre…').fill('Une belle description');
  await selectStatus(page, 'Lu');
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
  await page.getByPlaceholder('Le titre du livre').clear();
  await page.getByPlaceholder('Le titre du livre').blur();
  await expect(page.locator('mat-error').first()).toBeVisible();
});

test('affiche une erreur si l\'année est invalide', async ({ page }) => {
  await page.goto('/books/new');
  await fillTitle(page, 'Titre');
  await fillAuthor(page, 'Auteur');
  await page.getByPlaceholder('ex : 2024').fill('999');
  await page.getByPlaceholder('ex : 2024').blur();
  await expect(page.locator('mat-error')).toBeVisible();
});

// ── Champ conditionnel finishedAt ──────────────────────────────────────────

test('le champ date de fin est caché par défaut (statut À lire)', async ({ page }) => {
  await page.goto('/books/new');
  await expect(page.locator('input[type="date"]')).toBeHidden();
});

test('le champ date de fin apparaît quand le statut est Lu', async ({ page }) => {
  await page.goto('/books/new');
  await selectStatus(page, 'Lu');
  await expect(page.locator('input[type="date"]')).toBeVisible();
});

test('le champ date de fin disparaît si on rechange le statut', async ({ page }) => {
  await page.goto('/books/new');
  await selectStatus(page, 'Lu');
  await expect(page.locator('input[type="date"]')).toBeVisible();
  await selectStatus(page, 'En cours');
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
  await page.locator('button').filter({ hasText: /Annuler/ }).click();
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.row-title').filter({ hasText: 'Titre Non Sauvegardé' })).toHaveCount(0);
});

// ── Formulaire d'édition ───────────────────────────────────────────────────

test('le formulaire d\'édition est pré-rempli avec les données du livre', async ({ page }) => {
  await waitForList(page);
  await page.locator('.book-row').first().locator('.row-actions button').first().click();
  await expect(page).toHaveURL(/\/books\/\d+\/edit$/);
  await expect(page.locator('.page-title')).toContainText('Modifier le livre');
  const titleValue = await page.getByPlaceholder('Le titre du livre').inputValue();
  expect(titleValue).toBeTruthy();
});

test('modifier le titre d\'un livre met à jour la liste', async ({ page }) => {
  await waitForList(page);
  const originalTitle = await page.locator('.row-title').first().textContent();
  await page.locator('.book-row').first().locator('.row-actions button').first().click();
  await page.getByPlaceholder('Le titre du livre').fill('Titre Modifié E2E');
  await submit(page);
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.row-title').filter({ hasText: 'Titre Modifié E2E' })).toBeVisible();
  await expect(page.locator('.row-title').filter({ hasText: originalTitle! })).toHaveCount(0);
});

test('la note étoiles d\'un livre édité est conservée dans la liste', async ({ page }) => {
  await waitForList(page);
  // Le Seigneur des Anneaux (idx 4 en date-desc) a rating=5, mais Le Petit Prince (idx 0) aussi
  // On édite le premier livre et on définit une note
  await page.locator('.book-row').nth(1).locator('.row-actions button').first().click();
  await page.locator('.formly-star-wrap .star').nth(4).click();
  await submit(page);
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.book-row').nth(1).locator('.star.active').first()).toBeVisible();
});
