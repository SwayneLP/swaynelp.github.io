let rotX = 0;
let rotY = 0;
let velX = 0;
let velY = 0;

let dragging = false;
let lastX, lastY;

function setup() {
  const container = document.getElementById("p5-container");

  const canvas = createCanvas(
    container.clientWidth,
    container.clientHeight,
    WEBGL
  );

  canvas.parent(container);

  angleMode(DEGREES);
  pixelDensity(1);

  hint(ENABLE_STROKE_PERSPECTIVE); // 🔥 ESSENTIEL
}



function windowResized() {
  const container = document.getElementById("p5-container");
  resizeCanvas(container.clientWidth, container.clientHeight);
}

function draw() {
  background("#0025FF");

  noLights(); // essentiel pour le wireframe

  // inertie
  rotX += velX;
  rotY += velY;
  velX *= 0.94;
  velY *= 0.94;

  rotateX(rotX);
  rotateY(rotY);

  const r = min(width, height) * 0.35;

  noFill(255);
  stroke(255);
  strokeWeight(3);

  sphere(r, 32, 32);
}


// Interaction souris
function mousePressed() {
  if (!isMouseInsideCanvas()) return;

  dragging = true;
  lastX = mouseX;
  lastY = mouseY;
}

function mouseReleased() {
  dragging = false;
}

function mouseDragged() {
  if (!dragging) return;

  const dx = mouseX - lastX;
  const dy = mouseY - lastY;

  velY = dx * 0.15;
  velX = dy * 0.15;

  lastX = mouseX;
  lastY = mouseY;
}

// Empêche interaction hors footer
function isMouseInsideCanvas() {
  return (
    mouseX >= 0 &&
    mouseX <= width &&
    mouseY >= 0 &&
    mouseY <= height
  );
}
