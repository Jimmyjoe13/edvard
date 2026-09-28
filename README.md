# Projet Edvard - Univers de Jeu de Rôle Magi-Tech

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20Vite%20%7C%20TypeScript-blue)

## 📖 À propos

**Projet Edvard** est une plateforme web immersive dédiée à un univers de jeu de rôle post-apocalyptique original où la magie ancienne (les Flux) rencontre la technologie futuriste. Ce site sert de compagnon numérique pour les joueurs et les Maîtres de Jeu (MJ), offrant des outils interactifs, une encyclopédie de lore, et des ressources de jeu.

## 🌟 Fonctionnalités Clés

### 🎭 Pour les Joueurs
- **Création de Personnage Interactive** : Un outil pas à pas pour créer votre avatar, calculant automatiquement les statistiques et permettant de sauvegarder ou d'exporter la fiche en PDF.
- **Gestion d'Équipement** : Catalogue d'armes énergétiques, d'armures et d'implants.
- **Règles Accessibles** : Consultation rapide des mécaniques de jeu.
- **Table de jeu solo** : Créez une table, choisissez une fiche, composez une équipe de compagnons IA et lancez un scénario tactique. Votre partie est sauvegardée sur cet appareil.
- **Approches à conséquences** : Choisissez comment aborder une mission et résolvez un test 2d10 avant le combat.

### 🎲 Pour les Maîtres de Jeu
- **Bestiaire Détaillé** : Base de données de créatures avec statistiques et descriptions.
- **Scénarios Prêts à Jouer** : Aventures pré-écrites avec cartes et intrigues.
- **Univers & Lore** : Histoire détaillée, factions, et carte interactive du monde.

## 🚀 Installation & Usage

Le site utilise Vite pour servir l’accueil React et préserver les rubriques HTML historiques.

### Prérequis
- Node.js compatible avec Vite 8 et npm.
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge).

### Développement local
```bash
npm install
npm run dev
```

Le serveur de développement est configuré sur `http://localhost:3000`.

Les fiches et parties de la première version sont enregistrées dans le stockage local du navigateur ; elles ne sont pas encore partagées entre appareils.

### Build de production
```bash
npm run build
npm run preview
```

Le site compilé se trouve dans `dist/`. Le build inclut l’accueil React, la table virtuelle, les pages historiques et leurs ressources.

## 📁 Structure du Projet

```
projet-edvard/
├── src/                  # Application React, composants et données de jeu
├── css/                  # Feuilles de style des pages historiques
│   ├── styles.css        # Styles globaux
│   ├── character-creation.css
│   └── ...
├── js/                   # Logique JavaScript
│   ├── character-creation-logic.js
│   ├── map-interactive.js
│   └── ...
├── images/               # Assets graphiques
├── resources/            # PDFs, Fiches, Scénarios
├── *.html                # Pages historiques du site
└── README.md
```

## 🎨 Personnalisation

Le design repose sur des variables CSS (Custom Properties) définies dans `css/styles.css`, facilitant l'adaptation du thème :

```css
:root {
    --primary-color: #00d2ff;   /* Cyan futuriste */
    --accent-color: #bc13fe;    /* Violet magique */
    --bg-dark: #0a0a12;         /* Fond sombre */
    --text-light: #e0e0e0;      /* Texte clair */
}
```

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les directives.

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---
*Développé avec passion pour la communauté rôliste.*
