// Classe Carousel pour gérer le carrousel
class Carousel {
    constructor(container) {
        this.container = container;
        this.track = container.querySelector('.carousel-track');
        this.slides = Array.from(container.querySelectorAll('.carousel-slide'));
        this.buttons = {
            prev: container.querySelector('.carousel-button.prev'),
            next: container.querySelector('.carousel-button.next')
        };
        this.dotsContainer = container.querySelector('.carousel-dots');
        
        this.currentIndex = 0;
        this.slidesCount = this.slides.length;
        
        this.init();
    }
    
    init() {
        // Créer les points de navigation
        this.slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
        
        // Configurer les boutons
        this.buttons.prev.addEventListener('click', () => this.prev());
        this.buttons.next.addEventListener('click', () => this.next());
        
        // Activer le défilement automatique
        this.startAutoPlay();
        
        // Pause au survol
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
        
        // Gestion du swipe sur mobile
        this.setupTouchEvents();
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.slidesCount) % this.slidesCount;
        this.updateCarousel();
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.slidesCount;
        this.updateCarousel();
    }
    
    updateCarousel() {
        // Mettre à jour la position du track
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;
        
        // Mettre à jour les points
        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => this.next(), 5000);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
    
    setupTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, false);
        
        this.container.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
        }, false);
        
        this.container.addEventListener('touchend', () => {
            const difference = touchStartX - touchEndX;
            if (Math.abs(difference) > 50) { // Minimum de 50px pour déclencher le swipe
                if (difference > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        }, false);
    }
}

// Points d'intérêt sur la carte
const mapPoints = [
    {
        x: 25,
        y: 35,
        name: "Néo-Arcadia",
        description: "La capitale technologique, centre névralgique de la civilisation moderne."
    },
    {
        x: 65,
        y: 45,
        name: "Forêt des Anciens",
        description: "Une forêt mystique où la technologie des Anciens fusionne avec la nature."
    },
    {
        x: 45,
        y: 75,
        name: "Les Terres Désolées",
        description: "Vestiges d'une guerre antique, où rôdent des créatures mi-organiques, mi-machines."
    }
];

// Gestion de la carte interactive
function initializeMap() {
    const map = document.getElementById('worldMap');
    if (!map) return;

    const mapWrapper = map.closest('.map-wrapper');
    const points = document.querySelectorAll('.map-point');
    
    // Variables pour le zoom et le déplacement
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    let scale = 1;
    const MAX_SCALE = 2;
    const MIN_SCALE = 1;

    // Fonction de zoom
    function handleZoom(e) {
        e.preventDefault();
        
        const delta = e.deltaY * -0.01;
        scale = Math.min(Math.max(scale + delta, MIN_SCALE), MAX_SCALE);
        
        map.style.transform = `scale(${scale})`;
        points.forEach(point => {
            const originalLeft = parseFloat(point.style.left);
            const originalTop = parseFloat(point.style.top);
            point.style.transform = `translate(-50%, -50%) scale(${1/scale})`;
        });
    }

    // Gestion du déplacement
    function handleMouseDown(e) {
        isDragging = true;
        mapWrapper.style.cursor = 'grabbing';
        
        startX = e.pageX - mapWrapper.offsetLeft;
        startY = e.pageY - mapWrapper.offsetTop;
        scrollLeft = mapWrapper.scrollLeft;
        scrollTop = mapWrapper.scrollTop;
    }

    function handleMouseUp() {
        isDragging = false;
        mapWrapper.style.cursor = 'grab';
    }

    function handleMouseMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        const x = e.pageX - mapWrapper.offsetLeft;
        const y = e.pageY - mapWrapper.offsetTop;
        
        const walkX = (x - startX) * 1.5;
        const walkY = (y - startY) * 1.5;
        
        mapWrapper.scrollLeft = scrollLeft - walkX;
        mapWrapper.scrollTop = scrollTop - walkY;
    }

    // Ajout des événements
    mapWrapper.addEventListener('wheel', handleZoom);
    mapWrapper.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    // Style initial du curseur
    mapWrapper.style.cursor = 'grab';
    
    // Animation des points au survol
    points.forEach(point => {
        point.addEventListener('mouseenter', () => {
            point.style.zIndex = '100';
        });
        
        point.addEventListener('mouseleave', () => {
            point.style.zIndex = '1';
        });
    });
}

// Initialisation de la carte interactive
function initializeMapPoints() {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;

    const pointsContainer = mapContainer.querySelector('.map-points');
    
    mapPoints.forEach(point => {
        const pointElement = document.createElement('div');
        pointElement.className = 'map-point';
        pointElement.style.left = `${point.x}%`;
        pointElement.style.top = `${point.y}%`;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'map-tooltip';
        tooltip.innerHTML = `
            <h4>${point.name}</h4>
            <p>${point.description}</p>
        `;
        
        pointElement.appendChild(tooltip);
        pointsContainer.appendChild(pointElement);
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        new Carousel(carouselContainer);
    }
    
    // Initialisation de la carte si on est sur la page univers-lore
    initializeMap();
    initializeMapPoints();
    
    // Smooth scroll pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Gestion de la barre de recherche
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            // La logique de recherche sera implémentée ici
            console.log('Recherche:', searchTerm);
        });
    }
});

// Navigation mobile
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links li');

if (burger) {
    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');
        
        // Toggle Burger Animation
        burger.classList.toggle('active');
        
        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
    });
}

// Fermer le menu mobile lors du clic sur un lien
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (nav.classList.contains('nav-active')) {
            nav.classList.remove('nav-active');
            burger.classList.remove('active');
            
            navLinks.forEach(link => {
                link.style.animation = '';
            });
        }
    });
});

// Fermer le menu mobile lors du défilement
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && nav.classList.contains('nav-active')) {
        nav.classList.remove('nav-active');
        burger.classList.remove('active');
        
        navLinks.forEach(link => {
            link.style.animation = '';
        });
    }
    lastScrollTop = scrollTop;
});

// Animation du header au scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll) {
        // Scroll vers le bas
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scroll vers le haut
        header.style.transform = 'translateY(0)';
    }

    lastScroll = currentScroll;
});
