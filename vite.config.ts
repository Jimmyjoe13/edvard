import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const legacyPages = [
  'bestiaire.html',
  'creation-personnage.html',
  'equipement.html',
  'regles.html',
  'scenarios.html',
  'univers-lore.html',
];
const legacyDirectories = ['css', 'js', 'images', 'resources'];

const copyLegacySite = () => ({
  name: 'copy-edvard-legacy-site',
  apply: 'build' as const,
  closeBundle() {
    const outputDirectory = resolve(projectRoot, 'dist');

    legacyPages.forEach((page) => {
      copyFileSync(resolve(projectRoot, page), resolve(outputDirectory, page));
    });

    legacyDirectories.forEach((directory) => {
      cpSync(resolve(projectRoot, directory), resolve(outputDirectory, directory), { recursive: true });
    });
  },
});

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copyLegacySite(),
  ],
  server: {
    port: 3000
  }
});
