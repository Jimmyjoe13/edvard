import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { EdvardHome } from './components/EdvardHome';
import { RulebookPage } from './components/RulebookPage';

const NexusVTT = lazy(() => import('./components/NexusVTT').then((module) => ({ default: module.NexusVTT })));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EdvardHome />} />
        <Route path="/table" element={<Suspense fallback={<div className="flex min-h-svh items-center justify-center bg-[#070910] font-mono text-sm text-cyan-100">Ouverture de la table…</div>}><NexusVTT /></Suspense>} />
        <Route path="/guide-de-table" element={<RulebookPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
