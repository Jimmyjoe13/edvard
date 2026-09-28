import React, { useState, useEffect } from 'react';
import { useGameStore, Character, Obstacle, Decal, InteractiveObject } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, AlertCircle, Crosshair, Zap, Footprints, Flame, Terminal } from 'lucide-react';

const CELL_SIZE = 80;
const MAP_COLS = 30;
const MAP_ROWS = 30;

export const TacticalMap: React.FC = () => {
  const { 
    characters, obstacles, decals, interactiveObjects, zoom, selectedTokenId, targetTokenId, floatingTexts, 
    setSelectedToken, setTargetToken, moveCharacter, turnOrder, currentTurnIndex, setZoom, discoveredCells, fogEnabled, interact
  } = useGameStore();

  const [hoveredCell, setHoveredCell] = useState<{x: number, y: number} | null>(null);

  // Handle Zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            setZoom(useGameStore.getState().zoom - e.deltaY * 0.001);
        }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const activeChar = characters.find(c => c.id === turnOrder[currentTurnIndex]);
  const selectedChar = characters.find(c => c.id === selectedTokenId);
  const targetChar = characters.find(c => c.id === targetTokenId);
  const handleTokenClick = (character: Character) => {
    const selected = characters.find((item) => item.id === selectedTokenId);
    const factionOf = (item: Character) => item.faction || (item.isAI ? 'opposition' : 'party');
    if (selected && factionOf(selected) === 'party' && factionOf(character) === 'opposition') {
      setTargetToken(character.id);
      return;
    }
    setSelectedToken(character.id);
  };

  return (
    <div className="absolute inset-0 bg-[#020204] overflow-hidden">
        
        {/* Animated Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div 
                    key={i}
                    initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: 0 }}
                    animate={{ 
                        y: ["0%", "-10%", "0%"],
                        opacity: [0, 1, 0]
                    }}
                    transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear" }}
                    className="absolute w-1 h-1 bg-nexus-cyan rounded-full blur-[1px]"
                />
            ))}
        </div>

        {/* Dynamic Scanline */}
        <div className="absolute inset-0 pointer-events-none z-[60] bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,210,255,0.02)_50%)] bg-[length:100%_4px] opacity-30"></div>
        <motion.div 
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-nexus-cyan/5 to-transparent z-[65] pointer-events-none"
        />

        {/* Holotable Engine */}

        <motion.div 
            drag dragElastic={0.1}
            style={{ 
                width: MAP_COLS * CELL_SIZE, height: MAP_ROWS * CELL_SIZE,
                scale: zoom,
                left: '50%', top: '50%',
                x: '-50%', y: '-50%'
            }}
            className="absolute origin-center cursor-grab active:cursor-grabbing bg-hex"
        >
            {/* Grid Pattern */}
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(0, 210, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 210, 255, 0.05) 1px, transparent 1px)`, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px` }} />

            {/* Interactive Objects */}
            {interactiveObjects.map(obj => (
                <div 
                    key={obj.id}
                    onClick={() => selectedTokenId && interact(selectedTokenId, obj.id)}
                    className={`absolute z-20 flex items-center justify-center cursor-pointer transition-all duration-300 ${obj.isLocked ? 'animate-pulse border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-nexus-cyan shadow-[0_0_15px_rgba(0,210,255,0.3)]'} bg-black/80 border-2 rounded-xl`}
                    style={{ left: obj.position.x * CELL_SIZE + 10, top: obj.position.y * CELL_SIZE + 10, width: CELL_SIZE - 20, height: CELL_SIZE - 20 }}
                >
                    <Terminal size={24} className={obj.isLocked ? 'text-red-500' : 'text-nexus-cyan'} />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[7px] font-black text-white/40 uppercase whitespace-nowrap tracking-widest">{obj.name}</div>
                </div>
            ))}

            {/* Threat Zones */}
            {characters.filter(c => c.faction === 'opposition' && c.hp > 0).map(enemy => (
                <div 
                    key={`threat-${enemy.id}`}
                    className="absolute rounded-full bg-red-500/5 border border-red-500/10 pointer-events-none transition-all duration-1000"
                    style={{ 
                        left: (enemy.position.x - 4) * CELL_SIZE, top: (enemy.position.y - 4) * CELL_SIZE,
                        width: CELL_SIZE * 9, height: CELL_SIZE * 9,
                        filter: 'blur(20px)'
                    }}
                />
            ))}

            {/* Decals */}
            {decals.map(d => (
                <div 
                    key={d.id} className="absolute opacity-40 mix-blend-overlay"
                    style={{ left: d.x * CELL_SIZE, top: d.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}
                >
                    {d.type === 'scorch' ? <div className="w-full h-full bg-black rounded-full blur-md" /> : <div className="w-full h-full bg-red-900 rounded-full blur-xl" />}
                </div>
            ))}

            {/* Interactive Grid Overlay */}
            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${MAP_COLS}, ${CELL_SIZE}px)`, gridTemplateRows: `repeat(${MAP_ROWS}, ${CELL_SIZE}px)` }}>
                {Array.from({ length: MAP_COLS * MAP_ROWS }).map((_, i) => {
                    const x = i % MAP_COLS;
                    const y = Math.floor(i / MAP_COLS);
                    const isDiscovered = discoveredCells.has(`${x},${y}`);
                    return (
                        <div 
                            key={`${x}-${y}`} 
                            onMouseEnter={() => setHoveredCell({x, y})}
                            onClick={() => selectedTokenId && moveCharacter(selectedTokenId, x, y)}
                            className="relative border border-transparent hover:bg-nexus-cyan/5 transition-colors group"
                        >
                            {fogEnabled && !isDiscovered && <div className="absolute inset-0 bg-[#020205] z-40"></div>}
                            <div className="absolute inset-2 border border-nexus-cyan/0 group-hover:border-nexus-cyan/20 rounded-lg transition-all"></div>
                        </div>
                    );
                })}
            </div>

            {/* Obstacles */}
            {obstacles.map(obs => (
                <div 
                    key={obs.id} 
                    className={`absolute z-20 flex items-center justify-center bg-gray-900 border border-white/10 shadow-2xl`}
                    style={{ left: obs.position.x * CELL_SIZE + 10, top: obs.position.y * CELL_SIZE + 10, width: CELL_SIZE - 20, height: CELL_SIZE - 20, borderRadius: obs.type === 'heavy' ? '8px' : '20px' }}
                >
                    <Shield size={24} className="text-gray-600" />
                </div>
            ))}

            {/* Tokens */}
            {characters.map(char => (
                <Token
                    key={char.id} character={char} 
                    isSelected={selectedTokenId === char.id} isTarget={targetTokenId === char.id} isActive={activeChar?.id === char.id}
                    onSelect={() => handleTokenClick(char)} onTarget={() => setTargetToken(char.id)}
                    isVisible={!fogEnabled || discoveredCells.has(`${char.position.x},${char.position.y}`)}
                />
            ))}

            {/* Floating combat texts */}
            <AnimatePresence>
                {floatingTexts.map(t => (
                    <motion.div 
                        key={t.id} initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -100, scale: 1.5 }} exit={{ opacity: 0 }}
                        className={`absolute z-[100] font-black text-3xl pointer-events-none drop-shadow-2xl ${t.type === 'miss' ? 'text-gray-400' : t.type === 'crit' ? 'text-yellow-400' : t.type === 'xp' ? 'text-nexus-purple' : 'text-red-500'}`}
                        style={{ left: t.x * CELL_SIZE + CELL_SIZE/2, top: t.y * CELL_SIZE + CELL_SIZE/2 }}
                    >
                        {t.content}
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    </div>
  );
};

const Token: React.FC<{ character: Character, isSelected: boolean, isTarget: boolean, isActive: boolean, onSelect: () => void, onTarget: () => void, isVisible: boolean }> = ({ character, isSelected, isTarget, isActive, onSelect, onTarget, isVisible }) => {
    if (!isVisible) return null;
    const isAlly = character.faction === 'party' || (!character.faction && !character.isAI);
    return (
        <motion.div 
            animate={{ x: character.position.x * CELL_SIZE, y: character.position.y * CELL_SIZE }} 
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
            className="absolute z-30 flex items-center justify-center p-2"
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
        >
            <div 
                onClick={(e) => { e.stopPropagation(); onSelect(); }} onContextMenu={(e) => { e.preventDefault(); onTarget(); }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(); } }}
                title={`${character.name} · ${isAlly ? 'Équipe' : 'Opposition'}`}
                aria-label={`${character.name}, ${isAlly ? 'allié' : 'adversaire'}${character.isAI ? ' contrôlé par l’IA' : ''}`}
                className={`relative w-full h-full rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden bg-nexus-dark ${isSelected ? (isAlly ? 'border-cyan-300 scale-110 shadow-[0_0_30px_#00d2ff]' : 'border-red-400 scale-110 shadow-[0_0_30px_#ef4444]') : isTarget ? 'border-red-400 scale-110 shadow-[0_0_30px_#ef4444]' : isAlly ? 'border-cyan-200/45' : 'border-red-300/50'}`}
            >
                <img src={character.avatar} className={`w-full h-full object-cover transition-all ${character.hp <= 0 ? 'grayscale brightness-50' : ''}`} alt="" />
                <span className={`absolute left-1 top-1 rounded px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wide text-white shadow ${isAlly ? 'bg-cyan-800/90' : 'bg-red-900/90'}`}>{isAlly ? 'ALLIÉ' : 'MENACE'}</span>
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/60">
                    <div className={`h-full transition-all duration-500 ${character.hp < character.maxHp * 0.3 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(character.hp / character.maxHp) * 100}%` }}></div>
                </div>
            </div>
            
            {isActive && character.hp > 0 && <div className="absolute -inset-2 border-2 border-nexus-cyan/40 rounded-3xl animate-pulse pointer-events-none" />}
            
            {/* Status Indicators */}
            <div className="absolute -right-2 top-0 flex flex-col gap-1">
                {character.statuses.map(s => (
                    <div key={s.id} className={`w-5 h-5 ${s.type === 'buff' ? 'bg-green-500' : 'bg-red-500'} border border-white/20 rounded-md flex items-center justify-center shadow-lg`}>
                        {s.id === 'fortified' ? <Shield size={12} className="text-white" /> : <Zap size={12} className="text-white" />}
                    </div>
                ))}
            </div>

            {/* Special VFX based on statuses */}
            {character.statuses.some(s => s.id === 'fortified') && (
                <motion.div 
                    animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 border-2 border-dashed border-nexus-cyan/20 rounded-full pointer-events-none"
                />
            )}

            {character.hp <= 0 && <div className="absolute inset-0 flex items-center justify-center z-40 text-red-500 font-black tracking-tighter bg-black/40 rounded-2xl">DECO</div>}
        </motion.div>
    );
};
