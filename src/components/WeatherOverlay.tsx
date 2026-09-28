import React from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudLightning, Wind, AlertTriangle } from 'lucide-react';

export const WeatherOverlay: React.FC = () => {
    const { weather } = useGameStore();

    if (!weather) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[80]">
            {/* Fullscreen tint based on weather */}
            <div className={`absolute inset-0 transition-all duration-[3000ms] ${weather.id === 'ion_storm' ? 'bg-blue-500/5' : 'bg-green-500/5'}`} />

            {/* Particles */}
            <AnimatePresence>
                {weather.id === 'ion_storm' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {Array.from({ length: 15 }).map((_, i) => (
                            <motion.div 
                                key={i}
                                initial={{ x: Math.random() * 100 + "%", y: -10, opacity: 0 }}
                                animate={{ y: "110vh", opacity: [0, 0.8, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: Math.random() * 5 }}
                                className="absolute w-px h-10 bg-nexus-cyan shadow-[0_0_10px_#00d2ff]"
                            />
                        ))}
                    </motion.div>
                )}
                {weather.id === 'acid_fog' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,255,0,0.05)_100%)]">
                        <motion.div 
                            animate={{ x: ["-5%", "5%"], y: ["-5%", "5%"] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[-10%] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Weather HUD Badge */}
            <motion.div 
                initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="absolute top-24 left-1/2 -translate-x-1/2 glass-panel px-6 py-2 rounded-full border border-white/10 flex items-center gap-3 shadow-2xl"
            >
                {weather.id === 'ion_storm' ? <CloudLightning size={16} className="text-nexus-cyan animate-pulse" /> : <Wind size={16} className="text-green-400" />}
                <div className="flex flex-col">
                    <span className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Météo_Active</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${weather.id === 'ion_storm' ? 'text-nexus-cyan' : 'text-green-400'}`}>{weather.name}</span>
                </div>
                <div className="w-px h-6 bg-white/5 mx-2" />
                <p className="text-[8px] text-gray-400 max-w-[150px] leading-tight font-mono">{weather.desc}</p>
            </motion.div>
        </div>
    );
};
