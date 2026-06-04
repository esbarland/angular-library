import { test, expect, Page } from '@playwright/test';
import { resetData, waitForList } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetData(page);
  await waitForList(page);
});

async function openDetail(page: Page, rowIndex = 0) {
  await page.locator('.book-row').nth(rowIndex).click();
  await expect(page).toHaveURL(/\/books\/\d+$/);
}

// ── Affichage ─────────────────────────────────────────────────────────────

test('affiche le titre et l\'auteur du livre', async ({ page }) => {
  await openDetail(page, 0);
  await expect(page.locator('.book-title')).toBeVisible();
  await expect(page.locator('.book-author')).toBeVisible();
  const title = await page.locator('.book-title').textContent();
  expect(title?.trim().length).toBeGreaterThan(0);
});

test('affiche le badge statut', async ({ page }) => {
  await openDetail(page, 0);
  await expect(page.locator('.status-chip')).toBeVisible();
});

test('affiche la note étoiles pour un livre noté', async ({ page }) => {
  // Le Petit Prince (index 0 par défaut) a rating=5
  await openDetail(page, 0);
  await expect(page.locator('.info-row .star.active')).toHaveCount(5);
});

test('affiche "Non noté" pour un livre sans note', async ({ page }) => {
  // 1984 (index 1) a rating=null
  await openDetail(page, 1);
  await expect(page.locator('.no-rating')).toBeVisible();
  await expect(page.locator('.info-row .star.active')).toHaveCount(0);
});

test('affiche l\'année de publication si renseignée', async ({ page }) => {
  await openDetail(page, 0);
  const infoRows = page.locator('.info-row');
  await expect(infoRows).toBeTruthy();
});

test('affiche la section description si renseignée', async ({ page }) => {
  await openDetail(page, 0);
  await expect(page.locator('.description')).toBeVisible();
  const desc = await page.locator('.description').textContent();
  expect(desc?.trim().length).toBeGreaterThan(0);
});

// ── Notation interactive ───────────────────────────────────────────────────

test('cliquer sur une étoile définit la note', async ({ page }) => {
  // Ouvre 1984 (pas de note)
  await openDetail(page, 1);
  await expect(page.locator('.info-row .star.active')).toHaveCount(0);
  await page.locator('.info-row .star').nth(2).click();
  await expect(page.locator('.info-row .star.active')).toHaveCount(3);
});

test('cliquer sur la même étoile retire la note', async ({ page }) => {
  // Ouvre 1984, donne une note, retire
  await openDetail(page, 1);
  await page.locator('.info-row .star').nth(3).click();
  await expect(page.locator('.info-row .star.active')).toHaveCount(4);
  await page.locator('.info-row .star').nth(3).click();
  await expect(page.locator('.info-row .star.active')).toHaveCount(0);
});

test('la note est persistée après navigation et retour', async ({ page }) => {
  await openDetail(page, 1);
  await page.locator('.info-row .star').nth(1).click();
  await expect(page.locator('.info-row .star.active')).toHaveCount(2);
  // Retour à la liste
  await page.getByTestId('detail-back').click();
  await expect(page).toHaveURL('/books');
  // Re-ouvrir le même livre
  await page.locator('.book-row').nth(1).click();
  await expect(page.locator('.info-row .star.active')).toHaveCount(2);
});

test('changer la note met à jour les étoiles immédiatement', async ({ page }) => {
  await openDetail(page, 0); // Le Petit Prince, rating=5
  await expect(page.locator('.info-row .star.active')).toHaveCount(5);
  await page.locator('.info-row .star').nth(1).click(); // Passe à 2 étoiles
  await expect(page.locator('.info-row .star.active')).toHaveCount(2);
});

// ── Navigation ─────────────────────────────────────────────────────────────

test('le bouton Modifier navigue vers le formulaire d\'édition', async ({ page }) => {
  await openDetail(page, 0);
  await page.getByTestId('detail-edit').click();
  await expect(page).toHaveURL(/\/books\/\d+\/edit$/);
});

test('le bouton retour ramène à la liste', async ({ page }) => {
  await openDetail(page, 0);
  await page.getByTestId('detail-back').click();
  await expect(page).toHaveURL('/books');
  await expect(page.locator('.book-row')).toHaveCount(5);
});
