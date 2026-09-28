import React, { lazy, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

const NexusVTT = lazy(() => import('./NexusVTT').then((module) => ({ default: module.NexusVTT })));

const opening = (
  <div className="flex min-h-svh items-center justify-center bg-[#070910] font-mono text-sm text-cyan-100">
    Ouverture du séquenceur…
  </div>
);

/**
 * Point d'entree unique de la creation de personnage.
 * Prepare la table puis affiche le parcours React (DNASequencer),
 * en remplacement de l'ancien formulaire statique creation-personnage.html.
 */
export const CharacterCreationEntry: React.FC = () => {
  const navigate = useNavigate();
  const table = useGameStore((state) => state.table);
  const createTable = useGameStore((state) => state.createTable);
  const setTableSetupStep = useGameStore((state) => state.setTableSetupStep);
  const setCreationMode = useGameStore((state) => state.setCreationMode);

  useEffect(() => {
    // Une partie en cours ne doit jamais etre ecrasee : on renvoie vers la table.
    if (table?.status === 'playing') {
      navigate('/table', { replace: true });
      return;
    }

    if (!table) {
      createTable('Ma premiere table');
      return;
    }

    if (table.setupStep !== 'character') setTableSetupStep('character');
    if (!useGameStore.getState().creationMode) setCreationMode(true);
  }, [createTable, navigate, setCreationMode, setTableSetupStep, table]);

  if (table?.status === 'playing') return opening;

  return <Suspense fallback={opening}><NexusVTT /></Suspense>;
};

export default CharacterCreationEntry;