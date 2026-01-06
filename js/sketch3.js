// Version Three.js de la sphère interactive
(function() {
  let scene, camera, renderer, sphere, sphereGroup, controls;
  let pins = [];
  let pinMeshes = [];
  let selectedPin = null;
  let infoPanel;
  let autoRotate = true;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let currentRotationX = 0;
  let currentRotationY = 0;
  let footerElement;
  let raycaster, mouse;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let velocityX = 0;
  let velocityY = 0;
  let friction = 0.95;
  let isAnimatingToPin = false;

  // Définir les pins avec leurs coordonnées et informations
  // MODIFIER LES POSITIONS : Changez les valeurs x, y, z pour placer les pins partout sur la sphère
  // Les coordonnées vont de -1 à 1 (elles seront multipliées par 3 pour le rayon)
  // Exemple: {x: 1, y: 0, z: 0} = à droite, {x: 0, y: 1, z: 0} = en haut, {x: 0, y: 0, z: 1} = avant
  function initPins() {
    const pinData = [
      {
        x: 1, y: 0, z: 0, // À droite
        titleKey: "pin-design-title",
        descKey: "pin-design-desc"
      },
      {
        x: -1, y: 0, z: 0, // À gauche
        titleKey: "pin-typo-title",
        descKey: "pin-typo-desc"
      },
      {
        x: 0, y: 1, z: 0, // En haut
        titleKey: "pin-editorial-title",
        descKey: "pin-editorial-desc"
      },
      {
        x: 0, y: -1, z: 0, // En bas
        titleKey: "pin-motion-title",
        descKey: "pin-motion-desc"
      },
      {
        x: 0, y: 0, z: 1, // Avant
        titleKey: "pin-digital-title",
        descKey: "pin-digital-desc"
      }
    ];

    pinData.forEach(pinInfo => {
      // Normaliser les coordonnées
      const length = Math.sqrt(pinInfo.x * pinInfo.x + pinInfo.y * pinInfo.y + pinInfo.z * pinInfo.z);
      const normalized = {
        x: (pinInfo.x / length) * 3, // Rayon de la sphère = 3
        y: (pinInfo.y / length) * 3,
        z: (pinInfo.z / length) * 3
      };

      // Créer la géométrie du pin (petite sphère)
      const geometry = new THREE.SphereGeometry(0.12, 16, 16);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x1f1f1f,
        transparent: true,
        opacity: 1
      });
      const pinMesh = new THREE.Mesh(geometry, material);
      pinMesh.position.set(normalized.x, normalized.y, normalized.z);
      
      // Stocker les données du pin avec les clés de traduction
      pinMesh.userData = {
        titleKey: pinInfo.titleKey,
        descKey: pinInfo.descKey,
        index: pins.length
      };

      sphereGroup.add(pinMesh);
      pinMeshes.push(pinMesh);
      pins.push(pinMesh);
    });
  }

  // Écouter les changements de langue
  window.addEventListener('languageChanged', function(e) {
    // Mettre à jour le panneau d'info s'il est ouvert
    if (selectedPin !== null && infoPanel.style.display === 'block') {
      const pin = pinMeshes[selectedPin];
      const title = window.i18n.get(pin.userData.titleKey);
      const desc = window.i18n.get(pin.userData.descKey);
      infoPanel.innerHTML = `
        <h3 style="margin: 0 0 10px 0; font-size: 2em;">${title}</h3>
        <p style="margin: 0; font-size: 1.2em; line-height: 1.4;">${desc}</p>
      `;
    }
  });

  function init() {
    // Récupérer le conteneur du footer (#scene-footer)
    footerElement = document.querySelector('#scene-footer');
    
    // Obtenir les dimensions du conteneur
    const canvasWidth = footerElement.clientWidth || window.innerWidth;
    const canvasHeight = footerElement.clientHeight || window.innerHeight * 0.6;

    // Créer la scène
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2209ff);

    // Créer la caméra
    camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.z = 4; // Position zoomée initiale
    camera.position.y = 1.5; // Position vers le haut pour afficher le tiers supérieur

    // Créer le renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    footerElement.appendChild(renderer.domElement);

    // Créer un groupe pour la sphère et les pins
    sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // Créer la sphère principale (wireframe)
    const sphereGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      wireframe: true 
    });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereGroup.add(sphere);

    // Raycaster pour la détection de clic
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Créer le panneau d'informations
    infoPanel = document.createElement('div');
    infoPanel.id = 'pin-info-panel';
    infoPanel.style.cssText = `
      position: fixed;
      background: rgba(18, 18, 18, 0.9);
      color: #e1e1e1;
      padding: 20px;
      border-radius: 8px;
      z-index: 1000;
      display: none;
      max-width: 250px;
      font-family: 'Bricolage Grotesque', sans-serif;
    `;
    document.body.appendChild(infoPanel);

    // Initialiser les pins
    initPins();

    // Événements
    renderer.domElement.addEventListener('click', onMouseClick, false);
    renderer.domElement.addEventListener('wheel', onMouseWheel, { passive: false });
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    renderer.domElement.addEventListener('mouseleave', onMouseUp, false);
    
    // Support tactile pour mobiles
    renderer.domElement.addEventListener('touchstart', onTouchStart, false);
    renderer.domElement.addEventListener('touchmove', onTouchMove, false);
    renderer.domElement.addEventListener('touchend', onTouchEnd, false);
    
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('scroll', onScroll, false);

    // Démarrer l'animation
    animate();
  }

  function animate() {
    requestAnimationFrame(animate);

    // Animation vers le pin sélectionné
    if (isAnimatingToPin) {
      currentRotationX += (targetRotationX - currentRotationX) * 0.1;
      currentRotationY += (targetRotationY - currentRotationY) * 0.1;
      sphereGroup.rotation.x = currentRotationX;
      sphereGroup.rotation.y = currentRotationY;
      
      // Vérifier si l'animation est terminée
      const diffX = Math.abs(targetRotationX - currentRotationX);
      const diffY = Math.abs(targetRotationY - currentRotationY);
      if (diffX < 0.001 && diffY < 0.001) {
        isAnimatingToPin = false;
      }
    }
    // Inertie après le drag
    else if (!isDragging && (Math.abs(velocityX) > 0.0001 || Math.abs(velocityY) > 0.0001)) {
      sphereGroup.rotation.y += velocityY;
      sphereGroup.rotation.x += velocityX;
      currentRotationX = sphereGroup.rotation.x;
      currentRotationY = sphereGroup.rotation.y;
      
      // Appliquer la friction
      velocityX *= friction;
      velocityY *= friction;
    }
    // Rotation automatique
    else if (autoRotate && !isDragging && selectedPin === null) {
      sphereGroup.rotation.y += 0.001;
      currentRotationY = sphereGroup.rotation.y;
    }

    renderer.render(scene, camera);
  }

  function onMouseDown(event) {
    isDragging = true;
    autoRotate = false;
    isAnimatingToPin = false;
    velocityX = 0;
    velocityY = 0;
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  }

  function onMouseMove(event) {
    if (!isDragging) return;

    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;

    // Calculer la vélocité pour l'inertie
    velocityY = deltaX * 0.005;
    velocityX = deltaY * 0.005;

    sphereGroup.rotation.y += velocityY;
    sphereGroup.rotation.x += velocityX;

    currentRotationX = sphereGroup.rotation.x;
    currentRotationY = sphereGroup.rotation.y;

    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  }

  function onMouseUp() {
    isDragging = false;
    if (selectedPin === null) {
      autoRotate = true;
    }
  }

  // Gestion tactile pour mobiles
  function onTouchStart(event) {
    if (event.touches.length === 1) {
      isDragging = true;
      autoRotate = false;
      isAnimatingToPin = false;
      velocityX = 0;
      velocityY = 0;
      previousMousePosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    }
  }

  function onTouchMove(event) {
    if (!isDragging || event.touches.length !== 1) return;
    event.preventDefault();

    const deltaX = event.touches[0].clientX - previousMousePosition.x;
    const deltaY = event.touches[0].clientY - previousMousePosition.y;

    velocityY = deltaX * 0.005;
    velocityX = deltaY * 0.005;

    sphereGroup.rotation.y += velocityY;
    sphereGroup.rotation.x += velocityX;

    currentRotationX = sphereGroup.rotation.x;
    currentRotationY = sphereGroup.rotation.y;

    previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }

  function onTouchEnd() {
    isDragging = false;
    if (selectedPin === null) {
      autoRotate = true;
    }
  }

  function onMouseClick(event) {
    // Calculer les coordonnées de la souris normalisées (-1 à +1)
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Lancer le raycaster
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(pinMeshes);

    if (intersects.length > 0) {
      // Pin cliqué
      const clickedPin = intersects[0].object;
      selectedPin = clickedPin.userData.index;
      autoRotate = false;

      // Mettre à jour les couleurs
      pinMeshes.forEach((pin, idx) => {
        pin.material.color.setHex(idx === selectedPin ? 0x1f1f1f : 0x1f1f1f);
      });

      // Afficher le panneau d'info
      showInfoPanel(clickedPin.userData, event.clientX, event.clientY);
    } else {
      // Clic en dehors des pins
      selectedPin = null;
      autoRotate = true;
      infoPanel.style.display = 'none';
      
      // Réinitialiser les couleurs
      pinMeshes.forEach(pin => {
        pin.material.color.setHex(0x1f1f1f);
      });
    }
  }

  function showInfoPanel(pinData, screenX, screenY) {
    const title = window.i18n ? window.i18n.get(pinData.titleKey) : pinData.titleKey;
    const desc = window.i18n ? window.i18n.get(pinData.descKey) : pinData.descKey;
    
    infoPanel.innerHTML = `
      <h5 style="margin: 0 0 10px 0; font-size: 2em;">${title}</h5>
      <p style="margin: 0; font-size: 1.2em; line-height: 1.4;">${desc}</p>
    `;
    infoPanel.style.left = (screenX + 12) + 'px';
    infoPanel.style.top = (screenY + 12) + 'px';
    infoPanel.style.display = 'block';
  }

  function onMouseWheel(event) {
    event.preventDefault();
    camera.position.z += event.deltaY * 0.01;
    camera.position.z = Math.max(0, Math.min(15, camera.position.z)); // Limiter le zoom
  }

  function onWindowResize() {
    if (footerElement) {
      const canvasWidth = footerElement.clientWidth || window.innerWidth;
      const canvasHeight = footerElement.clientHeight || window.innerHeight * 0.6;
      
      camera.aspect = canvasWidth / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasWidth, canvasHeight);
    }
  }

  function onScroll() {
    // Calculer la position du footer par rapport à la fenêtre
    const footerTop = footerElement.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    // Calculer le pourcentage de visibilité du footer (0 = hors écran en bas, 1 = complètement visible)
    // On commence le dézoom quand le footer commence à apparaître
    const scrollProgress = Math.max(0, Math.min(1, (windowHeight - footerTop) / windowHeight));
    
    // Interpoler entre les positions zoom et dézoom
    const minZ = 1;  // Position zoomée (proche)
    const maxZ = 10;  // Position dézoomée (loin)
    const minY = 2; // Position haute
    const maxY = 0;   // Position centrée
    
    camera.position.z = minZ + (maxZ - minZ) * scrollProgress;
    camera.position.y = minY + (maxY - minY) * scrollProgress;
  }

  // Démarrer l'initialisation quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();