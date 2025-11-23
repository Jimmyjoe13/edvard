## 🧭 Phase 1 : Externalisation des Données des Races
Actuellement, la configuration des bonus raciaux est codée en dur dans js/character-manager.js, et les descriptions sont dupliquées dans creation-personnage.html. Une modification de règle nécessite deux changements dans deux fichiers différents, ce qui est risqué.

mentor_step_1 : Création du Fichier de Données de Race
La première étape consiste à centraliser les données de race dans un fichier JSON.

Explication : Nous créons un répertoire data pour stocker toutes les données de jeu (races, équipement, monstres...) au format JSON. Ce format est universel pour échanger des données structurées dans le web.

### Action 1.1 : Créer le répertoire et le fichier races.json
Ouvrez votre explorateur de fichiers dans le dossier racine du projet.

Créez un nouveau dossier nommé data.

Dans ce nouveau dossier data, créez un fichier nommé races.json.

### Action 1.2 : Remplir data/races.json avec les données complètes
Nous allons copier et enrichir les données des bonus raciaux de js/character-manager.js en ajoutant les informations descriptives et les chemins d'images que nous voyons dans creation-personnage.html.

Ce que vous devez faire (Contenu de data/races.json) :

Copiez le code JSON ci-dessous et collez-le dans le fichier data/races.json.

```JSON

{
  "humain": {
    "name": "Humain",
    "description": "Les humains sont connus pour leur adaptabilité et leur innovation. Une race polyvalente par excellence.",
    "type": "Polyvalent",
    "image": "images/humain.jpeg",
    "bonuses": {
      "stats": {},
      "free": 2,
      "description": "+1 à deux caractéristiques au choix"
    }
  },
  "sylvain": {
    "name": "Sylvaïn",
    "description": "Fusion parfaite entre nature et technologie, les Sylvaïns sont les gardiens de l'équilibre écologique dans l'espace.",
    "type": "Bio-augmenté",
    "image": "images/sylvains.webp",
    "bonuses": {
      "stats": {
        "sagesse": 2,
        "constitution": 1
      },
      "description": "+2 Sagesse, +1 Constitution"
    }
  },
  "neo-forge": {
    "name": "Néo-Forgé",
    "description": "Êtres de pure conscience numérique habitant des corps synthétiques, les Néo-Forgés repoussent les limites de l'existence.",
    "type": "Synthétique",
    "image": "images/neoforge.jpeg",
    "bonuses": {
      "stats": {
        "intelligence": 2,
        "force": 1
      },
      "description": "+2 Intelligence, +1 Force"
    }
  },
  "skarn": {
    "name": "Skarn",
    "description": "Guerriers cristallins issus des profondeurs spatiales, les Skarns sont une race ancienne dotée d'une force physique impressionnante.",
    "type": "Cristallin",
    "image": "images/skarn.jpeg",
    "bonuses": {
      "stats": {
        "force": 2,
        "constitution": 1
      },
      "description": "+2 Force, +1 Constitution"
    }
  },
  "ether-born": {
    "name": "Éthéré",
    "description": "Nés des Flux Primordiaux, les Éthérés sont des entités d'énergie pure contenues dans des armures de confinement complexes.",
    "type": "Énergétique",
    "image": "images/Voidborn.jpeg",
    "bonuses": {
      "stats": {
        "intelligence": 2,
        "charisme": 1,
        "constitution": -1
      },
      "description": "+2 Intelligence, +1 Charisme, -1 Constitution"
    }
  }
}
```
## 🧭 Phase 2 : Mise à Jour du CharacterManager (Logique de Données)
Maintenant que nous avons externalisé les données, nous devons modifier le cœur de la logique, CharacterManager, pour qu'il utilise le nouveau fichier JSON au lieu des données codées en dur.

mentor_step_2 : Adapter js/character-manager.js au Chargement Asynchrone
Explication : Nous allons transformer le gestionnaire pour qu'il puisse charger les données de manière asynchrone (fetch est une fonction asynchrone). Cela garantit que la logique ne tente pas d'utiliser des règles qui n'ont pas encore été chargées.

### Action 2.1 : Modifier le constructor et supprimer les données codées en dur
Ouvrez le fichier js/character-manager.js.

SUPPRIMEZ complètement l'objet this.racialBonuses (lignes 11 à 22).

Ajoutez this.loadedData = {}; au début du constructor.

Votre constructor devrait maintenant ressembler à ceci (lignes 6-46) :

```JavaScript

    constructor() {
      // Configuration de base
      this.storageKey = "edvard_character_autosave";
      // Configuration pour stocker les données externes
      this.loadedData = {}; 

      // État initial
      this.state = {
        availablePoints: 27,
        stats: {
          force: 8,
          agilite: 8,
          constitution: 8,
          intelligence: 8,
          sagesse: 8,
          charisme: 8,
        },
        derived: {
          hp: 10,
          credits: 0,
        },
        race: null,
        specialization: null,
        lore: {
          name: "",
          age: "",
          origin: "",
          background: "",
          appearance: "",
        },
        skills: [],
        equipment: [],
      };

      // Initialise derived stats (avant le chargement auto pour la restauration)
      this.calculateDerivedStats();

      // Le chargement auto est géré dans initialize() qui sera appelé APRES le chargement des données.
    }
```
Action 2.2 : Ajouter la méthode loadExternalData
Ajoutez cette nouvelle méthode après le constructor pour gérer la lecture du fichier JSON.

Ce que vous devez faire :

Insérez cette fonction dans la classe CharacterManager :

```JavaScript

    /**
     * Charge les configurations externes (races, etc.)
     */
    async loadExternalData() {
      try {
        const response = await fetch("data/races.json");
        if (!response.ok) {
          throw new Error("Erreur de chargement des données de race.");
        }
        this.loadedData.races = await response.json();
        console.log("Données de race chargées.");
      } catch (e) {
        console.error("Échec du chargement des données externes:", e);
      }
    }
```
### Action 2.3 : Mettre à jour la méthode getEffectiveStats
Modifiez getEffectiveStats (lignes 66 à 80) pour qu'elle utilise this.loadedData.races au lieu de l'objet supprimé.

Ce que vous devez faire :

Remplacez l'intégralité de la méthode getEffectiveStats par ceci :

```JavaScript

    /**
     * Calcule les stats finales (Base + Racial).
     */
    getEffectiveStats() {
      const effective = { ...this.state.stats };

      // Vérifiez si les données sont chargées et la race est sélectionnée
      if (this.state.race && this.loadedData.races && this.loadedData.races[this.state.race]) {
        // La propriété 'bonuses.stats' contient les modificateurs
        const bonuses = this.loadedData.races[this.state.race].bonuses.stats;
        
        for (const [stat, bonus] of Object.entries(bonuses)) {
          if (effective[stat] !== undefined) {
            effective[stat] += bonus;
          }
        }
      }
      return effective;
    }
```
## 🧭 Phase 3 : Initialisation Asynchrone
Le chargement des données est maintenant géré, mais il est asynchrone. La logique d'initialisation dans js/character-creation-logic.js doit attendre que les données soient prêtes.

mentor_step_3 : Rendre l'initialisation de l'UI asynchrone
Explication : Nous encapsulons la logique principale dans une fonction asynchrone pour pouvoir utiliser await et garantir que charManager a toutes les règles avant que l'UI ne commence à se charger et à écouter les événements.

### Action 3.1 : Modifier la logique de chargement de js/character-creation-logic.js
Ouvrez js/character-creation-logic.js.

Modifiez le bloc d'initialisation (lignes 5-11 et la fin du fichier) pour qu'il ressemble à ceci :

```JavaScript

// Logique principale de la création de personnage
// Dépend de utils.js et character-manager.js

document.addEventListener("DOMContentLoaded", function () {
  
  // Fonction asynchrone pour gérer le chargement des données
  async function initCharacterCreation() {
    // Initialisation du Manager
    const charManager = new window.CharacterManager();
    
    // NOUVELLE ÉTAPE : Charger les données externes AVANT d'initialiser l'UI
    await charManager.loadExternalData();
    
    // Après le chargement des données, nous pouvons restaurer l'état et l'UI.
    
    // --- Le reste du code de gestion de l'UI (uiElements, updateStatsUI, etc.) ---
    // ... (Tout le code des lignes 11 à 193) ...
    
    // Init Finale après chargement des données
    restoreUI();
    
  }

  // Lancer l'initialisation asynchrone
  initCharacterCreation();
});
```
Note du mentor : J'ai simplifié l'affichage de js/character-creation-logic.js ci-dessus pour montrer uniquement les lignes importantes. Vous devez encadrer tout le contenu du fichier (à partir de la ligne 5) avec la fonction async function initCharacterCreation() et l'appel initCharacterCreation(); à la fin.
