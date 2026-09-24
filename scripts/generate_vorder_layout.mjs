import fs from 'fs';
import path from 'path';

const cols = 24;
const rows = 20;

// Initialize tiles with VOID (255)
const tiles = new Array(cols * rows).fill(255);
const tileColors = new Array(cols * rows).fill(null);

// Floor IDs:
// 1 = Dark parquet (Office interior)
// 7 = Crimson carpet / Luxury executive zone
// 2 = Outdoor stone balcony deck (Smoke Lounge)
// 0 = Walls
// 255 = VOID

// 1. Build Office Interior (Cols 1 to 14, Rows 1 to 18)
// North wall: Row 1, Cols 1..14
// West wall: Col 1, Rows 1..18
// South wall: Row 18, Cols 1..14
// Interior corridor partition: Col 14, Rows 1..18 (with door openings at rows 4, 10, 15)

for (let r = 1; r <= 18; r++) {
  for (let c = 1; c <= 14; c++) {
    const idx = r * cols + c;
    if (r === 1 || r === 18 || c === 1 || (c === 14 && r !== 4 && r !== 5 && r !== 11 && r !== 12)) {
      tiles[idx] = 0; // Wall
      tileColors[idx] = { h: 220, s: 20, b: -60, c: -40 }; // Dark steel/slate wall
    } else {
      // Office interior floors
      if (r >= 2 && r <= 7) {
        // D1 Server & Tech zone: Walnut Parquet (floor_1)
        tiles[idx] = 1;
        tileColors[idx] = { h: 28, s: 35, b: -30, c: -50 };
      } else if (r >= 8 && r <= 13) {
        // Editorial & Coffee: Warm Oak Parquet (floor_0)
        tiles[idx] = 0; // will use floor_0 or floor_1
        tiles[idx] = 1;
        tileColors[idx] = { h: 32, s: 40, b: -20, c: -40 };
      } else {
        // Analytics & Maps: Royal Maroon Carpet (floor_7)
        tiles[idx] = 7;
        tileColors[idx] = { h: 345, s: 50, b: -35, c: -50 }; // Burgundy royal
      }
    }
  }
}

// 2. Build Smoke Lounge & Sunset Terrace (Cols 16 to 23, Rows 1 to 9)
// North perimeter: Row 1, Cols 16..23 (Low glass railing: wall)
// East perimeter: Col 23, Rows 1..9 (Low glass railing: wall)
// South perimeter: Row 9, Cols 16..23 (Low glass railing: wall)
// West perimeter: Col 16 connects to the terrace walkway (Cols 14-16 open path at Row 4-5)

for (let r = 1; r <= 9; r++) {
  for (let c = 16; c <= 23; c++) {
    const idx = r * cols + c;
    if (r === 1 || r === 9 || c === 23) {
      tiles[idx] = 0; // Glass balustrade / low wall
      tileColors[idx] = { h: 195, s: 45, b: 10, c: 20 }; // Cyan glass tint
    } else {
      // Balcony stone deck
      tiles[idx] = 2; // floor_2 (stone / slate terrace)
      tileColors[idx] = { h: 210, s: 15, b: -40, c: -30 }; // Slate dark granite
    }
  }
}

// Walkway connection bridge between Office and Smoke Lounge (Cols 14-16, Rows 4-5)
for (let r = 4; r <= 5; r++) {
  for (let c = 14; c <= 16; c++) {
    const idx = r * cols + c;
    tiles[idx] = 2; // Stone walkway bridge
    tileColors[idx] = { h: 210, s: 15, b: -40, c: -30 };
  }
}

// 3. Furniture Placement
const furniture = [
  // ── ZONE 1: SERVER CORE (Rows 2-7) ──
  // Desks & PCs for Tariq, Sarah, Kareem
  { uid: 'desk-tariq', type: 'DESK_FRONT', col: 3, row: 4 },
  { uid: 'pc-tariq', type: 'PC_FRONT_ON_1', col: 4, row: 4 },
  { uid: 'chair-tariq', type: 'CUSHIONED_CHAIR_FRONT', col: 4, row: 5 },

  { uid: 'desk-sarah', type: 'DESK_FRONT', col: 7, row: 4 },
  { uid: 'pc-sarah', type: 'PC_FRONT_ON_2', col: 8, row: 4 },
  { uid: 'chair-sarah', type: 'CUSHIONED_CHAIR_FRONT', col: 8, row: 5 },

  { uid: 'desk-kareem', type: 'DESK_FRONT', col: 11, row: 4 },
  { uid: 'pc-kareem', type: 'PC_FRONT_ON_3', col: 11, row: 4 },
  { uid: 'chair-kareem', type: 'CUSHIONED_CHAIR_FRONT', col: 11, row: 5 },

  { uid: 'wb-server', type: 'WHITEBOARD', col: 2, row: 1 },
  { uid: 'plant-s1', type: 'LARGE_PLANT', col: 13, row: 2 },
  { uid: 'clock-1', type: 'CLOCK', col: 6, row: 1 },

  // ── ZONE 2: EDITORIAL & COFFEE LOUNGE (Rows 8-13) ──
  // Desks & PCs for Ziad, Fahd, Layla
  { uid: 'desk-ziad', type: 'DESK_FRONT', col: 3, row: 9 },
  { uid: 'pc-ziad', type: 'PC_FRONT_ON_1', col: 4, row: 9 },
  { uid: 'chair-ziad', type: 'CUSHIONED_CHAIR_FRONT', col: 4, row: 10 },

  { uid: 'desk-fahd', type: 'DESK_FRONT', col: 7, row: 9 },
  { uid: 'pc-fahd', type: 'PC_FRONT_ON_2', col: 8, row: 9 },
  { uid: 'chair-fahd', type: 'CUSHIONED_CHAIR_FRONT', col: 8, row: 10 },

  { uid: 'desk-layla', type: 'DESK_FRONT', col: 11, row: 9 },
  { uid: 'pc-layla', type: 'PC_FRONT_ON_3', col: 11, row: 9 },
  { uid: 'chair-layla', type: 'CUSHIONED_CHAIR_FRONT', col: 11, row: 10 },

  { uid: 'coffee-bar', type: 'COFFEE', col: 2, row: 8 },
  { uid: 'shelf-books', type: 'DOUBLE_BOOKSHELF', col: 5, row: 8 },
  { uid: 'plant-s2', type: 'PLANT', col: 13, row: 8 },

  // ── ZONE 3: ANALYTICS & MAPS POD (Rows 14-18) ──
  // Desks & PCs for Omar, Nadine, Rami
  { uid: 'desk-omar', type: 'DESK_FRONT', col: 3, row: 14 },
  { uid: 'pc-omar', type: 'PC_FRONT_ON_1', col: 4, row: 14 },
  { uid: 'chair-omar', type: 'CUSHIONED_CHAIR_FRONT', col: 4, row: 15 },

  { uid: 'desk-nadine', type: 'DESK_FRONT', col: 7, row: 14 },
  { uid: 'pc-nadine', type: 'PC_FRONT_ON_2', col: 8, row: 14 },
  { uid: 'chair-nadine', type: 'CUSHIONED_CHAIR_FRONT', col: 8, row: 15 },

  { uid: 'desk-rami', type: 'DESK_FRONT', col: 11, row: 14 },
  { uid: 'pc-rami', type: 'PC_FRONT_ON_3', col: 11, row: 14 },
  { uid: 'chair-rami', type: 'CUSHIONED_CHAIR_FRONT', col: 11, row: 15 },

  { uid: 'painting-1', type: 'LARGE_PAINTING', col: 7, row: 13 },
  { uid: 'bin-1', type: 'BIN', col: 2, row: 17 },
  { uid: 'plant-s3', type: 'CACTUS', col: 13, row: 17 },

  // ── ZONE 4: SMOKE LOUNGE & SUNSET TERRACE (Cols 16-23, Rows 1-9) ──
  // Central Ashtray Coffee Table
  { uid: 'smoke-ashtray-table', type: 'COFFEE_TABLE', col: 19, row: 4 },
  // Royal Burgundy Sofas around Ashtray Table
  { uid: 'smoke-sofa-top', type: 'SOFA_BACK', col: 19, row: 3 },
  { uid: 'smoke-sofa-bottom', type: 'SOFA_FRONT', col: 19, row: 6 },
  { uid: 'smoke-sofa-left', type: 'SOFA_SIDE', col: 18, row: 4 },
  { uid: 'smoke-sofa-right', type: 'SOFA_SIDE:left', col: 21, row: 4 },

  // Terrace Espresso & Beverage Station
  { uid: 'smoke-terrace-coffee', type: 'COFFEE', col: 17, row: 2 },
  { uid: 'smoke-bench-sunset', type: 'WOODEN_BENCH', col: 21, row: 8 },
  { uid: 'smoke-plant-1', type: 'LARGE_PLANT', col: 22, row: 2 },
  { uid: 'smoke-plant-2', type: 'POT', col: 17, row: 8 }
];

const layout = {
  version: 1,
  cols,
  rows,
  layoutRevision: 1,
  tiles,
  tileColors,
  furniture
};

const targetPath = path.resolve('public/office-assets/vorder-office-layout.json');
fs.writeFileSync(targetPath, JSON.stringify(layout, null, 2));

// Also overwrite default-layout-1.json to ensure any fallback loads our layout
const defaultPath = path.resolve('public/office-assets/default-layout-1.json');
fs.writeFileSync(defaultPath, JSON.stringify(layout, null, 2));

console.log(`✓ Generated vorder-office-layout.json (${cols}x${rows}, ${furniture.length} furniture items)`);
