import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Clock3, Dices, Plus, Shield, Sparkles, Users, Zap } from 'lucide-react';
import { AI_COMPANIONS } from '../data/companionData';
import { characterStorage } from '../data/characterStorage';
import { MISSIONS } from '../data/missionData';
import { useGameStore } from '../store/gameStore';

const setupSteps = [
  { id: 'character' as const, label: 'Personnage', number: '01' },
  { id: 'companions' as const, label: 'Compagnons', number: '02' },
  { id: 'scenario' as const, label: 'Scénario', number: '03' },
];

export const TableSetupWizard: React.FC = () => {
  const {
    table, characters, createTable, chooseSavedCharacter, setCreationMode,
    setTableSetupStep, setTableCompanions, selectTableScenario, startTableGame,
  } = useGameStore();
  const [tableName, setTableName] = useState('');
  const [savedCharacter] = useState(() => characterStorage.read());
  const player = characters.find((character) => !character.isAI);

  if (!table) {
    return (
      <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#070910] px-5 py-12 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(ellipse at 15% 15%, rgba(0,210,255,.18), transparent 45%), radial-gradient(ellipse at 90% 85%, rgba(188,19,254,.12), transparent 40%)' }} />
        <section className="relative w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#0d111bcc] p-7 shadow-2xl backdrop-blur-xl sm:p-12">
          <Link to="/" className="mb-12 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white">
            <ArrowLeft size={16} /> Retour à Edvard
          </Link>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"><Dices size={23} /></div>
          <p className="font-mono text-xs uppercase tracking-[.25em] text-cyan-200/75">Votre prochaine expédition</p>
          <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Créer une table</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/65">Préparez une partie solo avec votre personnage, des compagnons tactiques et un scénario à jouer sur la carte.</p>

          <form className="mt-10" onSubmit={(event) => { event.preventDefault(); createTable(tableName); }}>
            <label htmlFor="table-name" className="mb-2 block text-sm font-semibold text-white/85">Nom de la table <span className="font-normal text-white/40">(facultatif)</span></label>
            <input
              id="table-name"
              value={tableName}
              onChange={(event) => setTableName(event.target.value)}
              maxLength={48}
              placeholder="Ex. Les Veilleurs du Secteur 7"
              className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-white/30 focus:border-cyan-200/70 focus:ring-2 focus:ring-cyan-200/15"
            />
            <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-cyan-200 px-5 py-4 font-bold text-slate-950 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:ring-offset-2 focus:ring-offset-[#0d111b]">
              <Plus size={19} /> Créer ma table <ArrowRight size={18} />
            </button>
          </form>
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/8 bg-white/[.035] p-4 text-sm leading-6 text-white/55">
            <Shield className="mt-0.5 shrink-0 text-cyan-100/70" size={17} />
            Votre configuration et votre partie sont sauvegardées automatiquement sur cet appareil.
          </div>
        </section>
      </main>
    );
  }

  const activeStep = table.setupStep;
  const activeIndex = setupSteps.findIndex((step) => step.id === activeStep);
  const selectedMission = MISSIONS.find((mission) => mission.id === table.scenarioId);
  const completedMissions = MISSIONS.filter((mission) => table.completedMissionIds.includes(mission.id));
  const lastChoiceMission = table.lastChoice ? MISSIONS.find((mission) => mission.id === table.lastChoice?.missionId) : undefined;

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#070910] px-4 py-7 text-white sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(ellipse at 0% 10%, rgba(0,210,255,.14), transparent 42%), radial-gradient(ellipse at 95% 90%, rgba(188,19,254,.1), transparent 38%)' }} />
      <div className="relative mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Quitter la configuration</Link>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-cyan-100/55">Table en préparation</p>
            <p className="mt-1 text-sm font-semibold text-white">{table.name}</p>
          </div>
        </header>

        <section className="mx-auto max-w-4xl pt-9 sm:pt-14">
          <p className="font-mono text-xs uppercase tracking-[.25em] text-cyan-200/75">Préparation de l’expédition</p>
          <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">
            {activeStep === 'character' ? 'Qui part à l’aventure ?' : activeStep === 'companions' ? 'Composez votre équipe.' : 'Choisissez votre mission.'}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
            {activeStep === 'character' && 'Choisissez une fiche existante ou créez le personnage qui portera votre histoire.'}
            {activeStep === 'companions' && 'Recrutez jusqu’à deux alliés. Leurs profils IA les font agir tactiquement pendant les combats.'}
            {activeStep === 'scenario' && 'Chaque mission a ses objectifs, son briefing et sa propre carte de rencontre.'}
          </p>

          {activeStep === 'scenario' && (
            <aside aria-label="Progression de campagne" className="mt-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-cyan-100/15 bg-cyan-100/[.045] p-4 sm:items-center sm:p-5">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-100/70"><Sparkles size={14} /> Progression de campagne</p>
                <p className="mt-2 text-sm font-semibold text-white">{completedMissions.length} mission{completedMissions.length === 1 ? '' : 's'} terminée{completedMissions.length === 1 ? '' : 's'} sur {MISSIONS.length}</p>
                {completedMissions.length > 0 && <p className="mt-1 text-xs text-white/45">{completedMissions.map((mission) => mission.title).join(' · ')}</p>}
              </div>
              {table.lastChoice && (
                <div className="max-w-xl border-l border-white/15 pl-4 text-sm">
                  <p className="text-xs text-white/45">Votre dernier choix · {lastChoiceMission?.title || 'Mission précédente'}</p>
                  <p className="mt-1 font-medium text-white/80">{table.lastChoice.label}</p>
                  <p className={`mt-1 text-xs ${table.lastChoice.succeeded ? 'text-emerald-200/75' : 'text-amber-200/75'}`}>{table.lastChoice.outcome} — ses conséquences suivront votre équipe.</p>
                </div>
              )}
            </aside>
          )}

          <nav aria-label="Étapes de création de la table" className="mt-9 grid grid-cols-3 gap-2 sm:gap-4">
            {setupSteps.map((step, index) => {
              const complete = index < activeIndex;
              const current = index === activeIndex;
              return (
                <div key={step.id} aria-current={current ? 'step' : undefined} className={`flex items-center gap-2 border-t-2 pt-3 sm:gap-3 ${current ? 'border-cyan-200 text-white' : complete ? 'border-cyan-200/40 text-white/70' : 'border-white/10 text-white/35'}`}>
                  <span className="font-mono text-[10px] sm:text-xs">{complete ? <Check size={14} /> : step.number}</span>
                  <span className="text-xs font-semibold sm:text-sm">{step.label}</span>
                </div>
              );
            })}
          </nav>

          {activeStep === 'character' && (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {savedCharacter && (
                <button type="button" onClick={chooseSavedCharacter} className="group rounded-2xl border border-cyan-100/25 bg-cyan-100/[.06] p-6 text-left transition hover:border-cyan-100/60 hover:bg-cyan-100/10 focus:outline-none focus:ring-2 focus:ring-cyan-100">
                  <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100/10 text-cyan-100"><Shield size={21} /></span>
                  <span className="block text-xs font-mono uppercase tracking-widest text-cyan-100/60">Fiche sauvegardée</span>
                  <span className="mt-2 block text-2xl font-semibold">{savedCharacter.name || savedCharacter.lore?.name || 'Mon personnage'}</span>
                  <span className="mt-2 block text-sm leading-6 text-white/55">Reprendre cette fiche et continuer la préparation de la table.</span>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-100">Choisir cette fiche <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
                </button>
              )}
              <button type="button" onClick={() => { setTableSetupStep('character'); setCreationMode(true); }} className="group rounded-2xl border border-white/10 bg-white/[.035] p-6 text-left transition hover:border-white/30 hover:bg-white/[.06] focus:outline-none focus:ring-2 focus:ring-white/50">
                <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/85"><Plus size={21} /></span>
                <span className="block text-xs font-mono uppercase tracking-widest text-white/45">Nouvelle fiche</span>
                <span className="mt-2 block text-2xl font-semibold">Créer un personnage</span>
                <span className="mt-2 block text-sm leading-6 text-white/55">Définissez son origine, ses attributs et ses compétences dans le créateur.</span>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white">Ouvrir le créateur <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
              </button>
              {player && (
                <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.035] p-5">
                  <div><p className="text-xs font-mono uppercase tracking-widest text-white/45">Déjà à la table</p><p className="mt-1 font-semibold">{player.name}</p></div>
                  <button type="button" onClick={() => setTableSetupStep('companions')} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/15">Continuer <ArrowRight size={16} /></button>
                </div>
              )}
            </div>
          )}

          {activeStep === 'companions' && (
            <>
              <div className="mt-5 flex items-center gap-2 text-sm text-white/50"><Users size={16} /><span>Sélectionnez 1 ou 2 compagnons · {table.companionIds.length}/2 choisis</span></div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {AI_COMPANIONS.map((companion) => {
                  const selected = table.companionIds.includes(companion.id);
                  const canSelect = selected || table.companionIds.length < 2;
                  return (
                    <button key={companion.id} type="button" aria-pressed={selected} disabled={!canSelect} onClick={() => setTableCompanions(selected ? table.companionIds.filter((id) => id !== companion.id) : [...table.companionIds, companion.id])} className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-40 ${selected ? 'border-cyan-100/60 bg-cyan-100/[.08]' : 'border-white/10 bg-white/[.035] hover:border-white/25 hover:bg-white/[.06]'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <img src={companion.avatar} alt="" className="h-16 w-16 rounded-xl border border-white/10 object-cover" />
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${selected ? 'border-cyan-100 bg-cyan-100 text-slate-950' : 'border-white/20 text-transparent'}`}><Check size={14} /></span>
                      </div>
                      <p className="mt-4 text-xs font-mono uppercase tracking-widest text-cyan-100/60">{companion.role} · {companion.origin}</p>
                      <h2 className="mt-1 text-xl font-semibold">{companion.name}</h2>
                      <p className="mt-2 min-h-12 text-sm leading-6 text-white/55">{companion.description}</p>
                      <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-3 text-xs text-white/55"><span>PV {companion.hp}</span><span>Flux {companion.flux}</span><span className="inline-flex items-center gap-1"><Zap size={12} /> IA tactique</span></div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-7 flex flex-wrap justify-between gap-3">
                <button type="button" onClick={() => setTableSetupStep('character')} className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-white/60 transition hover:text-white"><ArrowLeft size={16} /> Personnage</button>
                <button type="button" disabled={!table.companionIds.length} onClick={() => setTableSetupStep('scenario')} className="inline-flex items-center gap-2 rounded-xl bg-cyan-200 px-5 py-3 font-bold text-slate-950 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:ring-offset-2 focus:ring-offset-[#070910] disabled:cursor-not-allowed disabled:opacity-40">Choisir un scénario <ArrowRight size={17} /></button>
              </div>
            </>
          )}

          {activeStep === 'scenario' && (
            <>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {MISSIONS.map((mission) => {
                  const selected = table.scenarioId === mission.id;
                  const completed = table.completedMissionIds.includes(mission.id);
                  return (
                    <button key={mission.id} type="button" aria-pressed={selected} onClick={() => selectTableScenario(mission.id)} className={`group overflow-hidden rounded-2xl border text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-100 ${selected ? 'border-cyan-100/65 bg-cyan-100/[.07]' : 'border-white/10 bg-white/[.035] hover:border-white/25'}`}>
                      <div className="relative h-36 overflow-hidden">
                        <img src={mission.coverImage} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080b12] via-black/15 to-transparent" />
                        <span className="absolute bottom-3 left-4 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white/80">{mission.client}</span>
                        {completed && <span className="absolute left-4 top-3 inline-flex items-center gap-1 rounded-full border border-emerald-200/30 bg-emerald-950/75 px-2.5 py-1 text-[10px] font-semibold text-emerald-100"><Check size={12} /> Terminée</span>}
                        {selected && <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-100 text-slate-950"><Check size={16} /></span>}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-mono uppercase tracking-widest text-cyan-100/60">{mission.tags.join(' · ')}</span><span className="inline-flex shrink-0 items-center gap-1 text-xs text-white/45"><Clock3 size={13} /> {mission.estimatedMinutes} min</span></div>
                        <h2 className="mt-2 font-display text-2xl leading-tight">{mission.title}</h2>
                        <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-white/55">{mission.description}</p>
                        <div className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-white/50"><span className="font-semibold text-white/70">Objectifs :</span> {mission.objectives.filter((objective) => objective.status === 'pending').map((objective) => objective.description).join(' · ')}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <button type="button" onClick={() => setTableSetupStep('companions')} className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-white/60 transition hover:text-white"><ArrowLeft size={16} /> Compagnons</button>
                <div className="flex flex-wrap items-center gap-4">
                  {selectedMission && <span className="hidden text-sm text-white/45 sm:inline-flex sm:items-center sm:gap-2"><Sparkles size={15} /> {selectedMission.title}</span>}
                  <button type="button" disabled={!selectedMission || !table.companionIds.length} onClick={startTableGame} className="inline-flex items-center gap-2 rounded-xl bg-cyan-200 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:ring-offset-2 focus:ring-offset-[#070910] disabled:cursor-not-allowed disabled:opacity-40"><Dices size={18} /> Lancer la partie <ArrowRight size={17} /></button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
};
