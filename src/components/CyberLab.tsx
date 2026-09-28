import React, { useState } from 'react';
import { Character, useGameStore } from '../store/gameStore';
import { IMPLANTS, Implant } from '../data/implantData';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Eye, Zap, Shield, Activity, Layers, Footprints, AlertTriangle, ArrowRight, Lock, Unlock, Check, Target } from 'lucide-react';

const ICON_MAP: any = {
    'Eye': <Eye size={20} />, 'Scan': <Target size={20} />, 'Activity': <Activity size={20} />, 
    'Footprints': <Footprints size={20} />, 'Cpu': <Cpu size={20} />, 'Zap': <Zap size={20} />, 
    'Layers': <Layers size={20} />, 'Shield': <Shield size={20} />
};

export const CyberLab: React.FC = () => {
    const { characters, selectedTokenId, installImplant } = useGameStore();
    const player = characters.find(c => c.id === selectedTokenId) || characters[0];
    
    const [selectedImplant, setSelectedImplant] = useState<Implant | null>(null);

    if (!player) return null;

    // Filter implants by category for the tree
    const optiqueImplants = IMPLANTS.filter(i => i.category === 'optique');
    const moteurImplants = IMPLANTS.filter(i => i.category === 'moteur');
    const neuralImplants = IMPLANTS.filter(i => i.category === 'neural');
    const dermiqueImplants = IMPLANTS.filter(i => i.category === 'dermique');

    const handleInstall = () => {
        if (!selectedImplant) return;
        installImplant(player.id, selectedImplant.id);
    };

    return (
        <motion.div key="cyber" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex h-full gap-8">
            
            {/* Left: Trees */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-4">
                
                {/* Credits Header */}
                <div className="flex justify-between items-center bg-nexus-cyan/5 border border-nexus-cyan/20 p-6 rounded-3xl mb-4">
                    <div className="flex items-center gap-4 text-nexus-cyan">
                        <Cpu className="animate-pulse" size={28} />
                        <h3 className="text-xl font-black uppercase tracking-widest">Matrice Cybernétique</h3>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Neuro-Crédits (NC)</span>
                        <span className="text-4xl font-black text-white">{player.neuroCredits}</span>
                    </div>
                </div>

                {/* The Trees */}
                <div className="grid grid-cols-2 gap-6">
                    <Branch title="SYSTÈMES OPTIQUES" implants={optiqueImplants} player={player} onSelect={setSelectedImplant} selectedId={selectedImplant?.id} color="cyan" />
                    <Branch title="AMÉLIORATIONS MOTRICES" implants={moteurImplants} player={player} onSelect={setSelectedImplant} selectedId={selectedImplant?.id} color="purple" />
                    <Branch title="COPROCESSEURS NEURAUX" implants={neuralImplants} player={player} onSelect={setSelectedImplant} selectedId={selectedImplant?.id} color="cyan" />
                    <Branch title="BLINDAGE DERMIQUE" implants={dermiqueImplants} player={player} onSelect={setSelectedImplant} selectedId={selectedImplant?.id} color="purple" />
                </div>
            </div>

            {/* Right: Details Panel */}
            <div className="w-80 shrink-0 border-l border-white/5 pl-8 flex flex-col">
                <AnimatePresence mode="wait">
                    {selectedImplant ? (
                        <motion.div key={selectedImplant.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full">
                            
                            <div className="w-20 h-20 rounded-2xl bg-black border-2 border-white/10 flex items-center justify-center text-white/50 mb-6 shadow-2xl">
                                {ICON_MAP[selectedImplant.icon] || <Cpu size={32} />}
                            </div>

                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 leading-tight">{selectedImplant.name}</h2>
                            <div className="text-[10px] text-nexus-cyan font-black uppercase tracking-[0.2em] mb-6">
                                CATÉGORIE: {selectedImplant.category}
                            </div>

                            <p className="text-gray-400 text-sm font-sans leading-relaxed mb-8">
                                {selectedImplant.desc}
                            </p>

                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-auto">
                                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Analyse_Effet_Système</div>
                                <div className="text-sm font-black text-white flex items-center gap-3">
                                    <ArrowRight size={16} className="text-nexus-cyan" />
                                    {selectedImplant.effect.target && selectedImplant.effect.value && (
                                        <span>+{selectedImplant.effect.value} <span className="uppercase text-nexus-cyan">{selectedImplant.effect.target}</span></span>
                                    )}
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="mt-8 space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-gray-500">Coût d'intégration:</span>
                                    <span className={player.neuroCredits >= selectedImplant.cost ? 'text-white' : 'text-red-500'}>{selectedImplant.cost} NC</span>
                                </div>
                                
                                {player.unlockedImplants.includes(selectedImplant.id) ? (
                                    <div className="w-full py-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-center text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center justify-center gap-3">
                                        <Check size={16} /> MODULE INSTALLÉ
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleInstall}
                                        disabled={
                                            player.neuroCredits < selectedImplant.cost || 
                                            (selectedImplant.requires && !selectedImplant.requires.every(r => player.unlockedImplants.includes(r)))
                                        }
                                        className="w-full py-4 bg-nexus-cyan hover:bg-white text-nexus-dark font-black rounded-2xl transition-all shadow-[0_10px_20px_rgba(0,210,255,0.3)] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed uppercase tracking-widest"
                                    >
                                        PROCÉDER À L'IMPLANTATION
                                    </button>
                                )}
                                
                                {selectedImplant.requires && !selectedImplant.requires.every(r => player.unlockedImplants.includes(r)) && !player.unlockedImplants.includes(selectedImplant.id) && (
                                    <div className="flex items-center gap-2 text-[9px] text-red-500 font-black uppercase mt-2">
                                        <AlertTriangle size={12} /> Prérequis non remplis
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                            <Cpu size={64} className="mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">SÉLECTIONNEZ UN MODULE POUR DIAGNOSTIC</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const Branch: React.FC<{ title: string, implants: Implant[], player: Character, onSelect: (i: Implant) => void, selectedId?: string, color: 'cyan' | 'purple' }> = ({ title, implants, player, onSelect, selectedId, color }) => {
    return (
        <div className="bg-black/40 border border-white/5 p-6 rounded-[2rem]">
            <h4 className={`text-[9px] font-black uppercase tracking-[0.3em] mb-6 ${color === 'cyan' ? 'text-nexus-cyan' : 'text-nexus-purple'}`}>{title}</h4>
            <div className="flex flex-col gap-4 relative">
                {/* Connecting Line */}
                <div className="absolute left-6 top-6 bottom-6 w-px bg-white/10 z-0"></div>

                {implants.map(imp => {
                    const isUnlocked = player.unlockedImplants.includes(imp.id);
                    const canUnlock = !imp.requires || imp.requires.every(r => player.unlockedImplants.includes(r));
                    const isSelected = selectedId === imp.id;

                    return (
                        <button 
                            key={imp.id} 
                            onClick={() => onSelect(imp)}
                            className={`
                                relative z-10 flex items-center gap-4 p-3 rounded-2xl border-2 transition-all w-full text-left
                                ${isSelected ? 'border-white bg-white/10' : 'border-transparent hover:bg-white/5'}
                                ${!canUnlock && !isUnlocked ? 'opacity-40 grayscale' : ''}
                            `}
                        >
                            <div className={`
                                w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2
                                ${isUnlocked ? `bg-${color}-500/20 border-${color}-500 text-${color}-400 shadow-[0_0_15px_currentColor]` : 'bg-black border-white/10 text-white/50'}
                            `}>
                                {isUnlocked ? <Unlock size={16} /> : (canUnlock ? ICON_MAP[imp.icon] || <Cpu size={16} /> : <Lock size={16} />)}
                            </div>
                            <div>
                                <div className="text-xs font-black text-white uppercase tracking-tighter">{imp.name}</div>
                                <div className="text-[8px] text-gray-500 font-mono uppercase mt-1">COST: {imp.cost} NC</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
