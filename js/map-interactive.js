document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('mapContainer');
    const mapWrapper = document.getElementById('mapWrapper');
    const worldMap = document.getElementById('worldMap');
    const mapPoints = document.querySelectorAll('.map-point');
    const filterButtons = document.querySelectorAll('.map-btn');
    const zoomButtons = document.querySelectorAll('.zoom-btn');
    const pointCountElement = document.getElementById('pointCount');
    const zoomLevelElement = document.getElementById('zoomLevel');

    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    let currentScale = 1;
    const minScale = 0.5;
    const maxScale = 4;
    let lastTapTime = 0;

    // Initialisation des statistiques
    pointCountElement.textContent = mapPoints.length;
    updateZoomLevel();

    // Gestion des filtres avec animation
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;

            // Active le bouton sélectionné
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Animation des points
            mapPoints.forEach(point => {
                point.style.transition = 'all 0.3s ease';
                if (filter === 'all') {
                    point.classList.remove('hidden');
                    point.style.transform = 'scale(1)';
                } else if (point.classList.contains(filter)) {
                    point.classList.remove('hidden');
                    point.style.transform = 'scale(1.2)';
                    setTimeout(() => point.style.transform = 'scale(1)', 300);
                } else {
                    point.classList.add('hidden');
                }
            });

            // Mise à jour du compteur
            const visiblePoints = document.querySelectorAll('.map-point:not(.hidden)').length;
            pointCountElement.textContent = visiblePoints;
        });
    });

    // Gestion du zoom avec animation
    function updateZoomLevel() {
        const percentage = Math.round(currentScale * 100);
        zoomLevelElement.textContent = `${percentage}%`;
    }

    function setZoom(scale, originX = mapWrapper.offsetWidth / 2, originY = mapWrapper.offsetHeight / 2) {
        const oldScale = currentScale;
        currentScale = Math.min(Math.max(scale, minScale), maxScale);

        if (oldScale !== currentScale) {
            const rect = mapWrapper.getBoundingClientRect();
            const x = originX - rect.left;
            const y = originY - rect.top;

            mapContainer.style.transformOrigin = `${x}px ${y}px`;
            mapContainer.style.transform = `scale(${currentScale})`;
            updateZoomLevel();
        }
    }

    zoomButtons.forEach(button => {
        button.addEventListener('click', () => {
            const zoomType = button.dataset.zoom;
            if (zoomType === 'in') {
                setZoom(currentScale * 1.2);
            } else if (zoomType === 'out') {
                setZoom(currentScale * 0.8);
            } else if (zoomType === 'reset') {
                currentScale = 1;
                mapContainer.style.transform = 'scale(1)';
                updateZoomLevel();
            }
        });
    });

    // Gestion du déplacement amélioré
    function startDragging(e) {
        const touch = e.type === 'touchstart' ? e.touches[0] : e;
        isDragging = true;
        mapWrapper.classList.add('grabbing');

        startX = touch.pageX - mapWrapper.offsetLeft;
        startY = touch.pageY - mapWrapper.offsetTop;
        scrollLeft = mapWrapper.scrollLeft;
        scrollTop = mapWrapper.scrollTop;
    }

    function stopDragging() {
        isDragging = false;
        mapWrapper.classList.remove('grabbing');
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const touch = e.type === 'touchmove' ? e.touches[0] : e;
        const x = touch.pageX - mapWrapper.offsetLeft;
        const y = touch.pageY - mapWrapper.offsetTop;
        const moveX = (x - startX) * 2;
        const moveY = (y - startY) * 2;

        mapWrapper.scrollLeft = scrollLeft - moveX;
        mapWrapper.scrollTop = scrollTop - moveY;
    }

    // Événements tactiles et souris
    mapWrapper.addEventListener('mousedown', startDragging);
    mapWrapper.addEventListener('mousemove', drag);
    mapWrapper.addEventListener('mouseup', stopDragging);
    mapWrapper.addEventListener('mouseleave', stopDragging);
    mapWrapper.addEventListener('touchstart', startDragging);
    mapWrapper.addEventListener('touchmove', drag);
    mapWrapper.addEventListener('touchend', stopDragging);

    // Double-tap pour zoomer sur mobile
    mapWrapper.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;

        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            const touch = e.changedTouches[0];
            setZoom(currentScale * 1.5, touch.pageX, touch.pageY);
        }
        lastTapTime = currentTime;
    });

    // Zoom à la molette avec position du curseur
    mapWrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = mapWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setZoom(currentScale * (e.deltaY > 0 ? 0.9 : 1.1), x, y);
    });

    // Animation des points au chargement
    mapPoints.forEach((point, index) => {
        point.style.opacity = '0';
        point.style.transform = 'scale(0.5)';

        setTimeout(() => {
            point.style.transition = 'all 0.5s ease';
            point.style.opacity = '1';
            point.style.transform = 'scale(1)';
        }, index * 100);
    });

    // Initialisation
    document.querySelector('[data-filter="all"]').classList.add('active');
});
