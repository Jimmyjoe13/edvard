/**
 * Générateur de PDF pour la fiche de personnage Projet Edvard.
 * Utilise jsPDF.
 */

window.EdvardPDF = {
  generate: (state) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Couleurs du thème
    const primaryColor = [0, 210, 255]; // #00d2ff

    // Titre
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text("Fiche de Personnage - Projet Edvard", 105, 20, {
      align: "center",
    });

    // Ligne de séparation
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(20, 25, 190, 25);

    // Info de base
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let y = 40;
    const leftCol = 20;
    const rightCol = 110;

    doc.setFont("helvetica", "bold");
    doc.text("Identité", leftCol, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Nom : ${state.lore.name || "Inconnu"}`, leftCol, y);
    doc.text(`Race : ${formatString(state.race)}`, rightCol, y);
    y += 8;
    doc.text(`Âge : ${state.lore.age || "?"}`, leftCol, y);
    doc.text(
      `Spécialisation : ${formatString(state.specialization)}`,
      rightCol,
      y
    );
    y += 8;
    doc.text(`Origine : ${formatString(state.lore.origin)}`, leftCol, y);

    y += 15;

    // Caractéristiques
    doc.setFont("helvetica", "bold");
    doc.text("Caractéristiques", leftCol, y);
    y += 10;

    const stats = state.stats;
    let xOffset = 0;
    const statKeys = Object.keys(stats);

    // Grille de stats
    statKeys.forEach((key, index) => {
      if (index % 3 === 0 && index !== 0) {
        y += 15;
        xOffset = 0;
      }

      const val = stats[key];
      const mod = window.EdvardUtils.calculateModifier(val);
      const modStr = window.EdvardUtils.formatModifier(mod);

      doc.setFont("helvetica", "bold");
      doc.text(`${formatString(key)}`, leftCol + xOffset, y);
      doc.setFont("helvetica", "normal");
      doc.text(`Score: ${val} (${modStr})`, leftCol + xOffset, y + 6);

      xOffset += 60;
    });

    y += 25;

    // Stats Dérivées
    doc.setDrawColor(0, 0, 0);
    doc.rect(leftCol, y, 170, 20);
    doc.text(`PV Max : ${state.derived.hp}`, leftCol + 10, y + 13);
    doc.text(`Crédits : ${state.derived.credits}`, leftCol + 60, y + 13);

    y += 35;

    // Histoire
    doc.setFont("helvetica", "bold");
    doc.text("Histoire & Apparence", leftCol, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const bgLines = doc.splitTextToSize(
      `Histoire: ${state.lore.background || "Aucune"}`,
      170
    );
    doc.text(bgLines, leftCol, y);
    y += bgLines.length * 5 + 5;

    const appLines = doc.splitTextToSize(
      `Apparence: ${state.lore.appearance || "Non décrite"}`,
      170
    );
    doc.text(appLines, leftCol, y);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Généré sur Projet Edvard - Le JDR Magi-Tech", 105, 280, {
      align: "center",
    });

    doc.save("personnage-edvard.pdf");
  },
};

function formatString(str) {
  if (!str) return "-";
  // Capitalize first letter
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");
}
