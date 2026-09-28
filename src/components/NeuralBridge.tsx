import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { WEAPONS, ARMORS, SKILLS } from '../data/gameData';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberLab } from './CyberLab';
import { X, Shield, Sword, Cpu, Activity, Zap, Package, ChevronRight, Info } from 'lucide-react';

export const NeuralBridge: React.FC = () => {
  const { characters, setInventoryOpen, equipItem } = useGameStore();
  const player = characters[0];
  const [activeView, setView] = useState<'status' | 'arsenal' | 'intel' | 'cyber'>('status');

  const invWeapons = WEAPONS.filter(w => player.inventory.includes(w.id));
  const invArmors = ARMORS.filter(a => player.inventory.includes(a.id));
  const equippedWeapon = WEAPONS.find(w => w.id === player.equippedWeaponId);
  const equippedArmor = ARMORS.find(a => a.id === player.equippedArmorId);

  return (
    <motion.div 
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(40px)" }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-12"
    >
        <div className="relative w-full h-full max-w-7xl flex flex-col gap-8">
            
            {/* Header / Connection Status */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full border-2 border-nexus-cyan flex items-center justify-center shadow-[0_0_20px_#00d2ff]">
                        <Activity className="text-nexus-cyan animate-pulse" size={32} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-widest uppercase">PONT_NEURAL // {player.name}</h2>
                        <div className="text-[10px] text-nexus-cyan font-mono tracking-[0.5em] mt-1 italic">ENCRYPTED_BIOMETRIC_LINK_ESTABLISHED</div>
                    </div>
                </div>
                <button onClick={() => setInventoryOpen(false)} className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 transition-all text-white"><X size={32}/></button>
            </div>

            <div className="flex-1 flex gap-10 overflow-hidden">
                
                {/* Navigation Sidebar */}
                <div className="w-64 flex flex-col gap-3">
                    <NavTab active={activeView === 'status'} label="DIAGNOSTIC" icon={<Activity size={20}/>} onClick={() => setView('status')} />
                    <NavTab active={activeView === 'arsenal'} label="ARSENAL" icon={<Package size={20}/>} onClick={() => setView('arsenal')} />
                    <NavTab active={activeView === 'cyber'} label="CYBERNÉTIQUE" icon={<Cpu size={20}/>} onClick={() => setView('cyber')} />
                    <NavTab active={activeView === 'intel'} label="MISSION_INTEL" icon={<Info size={20}/>} onClick={() => setView('intel')} />
                    <div className="mt-auto p-6 bg-white/5 rounded-[2rem] border border-white/5">
                        <div className="text-[8px] text-gray-500 font-black uppercase mb-4 tracking-widest">Niveau de Flux</div>
                        <div className="h-40 w-full bg-black/40 rounded-2xl flex items-end p-1 overflow-hidden border border-nexus-cyan/20">
                            <motion.div 
                                initial={{ height: 0 }} animate={{ height: `${(player.flux / player.maxFlux) * 100}%` }}
                                className="w-full bg-gradient-to-t from-blue-600 to-nexus-cyan rounded-xl shadow-[0_0_20px_#00d2ff]"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Area */}
                <div className="flex-1 bg-black/40 border border-white/5 rounded-[4rem] p-12 overflow-y-auto custom-scrollbar relative">
                    <AnimatePresence mode="wait">
                        {activeView === 'status' && (
                            <motion.div key="status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-2 gap-12 h-full">
                                {/* Bio-Scan */}
                                <div className="space-y-10">
                                    <div>
                                        <h3 className="text-[10px] font-black text-nexus-cyan tracking-[0.4em] mb-6 uppercase">Biométrie_Sujet</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(player.stats).map(([k,v]) => (
                                                <div key={k} className="bg-white/5 p-5 rounded-3xl border border-white/5 group hover:border-nexus-cyan/30 transition-all">
                                                    <div className="text-[8px] text-gray-500 font-black uppercase mb-1">{k}</div>
                                                    <div className="text-3xl font-black text-white">{v as number}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-8 bg-nexus-cyan/5 border border-nexus-cyan/20 rounded-[3rem]">
                                        <div className="flex justify-between items-center mb-4"><span className="text-[10px] font-black text-nexus-cyan tracking-widest uppercase">Intégrité_Physique</span> <span className="text-xl font-black text-white">{player.hp} / {player.maxHp}</span></div>
                                        <div className="h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5"><div className="h-full bg-nexus-cyan rounded-full" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}></div></div>
                                    </div>
                                </div>
                                {/* Equipment Preview */}
                                <div className="space-y-10 flex flex-col items-center justify-center border-l border-white/5 pl-12">
                                    <div className="text-[10px] font-black text-nexus-purple tracking-[0.4em] mb-10 uppercase w-full">Configuration_Combat</div>
                                    <Slot label="ARME_PRIMAIRE" item={equippedWeapon} icon={<Sword size={24}/>} color="cyan" />
                                    <Slot label="PROTECTION_CORPS" item={equippedArmor} icon={<Shield size={24}/>} color="purple" />
                                </div>
                            </motion.div>
                        )}

                        {activeView === 'arsenal' && (
                            <motion.div key="arsenal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                <div>
                                    <h3 className="text-[10px] font-black text-nexus-cyan tracking-[0.4em] mb-8 uppercase">Armement_Disponible</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {invWeapons.map(w => (
                                            <ItemCard key={w.id} item={w} isEquipped={player.equippedWeaponId === w.id} onEquip={() => equipItem(player.id, w.id, 'weapon')} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-nexus-purple tracking-[0.4em] mb-8 uppercase">Unités_de_Protection</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {invArmors.map(a => (
                                            <ItemCard key={a.id} item={a} isEquipped={player.equippedArmorId === a.id} onEquip={() => equipItem(player.id, a.id, 'armor')} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    </motion.div>
  );
};

// --- SUBS ---

const NavTab: React.FC<{ active: boolean, label: string, icon: any, onClick: () => void }> = ({ active, label, icon, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-4 px-6 py-5 rounded-[2rem] border transition-all ${active ? 'bg-nexus-cyan text-nexus-dark font-black shadow-[0_10px_30px_#00d2ff33] border-nexus-cyan' : 'bg-black/40 border-white/5 text-gray-500 hover:text-white hover:bg-white/5'}`}>
        {icon} <span className="text-[10px] font-black tracking-widest">{label}</span>
    </button>
);

const Slot: React.FC<{ label: string, item: any, icon: any, color: string }> = ({ label, item, icon, color }) => (
    <div className="w-full max-w-[320px] group">
        <div className="text-[8px] text-gray-600 font-black mb-3 tracking-widest uppercase">{label}</div>
        <div className={`p-6 rounded-[2.5rem] border-2 flex items-center gap-6 transition-all ${item ? (color === 'cyan' ? 'border-nexus-cyan bg-nexus-cyan/5 shadow-[0_0_30px_#00d2ff1a]' : 'border-nexus-purple bg-nexus-purple/5 shadow-[0_0_30px_#bc13fe1a]') : 'border-dashed border-white/10 grayscale opacity-40'}`}>
            <div className="p-4 bg-black/40 rounded-2xl">{icon}</div>
            <div className="flex-1">
                <div className="text-sm font-black text-white uppercase">{item?.name || "VIDE"}</div>
                <div className="text-[8px] font-mono text-gray-500 uppercase">{item ? (item.dmg ? `Impact: ${item.dmg}` : `Défense: ${item.defense}`) : "Aucune donnée"}</div>
            </div>
        </div>
    </div>
);

const ItemCard: React.FC<{ item: any, isEquipped: boolean, onEquip: () => void }> = ({ item, isEquipped, onEquip }) => (
    <div className={`p-6 rounded-[2rem] border-2 transition-all flex justify-between items-center ${isEquipped ? 'border-nexus-cyan bg-nexus-cyan/5' : 'border-white/5 bg-black/20 hover:border-white/20'}`}>
        <div>
            <div className="text-sm font-black text-white uppercase mb-1">{item.name}</div>
            <div className="text-[8px] text-gray-500 font-mono uppercase tracking-tighter">{item.dmg ? `Dommages: ${item.dmg}` : `Protection: ${item.defense}`} // UNIT: {item.cost}Cr</div>
        </div>
        <button 
            onClick={onEquip}
            className={`px-5 py-2 rounded-xl text-[9px] font-black transition-all ${isEquipped ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500 hover:text-white' : 'bg-nexus-cyan text-nexus-dark shadow-lg shadow-nexus-cyan/20 hover:scale-105'}`}
        >
            {isEquipped ? 'DÉSACTIVER' : 'ÉQUIPER'}
        </button>
    </div>
);
