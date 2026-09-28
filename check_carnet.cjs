const { chromium } = require('playwright');
const FLAG = 'neon_pact';
const MISSIONS = 3;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript((flag) => {
    const decisions = [
      { missionId: 'op_blackout', missionTitle: 'Opération : Blackout', choiceLabel: 'Signer le pacte', succeeded: true, outcome: 'SUCCES', outcomeText: 'Le contrat est conclu.', consequenceText: 'Les decretes acceptent votre presence dans le Secteur 7.', flag, recordedAt: '2026-09-20T10:00:00.000Z' },
      { missionId: 'convoi', missionTitle: 'Convoi frontalier', choiceLabel: 'Eteindre le relais', succeeded: false, outcome: 'ECHEC', outcomeText: 'Le relais reste actif.', consequenceText: null, flag: null, recordedAt: '2026-09-22T10:00:00.000Z' },
    ];
    const state = {
      state: {
        table: { id: 't1', name: 'Test', status: 'setup', setupStep: 'scenario', companionIds: [], scenarioId: 'op_blackout', createdAt: '2026-09-01T00:00:00.000Z', completedMissionIds: ['op_blackout'], campaignFlags: [flag], decisionLog: decisions, lastChoice: null },
        characters: [],
        activeMission: null,
      },
      version: 0,
    };
    localStorage.setItem('edvard-game-state-v1', JSON.stringify(state));
  }, FLAG);

  const results = [];
  const check = (name, ok) => { results.push({ name, ok }); console.log((ok ? 'PASS' : 'FAIL') + ' - ' + name); };

  await page.goto('http://localhost:4177/table', { waitUntil: 'networkidle' });
  const panel = page.locator('aside[aria-label="Carnet de campagne"]');
  check('panneau carnet de campagne present', (await panel.count()) > 0);
  check('decision affichee', (await page.getByText('Signer le pacte').count()) > 0);
  check('consequence affichee', (await page.getByText('acceptent votre presence').count()) > 0);
  check('decision echouee affichee', (await page.getByText('Eteindre le relais').count()) > 0);
  check('aucun flag technique visible', (await page.getByText(FLAG).count()) === 0);

  // Le panneau applique `uppercase` : on compare sans tenir compte de la casse.
  const text = await panel.innerText();
  check('compteur et intitule du carnet', /carnet de d\u00e9cisions/i.test(text) && /2 entr\u00e9es/i.test(text));
  check('reussite et echec distingues', /r\u00e9ussite/i.test(text) && /\u00e9chec/i.test(text));
  check('progression des missions conservee', new RegExp('1 mission termin' + '\u00e9' + 'e? sur ' + MISSIONS).test(text));
  check('flag technique absent du carnet', !text.includes(FLAG));

  await browser.close();
  const bad = results.filter((r) => !r.ok);
  console.log('\n' + (results.length - bad.length) + '/' + results.length + ' verifications reussies');
  process.exit(bad.length ? 1 : 0);
})();

