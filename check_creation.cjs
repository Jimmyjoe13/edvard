const { chromium } = require('playwright');
const ORIGIN = 'ether-born';
const BASE_URL = 'http://localhost:4177';

// Verifie que le parcours React de creation produit exactement le meme
// personnage que la fiche commune (characterFactory) : meme origine, meme
// normalisation du nom, memes ressources derivees.
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('edvard-game-state-v1', JSON.stringify({
      state: {
        table: { id: 't1', name: 'Test', status: 'setup', setupStep: 'character', companionIds: [], scenarioId: 'op_blackout', createdAt: '2026-09-01T00:00:00.000Z', completedMissionIds: [], campaignFlags: [], decisionLog: [], lastChoice: null },
        characters: [],
        activeMission: null,
        creationMode: true,
      },
      version: 0,
    }));
  });

  const results = [];
  const check = (name, ok) => { results.push({ name, ok }); console.log((ok ? 'PASS' : 'FAIL') + ' - ' + name); };

  await page.goto(BASE_URL + '/table', { waitUntil: 'networkidle' });

  const checkNoJsError = (name) => check(name, errors.length === 0);

  // --- Etape 1 : origine (au moins une origine sans bonus flexible).
  await page.getByRole('button', { name: /\u00c9TH\u00c9R\u00c9/ }).first().click();
  check('origine ether-born selectionnable et retenue', await page.getByRole('button', { name: /\u00c9TH\u00c9R\u00c9/ }).first().getAttribute('aria-pressed') === 'true');
  checkNoJsError('aucune erreur JavaScript a l etape 1');

  // --- Etape 2 : repartir des valeurs par defaut, puis continuer.
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.locator('button[aria-label^="Augmenter"]').first().waitFor({ timeout: 5000 });
  check('repartition des caracteristiques affichee', true);
  await page.getByRole('button', { name: 'Continuer' }).click();

  // --- Etape 3 : nom puis validation.
  await page.locator('#character-name').fill('nova');
  check('validation activee une fois le nom renseigne', await page.getByRole('button', { name: /Cr\u00e9er le personnage/ }).isEnabled());

  await page.getByRole('button', { name: /Cr\u00e9er le personnage/ }).click();
  await page.locator('aside[aria-label="Carnet de campagne"]').waitFor({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);

  const snapshot = await page.evaluate(() => ({
    state: JSON.parse(localStorage.getItem('edvard-game-state-v1') || '{}'),
    sheet: JSON.parse(localStorage.getItem('edvard-character-sheet-v1') || 'null'),
  }));
  const record = snapshot?.state?.state?.characters?.[0];

  check('personnage cree et place dans la table', Boolean(record));
  check('fiche commune ecrite dans edvard-character-sheet-v1', Boolean(snapshot?.sheet));
  check('origine ether-born conservee dans la fiche commune', snapshot?.sheet?.originId === ORIGIN);
  check('fiche commune : nom normalise en majuscules', snapshot?.sheet?.name === 'NOVA');
  check('avatar ether-born (voidborn) correctement resolu', typeof record?.avatar === 'string' && record.avatar.includes('Voidborn'));

  // --- Coherence factory : ressources derivees des stats finales.
  const stats = record?.stats || {};
  const expectedHp = Math.max(1, 50 + ((stats.constitution || 10) - 10) * 2);
  const expectedFlux = Math.max(1, 20 + ((stats.intelligence || 10) - 10) * 2);
  const expectedMp = Math.max(1, 6 + Math.floor(((stats.agilite || 10) - 10) / 2));
  check('pv derives de la constitution', record?.maxHp === expectedHp);
  check('flux derives de l intelligence', record?.maxFlux === expectedFlux);
  check('mp derives de l agilite', record?.maxMp === expectedMp);
  check('pv et flux remplis a leur maximum', record?.hp === record?.maxHp && record?.flux === record?.maxFlux);
  checkNoJsError('aucune erreur JavaScript');

  await browser.close();
  const bad = results.filter((r) => !r.ok);
  console.log('\n' + (results.length - bad.length) + '/' + results.length + ' verifications reussies');
  process.exit(bad.length ? 1 : 0);
})();