import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SKILLS, WEAPONS } from '../data/gameData';
import { RACE_ABILITIES } from '../data/abilityData';
import { soundEngine } from '../utils/soundEngine';
import { TacticalMap } from './TacticalMap';
import { HackingTerminal } from './HackingTerminal';
import { Encyclopedia } from './Encyclopedia';
import { NeuralBridge } from './NeuralBridge';
import { DNASequencer } from './DNASequencer';
import { HoloComms } from './HoloComms';
import { MissionTracker } from './MissionTracker';
import { WeatherOverlay } from './WeatherOverlay';
import { TableSetupWizard } from './TableSetupWizard';
import { 
    Dices, Terminal as TermIcon, Users, Crosshair, Sword, ShieldAlert,
    Zap, Play, SkipForward, EyeOff, Activity, Box, Cpu, Book, Database, Send,
    Footprints, Loader2, Trophy, ZoomIn, ZoomOut, Compass, User, Dna, Volume2, VolumeX, ScrollText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NexusVTT: React.FC = () => {
  const { 
      characters, diceResult, logs, selectedTokenId, targetTokenId, turnOrder, currentTurnIndex, zoom,
      fogEnabled, hackingActive, archiveOpen, inventoryOpen, creationMode, isAITurnProcessing, victory, defeat, weather, table, dialogueQueue,
      rollCheck, takeDamage, setSelectedToken, setTargetToken, startCombat, nextTurn, toggleFog, setArchiveOpen, setInventoryOpen, setCreationMode, processCommand, performAttack, setZoom, activateAbility
  } = useGameStore();
  const returnToTableSetup = useGameStore((state) => state.returnToTableSetup);
  
  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'skills'>('stats');
  const [commandInput, setCommand] = useState("");
  const [showLogs, setShowLogs] = useState(false);
  const [soundEnabled, setSound] = useState(true);

  if (!table || table.status === 'setup' || characters.length === 0) {
      if (table?.setupStep === 'character' && creationMode) return <DNASequencer />;
      return <TableSetupWizard />;
  }

  const selectedChar = characters.find(c => c.id === selectedTokenId) || characters[0];
  const hasActiveOpposition = characters.some((character) => (
      (character.faction || (character.isAI ? 'opposition' : 'party')) === 'opposition' && character.hp > 0
  ));
  const targetChar = characters.find(c => c.id === targetTokenId);
  const currentCharId = turnOrder[currentTurnIndex];
  const isCombatActive = turnOrder.length > 0;
  const activeTurnChar = characters.find((character) => character.id === currentCharId);
  const isMyTurn = isCombatActive && !!activeTurnChar && !activeTurnChar.isAI;

  const charSkills = SKILLS.filter(s => selectedChar.skills.includes(s.id));
  const charWeapons = selectedChar.inventory.map(id => WEAPONS.find(w => w.id === id)).filter((w): w is any => !!w);
  const targetDistance = targetChar ? Math.abs(selectedChar.position.x - targetChar.position.x) + Math.abs(selectedChar.position.y - targetChar.position.y) : null;
  const charAbilities = selectedChar.race ? RACE_ABILITIES[selectedChar.race.toUpperCase()] || [] : [];

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (commandInput.trim()) processCommand(commandInput);
    setCommand("");
  };

  const toggleSound = () => {
      const state = soundEngine.toggle();
      setSound(state);
  };

  const openRulebook = () => {
      window.open('/guide-de-table#lancer-un-test', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative w-full h-screen bg-[#020204] text-[#e0e0e0] font-['Orbitron',sans-serif] overflow-hidden selection:bg-nexus-cyan/30 crt-overlay">
      <TacticalMap />
      <WeatherOverlay />

      <AnimatePresence>{hackingActive && <HackingTerminal />}</AnimatePresence>
      <AnimatePresence>{archiveOpen && <Encyclopedia />}</AnimatePresence>
      <AnimatePresence>{inventoryOpen && <NeuralBridge />}</AnimatePresence>
      <HoloComms />
      <MissionTracker />
      
      <AnimatePresence>
          {(victory || defeat) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl">
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center p-20 border border-nexus-cyan/40 bg-[#0a0a12]/80 rounded-[4rem] shadow-2xl">
                      {victory ? <Trophy size={88} className="text-nexus-cyan mx-auto mb-8 animate-bounce" /> : <ShieldAlert size={78} className="text-red-400 mx-auto mb-8" />}
                      <h2 className="text-3xl font-black text-white tracking-[0.12em] sm:text-5xl">{victory ? 'MISSION ACCOMPLIE' : 'ÉQUIPE NEUTRALISÉE'}</h2>
                      <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/60">{victory ? 'Votre groupe a rempli les objectifs. Reprenez des forces avant la prochaine mission.' : 'Votre équipe ne peut plus poursuivre. Reprenez des forces et retentez cette mission.'}</p>
                      <button onClick={returnToTableSetup} className="mt-8 rounded-xl border border-nexus-cyan bg-nexus-cyan/10 px-8 py-4 font-black uppercase tracking-widest text-nexus-cyan transition hover:bg-nexus-cyan hover:text-black">{victory ? 'Choisir la suite' : 'Réessayer la mission'}</button>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>

      <AnimatePresence>
        {diceResult && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 2, opacity: 0 }} className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none">
                <div className="w-[min(24rem,calc(100vw-2rem))] rounded-3xl border-2 border-nexus-purple/50 bg-black/95 p-6 text-center shadow-[0_0_60px_rgba(188,19,254,0.4)] backdrop-blur-2xl">
                    <div className="text-6xl font-black text-white">{diceResult.value}</div>
                    {diceResult.formula
                        ? <div className="mt-2 text-xs leading-5 text-gray-300">{diceResult.formula}</div>
                        : diceResult.dice && <div className="text-xs text-gray-400 font-mono">{diceResult.dice.join(' + ')}</div>}
                    <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-nexus-purple">{diceResult.label}</div>
                    {diceResult.difficulty !== undefined && diceResult.outcome && (
                        <div className={`mt-3 rounded-xl px-3 py-2 text-sm font-bold ${diceResult.outcome.includes('Réussite') ? 'bg-green-400/10 text-green-300' : 'bg-red-400/10 text-red-300'}`}>
                            {diceResult.outcome} · difficulté {diceResult.difficulty}
                        </div>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between z-50">
          <div className="flex justify-between items-start">
              <div className="flex flex-col gap-4 pointer-events-auto">
                  <div className="glass-panel px-6 py-4 rounded-3xl flex items-center gap-5 border-l-4 border-l-nexus-cyan">
                      <Database className="text-nexus-cyan" size={28} />
                      <div>
                          <h1 className="text-2xl font-black tracking-widest text-white leading-none">NEXUS</h1>
                          <div className="mt-1 max-w-56 truncate text-[8px] font-mono text-nexus-cyan/70 tracking-widest">{table.name}</div>
                          <div className="text-[7px] font-mono text-white/40 tracking-widest">SAUVEGARDE LOCALE ACTIVE</div>
                      </div>
                  </div>
                  <div className="flex flex-col gap-2">
                      <NavBtn icon={<User size={18}/>} label="Profil" active={inventoryOpen} onClick={() => setInventoryOpen(true)} />
                      <NavBtn icon={<ScrollText size={18}/>} label="Règles" active={false} onClick={openRulebook} />
                      <NavBtn icon={<Book size={18}/>} label="Archives" active={archiveOpen} onClick={() => setArchiveOpen(true)} />
                      <NavBtn icon={soundEnabled ? <Volume2 size={18}/> : <VolumeX size={18}/>} label="Audio" active={false} onClick={toggleSound} />
                  </div>
              </div>

              <div className="flex flex-col items-center gap-4 pointer-events-auto">
                  {!isCombatActive ? (
                      <button onClick={startCombat} disabled={dialogueQueue.length > 0 || !hasActiveOpposition} className="rounded-2xl border border-nexus-purple/40 bg-nexus-purple/10 px-8 py-4 text-sm font-black tracking-[0.2em] text-nexus-purple shadow-[0_0_40px_rgba(188,19,254,0.2)] transition-all hover:bg-nexus-purple/30 disabled:cursor-not-allowed disabled:opacity-40">{dialogueQueue.length ? 'Transmission en cours' : hasActiveOpposition ? 'Commencer le combat' : 'Zone sécurisée'}</button>
                  ) : (
                      <div className="flex flex-col items-center gap-4">
                          <div className="flex gap-3 bg-black/60 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl">
                              {turnOrder.map((id, i) => (
                                  <div key={id} className={`relative w-14 h-14 rounded-2xl border-2 transition-all ${i === currentTurnIndex ? 'border-nexus-cyan scale-110 shadow-[0_0_20px_#00d2ff]' : 'border-gray-800 opacity-40 grayscale'}`}>
                                      <img src={characters.find(c => c.id === id)?.avatar} className="w-full h-full object-cover" alt="" />
                                  </div>
                              ))}
                          </div>
                          {isMyTurn && <button onClick={nextTurn} className="px-8 py-3 bg-nexus-cyan/10 border border-nexus-cyan hover:bg-nexus-cyan hover:text-black rounded-full text-[10px] font-black transition-all uppercase tracking-widest">Finir le tour</button>}
                      </div>
                  )}
                  <p className="max-w-72 text-center text-[9px] leading-4 text-white/45">
                      {hasActiveOpposition ? 'Sélectionnez votre personnage, puis une menace pour la cibler. Cliquez une case pour vous déplacer.' : 'La zone est sûre. Déplacez-vous vers l’objectif restant et interagissez avec lui.'}
                  </p>
              </div>

              <div className="flex flex-col gap-2 pointer-events-auto">
                  <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1">
                    <button onClick={() => setZoom(zoom + 0.1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors"><ZoomIn size={18}/></button>
                    <button onClick={() => setZoom(zoom - 0.1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors"><ZoomOut size={18}/></button>
                  </div>
              </div>
          </div>

          <div className="flex justify-between items-end gap-10">
              <div className="glass-panel p-6 rounded-[3rem] w-[520px] flex gap-8 pointer-events-auto border-l-4 border-l-nexus-cyan">
                  <div className={`w-32 h-32 rounded-[2.5rem] border-2 bg-black overflow-hidden shadow-2xl shrink-0 transition-all ${isMyTurn ? 'border-nexus-cyan shadow-[0_0_30px_#00d2ff33]' : 'border-white/10'}`}>
                      <img src={selectedChar.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                          <h2 className="text-3xl font-black uppercase text-white tracking-tighter mb-4">{selectedChar.name}</h2>
                          <div className="space-y-4">
                              <ResourceBar label="Vitalité" current={selectedChar.hp} max={selectedChar.maxHp} color="red" />
                              <div className="flex gap-4">
                                <ResourceBar label="Flux" current={selectedChar.flux} max={selectedChar.maxFlux} color="cyan" />
                                <ResourceBar label="Énergie" current={selectedChar.mp} max={selectedChar.maxMp} color="purple" />
                              </div>
                          </div>
                      </div>
                      <div className="flex gap-1 mt-6 bg-black/40 p-1 rounded-2xl border border-white/5">
                          <TabBtn active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="DIAG" />
                          <TabBtn active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} label="SYSTEM" />
                          <TabBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} label="LOADOUT" />
                      </div>
                  </div>
              </div>

              <div className="glass-panel p-6 rounded-[3rem] flex-1 max-w-[600px] h-[180px] pointer-events-auto relative border-t-4 border-t-nexus-purple overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="wait">
                      {activeTab === 'stats' && (
                          <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-6 gap-3">
                              {Object.entries(selectedChar.stats).map(([k,v]) => (
                                  <div key={k} className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                                      <span className="text-[7px] text-gray-500 uppercase font-black">{k.substring(0,3)}</span>
                                      <span className="text-xl font-black text-white">{v as number}</span>
                                  </div>
                              ))}
                          </motion.div>
                      )}
                      {activeTab === 'skills' && (
                          <motion.div key="skills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                              <div className="flex flex-wrap gap-2">
                                {charSkills.map(s => (<button key={s.id} onClick={() => rollCheck(s.name, selectedChar.stats[s.stat])} className="px-4 py-2 bg-nexus-purple/10 border border-nexus-purple/20 rounded-xl text-[10px] font-black uppercase hover:bg-nexus-purple/30 transition-all">{s.name}</button>))}
                              </div>
                              <div className="text-[8px] font-black text-nexus-cyan uppercase tracking-widest opacity-50">Capacités_Actives</div>
                              <div className="flex flex-wrap gap-3">
                                {charAbilities.map(a => {
                                    let cost = a.cost;
                                    if (weather?.id === 'ion_storm') cost = Math.floor(cost * 1.5);
                                    return (
                                        <button 
                                            key={a.id} onClick={() => activateAbility(selectedChar.id, a.id)} 
                                            disabled={selectedChar.flux < cost || (isCombatActive && (!isMyTurn || selectedChar.isAI))} 
                                            className={`px-5 py-3 bg-nexus-cyan/10 border border-nexus-cyan/30 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-3 ${selectedChar.flux < cost ? 'opacity-30' : 'hover:bg-nexus-cyan/30 shadow-lg'}`}
                                        >
                                            <Zap size={14} className="text-nexus-cyan" /> {a.name}
                                            <span className={`text-[8px] ${selectedChar.flux < cost ? 'text-red-500' : 'text-nexus-cyan'}`}>COST: {cost} FLUX</span>
                                        </button>
                                    );
                                })}
                              </div>
                          </motion.div>
                      )}
                      {activeTab === 'inventory' && (
                          <motion.div key="gear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                              {!targetChar && <div className="text-[10px] text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center font-black animate-pulse flex items-center justify-center gap-3"><Crosshair size={16}/> VERROUILLAGE_REQUIS</div>}
                              {charWeapons.map(w => {
                                  const outOfRange = targetDistance !== null && targetDistance > w.rangeCells;
                                  const disabled = !targetChar || selectedChar.isAI || selectedChar.id !== currentCharId || !isMyTurn || selectedChar.ap < 1 || outOfRange;
                                  return (
                                      <button key={w.id} onClick={() => performAttack(selectedChar.id, targetChar!.id, w.id)} disabled={disabled} title={outOfRange ? 'La cible est hors de portée.' : undefined} className={`rounded-2xl border border-nexus-cyan/30 bg-nexus-cyan/10 px-6 py-4 text-left text-[10px] font-black transition-all ${disabled ? 'opacity-30 grayscale' : 'hover:scale-[1.02] hover:bg-nexus-cyan/30'}`}>
                                          <span className="flex items-center justify-between gap-4"><span className="flex items-center gap-3"><Sword size={18}/> {w.name}</span><span className="text-nexus-cyan">{w.dmg}</span></span>
                                          <span className="mt-2 block text-[8px] font-mono uppercase tracking-widest text-white/50">1 action · portée {w.rangeCells} cases{outOfRange && targetDistance !== null ? ` · cible à ${targetDistance} cases` : ''}</span>
                                      </button>
                                  );
                              })}
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>

              <div className="flex flex-col items-end gap-4 pointer-events-auto">
                <AnimatePresence>
                  {showLogs && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-[350px] h-[400px] glass-panel rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
                          <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between text-nexus-cyan"><div className="flex items-center gap-3"><TermIcon size={16}/><span className="text-[10px] font-black uppercase tracking-widest">Flux_Données</span></div></div>
                          <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-[9px]">
                              {logs.map((log, i) => (<div key={i} className={`pl-4 border-l-2 ${log.includes('[Combat]') ? 'border-red-500 text-red-400' : log.includes('Jet') ? 'border-nexus-purple text-nexus-purple' : 'border-gray-700 text-gray-500'}`}>{log}</div>))}
                          </div>
                      </motion.div>
                  )}
                </AnimatePresence>
                <button onClick={() => setShowLogs(!showLogs)} className={`w-16 h-16 rounded-[2rem] glass-panel flex items-center justify-center transition-all ${showLogs ? 'text-nexus-cyan shadow-[0_0_20px_#00d2ff33]' : 'text-gray-500'}`}><TermIcon size={24}/></button>
              </div>
          </div>
      </div>
    </div>
  );
};

const ResourceBar: React.FC<{ label: string, current: number, max: number, color: 'red' | 'cyan' | 'purple' }> = ({ label, current, max, color }) => (
    <div className="flex flex-col gap-1 flex-1">
        <div className="flex justify-between text-[7px] font-black uppercase tracking-widest opacity-60"><span>{label}</span><span className="font-mono text-white">{current}/{max}</span></div>
        <div className="h-1.5 rounded-full bg-black/40 border border-white/5 p-0.5 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 bar-glow ${color === 'red' ? 'bg-gradient-to-r from-red-600 to-red-400' : color === 'cyan' ? 'bg-gradient-to-r from-blue-500 to-nexus-cyan' : 'bg-gradient-to-r from-purple-600 to-nexus-purple'}`} style={{ width: `${(current / max) * 100}%` }}></div>
        </div>
    </div>
);

const NavBtn: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl glass-panel transition-all pointer-events-auto ${active ? 'text-nexus-cyan border-nexus-cyan/50 shadow-[0_0_15px_#00d2ff33]' : 'text-gray-500 hover:text-white'}`}>{icon} <span className="text-[10px] font-black uppercase tracking-widest">{label}</span></button>
);

const TabBtn: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
    <button onClick={onClick} className={`flex-1 py-3 rounded-xl text-[9px] font-black transition-all ${active ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>{label}</button>
);
