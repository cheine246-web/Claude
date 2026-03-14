// ─── PIXEL POLIZIST ─── Pokemon-Style Mobile Game ───────────────────────────

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Responsive sizing
const TILE = 16;
const COLS = 12;
const ROWS = 10;
let SCALE = 2;

function resize() {
  const maxW = Math.min(window.innerWidth - 16, 480);
  const maxH = window.innerHeight * 0.52;
  SCALE = Math.floor(Math.min(maxW / (COLS * TILE), maxH / (ROWS * TILE)));
  if (SCALE < 1) SCALE = 1;
  canvas.width  = COLS * TILE * SCALE;
  canvas.height = ROWS * TILE * SCALE;
  ctx.imageSmoothingEnabled = false;
}
resize();
window.addEventListener('resize', () => { resize(); render(); });

// ─── GAME STATE ──────────────────────────────────────────────────────────────
const state = {
  floor: 0, // 0=Keller(Gym), 1=Erdgeschoss(Küche), 2=1.OG(Schlafraum)
  player: { x: 5, y: 5, dir: 2, frame: 0, moving: false },
  stats: { kraft: 30, hunger: 70, energie: 80 },
  dialog: null,
  dialogQueue: [],
  animTick: 0,
  trainCooldown: 0,
  eatCooldown: 0,
  sleepCooldown: 0,
  keys: {},
  moveTimer: 0,
};

// ─── FLOORS ──────────────────────────────────────────────────────────────────
// Tile IDs: 0=floor, 1=wall, 2=stairs_up, 3=stairs_down, 10=locker, 11=bench,
//           12=barbell, 13=dumbbell, 14=fridge, 15=table, 16=bed, 17=window,
//           18=counter, 19=door, 20=mat

const floors = [
  // ── KELLER (Gym) ──
  {
    name: 'Keller – Kraftraum',
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,12,0,12,0,12,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,20,20,0,1],
      [1,0,13,0,13,0,13,0,20,20,0,1],
      [1,0,0,0,0,0,0,0,20,20,0,1],
      [1,0,11,11,0,0,11,11,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,10,10,10,0,0,3,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    stairsUp: {x:9, y:8},
  },
  // ── ERDGESCHOSS (Küche/Aufenthaltsraum) ──
  {
    name: 'EG – Aufenthaltsraum',
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,17,0,0,0,0,0,0,0,17,17,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,15,15,0,0,18,18,18,18,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,15,15,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,14,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,3,0,0,0,0,0,0,2,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    stairsDown: {x:2, y:8},
    stairsUp:   {x:9, y:8},
  },
  // ── 1. OG (Schlafraum) ──
  {
    name: '1. OG – Schlafraum',
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,17,0,0,0,0,0,0,0,17,17,1],
      [1,0,16,0,0,16,0,0,16,0,0,1],
      [1,0,16,0,0,16,0,0,16,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,16,0,0,16,0,0,16,0,0,1],
      [1,0,16,0,0,16,0,0,16,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,3,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    stairsDown: {x:2, y:8},
  },
];

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  wall:    '#2c3e50',
  wallTop: '#34495e',
  floor:   '#7f8c8d',
  floorAlt:'#95a5a6',
  gymFloor:'#6b5a3e',
  gymFloorAlt:'#7a6a4e',
  kitFloor:'#c9b99a',
  kitFloorAlt:'#d4c4a8',
  bedFloor:'#b0c4de',
  bedFloorAlt:'#bed0e8',
  stairUp: '#4a90d9',
  stairDn: '#e67e22',
  locker:  '#607d8b',
  bench:   '#795548',
  barbell: '#455a64',
  dumbbell:'#546e7a',
  fridge:  '#ecf0f1',
  fridgeDoor:'#bdc3c7',
  table:   '#a0522d',
  bed:     '#3498db',
  bedSheet:'#ecf0f1',
  pillow:  '#f0f0e0',
  window:  '#87ceeb',
  counter: '#c0392b',
  mat:     '#e74c3c',
  matBorder:'#c0392b',
};

// ─── TILE RENDERER ───────────────────────────────────────────────────────────
function drawTile(tx, ty, id, floorIdx) {
  const x = tx * TILE * SCALE;
  const y = ty * TILE * SCALE;
  const S = SCALE;
  const T = TILE * S;

  // Checkerboard floor base
  const isEven = (tx + ty) % 2 === 0;
  let fc, fc2;
  if (floorIdx === 0) { fc = C.gymFloor; fc2 = C.gymFloorAlt; }
  else if (floorIdx === 1) { fc = C.kitFloor; fc2 = C.kitFloorAlt; }
  else { fc = C.bedFloor; fc2 = C.bedFloorAlt; }

  if (id === 0 || id >= 10) {
    ctx.fillStyle = isEven ? fc : fc2;
    ctx.fillRect(x, y, T, T);
  }

  switch(id) {
    case 1: // wall
      ctx.fillStyle = C.wall;
      ctx.fillRect(x, y, T, T);
      ctx.fillStyle = C.wallTop;
      ctx.fillRect(x, y, T, 3*S);
      // brick lines
      ctx.fillStyle = '#243342';
      for (let r = 0; r < 4; r++) {
        const off = (r % 2) * 4 * S;
        ctx.fillRect(x + off, y + r*4*S, 1*S, 4*S);
        ctx.fillRect(x + off + 8*S, y + r*4*S, 1*S, 4*S);
      }
      break;

    case 2: // stairs up
      ctx.fillStyle = C.stairUp;
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + i*4*S, y + (3-i)*4*S, T - i*4*S, 2*S);
      }
      ctx.fillStyle = '#fff';
      ctx.fillRect(x+5*S, y+1*S, 6*S, 2*S);
      drawText(ctx, '▲', x + T/2, y + T*0.65, 8*S, '#fff');
      break;

    case 3: // stairs down
      ctx.fillStyle = C.stairDn;
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x, y + i*4*S, T - i*4*S, 2*S);
      }
      ctx.fillStyle = '#fff';
      ctx.fillRect(x+5*S, y+11*S, 6*S, 2*S);
      drawText(ctx, '▼', x + T/2, y + T*0.65, 8*S, '#fff');
      break;

    case 10: { // locker
      ctx.fillStyle = '#455a64';
      ctx.fillRect(x+1*S, y+1*S, 14*S, 14*S);
      ctx.fillStyle = C.locker;
      ctx.fillRect(x+2*S, y+2*S, 5*S, 12*S);
      ctx.fillRect(x+9*S, y+2*S, 5*S, 12*S);
      ctx.fillStyle = '#90a4ae';
      ctx.fillRect(x+6*S, y+7*S, 4*S, 2*S);
      // handle
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x+4*S, y+8*S, 1*S, 2*S);
      ctx.fillRect(x+11*S, y+8*S, 1*S, 2*S);
      break;
    }
    case 11: { // bench
      ctx.fillStyle = C.bench;
      ctx.fillRect(x+1*S, y+5*S, 14*S, 4*S);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(x+2*S, y+9*S, 3*S, 5*S);
      ctx.fillRect(x+11*S, y+9*S, 3*S, 5*S);
      ctx.fillRect(x+2*S, y+4*S, 3*S, 2*S);
      ctx.fillRect(x+11*S, y+4*S, 3*S, 2*S);
      break;
    }
    case 12: { // barbell
      ctx.fillStyle = '#78909c';
      ctx.fillRect(x+0*S, y+6*S, 16*S, 4*S);
      ctx.fillStyle = '#455a64';
      ctx.fillRect(x+0*S, y+4*S, 3*S, 8*S);
      ctx.fillRect(x+13*S, y+4*S, 3*S, 8*S);
      ctx.fillStyle = '#37474f';
      ctx.fillRect(x+0*S, y+3*S, 3*S, 3*S);
      ctx.fillRect(x+13*S, y+3*S, 3*S, 3*S);
      ctx.fillRect(x+0*S, y+10*S, 3*S, 3*S);
      ctx.fillRect(x+13*S, y+10*S, 3*S, 3*S);
      break;
    }
    case 13: { // dumbbell
      ctx.fillStyle = '#78909c';
      ctx.fillRect(x+4*S, y+7*S, 8*S, 2*S);
      ctx.fillStyle = '#455a64';
      ctx.fillRect(x+1*S, y+5*S, 3*S, 6*S);
      ctx.fillRect(x+12*S, y+5*S, 3*S, 6*S);
      ctx.fillStyle = '#37474f';
      ctx.fillRect(x+1*S, y+4*S, 3*S, 2*S);
      ctx.fillRect(x+12*S, y+4*S, 3*S, 2*S);
      ctx.fillRect(x+1*S, y+10*S, 3*S, 2*S);
      ctx.fillRect(x+12*S, y+10*S, 3*S, 2*S);
      break;
    }
    case 14: { // fridge
      ctx.fillStyle = C.fridge;
      ctx.fillRect(x+2*S, y+1*S, 12*S, 14*S);
      ctx.fillStyle = C.fridgeDoor;
      ctx.fillRect(x+3*S, y+2*S, 10*S, 5*S);
      ctx.fillRect(x+3*S, y+8*S, 10*S, 6*S);
      ctx.fillStyle = '#aaa';
      ctx.fillRect(x+4*S, y+3*S, 1*S, 3*S);
      ctx.fillRect(x+4*S, y+9*S, 1*S, 4*S);
      // glow line
      ctx.fillStyle = '#a8edea';
      ctx.fillRect(x+2*S, y+7*S, 12*S, 1*S);
      break;
    }
    case 15: { // table
      ctx.fillStyle = C.table;
      ctx.fillRect(x+1*S, y+3*S, 14*S, 2*S);
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(x+2*S, y+5*S, 2*S, 9*S);
      ctx.fillRect(x+12*S, y+5*S, 2*S, 9*S);
      // tabletop sheen
      ctx.fillStyle = '#cd853f';
      ctx.fillRect(x+1*S, y+3*S, 14*S, 1*S);
      break;
    }
    case 16: { // bed
      ctx.fillStyle = '#1a5276';
      ctx.fillRect(x+1*S, y+1*S, 14*S, 14*S);
      ctx.fillStyle = C.bedSheet;
      ctx.fillRect(x+2*S, y+4*S, 12*S, 10*S);
      ctx.fillStyle = C.pillow;
      ctx.fillRect(x+3*S, y+2*S, 10*S, 3*S);
      ctx.fillStyle = '#d0d0c0';
      ctx.fillRect(x+5*S, y+2*S, 6*S, 3*S);
      break;
    }
    case 17: { // window
      ctx.fillStyle = C.window;
      ctx.fillRect(x+1*S, y+1*S, 14*S, 14*S);
      ctx.fillStyle = '#c8e6ff';
      ctx.fillRect(x+2*S, y+2*S, 6*S, 6*S);
      ctx.fillRect(x+9*S, y+2*S, 5*S, 6*S);
      ctx.fillRect(x+2*S, y+9*S, 6*S, 5*S);
      ctx.fillRect(x+9*S, y+9*S, 5*S, 5*S);
      ctx.fillStyle = '#a0cfee';
      ctx.fillRect(x+1*S, y+7*S, 14*S, 2*S);
      ctx.fillRect(x+7*S, y+1*S, 2*S, 14*S);
      break;
    }
    case 18: { // counter
      ctx.fillStyle = C.counter;
      ctx.fillRect(x+0*S, y+0*S, 16*S, 12*S);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(x+0*S, y+0*S, 16*S, 3*S);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(x+0*S, y+11*S, 16*S, 1*S);
      // microwave-ish
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(x+2*S, y+4*S, 8*S, 6*S);
      ctx.fillStyle = '#1abc9c';
      ctx.fillRect(x+3*S, y+5*S, 6*S, 4*S);
      break;
    }
    case 20: { // mat
      ctx.fillStyle = C.mat;
      ctx.fillRect(x+0*S, y+0*S, 16*S, 16*S);
      ctx.fillStyle = C.matBorder;
      ctx.fillRect(x+0*S, y+0*S, 16*S, 2*S);
      ctx.fillRect(x+0*S, y+14*S, 16*S, 2*S);
      ctx.fillRect(x+0*S, y+0*S, 2*S, 16*S);
      ctx.fillRect(x+14*S, y+0*S, 2*S, 16*S);
      break;
    }
  }
}

// ─── PLAYER SPRITE ───────────────────────────────────────────────────────────
// dir: 0=up, 1=right, 2=down, 3=left
function drawPlayer(px, py, dir, frame) {
  const x = px * TILE * SCALE;
  const y = py * TILE * SCALE;
  const S = SCALE;
  const legOff = frame % 4 < 2 ? 1*S : 0; // walking animation

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x+3*S, y+14*S, 10*S, 2*S);

  // Legs
  ctx.fillStyle = '#2c3e50';
  if (dir === 2 || dir === 0) {
    ctx.fillRect(x+4*S, y+10*S, 3*S, 5*S + (frame%4<2?-legOff:legOff));
    ctx.fillRect(x+9*S, y+10*S, 3*S, 5*S + (frame%4<2?legOff:-legOff));
  } else {
    ctx.fillRect(x+4*S, y+10*S, 3*S, 5*S);
    ctx.fillRect(x+9*S, y+10*S, 3*S, 5*S);
  }

  // Boots
  ctx.fillStyle = '#1a252f';
  ctx.fillRect(x+3*S, y+13*S, 4*S, 3*S);
  ctx.fillRect(x+9*S, y+13*S, 4*S, 3*S);

  // Body - police uniform (green)
  ctx.fillStyle = '#4a5568';
  ctx.fillRect(x+3*S, y+6*S, 10*S, 7*S);

  // Police vest/jacket details
  ctx.fillStyle = '#2d3748';
  ctx.fillRect(x+3*S, y+6*S, 3*S, 7*S);
  ctx.fillRect(x+10*S, y+6*S, 3*S, 7*S);

  // Badge
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(x+6*S, y+7*S, 4*S, 3*S);
  ctx.fillStyle = '#ffec6e';
  ctx.fillRect(x+7*S, y+8*S, 2*S, 1*S);

  // Belt
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x+3*S, y+11*S, 10*S, 2*S);
  ctx.fillStyle = '#888';
  ctx.fillRect(x+7*S, y+11*S, 2*S, 2*S);

  // Arms
  ctx.fillStyle = '#4a5568';
  if (dir === 2 || dir === 0) {
    ctx.fillRect(x+1*S, y+7*S, 2*S, 5*S);
    ctx.fillRect(x+13*S, y+7*S, 2*S, 5*S);
  } else if (dir === 1) {
    ctx.fillRect(x+13*S, y+7*S, 3*S, 5*S);
  } else {
    ctx.fillRect(x+0*S, y+7*S, 3*S, 5*S);
  }

  // Hands
  ctx.fillStyle = '#f0c8a0';
  ctx.fillRect(x+1*S, y+11*S, 2*S, 2*S);
  ctx.fillRect(x+13*S, y+11*S, 2*S, 2*S);

  // Head
  ctx.fillStyle = '#f0c8a0';
  ctx.fillRect(x+4*S, y+1*S, 8*S, 6*S);

  // Hair
  ctx.fillStyle = '#3e2008';
  ctx.fillRect(x+4*S, y+1*S, 8*S, 2*S);

  // Face based on direction
  if (dir === 2) { // facing down
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x+5*S, y+4*S, 2*S, 2*S); // eyes
    ctx.fillRect(x+9*S, y+4*S, 2*S, 2*S);
    ctx.fillStyle = '#c0504a';
    ctx.fillRect(x+6*S, y+6*S, 4*S, 1*S); // mouth
  } else if (dir === 0) { // facing up
    ctx.fillStyle = '#3e2008';
    ctx.fillRect(x+4*S, y+1*S, 8*S, 3*S);
  } else if (dir === 1) { // right
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x+10*S, y+4*S, 2*S, 2*S);
  } else { // left
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x+4*S, y+4*S, 2*S, 2*S);
  }

  // Helmet / Mütze
  ctx.fillStyle = '#2d3748';
  ctx.fillRect(x+3*S, y+0*S, 10*S, 3*S);
  ctx.fillRect(x+2*S, y+2*S, 12*S, 2*S); // brim
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(x+6*S, y+1*S, 4*S, 1*S); // band
}

// ─── HELPER: pixel text ──────────────────────────────────────────────────────
function drawText(c, text, x, y, size, color) {
  c.font = `${size}px monospace`;
  c.fillStyle = color || '#fff';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(text, x, y);
}

// ─── RENDER ──────────────────────────────────────────────────────────────────
function render() {
  const f = floors[state.floor];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw tiles
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      drawTile(tx, ty, f.map[ty][tx], state.floor);
    }
  }

  // Draw player
  drawPlayer(state.player.x, state.player.y, state.player.dir, state.animTick);

  // Floor label
  const container = document.getElementById('gameContainer');
  let lbl = document.getElementById('floorLabel');
  if (!lbl) {
    lbl = document.createElement('div');
    lbl.id = 'floorLabel';
    lbl.style.cssText = 'position:absolute;top:6px;right:8px;background:#0d1b2acc;color:#4a90d9;font-size:10px;padding:2px 6px;border:1px solid #4a90d9;border-radius:3px;font-family:monospace;pointer-events:none;';
    canvas.parentElement.style.position = 'relative';
    canvas.parentElement.appendChild(lbl);
  }
  lbl.textContent = f.name;

  // Dialog box
  const dlgBox = document.getElementById('dialogBox');
  if (state.dialog) {
    dlgBox.style.display = 'block';
    document.getElementById('dialogText').textContent = state.dialog.text;
    document.getElementById('dialogContinue').textContent = state.dialog.last ? '▶ OK' : '▶ Weiter';
    dlgBox.style.position = 'absolute';
    dlgBox.style.width = canvas.width + 'px';
  } else {
    dlgBox.style.display = 'none';
  }
}

// ─── STATS UI ────────────────────────────────────────────────────────────────
function updateStats() {
  const s = state.stats;
  document.getElementById('barKraft').style.width   = Math.max(0, Math.min(100, s.kraft))   + '%';
  document.getElementById('barHunger').style.width  = Math.max(0, Math.min(100, s.hunger))  + '%';
  document.getElementById('barEnergie').style.width = Math.max(0, Math.min(100, s.energie)) + '%';

  // Color feedback
  const barH = document.getElementById('barHunger');
  barH.style.background = s.hunger < 25 ? '#e74c3c' : '#f39c12';
  const barE = document.getElementById('barEnergie');
  barE.style.background = s.energie < 25 ? '#e74c3c' : '#2ecc71';
}

// ─── DIALOG SYSTEM ───────────────────────────────────────────────────────────
function showDialog(lines) {
  state.dialogQueue = [...lines];
  advanceDialog();
}

function advanceDialog() {
  if (state.dialogQueue.length === 0) {
    state.dialog = null;
    render();
    return;
  }
  const text = state.dialogQueue.shift();
  state.dialog = { text, last: state.dialogQueue.length === 0 };
  render();
}

// ─── COLLISION ───────────────────────────────────────────────────────────────
function isWalkable(x, y) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return false;
  const t = floors[state.floor].map[y][x];
  // solid tiles
  return ![1, 10, 11, 12, 13, 14, 15, 16, 17, 18].includes(t);
}

// ─── INTERACTION ─────────────────────────────────────────────────────────────
function tryInteract() {
  if (state.dialog) { advanceDialog(); return; }
  const { x, y, dir } = state.player;
  const s = state.stats;
  const dx = [0, 1, 0, -1][dir];
  const dy = [-1, 0, 1, 0][dir];
  const tx = x + dx;
  const ty = y + dy;
  const tile = floors[state.floor].map[ty]?.[tx];

  // Stairs
  if (tile === 2) { // stairs up
    const next = state.floor + 1;
    if (next < floors.length) {
      state.floor = next;
      const sd = floors[next].stairsDown;
      state.player.x = sd.x; state.player.y = sd.y + 1;
      showDialog([`Du gehst nach oben.\n➡ ${floors[next].name}`]);
    }
    return;
  }
  if (tile === 3) { // stairs down
    const prev = state.floor - 1;
    if (prev >= 0) {
      state.floor = prev;
      const su = floors[prev].stairsUp;
      state.player.x = su.x; state.player.y = su.y + 1;
      showDialog([`Du gehst nach unten.\n➡ ${floors[prev].name}`]);
    }
    return;
  }

  // Gym – Hantelbank (bench)
  if (tile === 11) {
    if (state.trainCooldown > 0) {
      showDialog([`Du bist noch erschöpft...\nWarte noch ${state.trainCooldown} Sekunden.`]); return;
    }
    if (s.energie < 15) {
      showDialog(['Du bist zu müde zum Training!\nGeh schlafen im 1. OG.']); return;
    }
    if (s.hunger < 15) {
      showDialog(['Dein Magen knurrt...\nEss erstmal was im EG!']); return;
    }
    s.kraft   = Math.min(100, s.kraft + 8);
    s.energie = Math.max(0,   s.energie - 12);
    s.hunger  = Math.max(0,   s.hunger  - 10);
    state.trainCooldown = 5;
    showDialog([
      'BANKDRÜCKEN!\n💪 Du drückst 5 Sätze à 5.',
      `Kraft +8\nEnergie -12 | Hunger -10\n\n💪 Kraft: ${Math.round(s.kraft)}%`
    ]);
    updateStats(); return;
  }

  // Gym – Langhantel (barbell)
  if (tile === 12) {
    if (state.trainCooldown > 0) {
      showDialog([`Noch eine kurze Pause...\n(${state.trainCooldown}s)`]); return;
    }
    if (s.energie < 15) { showDialog(['Zu erschöpft! Schlaf zuerst.']); return; }
    if (s.hunger  < 15) { showDialog(['Zu hungrig! Iss zuerst.']); return; }
    s.kraft   = Math.min(100, s.kraft + 10);
    s.energie = Math.max(0,   s.energie - 15);
    s.hunger  = Math.max(0,   s.hunger  - 12);
    state.trainCooldown = 7;
    showDialog([
      'KREUZHEBEN!\n🏋️ Du hebst die Hantel.',
      `Kraft +10\nEnergie -15 | Hunger -12\n\n💪 Kraft: ${Math.round(s.kraft)}%`
    ]);
    updateStats(); return;
  }

  // Gym – Kurzhanteln (dumbbell)
  if (tile === 13) {
    if (state.trainCooldown > 0) {
      showDialog([`Kurze Pause...\n(${state.trainCooldown}s)`]); return;
    }
    if (s.energie < 10) { showDialog(['Zu erschöpft!']); return; }
    s.kraft   = Math.min(100, s.kraft + 5);
    s.energie = Math.max(0,   s.energie - 8);
    s.hunger  = Math.max(0,   s.hunger  - 6);
    state.trainCooldown = 4;
    showDialog([
      'BIZEPS CURLS!\n💪 Curl, curl, curl...',
      `Kraft +5\nEnergie -8 | Hunger -6\n\n💪 Kraft: ${Math.round(s.kraft)}%`
    ]);
    updateStats(); return;
  }

  // Gym – Matte (mat)
  if (tile === 20) {
    if (s.energie < 8) { showDialog(['Zu erschöpft!']); return; }
    s.kraft   = Math.min(100, s.kraft + 3);
    s.energie = Math.max(0,   s.energie - 5);
    s.hunger  = Math.max(0,   s.hunger  - 4);
    state.trainCooldown = 3;
    showDialog(['LIEGESTÜTZE & KNIEBEUGEN!\nKraft +3 | Energie -5']);
    updateStats(); return;
  }

  // Kitchen – Kühlschrank (fridge)
  if (tile === 14) {
    if (s.hunger >= 95) {
      showDialog(['Du bist satt!\nNoch mehr Thunfisch geht nicht 😅']); return;
    }
    const gain = Math.min(35, 100 - s.hunger);
    s.hunger  = Math.min(100, s.hunger + gain);
    s.energie = Math.min(100, s.energie + 5);
    showDialog([
      '🐟 Kühlschrank öffnen...',
      'Du nimmst: THUNFISCH MIT REIS\n\nProtein für die Muckis! 💪',
      `Hunger +${gain}\nEnergie +5\n\n🍱 Hunger: ${Math.round(s.hunger)}%`
    ]);
    updateStats(); return;
  }

  // Bedroom – Bett (bed)
  if (tile === 16) {
    if (s.energie >= 95) {
      showDialog(['Du bist ausgeruht!\nDu kannst jetzt trainieren.']); return;
    }
    const gain = Math.min(50, 100 - s.energie);
    s.energie = Math.min(100, s.energie + gain);
    s.hunger  = Math.max(0,   s.hunger  - 10);
    showDialog([
      '😴 Du legst dich ins Bett...',
      'Zzzz... Zzzz... Zzzz...',
      `Energie +${gain}\nHunger -10\n\n⚡ Energie: ${Math.round(s.energie)}%`
    ]);
    updateStats(); return;
  }

  // Default: nothing
  if (tile === undefined || tile === 0) {
    const msgs = [
      'Hier ist nichts.\nGeh trainieren! 💪',
      'Die Wand schaut dich an.\nGeh ins Gym!',
      'Nur Luft hier...',
    ];
    showDialog([msgs[Math.floor(Math.random() * msgs.length)]]);
  }
}

// ─── MOVEMENT ────────────────────────────────────────────────────────────────
function tryMove(dir) {
  if (state.dialog) return;
  state.player.dir = dir;
  const dx = [0, 1, 0, -1][dir];
  const dy = [-1, 0, 1, 0][dir];
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;

  // Check for stairs interaction on step
  const tile = floors[state.floor].map[ny]?.[nx];
  if (tile === 2) { tryInteract(); return; }
  if (tile === 3) { tryInteract(); return; }

  if (isWalkable(nx, ny)) {
    state.player.x = nx;
    state.player.y = ny;
    state.animTick++;
  }
  render();
}

// ─── CONTROLS ────────────────────────────────────────────────────────────────
let moveInterval = null;
let moveDir = -1;
let moveDelay = null;

function startMove(dir) {
  if (moveDir === dir) return;
  stopMove();
  moveDir = dir;
  tryMove(dir);
  moveDelay = setTimeout(() => {
    moveInterval = setInterval(() => tryMove(dir), 120);
  }, 200);
}

function stopMove() {
  moveDir = -1;
  clearTimeout(moveDelay);
  clearInterval(moveInterval);
  moveInterval = null;
}

function addBtnListeners(id, dir) {
  const btn = document.getElementById(id);
  btn.addEventListener('touchstart', e => { e.preventDefault(); startMove(dir); }, {passive:false});
  btn.addEventListener('touchend',   e => { e.preventDefault(); stopMove(); }, {passive:false});
  btn.addEventListener('mousedown',  () => startMove(dir));
  btn.addEventListener('mouseup',    () => stopMove());
  btn.addEventListener('mouseleave', () => stopMove());
}

addBtnListeners('btnUp',    0);
addBtnListeners('btnRight', 1);
addBtnListeners('btnDown',  2);
addBtnListeners('btnLeft',  3);

document.getElementById('btnAction').addEventListener('touchstart', e => {
  e.preventDefault(); tryInteract();
}, {passive:false});
document.getElementById('btnAction').addEventListener('click', tryInteract);

// Keyboard support
window.addEventListener('keydown', e => {
  if (state.keys[e.code]) return;
  state.keys[e.code] = true;
  const map = { ArrowUp:0, KeyW:0, ArrowRight:1, KeyD:1, ArrowDown:2, KeyS:2, ArrowLeft:3, KeyA:3 };
  if (map[e.code] !== undefined) startMove(map[e.code]);
  if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyZ') tryInteract();
});
window.addEventListener('keyup', e => {
  delete state.keys[e.code];
  const map = { ArrowUp:0, KeyW:0, ArrowRight:1, KeyD:1, ArrowDown:2, KeyS:2, ArrowLeft:3, KeyA:3 };
  if (map[e.code] !== undefined) stopMove();
});

// Dialog box click
document.getElementById('dialogBox')?.addEventListener('click', advanceDialog);

// ─── GAME LOOP (passive stat decay + cooldown) ────────────────────────────────
setInterval(() => {
  const s = state.stats;
  // Gradual hunger/energy drain
  if (!state.dialog) {
    s.hunger  = Math.max(0, s.hunger  - 0.3);
    s.energie = Math.max(0, s.energie - 0.2);
  }
  if (state.trainCooldown > 0) state.trainCooldown = Math.max(0, state.trainCooldown - 1);
  updateStats();

  // Warnings
  if (s.hunger <= 0 && Math.random() < 0.05) {
    s.energie = Math.max(0, s.energie - 2);
    updateStats();
  }
}, 1000);

// ─── WELCOME ─────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  resize();
  updateStats();
  render();
  setTimeout(() => {
    showDialog([
      'PIXEL POLIZIST\n👮 Bereitschaftspolizei',
      'Du bist frisch in der\nDienststelle eingetroffen.',
      'Dein Ziel:\nFit bleiben und trainieren!',
      '💪 KELLER  → Kraftraum\n🍱 ERDGESCHOSS → Küche\n😴 1. OG  → Schlafraum',
      '▲▼◀▶ Bewegen\n[A] Interagieren\n\nViel Erfolg, Wachtmeister!'
    ]);
  }, 300);
});
