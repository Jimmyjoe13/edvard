import React, { useEffect, useState } from 'react';
import { useGameStore, RACES } from '../store/gameStore';
import { ATTRIBUTES, AttributeId, CHARACTER_CREATION, CharacterStats, getTotalAttributePointCost } from '../data/rules';
import { characterStorage } from '../data/characterStorage';
import { createCharacterFromRecord } from '../data/characterFactory';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Shield, Zap, ChevronLeft, ChevronRight, Check, AlertTriangle, User } from 'lucide-react';

const CHARACTER_DRAFT_KEY = 'edvard-character-draft-v2';

type CharacterDraft = {
  step: number;
  name: string;
  selectedRaceId: string;
  stats: CharacterStats;
  flexibleBonusStats: AttributeId[];
};

const createBaseStats = (): CharacterStats => Object.fromEntries(
  ATTRIBUTES.map(({ id }) => [id, CHARACTER_CREATION.minimumAttribute]),
) as CharacterStats;

const readCharacterDraft = (): Partial<CharacterDraft> => {
  try {
    const savedDraft = localStorage.getItem(CHARACTER_DRAFT_KEY);
    if (savedDraft) return JSON.parse(savedDraft) as Partial<CharacterDraft>;

    const savedCharacter = characterStorage.read();
    if (!savedCharacter) return {};

    const stats = createBaseStats();
    ATTRIBUTES.forEach(({ id }) => {
      const value = savedCharacter.baseStats[id];
      if (typeof value === 'number') stats[id] = value;
    });

    return {
      step: 1,
      name: savedCharacter.name,
      selectedRaceId: savedCharacter.originId || undefined,
      stats,
      flexibleBonusStats: savedCharacter.flexibleBonusStats,
    };
  } catch {
    return {};
  }
};

export const DNASequencer: React.FC = () => {
  const { finalizeCharacter, table, setCreationMode } = useGameStore();
  const [draft] = useState(readCharacterDraft);
  const [step, setStep] = useState(() => Math.min(3, Math.max(1, draft.step || 1)));
  const [name, setName] = useState(draft.name || "");
  const [selectedRaceId, setRace] = useState(RACES.some((race) => race.id === draft.selectedRaceId) ? draft.selectedRaceId! : RACES[0].id);
  const [stats, setStats] = useState<CharacterStats>(draft.stats || createBaseStats());
  const [flexibleBonusStats, setFlexibleBonusStats] = useState<AttributeId[]>(draft.flexibleBonusStats || []);
  const points = CHARACTER_CREATION.initialAttributePoints - getTotalAttributePointCost(stats);

  useEffect(() => {
      try {
          localStorage.setItem(CHARACTER_DRAFT_KEY, JSON.stringify({ step, name, selectedRaceId, stats, flexibleBonusStats }));
      } catch {
          // Keep character creation usable when local storage is unavailable.
      }
  }, [step, name, selectedRaceId, stats, flexibleBonusStats]);

  const selectedRace = RACES.find(r => r.id === selectedRaceId)!;

  const updateStat = (stat: AttributeId, delta: number) => {
      const nextValue = stats[stat] + delta;
      if (nextValue < CHARACTER_CREATION.minimumAttribute || nextValue > CHARACTER_CREATION.maximumAttribute) return;
      const nextStats = { ...stats, [stat]: nextValue };
      if (CHARACTER_CREATION.initialAttributePoints - getTotalAttributePointCost(nextStats) < 0) return;
      setStats(nextStats);
  };

  const canIncreaseStat = (stat: AttributeId) => (
      stats[stat] < CHARACTER_CREATION.maximumAttribute
      && getTotalAttributePointCost({ ...stats, [stat]: stats[stat] + 1 }) <= CHARACTER_CREATION.initialAttributePoints
  );

  const toggleFlexibleBonus = (stat: AttributeId) => {
      setFlexibleBonusStats((selected) => {
          if (selected.includes(stat)) return selected.filter((item) => item !== stat);
          if (selected.length >= selectedRace.flexibleBonusCount) return selected;
          return [...selected, stat];
      });
  };

  const chooseRace = (raceId: string) => {
      setRace(raceId);
      setFlexibleBonusStats([]);
  };

  const handleFinalize = () => {
      if (!name.trim()) return;
      const savedCharacter = characterStorage.read();
      // Single source of truth: the shared factory turns a campaign-sheet record
      // into the playable character, so both creation paths behave identically.
      const newChar = createCharacterFromRecord({
          name: name.trim(),
          originId: selectedRaceId,
          baseStats: stats,
          flexibleBonusStats,
          specializationId: savedCharacter?.specializationId ?? null,
          skillIds: savedCharacter?.skillIds,
          equipmentIds: savedCharacter?.equipmentIds,
          lore: { ...(savedCharacter?.lore || { name: '', age: '', origin: '', background: '', appearance: '' }), name: name.trim() },
      });
      characterStorage.write({
          name: newChar.name,
          originId: selectedRaceId,
          baseStats: stats,
          flexibleBonusStats,
          specializationId: newChar.specializationId ?? null,
          skillIds: newChar.skills,
          equipmentIds: newChar.inventory,
          lore: { ...(savedCharacter?.lore || { name: '', age: '', origin: '', background: '', appearance: '' }), name: newChar.name },
      });
      finalizeCharacter(newChar);
      try {
          localStorage.removeItem(CHARACTER_DRAFT_KEY);
      } catch {
          // A completed character can still be created without local storage.
      }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[300] bg-[#020205] flex items-start lg:items-center justify-center px-4 py-5 sm:px-6 sm:py-8 lg:p-10 overflow-y-auto bg-hex">
        <div className="w-full max-w-6xl min-h-full lg:h-full flex flex-col gap-5 sm:gap-7 lg:gap-10 relative py-2">
            
            {/* Header */}
            <div className="flex flex-col gap-5 border-b border-nexus-cyan/20 pb-5 sm:flex-row sm:justify-between sm:items-end sm:pb-6 lg:pb-8">
                <div>
                    <div className="flex items-center gap-4 text-nexus-cyan mb-2">
                        <Dna size={26} className="shrink-0 animate-spin-slow sm:w-8 sm:h-8" />
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-[0.08em] sm:tracking-[0.2em] uppercase">SÉQUENCEUR_ADN_v4</h2>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono tracking-wide sm:tracking-widest uppercase">Création de personnage // Laboratoire de la NeoForge</p>
                    <p className="mt-2 text-xs text-gray-300">Vos choix sont enregistrés sur cet appareil.</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    {table?.status === 'setup' && (
                        <button type="button" onClick={() => setCreationMode(false)} className="inline-flex items-center gap-2 text-xs text-gray-400 transition hover:text-white">
                            <ChevronLeft size={15} /> Retour à la table
                        </button>
                    )}
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-300" aria-live="polite">Étape {step} sur 3</span>
                        <div className="flex gap-2" aria-hidden="true">
                            {[1,2,3].map(s => (
                                <div key={s} className={`w-10 sm:w-12 h-2 rounded-full transition-all ${step >= s ? 'bg-nexus-cyan shadow-[0_0_10px_#00d2ff]' : 'bg-gray-700'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-10 overflow-visible lg:min-h-0">
                
                {/* View Container */}
                <div className="min-w-0 flex-1 glass-panel rounded-[1.75rem] sm:rounded-[2.25rem] lg:rounded-[3rem] p-5 sm:p-8 lg:p-10 xl:p-12 overflow-visible lg:overflow-y-auto custom-scrollbar relative">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Dna size={300}/></div>
                    
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-10">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide sm:tracking-widest mb-2">01. SÉLECTION DE VOTRE ORIGINE</h3>
                                    <p className="text-xs text-gray-500 font-sans">Choisissez la base génétique de votre unité.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    {RACES.map(r => (
                                        <button 
                                            key={r.id} onClick={() => chooseRace(r.id)} aria-pressed={selectedRaceId === r.id}
                                            className={`p-5 sm:p-7 rounded-[1.5rem] sm:rounded-[2rem] border-2 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nexus-cyan ${selectedRaceId === r.id ? 'border-nexus-cyan bg-nexus-cyan/5 shadow-[0_0_30px_#00d2ff1a]' : 'border-white/10 bg-black/40 hover:border-white/30'}`}
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-xl font-black text-white tracking-tighter">{r.name}</span>
                                                {selectedRaceId === r.id && <Check size={20} className="text-nexus-cyan" />}
                                            </div>
                                            <p className="text-sm text-gray-300 font-sans leading-relaxed mb-5 min-h-[3rem]">{r.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(r.bonus).map(([stat, val]) => (
                                                    <span key={stat} className="px-2 py-1 bg-white/5 rounded text-[8px] font-black text-nexus-cyan uppercase">{val > 0 ? '+' : ''}{val} {ATTRIBUTES.find((attribute) => attribute.id === stat)?.label ?? stat}</span>
                                                ))}
                                                {r.flexibleBonusCount > 0 && <span className="px-2 py-1 bg-white/5 rounded text-[8px] font-black text-nexus-cyan uppercase">+1 à choisir × {r.flexibleBonusCount}</span>}
                                                {r.freeSkillBonus > 0 && <span className="px-2 py-1 bg-white/5 rounded text-[8px] font-black text-nexus-cyan uppercase">+{r.freeSkillBonus} compétence</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {selectedRace.flexibleBonusCount > 0 && (
                                    <fieldset className="space-y-3 rounded-2xl border border-nexus-cyan/20 bg-nexus-cyan/5 p-5">
                                        <legend className="px-2 text-xs font-black uppercase tracking-widest text-nexus-cyan">Choisissez deux caractéristiques à augmenter de +1</legend>
                                        <div className="flex flex-wrap gap-2">
                                            {ATTRIBUTES.map(({ id, label }) => {
                                                const selected = flexibleBonusStats.includes(id);
                                                const atLimit = flexibleBonusStats.length >= selectedRace.flexibleBonusCount;
                                                return (
                                                    <button key={id} type="button" aria-pressed={selected} onClick={() => toggleFlexibleBonus(id)} disabled={!selected && atLimit}
                                                        className={`rounded-full border px-3 py-2 text-xs font-bold transition-colors ${selected ? 'border-nexus-cyan bg-nexus-cyan text-nexus-dark' : 'border-white/20 text-white hover:border-nexus-cyan disabled:opacity-40'}`}>
                                                        {label}{selected ? ' +1' : ''}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </fieldset>
                                )}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-10">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide sm:tracking-widest mb-2">02. Répartir vos caractéristiques</h3>
                                        <p className="text-xs text-gray-500 font-sans">Caractéristiques de {CHARACTER_CREATION.minimumAttribute} à {CHARACTER_CREATION.maximumAttribute}. Le coût augmente avec la valeur.</p>
                                    </div>
                                    <div className="bg-nexus-purple/10 border border-nexus-purple/30 px-5 py-3 rounded-2xl self-start sm:self-auto">
                                        <div className="text-xs text-purple-300 font-black uppercase mb-1">Points disponibles</div>
                                        <div className="text-2xl font-black text-white">{points}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-8">
                                    {ATTRIBUTES.map(({ id, label }) => (
                                        <div key={id} className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{label}</span>
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => updateStat(id, -1)} disabled={stats[id] <= CHARACTER_CREATION.minimumAttribute} aria-label={`Diminuer ${label}`} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white disabled:opacity-30">-</button>
                                                    <span className="text-xl font-black text-nexus-cyan w-8 text-center">{stats[id]}</span>
                                                    <button onClick={() => updateStat(id, 1)} disabled={!canIncreaseStat(id)} aria-label={`Augmenter ${label}`} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white disabled:opacity-30">+</button>
                                                </div>
                                            </div>
                                            <div className="h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-nexus-cyan" style={{ width: `${(stats[id] / CHARACTER_CREATION.maximumAttribute) * 100}%` }}></div></div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-12">
                                <div>
                                     <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide sm:tracking-widest mb-2">03. Nommer votre personnage</h3>
                                    <p className="text-xs text-gray-500 font-sans">Finalisez le processus de synchronisation neural.</p>
                                </div>
                                <div className="max-w-md space-y-8">
                                    <div className="space-y-4">
                                        <label htmlFor="character-name" className="text-sm font-bold text-nexus-cyan tracking-wide">Nom du personnage</label>
                                        <input 
                                            id="character-name" required maxLength={24} autoComplete="off"
                                            type="text" value={name} onChange={(e) => setName(e.target.value)}
                                            placeholder="Ex. : Kael Veyr" 
                                            className="w-full bg-black/60 border-2 border-white/10 rounded-2xl px-5 py-4 text-lg font-bold text-white outline-none focus:border-nexus-cyan transition-all"
                                        />
                                    </div>
                                    <div className="p-8 bg-nexus-purple/5 border border-nexus-purple/20 rounded-[2.5rem] flex gap-6 items-center">
                                        <AlertTriangle className="text-nexus-purple shrink-0" size={32} />
                                        <p className="text-[10px] text-gray-400 font-sans leading-relaxed uppercase">Attention : Le processus de séquençage est irréversible. Une fois validée, l'intégrité de la souche sera fixée.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Summary Panel */}
                <div className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-4 sm:gap-6">
                    <div className="glass-panel p-5 sm:p-7 lg:p-8 rounded-[1.75rem] lg:rounded-[3rem] space-y-5 sm:space-y-7 lg:space-y-8 border-l-4 lg:border-l-0 lg:border-r-4 border-l-nexus-cyan lg:border-r-nexus-cyan">
                        <div className="text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] border-2 border-nexus-cyan bg-black mx-auto mb-3 sm:mb-4 overflow-hidden shadow-2xl grid place-items-center">
                                <User size={32} className="text-gray-500" />
                            </div>
                            <div className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">{name || "Votre personnage"}</div>
                            <div className="text-[8px] text-nexus-cyan font-mono uppercase tracking-[0.2em] mt-1">{selectedRace.name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-5 gap-y-2 pt-5 border-t border-white/10 sm:grid-cols-3 lg:grid-cols-2">
                            {ATTRIBUTES.map(({ id, label }) => (
                                <div key={id} className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-gray-500">{label.substring(0,3)}</span>
                                    <span className="text-white">{stats[id] + (selectedRace.bonus[id] || 0) + (flexibleBonusStats.includes(id) ? 1 : 0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="px-4 sm:px-5 py-4 sm:py-5 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                            >
                                <ChevronLeft size={18} aria-hidden="true" /> <span className="sr-only sm:not-sr-only">Retour</span>
                            </button>
                        )}
                        <button 
                            type="button"
                            onClick={() => step < 3 ? setStep(step + 1) : handleFinalize()}
                            disabled={(step === 1 && flexibleBonusStats.length !== selectedRace.flexibleBonusCount) || (step === 3 && !name.trim())}
                            className="flex-1 min-w-0 py-4 sm:py-5 lg:py-6 bg-nexus-cyan text-nexus-dark font-black rounded-2xl lg:rounded-[2rem] hover:brightness-110 transition-all shadow-[0_10px_30px_#00d2ff33] uppercase tracking-wide sm:tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <span>{step === 3 ? "Créer le personnage" : "Continuer"}</span> <ChevronRight size={20} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
  );
};
