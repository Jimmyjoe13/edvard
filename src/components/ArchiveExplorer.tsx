import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { LORE_DATABASE, SCENARIOS } from '../data/loreData';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, MapPin, Zap, Users, ChevronRight, Search } from 'lucide-react';

export const ArchiveExplorer: React.FC = () => {
  const { setArchiveOpen } = useGameStore();
  const [activeCategory, setCategory] = useState<'all' | 'lieux' | 'flux' | 'factions' | 'scenarios'>('all');
  const [searchTerm, setSearch] = useState("");

  const filteredLore = LORE_DATABASE.filter(entry => 
    (activeCategory === 'all' || entry.category === activeCategory) &&
    (entry.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-12 z-[100] bg-nexus-panel/95 backdrop-blur-3xl border-2 border-nexus-cyan/20 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
    >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
            <div className="flex items-center gap-6">
                <div className="p-3 bg-nexus-cyan/10 rounded-2xl text-nexus-cyan"><Book size={28}/></div>
                <div>
                    <h2 className="text-2xl font-black tracking-widest uppercase text-white">ARCHIVES_CENTRALES</h2>
                    <div className="text-[8px] text-nexus-cyan font-mono opacity-50 tracking-[0.4em]">CONNECTED_TO_EDVARD_CORE</div>
                </div>
            </div>
            <button onClick={() => setArchiveOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-500/20 rounded-2xl transition-all"><X size={24}/></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-white/5 p-6 flex flex-col gap-2">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                        type="text" placeholder="RECHERCHE..." 
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-mono focus:border-nexus-cyan outline-none transition-all"
                        value={searchTerm} onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <NavTab active={activeCategory === 'all'} label="TOUS" icon={<Book size={14}/>} onClick={() => setCategory('all')} />
                <NavTab active={activeCategory === 'lieux'} label="LIEUX" icon={<MapPin size={14}/>} onClick={() => setCategory('lieux')} />
                <NavTab active={activeCategory === 'flux'} label="FLUX" icon={<Zap size={14}/>} onClick={() => setCategory('flux')} />
                <NavTab active={activeCategory === 'factions'} label="FACTIONS" icon={<Users size={14}/>} onClick={() => setCategory('factions')} />
                <div className="my-4 h-px bg-white/5"></div>
                <NavTab active={activeCategory === 'scenarios'} label="SCÉNARIOS" icon={<ChevronRight size={14}/>} onClick={() => setCategory('scenarios')} />
            </div>

            {/* Content Area */}
            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-black/10">
                <div className="grid grid-cols-2 gap-8">
                    {activeCategory === 'scenarios' ? (
                        SCENARIOS.map(s => <ScenarioCard key={s.id} scenario={s} />)
                    ) : (
                        filteredLore.map(entry => <LoreCard key={entry.id} entry={entry} />)
                    )}
                </div>
            </div>
        </div>
    </motion.div>
  );
};

const NavTab: React.FC<{ active: boolean, label: string, icon: any, onClick: () => void }> = ({ active, label, icon, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-nexus-cyan text-nexus-dark font-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        {icon} <span className="text-[10px] tracking-widest">{label}</span>
    </button>
);

const LoreCard: React.FC<{ entry: any }> = ({ entry }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group relative bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-nexus-cyan/40 transition-all">
        <div className="flex gap-6">
            {entry.image && <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-white/5 group-hover:border-nexus-cyan/20 transition-all"><img src={entry.image} className="w-full h-full object-cover" /></div>}
            <div>
                <span className="text-[7px] font-black text-nexus-cyan bg-nexus-cyan/10 px-2 py-0.5 rounded uppercase tracking-widest">{entry.category}</span>
                <h3 className="text-xl font-black text-white mt-2 mb-3 uppercase tracking-tighter">{entry.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">{entry.content}</p>
            </div>
        </div>
    </motion.div>
);

const ScenarioCard: React.FC<{ scenario: any }> = ({ scenario }) => (
    <div className="bg-gradient-to-br from-nexus-purple/10 to-transparent border border-nexus-purple/20 rounded-3xl p-8 hover:border-nexus-purple/50 transition-all">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-black text-white uppercase">{scenario.title}</h3>
            <span className="text-[8px] bg-nexus-purple text-white px-3 py-1 rounded-full font-black uppercase">{scenario.difficulty}</span>
        </div>
        <p className="text-sm text-gray-400 font-sans italic mb-6">"{scenario.desc}"</p>
        <button className="w-full py-3 bg-nexus-purple/20 hover:bg-nexus-purple/40 border border-nexus-purple/30 rounded-2xl text-[10px] font-black text-white transition-all uppercase tracking-widest">INITIALISER MISSION</button>
    </div>
);
