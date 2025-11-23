document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const searchInput = document.getElementById('creature-search');
    const typeFilter = document.getElementById('type-filter');
    const levelFilter = document.getElementById('level-filter');
    const habitatFilter = document.getElementById('habitat-filter');
    const creatureCards = document.querySelectorAll('.creature-card');
    const activeFiltersContainer = document.querySelector('.active-filters');
    const sortSelect = document.getElementById('sort-creatures');
    const viewToggle = document.getElementById('view-toggle');
    const bestiaryContent = document.querySelector('.bestiary-content');

    // État des filtres et préférences
    let activeFilters = {
        search: '',
        type: 'all',
        level: 'all',
        habitat: 'all'
    };

    let favorites = JSON.parse(localStorage.getItem('bestiaryFavorites')) || [];
    let currentView = localStorage.getItem('bestiaryView') || 'grid';

    // Initialisation de la vue
    function initializeView() {
        bestiaryContent.classList.add(currentView);
        viewToggle.querySelector(`[data-view="${currentView}"]`).classList.add('active');
    }

    // Gestion des favoris
    function toggleFavorite(creatureId) {
        const index = favorites.indexOf(creatureId);
        if (index === -1) {
            favorites.push(creatureId);
        } else {
            favorites.splice(index, 1);
        }
        localStorage.setItem('bestiaryFavorites', JSON.stringify(favorites));
        updateFavoriteButtons();
    }

    function updateFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const creatureId = btn.closest('.creature-card').dataset.id;
            btn.classList.toggle('active', favorites.includes(creatureId));
        });
    }

    // Fonction pour mettre à jour l'affichage des filtres actifs
    function updateActiveFiltersDisplay() {
        activeFiltersContainer.innerHTML = '';

        Object.entries(activeFilters).forEach(([key, value]) => {
            if (value !== 'all' && value !== '') {
                const filterTag = document.createElement('span');
                filterTag.className = 'filter-tag';
                filterTag.innerHTML = `
                    ${key}: ${value}
                    <button onclick="removeFilter('${key}')">&times;</button>
                `;
                activeFiltersContainer.appendChild(filterTag);
            }
        });
    }

    // Fonction pour trier les créatures
    function sortCreatures(criteria) {
        const cards = Array.from(creatureCards);

        cards.sort((a, b) => {
            switch(criteria) {
                case 'name':
                    return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent);
                case 'level':
                    return parseInt(a.dataset.level) - parseInt(b.dataset.level);
                case 'type':
                    return a.dataset.type.localeCompare(b.dataset.type);
                default:
                    return 0;
            }
        });

        cards.forEach(card => bestiaryContent.appendChild(card));
    }

    // Fonction pour changer la vue
    function changeView(view) {
        bestiaryContent.classList.remove('grid', 'list');
        bestiaryContent.classList.add(view);
        localStorage.setItem('bestiaryView', view);

        viewToggle.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    }

    // Fonction pour filtrer les créatures
    function filterCreatures() {
        creatureCards.forEach(card => {
            const type = card.dataset.type;
            const level = parseInt(card.dataset.level);
            const habitat = card.dataset.habitat;
            const name = card.querySelector('h3').textContent.toLowerCase();

            // Vérification des critères de filtrage
            const matchesSearch = name.includes(activeFilters.search.toLowerCase());
            const matchesType = activeFilters.type === 'all' || type === activeFilters.type;
            const matchesHabitat = activeFilters.habitat === 'all' || habitat === activeFilters.habitat;

            let matchesLevel = true;
            if (activeFilters.level !== 'all') {
                const [min, max] = activeFilters.level.split('-').map(Number);
                matchesLevel = level >= min && level <= max;
            }

            // Afficher ou masquer la carte avec animation
            if (matchesSearch && matchesType && matchesLevel && matchesHabitat) {
                card.style.display = '';
                card.style.animation = 'none';
                card.offsetHeight; // Force reflow
                card.style.animation = 'cardAppear 0.3s ease-out forwards';
            } else {
                card.style.animation = 'cardDisappear 0.3s ease-out forwards';
                setTimeout(() => {
                    if (!matchesSearch || !matchesType || !matchesLevel || !matchesHabitat) {
                        card.style.display = 'none';
                    }
                }, 300);
            }
        });

        updateActiveFiltersDisplay();
    }

    // Fonction pour afficher les détails d'une créature
    function showCreatureDetails(card) {
        const modal = document.createElement('div');
        modal.className = 'creature-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">&times;</button>
                <div class="creature-details">
                    ${card.innerHTML}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        modal.querySelector('.close-modal').onclick = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };
    }

    // Écouteurs d'événements
    searchInput.addEventListener('input', (e) => {
        activeFilters.search = e.target.value;
        filterCreatures();
    });

    typeFilter.addEventListener('change', (e) => {
        activeFilters.type = e.target.value;
        filterCreatures();
    });

    levelFilter.addEventListener('change', (e) => {
        activeFilters.level = e.target.value;
        filterCreatures();
    });

    habitatFilter.addEventListener('change', (e) => {
        activeFilters.habitat = e.target.value;
        filterCreatures();
    });

    sortSelect.addEventListener('change', (e) => {
        sortCreatures(e.target.value);
    });

    viewToggle.addEventListener('click', (e) => {
        if (e.target.dataset.view) {
            changeView(e.target.value);
        }
    });

    // Délégation d'événements pour les cartes de créatures
    bestiaryContent.addEventListener('click', (e) => {
        const card = e.target.closest('.creature-card');
        if (!card) return;

        if (e.target.closest('.favorite-btn')) {
            toggleFavorite(card.dataset.id);
        } else {
            showCreatureDetails(card);
        }
    });

    // Initialisation
    initializeView();
    updateFavoriteButtons();
    filterCreatures();
});
