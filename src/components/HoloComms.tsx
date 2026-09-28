import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, ShieldAlert } from 'lucide-react';
import { GAME_RULES } from '../data/rules';
import { SKILLS } from '../data/gameData';
import { useGameStore } from '../store/gameStore';

export const HoloComms: React.FC = () => {
  const { dialogueQueue, advanceDialogue, resolveDialogueChoice } = useGameStore();
  const [displayedText, setDisplayedText] = useState('');
  const currentDialogue = dialogueQueue[0];
  const isSystem = currentDialogue?.speaker.startsWith('SYSTEM') || false;
  const textComplete = !!currentDialogue && displayedText.length === currentDialogue.text.length;

  useEffect(() => {
    if (!currentDialogue) {
      setDisplayedText('');
      return;
    }

    let index = 0;
    const interval = window.setInterval(() => {
      setDisplayedText(currentDialogue.text.substring(0, index));
      index += 1;
      if (index > currentDialogue.text.length) window.clearInterval(interval);
    }, 22);

    return () => window.clearInterval(interval);
  }, [currentDialogue]);

  if (!currentDialogue) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        className="fixed bottom-3 left-1/2 z-[250] w-[calc(100vw-1.5rem)] max-w-3xl -translate-x-1/2 cursor-pointer pointer-events-auto sm:bottom-8"
        onClick={() => {
          if (!textComplete) setDisplayedText(currentDialogue.text);
          else if (!currentDialogue.choices) advanceDialogue();
        }}
      >
        <div className={`glass-panel flex items-start gap-3 rounded-2xl border-b-4 p-3 shadow-[0_0_50px_rgba(0,0,0,0.9)] sm:gap-5 sm:rounded-3xl sm:p-5 ${isSystem ? 'border-b-red-500 bg-red-950/20' : 'border-b-nexus-cyan'}`}>
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-2 bg-black sm:h-20 sm:w-20 sm:rounded-2xl ${isSystem ? 'border-red-500' : 'border-nexus-cyan'}`}>
              {isSystem ? <ShieldAlert size={24} className="text-red-500 sm:h-9 sm:w-9" /> : <img src={currentDialogue.avatar} className="h-full w-full object-cover" alt="" />}
            </div>
            <span className={`max-w-20 truncate rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-widest sm:text-[8px] ${isSystem ? 'bg-red-500 text-black' : 'bg-nexus-cyan text-black'}`}>
              {currentDialogue.speaker}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 text-[8px] font-black uppercase tracking-[.2em] text-nexus-cyan sm:text-[10px] sm:tracking-[.3em]">
              <Radio className="animate-pulse" size={14} />
              {isSystem ? 'Alerte système' : 'Transmission sécurisée'}
            </div>
            <p className={`text-sm leading-relaxed sm:text-base ${isSystem ? 'font-bold uppercase tracking-widest text-red-300' : 'text-gray-200'}`}>
              {displayedText}
              {!textComplete && <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-nexus-cyan align-middle" />}
            </p>

            {textComplete && currentDialogue.choices && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2" role="group" aria-label="Choisissez votre action">
                {currentDialogue.choices.map((choice) => {
                  const skill = SKILLS.find((item) => item.id === choice.check.skillId);
                  const difficulty = GAME_RULES.resolution.difficulties.find((item) => item.value === choice.check.difficulty)?.label || 'test';
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={(event) => { event.stopPropagation(); resolveDialogueChoice(choice.id); }}
                      className="rounded-xl border border-cyan-100/20 bg-cyan-100/[.06] p-3 text-left transition hover:border-cyan-100/60 hover:bg-cyan-100/10 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                    >
                      <span className="block text-xs font-bold text-white sm:text-sm">{choice.label}</span>
                      <span className="mt-1 block text-[10px] leading-4 text-white/55">{choice.description}</span>
                      <span className="mt-2 block font-mono text-[9px] uppercase tracking-wider text-cyan-100/70">{skill?.name || choice.check.skillId} · {difficulty} · seuil {choice.check.difficulty}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {textComplete && !currentDialogue.choices && (
              <button type="button" onClick={(event) => { event.stopPropagation(); advanceDialogue(); }} className="mt-3 ml-auto block rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-cyan-100/70 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-100">
                Continuer <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
