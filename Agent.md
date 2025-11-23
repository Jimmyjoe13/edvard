# Plan de Travail - Projet Edvard

Ce fichier suit la progression du développement.

## Phase 1 : Finalisation de la Création de Personnage

### mentor_step_2 : Implémentation du Système d'Équipement
**Explication** : L'équipement est actuellement simplifié. Il faut permettre une sélection d'équipement initial (Arme, Armure) impactant les stats (Défense, Dégâts).
**Action 2.1** : Créer `js/equipment-data.js` contenant les objets disponibles.
**Action 2.2** : Intégrer la gestion de l'inventaire dans `CharacterManager` (méthodes `addItem`, `removeItem`, `getInventory`).
**Action 2.3** : Créer l'UI de sélection d'équipement dans `creation-personnage.html`.

### mentor_step_3 : Validation et Sauvegarde Finale
**Explication** : Ajouter une étape de validation qui vérifie que tous les choix obligatoires (Race, Classe, Stats, Compétences) sont faits avant de permettre la génération finale.
**Action 3.1** : Ajouter une méthode `validateCharacter()` dans `CharacterManager`.
**Action 3.2** : Empêcher le téléchargement PDF si le personnage est invalide.
