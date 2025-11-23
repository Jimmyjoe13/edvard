# Projet Edvard - Univers de Jeu de Rôle Magi-Tech

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)
![Tech](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JS-yellow)

## 📖 À propos

**Projet Edvard** est une plateforme web immersive dédiée à un univers de jeu de rôle post-apocalyptique original où la magie ancienne (les Flux) rencontre la technologie futuriste. Ce site sert de compagnon numérique pour les joueurs et les Maîtres de Jeu (MJ), offrant des outils interactifs, une encyclopédie de lore, et des ressources de jeu.

## 🌟 Fonctionnalités Clés

### 🎭 Pour les Joueurs
- **Création de Personnage Interactive** : Un outil pas à pas pour créer votre avatar, calculant automatiquement les statistiques et permettant de sauvegarder ou d'exporter la fiche en PDF.
- **Gestion d'Équipement** : Catalogue d'armes énergétiques, d'armures et d'implants.
- **Règles Accessibles** : Consultation rapide des mécaniques de jeu.

### 🎲 Pour les Maîtres de Jeu
- **Bestiaire Détaillé** : Base de données de créatures avec statistiques et descriptions.
- **Scénarios Prêts à Jouer** : Aventures pré-écrites avec cartes et intrigues.
- **Univers & Lore** : Histoire détaillée, factions, et carte interactive du monde.

## 🚀 Installation & Usage

Ce projet est conçu pour être simple et sans dépendances lourdes.

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge).

### Installation Locale
1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-username/projet-edvard.git
   ```
2. Naviguez dans le dossier du projet :
   ```bash
   cd projet-edvard
   ```
3. Ouvrez `index.html` dans votre navigateur.
   - *Astuce : Pour une meilleure expérience (notamment pour éviter les problèmes de CORS avec certains assets ou modules JS futurs), utilisez une extension "Live Server" ou lancez un simple serveur python :*
     ```bash
     python3 -m http.server 8000
     ```
     Puis accédez à `http://localhost:8000`.

## 📁 Structure du Projet

```
projet-edvard/
├── css/                  # Feuilles de style
│   ├── styles.css        # Styles globaux
│   ├── character-creation.css
│   └── ...
├── js/                   # Logique JavaScript
│   ├── character-creation-logic.js
│   ├── map-interactive.js
│   └── ...
├── images/               # Assets graphiques
├── resources/            # PDFs, Fiches, Scénarios
├── *.html                # Pages du site
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
