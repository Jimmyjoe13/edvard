/**
 * Utilitaires pour le Projet Edvard
 * Contient des fonctions d'aide pour les dés, les calculs et le formatage.
 */

window.EdvardUtils = {
    /**
     * Lance un dé virtuel.
     * @param {number} sides - Le nombre de faces du dé.
     * @returns {number} Résultat entre 1 et sides.
     */
    rollDice: (sides) => {
        return Math.floor(Math.random() * sides) + 1;
    },

    /**
     * Calcule le modificateur pour une caractéristique donnée.
     * @param {number} value - La valeur de la caractéristique.
     * @returns {number} Le modificateur (ex: 10 -> 0, 12 -> +1, 8 -> -1).
     */
    calculateModifier: (value) => {
        return Math.floor((value - 10) / 2);
    },

    /**
     * Formate un modificateur avec le signe + si positif.
     * @param {number} mod - Le modificateur.
     * @returns {string} Chaîne formatée (ex: "+2", "-1", "0").
     */
    formatModifier: (mod) => {
        return mod >= 0 ? `+${mod}` : `${mod}`;
    },

    /**
     * Génère un ID unique (pour les sauvegardes/sessions).
     */
    generateUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Table des coûts pour l'achat de caractéristiques (Point Buy).
     */
    costTable: {
        8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5,
        14: 7, 15: 9, 16: 11, 17: 13, 18: 15
    }
};
