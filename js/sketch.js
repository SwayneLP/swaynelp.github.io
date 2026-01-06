
// Multi-scale organic blocks animation
// Blocks originate near the canvas center, grow, hold, then fade outward.

// Parameters
let startFrame = 24;       // frame when animation begins
let holdFrames = 90;       // frames to hold at full size
let growDuration = 16;     // frames to grow from 0 -> target size
let fadeDuration = 40;     // frames to fade out
let areaFraction = 0.45;   // central area fraction used for composition (0..1)

// multi-scale block sizes and placement thresholds
let levels = [140, 70, 35, 17, 7];
let thresholds = [0.78, 0.72, 0.62, 0.52, 0.45];

let cells = [];

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('pointer-events', 'none');
  cnv.style('background', 'transparent');
  frameRate(60);
  rectMode(CENTER);
  initCells();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initCells();
}

function initCells() {
  cells = [];

  const cx = windowWidth / 2;
  const cy = windowHeight / 2;
  const areaW = windowWidth * areaFraction;
  const areaH = windowHeight * areaFraction;
  const startX = cx - areaW / 2;
  const endX = cx + areaW / 2;
  const startY = cy - areaH / 2;
  const endY = cy + areaH / 2;

  // coverage grid based on smallest step to avoid overlaps
  const step = levels[levels.length - 1];
  const cols = ceil(areaW / step) + 4;
  const rows = ceil(areaH / step) + 4;
  let covered = new Array(rows);
  for (let r = 0; r < rows; r++) covered[r] = new Array(cols).fill(false);

  function markCovered(px, py, w, h) {
    const sx = floor((px - startX) / step);
    const sy = floor((py - startY) / step);
    const ew = max(1, ceil(w / step));
    const eh = max(1, ceil(h / step));
    for (let ry = sy; ry < sy + eh; ry++) {
      for (let rx = sx; rx < sx + ew; rx++) {
        if (ry >= 0 && ry < rows && rx >= 0 && rx < cols) covered[ry][rx] = true;
      }
    }
  }

  const maxDist = sqrt((areaW/2)*(areaW/2) + (areaH/2)*(areaH/2));

  // iterate from large to small to prioritize big shapes
  for (let li = 0; li < levels.length; li++) {
    const L = levels[li];
    const thresh = thresholds[li] ?? 0.5;
    for (let y = startY; y <= endY; y += L) {
      for (let x = startX; x <= endX; x += L) {
        const sx = floor((x - startX) / step);
        const sy = floor((y - startY) / step);
        if (sy >= 0 && sy < rows && sx >= 0 && sx < cols && covered[sy][sx]) continue;

        const n = noise(x * 0.004, y * 0.004, li * 10);
        if (n > thresh) {
          const d = dist(x + L/2, y + L/2, cx, cy);
          const dn = maxDist > 0 ? d / maxDist : 0;
          const jitter = floor(noise(x * 0.01, y * 0.01) * 12);
          const appear = startFrame + floor(dn * 12) + jitter;
          const fade = appear + growDuration + holdFrames + floor(dn * 10);
          const target = L * (0.9 + noise(x * 0.02, y * 0.02) * 0.9);
          cells.push({x: x + L/2, y: y + L/2, size: target, appear: appear, fade: fade});
          markCovered(x, y, L, L);
        }
      }
    }
  }
}

function draw() {
  clear();
  const f = frameCount;
  noStroke();
  for (let c of cells) {
    if (f < c.appear) continue;
    const tg = constrain((f - c.appear) / growDuration, 0, 1);
    const se = 1 - pow(1 - tg, 3);
    const s = c.size * se;
    let a = 255;
    if (f >= c.fade) {
      const tf = constrain((f - c.fade) / fadeDuration, 0, 1);
      a = 255 * (1 - tf);
    }
    if (a <= 0) continue;
    fill(0, a);
    rect(c.x, c.y, s, s);
  }
}

