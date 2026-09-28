import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { LORE_DATABASE } from '../data/loreData';
import { BESTIARY, Creature } from '../data/bestiaryData';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, Users, Shield, Zap, Search, Globe, Skull } from 'lucide-react';

export const Encyclopedia: React.FC = () => {
  const { setArchiveOpen } = useGameStore();
  const [activeTab, setTab] = useState<'lore' | 'bestiary' | 'rules'>('lore');
  const [searchTerm, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const filteredLore = LORE_DATABASE.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredBestiary = BESTIARY.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-6 z-[150] glass-panel rounded-[3rem] flex flex-col overflow-hidden"
    >
        {/* Header Navigation */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex gap-10">
                <HeaderTab active={activeTab === 'lore'} icon={<Globe size={20}/>} label="LORE_ARCHIVES" onClick={() => {setTab('lore'); setSelectedEntry(null);}} />
                <HeaderTab active={activeTab === 'bestiary'} icon={<Skull size={20}/>} label="BESTIAIRE_ALPHA" onClick={() => {setTab('bestiary'); setSelectedEntry(null);}} />
                <HeaderTab active={activeTab === 'rules'} icon={<Book size={20}/>} label="RÈGLES_SYSTÈME" onClick={() => {setTab('rules'); setSelectedEntry(null);}} />
            </div>
            
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                        type="text" placeholder="RECHERCHE..." 
                        className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] font-mono focus:border-nexus-cyan outline-none transition-all w-64"
                        value={searchTerm} onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button onClick={() => setArchiveOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-500/20 rounded-2xl transition-all"><X size={20}/></button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* List Sidebar */}
            <div className="w-80 border-r border-white/5 bg-black/20 overflow-y-auto custom-scrollbar">
                {activeTab === 'lore' && filteredLore.map(entry => (
                    <ListEntry key={entry.id} active={selectedEntry?.id === entry.id} title={entry.title} sub={entry.category} onClick={() => setSelectedEntry(entry)} />
                ))}
                {activeTab === 'bestiary' && filteredBestiary.map(creature => (
                    <ListEntry key={creature.id} active={selectedEntry?.id === creature.id} title={creature.name} sub={`LVL ${creature.level} // ${creature.category}`} onClick={() => setSelectedEntry(creature)} />
                ))}
            </div>

            {/* Viewer Area */}
            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar relative">
                <AnimatePresence mode="wait">
                    {selectedEntry ? (
                        <motion.div key={selectedEntry.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            {activeTab === 'lore' ? <LoreViewer entry={selectedEntry} /> : <CreatureViewer creature={selectedEntry} />}
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600">
                            <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center mb-6"><Book size={40} opacity={0.2} /></div>
                            <p className="text-[10px] font-black tracking-[0.4em] uppercase">Sélectionnez une entrée pour décrypter les données</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </motion.div>
  );
};

// --- Sub-Components ---

const HeaderTab: React.FC<{ active: boolean, icon: any, label: string, onClick: () => void }> = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-4 transition-all ${active ? 'text-nexus-cyan' : 'text-gray-500 hover:text-white'}`}>
        <div className={`p-2 rounded-xl border transition-all ${active ? 'bg-nexus-cyan/10 border-nexus-cyan/50 shadow-[0_0_15px_#00d2ff33]' : 'border-transparent'}`}>{icon}</div>
        <span className="text-xs font-black tracking-[0.2em]">{label}</span>
    </button>
);

const ListEntry: React.FC<{ active: boolean, title: string, sub: string, onClick: () => void }> = ({ active, title, sub, onClick }) => (
    <button onClick={onClick} className={`w-full p-6 text-left border-b border-white/5 transition-all ${active ? 'bg-nexus-cyan/5 border-l-4 border-l-nexus-cyan' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}>
        <div className="text-[11px] font-black text-white uppercase tracking-wider mb-1">{title}</div>
        <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{sub}</div>
    </button>
);

const LoreViewer: React.FC<{ entry: any }> = ({ entry }) => (
    <div className="max-w-3xl">
        <span className="text-[8px] font-black text-nexus-cyan bg-nexus-cyan/10 px-3 py-1 rounded-full uppercase tracking-widest mb-6 inline-block">{entry.category}</span>
        <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-8">{entry.title}</h2>
        {entry.image && <div className="w-full h-64 rounded-[2rem] overflow-hidden border border-white/10 mb-8 shadow-2xl"><img src={entry.image} className="w-full h-full object-cover" /></div>}
        <p className="text-gray-400 text-lg leading-relaxed font-sans font-light">{entry.content}</p>
    </div>
);

const CreatureViewer: React.FC<{ creature: Creature }> = ({ creature }) => (
    <div className="max-w-4xl grid grid-cols-3 gap-12">
        <div className="col-span-2">
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">{creature.name}</h2>
            <div className="text-xs text-nexus-purple font-black mb-10 tracking-[0.3em] uppercase">{creature.type} // LVL {creature.level}</div>
            
            <p className="text-gray-400 text-lg mb-10 font-sans">{creature.description}</p>
            
            <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-nexus-cyan tracking-widest uppercase border-b border-white/10 pb-2">Capacités_Spéciales</h4>
                    {creature.abilities.map((a, i) => (
                        <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="text-[11px] font-black text-white mb-2 uppercase">{a.name}</div>
                            <div className="text-[10px] text-gray-400 leading-relaxed font-sans">{a.desc}</div>
                        </div>
                    ))}
                </div>
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-red-500 tracking-widest uppercase border-b border-white/10 pb-2">Résistances_Vulnérabilités</h4>
                    <div className="flex flex-wrap gap-2">
                        {creature.resistances.map((r, i) => (
                            <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] rounded-lg font-mono uppercase">{r}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4 shadow-2xl">
                <div className="flex justify-between items-center mb-4"><span className="text-[9px] font-black text-gray-500 uppercase">Fiche_Tactique</span><Zap size={14} className="text-nexus-cyan"/></div>
                <StatRow label="SANTÉ" val={creature.stats.hp} color="text-red-400" />
                <StatRow label="DÉFENSE" val={creature.stats.ac} color="text-nexus-cyan" />
                <StatRow label="INIT" val={`+${creature.stats.init}`} color="text-nexus-purple" />
                <StatRow label="VITESSE" val={creature.stats.speed} color="text-white" />
                <div className="h-px bg-white/5 my-4"></div>
                <div className="grid grid-cols-2 gap-3">
                    <MiniStat label="FOR" val={creature.stats.force} />
                    <MiniStat label="DEX" val={creature.stats.dexterite} />
                    <MiniStat label="CON" val={creature.stats.constitution} />
                    <MiniStat label="INT" val={creature.stats.intelligence} />
                    <MiniStat label="SAG" val={creature.stats.sagesse} />
                    <MiniStat label="CHA" val={creature.stats.charisme} />
                </div>
            </div>
        </div>
    </div>
);

const StatRow: React.FC<{ label: string, val: any, colorText?: string, color: string }> = ({ label, val, color }) => (
    <div className="flex justify-between items-center">
        <span className="text-[8px] font-black text-gray-500 uppercase">{label}</span>
        <span className={`text-sm font-black ${color}`}>{val}</span>
    </div>
);

const MiniStat: React.FC<{ label: string, val: number }> = ({ label, val }) => (
    <div className="bg-black/40 p-2 rounded-xl text-center border border-white/5">
        <div className="text-[7px] text-gray-600 font-black mb-1">{label}</div>
        <div className="text-xs font-black text-white">{val}</div>
    </div>
);
