/**
 * UI Enhancements for Project Edvard
 * Includes: Dark Mode, Dice Roller, and Live Preview updates.
 */

document.addEventListener("DOMContentLoaded", function () {
  // --- 1. Dark/Light Mode Toggle ---

  // Check local storage or system preference
  const currentTheme = localStorage.getItem("theme") || "dark"; // Default to dark for this universe
  document.documentElement.setAttribute("data-theme", currentTheme);

  const themeToggleBtn = document.createElement("button");
  themeToggleBtn.id = "theme-toggle";
  themeToggleBtn.className = "theme-toggle-btn";
  themeToggleBtn.innerHTML =
    currentTheme === "dark"
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  themeToggleBtn.title = "Changer le thème";

  // Insert in nav (find burger or last li)
  const nav = document.querySelector("nav");
  if (nav) {
    nav.appendChild(themeToggleBtn);
  }

  themeToggleBtn.addEventListener("click", () => {
    let theme = document.documentElement.getAttribute("data-theme");
    let newTheme = theme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    themeToggleBtn.innerHTML =
      newTheme === "dark"
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
  });

  // --- 2. Dice Roller Widget ---

  // HTML Structure
  const diceWidget = document.createElement("div");
  diceWidget.id = "dice-widget";
  diceWidget.innerHTML = `
        <button id="dice-toggle" class="dice-float-btn"><i class="fas fa-dice-d20"></i></button>
        <div id="dice-modal" class="dice-modal hidden">
            <div class="dice-header">
                <h3>Lanceur de Dés</h3>
                <button id="dice-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="dice-content">
                <div class="dice-grid">
                    <button class="dice-btn" data-sides="4">D4</button>
                    <button class="dice-btn" data-sides="6">D6</button>
                    <button class="dice-btn" data-sides="8">D8</button>
                    <button class="dice-btn" data-sides="10">D10</button>
                    <button class="dice-btn" data-sides="12">D12</button>
                    <button class="dice-btn" data-sides="20">D20</button>
                    <button class="dice-btn" data-sides="100">D100</button>
                </div>
                <div id="dice-result" class="dice-result">
                    <span>Résultat: -</span>
                </div>
                <div id="dice-history" class="dice-history">
                    <!-- History log -->
                </div>
            </div>
        </div>
    `;
  document.body.appendChild(diceWidget);

  const diceToggle = document.getElementById("dice-toggle");
  const diceModal = document.getElementById("dice-modal");
  const diceClose = document.getElementById("dice-close");
  const resultDisplay = document.querySelector("#dice-result span");
  const historyContainer = document.getElementById("dice-history");

  diceToggle.addEventListener("click", () => {
    diceModal.classList.toggle("hidden");
  });

  diceClose.addEventListener("click", () => {
    diceModal.classList.add("hidden");
  });

  document.querySelectorAll(".dice-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sides = parseInt(btn.dataset.sides);

      // Animation effect
      resultDisplay.textContent = "...";

      setTimeout(() => {
        const roll = Math.floor(Math.random() * sides) + 1;
        resultDisplay.textContent = `D${sides} : ${roll}`;

        // Add to history
        const p = document.createElement("p");
        p.textContent = `> D${sides} = ${roll}`;
        historyContainer.prepend(p);
        if (historyContainer.children.length > 5)
          historyContainer.lastChild.remove();
      }, 300);
    });
  });

  // --- 3. Live Preview Sidebar (Character Creation Only) ---

  if (document.querySelector(".character-creation")) {
    const previewSidebar = document.createElement("aside");
    previewSidebar.id = "char-preview-sidebar";
    previewSidebar.className = "preview-sidebar hidden-mobile";
    previewSidebar.innerHTML = `
            <h3>Aperçu</h3>
            <div id="preview-content">
                <div class="preview-row"><strong>Race:</strong> <span id="prev-race">-</span></div>
                <div class="preview-row"><strong>Classe:</strong> <span id="prev-spec">-</span></div>
                <hr>
                <div class="preview-stats">
                    <!-- Dynamic Stats -->
                </div>
                <div class="preview-hp">PV Max: <span id="prev-hp">-</span></div>
            </div>
        `;

    const main = document.querySelector("main.character-creation");
    main.appendChild(previewSidebar);

    // Event-driven update
    function updatePreview(state) {
      if (!state) return;

      document.getElementById("prev-race").textContent = state.race
        ? capitalize(state.race)
        : "-";
      document.getElementById("prev-spec").textContent = state.specialization
        ? capitalize(state.specialization)
        : "-";
      document.getElementById("prev-hp").textContent = state.derived
        ? state.derived.hp
        : "-";

      const statsContainer = document.querySelector(".preview-stats");
      statsContainer.innerHTML = "";

      // Use effective stats if available, otherwise base stats
      const statsToDisplay = state.effectiveStats || state.stats;

      Object.keys(statsToDisplay).forEach((k) => {
        const val = statsToDisplay[k];
        const mod = window.EdvardUtils
          ? window.EdvardUtils.calculateModifier(val)
          : Math.floor((val - 10) / 2);
        const modStr = window.EdvardUtils
          ? window.EdvardUtils.formatModifier(mod)
          : mod >= 0
            ? `+${mod}`
            : mod;

        const div = document.createElement("div");
        div.innerHTML = `<span>${k.substring(0, 3).toUpperCase()}:</span> <strong>${val}</strong> <small>(${modStr})</small>`;
        statsContainer.appendChild(div);
      });
    }

    // Listener for internal updates
    window.addEventListener("characterStateUpdated", (e) => {
      updatePreview(e.detail);
    });

    // Initial Load
    const saved = localStorage.getItem("edvard_character_autosave");
    if (saved) {
      try {
        // We need to simulate effective stats if we load raw JSON here for preview before Manager fires
        // Actually, if Manager loads, it will fire 'characterStateUpdated' potentially if triggered manually,
        // or we just parse here. The Manager handles the logic.
        // Since Manager fires no event on initial load unless we tell it to, let's just parse.
        // Note: 'effectiveStats' is computed in getState(), not stored in localStorage usually.
        // So we might just show base stats here until user interacts, OR we instantiate a temporary manager.
        // Simpler: Wait for the manager to init? Or just show base stats.
        updatePreview(JSON.parse(saved));
      } catch (e) {}
    }
  }
});

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
