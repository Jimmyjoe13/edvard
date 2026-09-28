import React from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Circle } from 'lucide-react';

export const MissionTracker: React.FC = () => {
    const { activeMission } = useGameStore();

    if (!activeMission) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
            className="absolute right-10 top-24 w-80 glass-panel p-6 rounded-[2rem] border-r-4 border-r-nexus-cyan pointer-events-auto shadow-2xl"
        >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <Target className="text-nexus-cyan" size={24} />
                <div>
                    <div className="text-[8px] font-black text-nexus-cyan uppercase tracking-[0.3em]">DIRECTIVE_ACTIVE</div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest leading-tight">{activeMission.title}</h3>
                </div>
            </div>

            <div className="space-y-4">
                {activeMission.objectives.map((obj, i) => (
                    <motion.div 
                        key={obj.id} 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className={`flex gap-3 items-start p-3 rounded-xl transition-all ${obj.status === 'completed' ? 'bg-green-500/10 border border-green-500/20 opacity-60' : 'bg-black/40 border border-white/5'}`}
                    >
                        <div className="mt-0.5">
                            {obj.status === 'completed' ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-nexus-cyan animate-pulse" />}
                        </div>
                        <p className={`text-[10px] font-mono leading-relaxed ${obj.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                            {obj.description}
                        </p>
                    </motion.div>
                ))}
            </div>
            <div className="mt-6 text-[8px] text-gray-600 font-mono text-center uppercase tracking-widest">
                Client : {activeMission.client}
            </div>
        </motion.div>
    );
};
