# Edvard — feuille de route de refonte

**Promesse produit :** faire d’Edvard le compagnon de table d’un JDR magi-tech, du premier contact avec l’univers jusqu’à la reprise de campagne.

La refonte part des parcours réels de jeu : découvrir et apprendre, créer un personnage, jouer une séance, puis retrouver ses choix et préparer la suite. Les rôlistes n’ont pas encore validé les hypothèses d’usage ci-dessous ; elles seront vérifiées pendant les tests de table.

## Besoins à valider

| Situation | Besoin supposé | Résultat recherché |
| --- | --- | --- |
| Nouveau joueur découvre Edvard | Comprendre quoi lire et quoi faire en premier | Démarrer sans devoir connaître tout le lore |
| Joueur prend une décision pendant une partie | Retrouver la règle et résoudre un test rapidement | Reprendre le rythme de la scène |
| Joueur revient pour une autre séance | Retrouver une fiche fiable et ses choix | Continuer sans ressaisir le personnage |
| MJ prépare et mène une séance | Relier scénario, opposition et aide de jeu | Passer de la préparation à la partie sans changer d’outil |

## État du dépôt observé

- L’accueil React présente déjà les parcours joueurs, MJ et univers.
- Le site conserve des pages HTML historiques pour la création, les règles, le bestiaire, l’équipement, les scénarios et le lore.
- La table React rassemble carte tactique, combat, missions, inventaire et création de personnage ; plusieurs données sont statiques.
- La progression est sauvegardée localement dans plusieurs espaces séparés. Il n’y a pas encore de fiche de campagne partagée.
- L’audit de dépôt a relevé 0 fichier de test et aucun pipeline CI.

## Écarts P0 avant de présenter les outils comme fiables

1. **Deux moteurs de résolution.** Le livret de règles annonce 2d10 pour un test (regles.html, ligne 45), tandis que les raccourcis de compétences dans Nexus lancent un d20 (NexusVTT.tsx, ligne 173). Les attaques emploient aussi un d20 dans le store (gameStore.ts, ligne 190).
2. **Deux catalogues d’origines.** Le créateur historique propose Humain, Sylvaïn, Néo-Forgé, Skarn et Éthéré (creation-personnage.html, lignes 78–155). Le prototype React en propose quatre et remplace Néo-Forgé / Éthéré par Synthétique (gameStore.ts, lignes 121–126).
3. **Créateurs séparés.** L’accueil dirige vers le créateur HTML ; la table démarre son propre séquenceur React. Leurs statistiques, équipements et sauvegardes ne sont pas encore un même personnage.
4. **Création et démonstration mêlées.** Valider le séquenceur React démarre immédiatement une mission et ajoute un adversaire de démonstration (gameStore.ts, lignes 432–446). La création d’une fiche doit être une action autonome.
5. **Formules de personnage incomplètes.** Les points de caractéristiques, compétences, ressources et défenses n’ont pas encore une définition unique utilisée par la fiche, les règles et la table.

**Référence provisoire de cette première livraison :** le livret de règles actuellement publié. Les outils nouveaux doivent reproduire ses mécaniques jusqu’à leur validation lors de parties tests. Ce choix ne tranche pas les paramètres qui manquent au livret.

La nouvelle référence rapide reprend encore le contenu du livret dans un fichier de données séparé. L’extraction d’une source de règles commune reste un chantier P0.

## Ordre de réalisation

### P0 — rendre le socle jouable et cohérent

- [x] Ajouter une référence de table interactive : recherche, filtres, difficultés, synergies et calculateur de test 2d10 fondé sur le livret publié.
- [x] Introduire un premier catalogue commun aux interfaces React et historiques : origines, point-buy, compétences, équipement, difficultés et résolution 2d10.
- [x] Introduire une fiche locale partagée par les deux créateurs, avec migration depuis la sauvegarde historique.
- [ ] Terminer l’alignement des parcours de création et relier tous les états de table à cette fiche commune.
- [ ] Définir avec des parties tests les valeurs encore manquantes : rang d’une compétence, ressources dérivées, défense, dégâts et progression.
- [x] Séparer la création de la fiche du démarrage automatique d’une mission de démonstration.
- [ ] Migrer toutes les entrées joueur vers un parcours unique et faire valider la fiche commune en parties tests.

**Critères :** une même valeur de règle apparaît de façon cohérente dans le guide, le créateur et la table ; un joueur peut consulter une règle ou résoudre un test sans quitter sa séance.

### P1 — compagnon du joueur

- Créer, modifier, sauvegarder, exporter et retrouver une fiche qui reprend les règles validées.
- Afficher les capacités, l’équipement, les ressources et les états utiles pendant une séance.
- Construire la vue de table autour des actions réelles du joueur plutôt que de l’état interne du prototype.

**Critères :** un joueur novice termine une fiche en moins de 10 minutes ; le joueur existant retrouve sa fiche après fermeture et réouverture.

### P2 — jeu interactif complet (nouveau chantier majeur)

**Parcours visé :** depuis l’accueil, le joueur crée une table, prépare son personnage, choisit ses compagnons IA, sélectionne un scénario et joue une partie dont l’état peut être repris plus tard.

Ce chantier s’appuie sur le modèle de règles commun (P0) et le personnage persistant (P1). Le premier objectif est une tranche verticale jouable de bout en bout ; les prototypes de carte tactique, mission et combat ne deviennent des éléments du parcours que lorsqu’ils servent cette expérience.

#### Décisions produit à valider avant la conception détaillée

- **Qui mène la partie ?** Un moteur de scènes et de règles préparées, un MJ IA qui improvise, ou un modèle hybride. Le choix définit les capacités, les coûts, la fiabilité et les limites du jeu.
- **Que signifie « créer une table » au lancement ?** Une partie solo avec des compagnons IA, ou une salle où plusieurs joueurs humains peuvent rejoindre. La proposition de départ est de valider d’abord le parcours solo, puis d’ouvrir le multijoueur après les retours.
- **Quel contrôle pour les compagnons IA ?** Aide et suggestions sous contrôle du joueur, ou actions autonomes lors des scènes et combats.
- **Quelle durée et quelle structure pour le premier scénario ?** Assez courte pour qu’une nouvelle table puisse terminer une première aventure et comprendre comment reprendre sa progression.

#### Étapes

1. **Créer et configurer une table.** Nommer la partie, afficher son état, définir le mode de jeu et enregistrer le groupe et la progression dans une session durable.
2. **Préparer le personnage joueur.** Créer ou sélectionner une fiche conforme au modèle commun, expliquer les choix et permettre le retour à la configuration de table sans perdre les données.
3. **Composer le groupe de compagnons IA.** Présenter leurs rôles et personnalités, permettre de choisir/remplacer les compagnons, et rendre leur niveau d’intervention lisible et maîtrisable.
4. **Choisir puis lancer un scénario.** Proposer des scénarios avec durée, difficulté, thèmes, prérequis et résumé sans divulgâcher ; vérifier la compatibilité avec le personnage et le groupe.
5. **Jouer une première aventure complète.** Enchaîner scènes, choix narratifs, exploration, tests utilisant les règles communes, objectifs et au moins une rencontre de combat ; afficher clairement les conséquences et le prochain objectif.
6. **Sauvegarder, reprendre et conclure.** Restaurer la partie après fermeture, reprendre au bon endroit, enregistrer les conséquences persistantes et afficher un résumé de fin ainsi que les pistes pour continuer.
7. **Tester et élargir par paliers.** Faire jouer le parcours par des novices et des rôlistes réguliers, corriger les ruptures de compréhension et de rythme, puis décider à partir des retours de la priorité du multijoueur, de l’autonomie IA et des outils MJ.

#### Critères de sortie du premier MVP jouable

- Un joueur peut passer de « Créer une table » à une aventure terminée sans utiliser les outils de démonstration ni ressaisir les mêmes informations.
- La fiche, les compagnons, le scénario et l’état de partie restent cohérents pendant toute la session et après une reprise.
- Chaque test et chaque action mécanique emploient les règles communes ; les résultats expliquent le jet, l’effet et la conséquence narrative.
- Une aventure d’introduction contient au minimum un choix ayant une conséquence, un test, un objectif suivi et une rencontre jouable.
- Les compagnons IA soutiennent le joueur sans prendre silencieusement le contrôle de son personnage ; leurs interventions sont compréhensibles et réglables.
- Des tests avec des joueurs confirment qu’ils savent quoi faire ensuite, peuvent reprendre la partie et comprennent pourquoi une action a réussi ou échoué.

**Hors premier MVP, à décider selon les tests :** salle multijoueur temps réel, MJ IA improvisant sans scénario, génération libre d’aventures, campagne longue avec partage entre appareils et automatisation tactique poussée.

### P3 — poste de préparation et de conduite pour le MJ

- Relier scénarios, factions et bestiaire par une recherche commune.
- Composer une rencontre depuis une scène et ses créatures.
- Suivre initiative, états, notes et objectifs durant une partie.

**Critères :** un MJ trouve une scène et démarre sa rencontre sans reconstituer les données dans plusieurs pages.

### P4 — campagnes partagées et lancement public

- Ajouter groupes, partage de fiches et synchronisation entre appareils après stabilisation du modèle de personnage.
- Accompagner le lancement public par un scénario d’initiation, un guide de démarrage et une aide de reprise.
- Faire des sessions de test avec joueurs débutants, joueurs réguliers et MJ ; prioriser ensuite multijoueur, carte tactique avancée et fonctions sociales selon les usages observés.

**Critères :** trois tables tests terminent un parcours découverte → création → séance → reprise ; au moins quatre testeurs sur cinq accomplissent leurs tâches sans aide pour retrouver une règle et démarrer.

## Direction UI/UX

- Univers illustré, éditorial et vivant ; les visuels donnent envie d’explorer les Flux.
- Mouvement réservé à la progression, au résultat d’un jet et aux transitions utiles ; respecter la préférence de réduction des animations.
- Vue de séance contrastée, compacte, tactile et utilisable sur téléphone comme sur tablette.
- Les notions de jeu restent visibles dans le vocabulaire des joueurs ; la terminologie technique du prototype reste dans le code.

## Chantier en cours

**Tranche 1 livrée :** guide de règles accessible depuis l’accueil et Nexus, avec recherche, filtres et résolution d’un test 2d10.

**Tranche 2 en cours :** catalogue de règles partagé par React et les pages historiques, point-buy harmonisé sur 8–15 avec 27 points, cinq origines reprises du créateur publié, bonus humains sélectionnables et fiche partagée par les deux créateurs. Les tests de compétence et d’attaque Nexus utilisent le 2d10 commun. Les formules de ressources restent à valider.

**Tranche 3 en cours — parcours initial de table :** depuis l’accueil, un joueur peut nommer une table, reprendre une fiche locale ou en créer une, choisir un ou deux compagnons IA, sélectionner l’un des trois scénarios et lancer une rencontre tactique. Le briefing propose deux approches ; les tests utilisent 2d10, la caractéristique et un bonus de compétence si elle est connue. Le résultat est détaillé et change la situation de départ : dégâts sur l’opposition ou sur le personnage, ou objectif informatique neutralisé. Chaque mission possède désormais une scène narrative après son affrontement principal : Blackout ouvre une récupération du noyau du drone, le Convoi impose de couper la balise du prototype et les Profondeurs isolent le signal de l’équipe disparue. Les choix de ces scènes peuvent terminer l’objectif final, modifier les ressources ou les drapeaux de campagne, et faire apparaître un objectif ainsi qu’une unité de renfort en cas d’échec. Les attaques utilisent la compétence d’arme, la défense calculée depuis l’Agilité et l’armure, la portée de l’arme et ses dés de dégâts ; l’initiative est 1d10 + Agilité. La partie, l’équipe, les objectifs, le dialogue et la mission active sont conservés localement ; les anciennes sessions actives sont converties à la reprise. Les alliés IA et l’opposition sont différenciés, les tours IA se poursuivent quel que soit le premier participant, la défaite permet de retenter la mission et les objectifs suivent les données du scénario. La zone sécurisée ne relance plus de combat sans opposition. Chaque mission terminée affiche un débrief avant de retourner au choix de la suite.

**Continuité de campagne livrée :** la table conserve les missions terminées, les drapeaux de conséquences et le dernier choix narratif. Les briefings des missions suivantes réagissent aux décisions précédentes ; l’écran de sélection rappelle la progression. Les sauvegardes antérieures sont normalisées à la reprise. La progression reste locale à l’appareil.

**Limites restantes de cette tranche :** les choix modifient désormais les objectifs, les renforts, les rencontres et la continuité de campagne, mais ne changent pas encore la géométrie des cartes. L’ergonomie tactique mobile, la synchronisation entre appareils et les essais avec des rôlistes restent à faire. Les valeurs de bonus de compétence, de dégâts et de défense doivent être validées avec les règles et les tables tests.

**Mesure de chargement :** après découpage par route, l’entrée React pèse 201 Ko (63 Ko gzip) et la table 211 Ko (63 Ko gzip), contre un unique chunk initial de 503 Ko (156 Ko gzip) avant séparation.

**Prochain lot :** harmoniser les actions de combat avec les règles communes, renforcer la lecture de la reprise et de l’impact des décisions, puis faire tester la boucle complète et l’ergonomie tactique par des joueurs. Le premier parcours de jeu complet reste une aventure d’introduction reprenable.
