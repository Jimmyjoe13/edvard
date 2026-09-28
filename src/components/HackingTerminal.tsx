import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';

export const HackingTerminal: React.FC = () => {
  const { hackingTargetId, completeHacking } = useGameStore();
  const [targetCode, setTargetCode] = useState<string>("");
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [attempts, setGuesses] = useState<{ code: string, correct: number, misplaced: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    // Generate random 4 digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setTargetCode(code);
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
            setIsGameOver(true);
            setTimeout(() => completeHacking(false), 2000);
            return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleInput = (digit: string) => {
    if (currentGuess.length < 4) {
        setCurrentGuess(prev => prev + digit);
    }
  };

  const submitGuess = () => {
    if (currentGuess.length !== 4) return;

    let correct = 0;
    let misplaced = 0;
    
    const targetArr = targetCode.split('');
    const guessArr = currentGuess.split('');

    // Check correct positions
    for(let i=0; i<4; i++) {
        if (guessArr[i] === targetArr[i]) {
            correct++;
            targetArr[i] = 'X';
            guessArr[i] = 'Y';
        }
    }

    // Check misplaced
    for(let i=0; i<4; i++) {
        const idx = targetArr.indexOf(guessArr[i]);
        if (guessArr[i] !== 'Y' && idx !== -1) {
            misplaced++;
            targetArr[idx] = 'X';
        }
    }

    const newAttempt = { code: currentGuess, correct, misplaced };
    setGuesses([newAttempt, ...attempts]);
    setCurrentGuess("");

    if (correct === 4) {
        setIsGameOver(true);
        setTimeout(() => completeHacking(true), 2000);
    } else if (attempts.length >= 7) {
        setIsGameOver(true);
        setTimeout(() => completeHacking(false), 2000);
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
    >
      <div className="w-[500px] bg-nexus-panel border-2 border-nexus-cyan/30 rounded-[3rem] p-8 shadow-[0_0_100px_rgba(0,210,255,0.2)] relative overflow-hidden">
        
        {/* Scanline FX */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]"></div>

        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3 text-nexus-cyan">
                <Cpu size={24} className="animate-pulse" />
                <h2 className="text-xl font-black tracking-widest uppercase">INTRUSION_EN_COURS</h2>
            </div>
            <div className={`font-mono text-xl font-black ${timeLeft < 10 ? 'text-red-500 animate-ping' : 'text-nexus-purple'}`}>
                {timeLeft}s
            </div>
        </div>

        <div className="bg-black/50 border border-nexus-cyan/10 rounded-2xl p-6 mb-6 min-h-[240px] flex flex-col gap-2 font-mono">
            {attempts.map((a, i) => (
                <div key={i} className="flex justify-between text-xs items-center border-b border-white/5 pb-1">
                    <span className="text-white tracking-[0.5em]">{a.code}</span>
                    <div className="flex gap-4">
                        <span className="text-green-500">POS_OK: {a.correct}</span>
                        <span className="text-nexus-purple">VAL_OK: {a.misplaced}</span>
                    </div>
                </div>
            ))}
            {attempts.length === 0 && (
                <div className="text-nexus-cyan/30 text-[10px] text-center mt-12 italic">
                    DÉCHIFFREZ LE CODE À 4 CHIFFRES POUR ACCÉDER AU NOEUD_SYSTÈME.
                </div>
            )}
        </div>

        {/* Current Input */}
        <div className="flex justify-center gap-4 mb-8">
            {[0,1,2,3].map(i => (
                <div key={i} className={`w-12 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${currentGuess[i] ? 'border-nexus-cyan text-white bg-nexus-cyan/10 shadow-[0_0_15px_rgba(0,210,255,0.3)]' : 'border-white/10 text-white/10'}`}>
                    {currentGuess[i] || "0"}
                </div>
            ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-5 gap-3 mb-8">
            {["1","2","3","4","5","6","7","8","9","0"].map(d => (
                <button 
                    key={d} 
                    onClick={() => handleInput(d)}
                    disabled={isGameOver}
                    className="h-12 bg-white/5 hover:bg-nexus-cyan/20 border border-white/10 hover:border-nexus-cyan/50 rounded-xl text-white font-bold transition-all active:scale-90 disabled:opacity-30"
                >
                    {d}
                </button>
            ))}
        </div>

        <div className="flex gap-3">
            <button 
                onClick={() => setCurrentGuess("")}
                className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest transition-all"
            >
                RESET
            </button>
            <button 
                onClick={submitGuess}
                disabled={currentGuess.length < 4 || isGameOver}
                className="flex-[2] py-4 bg-nexus-cyan/20 hover:bg-nexus-cyan/40 border border-nexus-cyan/50 rounded-2xl text-nexus-cyan text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nexus-cyan/10 transition-all disabled:opacity-30"
            >
                CONFIRMER_ACCÈS
            </button>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
            {isGameOver && (
                <motion.div 
                    initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="absolute inset-0 z-[60] flex items-center justify-center bg-nexus-panel/90 backdrop-blur-md"
                >
                    <div className="text-center">
                        {attempts[0]?.correct === 4 ? (
                            <div className="text-green-500 flex flex-col items-center gap-4">
                                <CheckCircle2 size={64} />
                                <div className="text-2xl font-black uppercase tracking-[0.3em]">ACCÈS_ACCORDÉ</div>
                            </div>
                        ) : (
                            <div className="text-red-500 flex flex-col items-center gap-4">
                                <ShieldAlert size={64} />
                                <div className="text-2xl font-black uppercase tracking-[0.3em]">SYSTÈME_VERROUILLÉ</div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
