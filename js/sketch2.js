// Version Three.js - Animation de rectangles en vague
(function() {
  let scene, camera, renderer;
  let startFrame = 48;
  let holdFrames = 12;
  let fadeStart = startFrame + holdFrames;
  let evo = 1;
  let fadeSpeed = 0.04;
  let waveRadius = 4;
  let frameCount = 0;
  let rectangles = [];
  let hero;

  // Fonction noise simplifiée (compatible Three.js)
  function noise(x, y, z) {
    // Utilisation de Math.sin pour simuler le bruit de Perlin
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
    return n - Math.floor(n);
  }

  function init() {
    hero = document.querySelector('#hero');
    
    // Créer la scène
    scene = new THREE.Scene();
    
    // Créer la caméra orthographique pour un rendu 2D
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera = new THREE.OrthographicCamera(
      width / -2, width / 2,
      height / 2, height / -2,
      1, 1000
    );
    camera.position.z = 500;

    // Créer le renderer
    renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Fond transparent
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    hero.appendChild(renderer.domElement);

    // Événement de redimensionnement
    window.addEventListener('resize', onWindowResize, false);

    // Démarrer l'animation
    animate();
  }

  let lastTime = 0;
  const fps = 12;
  const fpsInterval = 1000 / fps;

  function animate(currentTime) {
    requestAnimationFrame(animate);
    
    const elapsed = currentTime - lastTime;
    
    // Limiter le framerate à 12 fps
    if (elapsed > fpsInterval) {
      lastTime = currentTime - (elapsed % fpsInterval);
      frameCount++;
      draw();
      renderer.render(scene, camera);
    }
  }

  function draw() {
    // Nettoyer les rectangles précédents
    rectangles.forEach(rect => scene.remove(rect));
    rectangles = [];

    const noiseScale = 0.02;
    const marginx = window.innerWidth / 5;
    const marginy = window.innerHeight / 3;
    
    const centerX = 0;
    const centerY = 0;

    if (frameCount > fadeStart) {
      evo = Math.max(0, evo - fadeSpeed);
    }
    
    waveRadius = (frameCount - startFrame) * 100;

    if (frameCount >= startFrame) {
      for (let y = -window.innerHeight/2 + marginy; y < window.innerHeight/2 - marginy; y += 35) {
        for (let x = -window.innerWidth/2 + marginx; x < window.innerWidth/2 - marginx; x += 35) {
          const distX = x - centerX;
          const distY = y - centerY;
          const distFromCenter = Math.sqrt(distX * distX + distY * distY);
          
          const waveWidth = 80;
          const distToWave = Math.abs(distFromCenter - waveRadius);
          
          if (distToWave > waveWidth) {
            continue;
          }
          
          const nx = noiseScale * (x + window.innerWidth/2);
          const ny = noiseScale * (y + window.innerHeight/2);
          const nt = noiseScale * frameCount * 50;

          let nv = noise(nx, ny, nt);
          nv = Math.pow(nv, 4);
          
          const size = 20 + nv * 100;
          const opacity = evo;
          
          // Créer un rectangle avec Three.js
          const geometry = new THREE.PlaneGeometry(size, size);
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide
          });
          
          const rect = new THREE.Mesh(geometry, material);
          rect.position.set(x, y, 0);
          
          // Ajouter un contour (stroke)
          const edges = new THREE.EdgesGeometry(geometry);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x2209ff,
            transparent: true,
            opacity: opacity,
            linewidth: 2
          });
          const wireframe = new THREE.LineSegments(edges, lineMaterial);
          wireframe.position.set(x, y, 0.1);
          
          scene.add(rect);
          scene.add(wireframe);
          rectangles.push(rect, wireframe);
        }
      }
    }
  }

  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
  }

  // Démarrer l'initialisation quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();