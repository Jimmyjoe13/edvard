const { chromium } = require('playwright');
const BASE_URL = 'http://localhost:4177';

// Verifie que la creation de personnage passe par un seul parcours, celui de
// l'application React, et que l'ancienne page statique ne fait plus que
// rediriger vers celui-ci.
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  const results = [];
  const check = (name, ok) => { results.push({ name, ok }); console.log((ok ? 'PASS' : 'FAIL') + ' - ' + name); };

  await page.addInitScript(() => localStorage.clear());

  // --- L'accueil propose des liens internes, plus deCreation de Personnage.html.
  await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
  const legacyHrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a'))
    .map((a) => a.getAttribute('href'))
    .filter((href) => href && href.includes('creation-personnage.html')));
  check('aucun lien de l accueil ne pointe vers creation-personnage.html', legacyHrefs.length === 0);

  const creationHref = await page.locator('a.journey-card').first().getAttribute('href');
  check('la carte de creation pointe vers la route React', creationHref === '/creation-personnage');

  // --- La route React ouvre directement le sequenceur de personnage.
  await page.locator('a.journey-card').first().click();
  await page.waitForURL('**/creation-personnage', { timeout: 10000 });
  check('la carte de creation mene a la route /creation-personnage', page.url().endsWith('/creation-personnage'));

  await page.getByRole('button', { name: /\u00c9TH\u00c9R\u00c9/ }).first().waitFor({ timeout: 10000 });
  check('le parcours React affiche les origines du personnage', true);
  check('une table de preparation a ete creee', await page.evaluate(() => {
    const raw = localStorage.getItem('edvard-game-state-v1');
    return Boolean(raw && JSON.parse(raw)?.state?.table);
  }));
  check('le mode creation est actif', await page.evaluate(() => {
    const raw = localStorage.getItem('edvard-game-state-v1');
    return Boolean(raw && JSON.parse(raw)?.state?.creationMode);
  }));

  // --- L'ancienne page statique redirige vers le parcours React.
  // On passe par un <iframe> : goto() se bloque sur une redirection instantanee.
  await page.evaluate(() => {
    const f = document.createElement('iframe');
    f.style.display = 'none';
    f.id = 'legacy-redirect-probe';
    f.src = '/creation-personnage.html';
    document.body.appendChild(f);
  });
  await page.waitForFunction(() => {
    const f = document.getElementById('legacy-redirect-probe');
    return Boolean(f && f.contentWindow && f.contentWindow.location.pathname === '/creation-personnage');
  }, undefined, { timeout: 15000 });
  check('creation-personnage.html redirige vers /creation-personnage', true);
  await page.evaluate(() => document.getElementById('legacy-redirect-probe')?.remove());
  await page.waitForSelector('#legacy-redirect-probe', { state: 'detached' }).catch(() => {});
  check('la redirection aboutit bien au parcours React', true);

  // --- Les pages statiques conservent un lien vers le parcours unique.
  for (const legacyPage of ['regles.html', 'bestiaire.html', 'scenarios.html', 'univers-lore.html', 'equipement.html']) {
    await page.goto(BASE_URL + '/' + legacyPage, { waitUntil: 'domcontentloaded' });
    const href = await page.locator('a[href="/creation-personnage"]').count();
    check(legacyPage + ' renvoie vers le parcours React', href > 0);
  }

  check('aucune erreur JavaScript sur le parcours', errors.length === 0);
  if (errors.length) console.log(errors.join('\n'));

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log('\n' + (results.length - failed.length) + '/' + results.length + ' verifications reussies');
  if (failed.length) process.exit(1);
})().catch((error) => { console.error(error); process.exit(1); });