# Plan de Travail - Projet Edvard

Ce fichier suit la progression du développement.

## Phase 1 : Finalisation de la Création de Personnage

### mentor_step_3 : Validation et Sauvegarde Finale
**Explication** : Ajouter une étape de validation qui vérifie que tous les choix obligatoires (Race, Classe, Stats, Compétences) sont faits avant de permettre la génération finale.
**Action 3.1** : Ajouter une méthode `validateCharacter()` dans `CharacterManager`.
**Action 3.2** : Empêcher le téléchargement PDF si le personnage est invalide (bouton désactivé ou message d'erreur).
**Action 3.3** : Mettre à jour `creation-personnage.html` pour afficher les erreurs de validation si nécessaire.
