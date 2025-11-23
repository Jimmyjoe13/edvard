// Logique principale de la création de personnage
// Dépend de utils.js et character-manager.js

document.addEventListener("DOMContentLoaded", function () {
  // Initialisation du Manager
  const charManager = new window.CharacterManager();

  // --- Gestion de l'UI ---

  const uiElements = {
    pointsDisplay: document.getElementById("available-points"),
    statCards: document.querySelectorAll(".characteristic-card"),
    raceCards: document.querySelectorAll(".race-card"),
    specCards: document.querySelectorAll(".spec-card"),
    inputs: {
      name: document.getElementById("charName"),
      age: document.getElementById("charAge"),
      origin: document.getElementById("origin"),
      background: document.getElementById("background"),
      appearance: document.getElementById("charAppearance"),
    },
  };

  /**
   * Met à jour l'affichage des caractéristiques et des points.
   */
  function updateStatsUI() {
    const state = charManager.getState();
    const effectiveStats = state.effectiveStats; // Stats avec bonus raciaux

    // Mise à jour des points disponibles
    if (uiElements.pointsDisplay) {
      uiElements.pointsDisplay.textContent = state.availablePoints;
    }

    // Mise à jour de chaque carte de stat
    uiElements.statCards.forEach((card) => {
      const statName = card.dataset.stat;
      const baseVal = state.stats[statName];
      const effectiveVal = effectiveStats[statName];
      const bonus = effectiveVal - baseVal;

      // Valeur affichée (Finale)
      const valSpan = card.querySelector(".char-value");
      if (valSpan) {
        valSpan.textContent = effectiveVal;
        // Highlight si bonus
        if (bonus > 0) {
          valSpan.style.color = "var(--primary-color)";
          valSpan.title = `Base: ${baseVal}, Bonus Racial: +${bonus}`;
        } else if (bonus < 0) {
          valSpan.style.color = "var(--accent-color)"; // Orange/Red usually
          valSpan.title = `Base: ${baseVal}, Malus Racial: ${bonus}`;
        } else {
          valSpan.style.color = "";
          valSpan.title = "";
        }
      }

      // Modificateur (basé sur la valeur effective)
      const modSpan = card.querySelector(".mod-value");
      if (modSpan) {
        const mod = window.EdvardUtils.calculateModifier(effectiveVal);
        modSpan.textContent = window.EdvardUtils.formatModifier(mod);
      }

      // Gestion des boutons (basés sur le coût de la valeur de base)
      const btnPlus = card.querySelector(".increase-stat");
      const btnMinus = card.querySelector(".decrease-stat");

      if (btnPlus) {
        const nextCostDiff =
          window.EdvardUtils.costTable[baseVal + 1] -
          window.EdvardUtils.costTable[baseVal];
        const isMax = baseVal >= 15; // Point Buy Max Limit logic (15 usually)
        btnPlus.disabled = isMax || state.availablePoints < nextCostDiff;
      }

      if (btnMinus) {
        btnMinus.disabled = baseVal <= 8;
      }
    });
  }

  // --- Event Listeners ---

  // 1. Caractéristiques
  uiElements.statCards.forEach((card) => {
    const statName = card.dataset.stat;

    const btnPlus = card.querySelector(".increase-stat");
    const btnMinus = card.querySelector(".decrease-stat");

    if (btnPlus) {
      btnPlus.addEventListener("click", () => {
        if (charManager.increaseStat(statName)) {
          updateStatsUI();
        }
      });
    }

    if (btnMinus) {
      btnMinus.addEventListener("click", () => {
        if (charManager.decreaseStat(statName)) {
          updateStatsUI();
        }
      });
    }
  });

  // 2. Race Selection
  uiElements.raceCards.forEach((card) => {
    card.addEventListener("click", () => {
      // Visuel selection
      uiElements.raceCards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");

      const race = card.dataset.race;
      charManager.setRace(race);

      // Important: Refresh stats UI because modifiers might change
      updateStatsUI();
    });
  });

  // 3. Spécialisation Selection
  uiElements.specCards.forEach((card) => {
    card.addEventListener("click", () => {
      uiElements.specCards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");

      // Mapping simple titre -> key
      const title = card.querySelector("h3").textContent;
      const map = {
        "Techno-Guerrier": "techno-guerrier",
        "Bio-Ingénieur": "bio-ingenieur",
        "Techno-Mage": "techno-mage",
        Infiltrateur: "infiltrateur",
      };
      const key = map[title] || title.toLowerCase();

      charManager.setSpecialization(key);
    });
  });

  // 4. Champs textes (Lore)
  Object.keys(uiElements.inputs).forEach((key) => {
    const input = uiElements.inputs[key];
    if (input) {
      input.addEventListener("input", (e) => {
        charManager.updateLore(key, e.target.value);
      });
    }
  });

  // --- Restauration UI depuis Etat ---
  function restoreUI() {
    const state = charManager.getState();

    // Update Stats (will handle effectives)
    updateStatsUI();

    // Restore Race Selection
    if (state.race) {
      const card = document.querySelector(
        `.race-card[data-race="${state.race}"]`
      );
      if (card) {
        uiElements.raceCards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
      }
    }

    // Restore Spec
    if (state.specialization) {
      const mapInv = {
        "techno-guerrier": "Techno-Guerrier",
        "bio-ingenieur": "Bio-Ingénieur",
        "techno-mage": "Techno-Mage",
        infiltrateur: "Infiltrateur",
      };
      const title = mapInv[state.specialization];
      if (title) {
        uiElements.specCards.forEach((c) => {
          if (c.querySelector("h3").textContent === title) {
            uiElements.specCards.forEach((x) => x.classList.remove("selected"));
            c.classList.add("selected");
          }
        });
      }
    }

    // Restore Inputs
    if (state.lore) {
      if (uiElements.inputs.name)
        uiElements.inputs.name.value = state.lore.name || "";
      if (uiElements.inputs.age)
        uiElements.inputs.age.value = state.lore.age || "";
      if (uiElements.inputs.origin)
        uiElements.inputs.origin.value = state.lore.origin || "";
      if (uiElements.inputs.background)
        uiElements.inputs.background.value = state.lore.background || "";
      if (uiElements.inputs.appearance)
        uiElements.inputs.appearance.value = state.lore.appearance || "";
    }
  }

  // --- Boutons Sauvegarde / Chargement / PDF ---

  const btnSaveJson = document.getElementById("btn-save-json");
  if (btnSaveJson) {
    btnSaveJson.addEventListener("click", () => {
      charManager.exportJSON();
    });
  }

  const fileInput = document.getElementById("file-upload");
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      charManager.importJSON(file, (success) => {
        if (success) {
          restoreUI();
          alert("Personnage chargé avec succès !");
        } else {
          alert("Erreur lors de la lecture du fichier.");
        }
      });
    });
  }

  const btnPdf = document.getElementById("btn-generate-pdf");
  if (btnPdf) {
    btnPdf.addEventListener("click", () => {
      if (window.EdvardPDF) {
        window.EdvardPDF.generate(charManager.getState());
      } else {
        alert("Le module PDF n'est pas chargé.");
      }
    });
  }

  // Générateur de Nom
  const btnRandomName = document.getElementById("btn-random-name");
  if (btnRandomName) {
    btnRandomName.addEventListener("click", () => {
      const names = [
        "Kael",
        "Lyra",
        "Zane",
        "Orion",
        "Vesper",
        "Cyrus",
        "Nova",
        "Aurelius",
        "Thorne",
        "Elara",
      ];
      const random = names[Math.floor(Math.random() * names.length)];
      const nameInput = document.getElementById("charName");
      if (nameInput) {
        nameInput.value = random;
        charManager.updateLore("name", random);
      }
    });
  }

  // Init
  restoreUI();
});
