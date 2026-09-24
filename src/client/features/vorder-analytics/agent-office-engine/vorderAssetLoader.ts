/**
 * Vorder In-Browser Asset Loader
 * Decodes PNG sprites and loads furniture catalog & layout natively in the browser
 * with 0 external dependencies.
 */

import { setFloorSprites } from './floorTiles.js';
import { buildDynamicCatalog } from './layout/furnitureCatalog.js';
import { setCharacterTemplates } from './sprites/spriteData.js';
import type { OfficeLayout } from './types.js';
import { setWallSprites } from './wallTiles.js';

const CHAR_FRAME_W = 16;
const CHAR_FRAME_H = 32;
const CHAR_FRAMES_PER_ROW = 7;
const CHARACTER_DIRECTIONS = ['down', 'up', 'right'] as const;
const FLOOR_TILE_SIZE = 16;
const WALL_PIECE_WIDTH = 16;
const WALL_PIECE_HEIGHT = 32;
const WALL_GRID_COLS = 4;
const WALL_BITMASK_COUNT = 16;
const PNG_ALPHA_THRESHOLD = 2;

function rgbaToHex(r: number, g: number, b: number, a: number): string {
  if (a < PNG_ALPHA_THRESHOLD) return '';
  const rgb = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  if (a >= 255) return rgb;
  return `${rgb}${a.toString(16).padStart(2, '0').toUpperCase()}`;
}

interface DecodedPng {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

function getPixel(data: Uint8ClampedArray, width: number, x: number, y: number): [number, number, number, number] {
  const idx = (y * width + x) * 4;
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
}

function readSprite(
  png: DecodedPng,
  width: number,
  height: number,
  offsetX = 0,
  offsetY = 0
): string[][] {
  const sprite: string[][] = [];
  for (let y = 0; y < height; y++) {
    const row: string[] = [];
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(png.data, png.width, offsetX + x, offsetY + y);
      row.push(rgbaToHex(r, g, b, a));
    }
    sprite.push(row);
  }
  return sprite;
}

async function decodePng(url: string): Promise<DecodedPng> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch PNG: ${url} (${res.status})`);
  }
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Failed to create 2d canvas context for PNG decode');
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { width: canvas.width, height: canvas.height, data: imageData.data };
}

let isInitialized = false;
let cachedLayout: OfficeLayout | null = null;

export async function initVorderOfficeEngine(base = '/office-assets/'): Promise<OfficeLayout> {
  if (isInitialized && cachedLayout) {
    return cachedLayout;
  }

  console.log('[VorderAssetLoader] Initializing Office Engine assets from:', base);

  const [assetIndex, catalog, layout] = await Promise.all([
    fetch(`${base}asset-index.json`).then(r => r.json() as Promise<{ characters: string[]; floors: string[]; walls: string[] }>),
    fetch(`${base}furniture-catalog.json`).then(r => r.json() as Promise<any[]>),
    fetch(`${base}vorder-office-layout.json`)
      .then(r => (r.ok ? (r.json() as Promise<OfficeLayout>) : fetch(`${base}default-layout-1.json`).then(r2 => r2.json() as Promise<OfficeLayout>))),
  ]);

  // 1. Decode Characters
  const characters: any[] = [];
  for (const relPath of assetIndex.characters) {
    try {
      const png = await decodePng(`${base}characters/${relPath}`);
      const byDir: any = { down: [], up: [], right: [] };
      for (let dirIdx = 0; dirIdx < CHARACTER_DIRECTIONS.length; dirIdx++) {
        const dir = CHARACTER_DIRECTIONS[dirIdx];
        const rowOffsetY = dirIdx * CHAR_FRAME_H;
        const frames: string[][][] = [];
        for (let frame = 0; frame < CHAR_FRAMES_PER_ROW; frame++) {
          frames.push(readSprite(png, CHAR_FRAME_W, CHAR_FRAME_H, frame * CHAR_FRAME_W, rowOffsetY));
        }
        byDir[dir] = frames;
      }
      characters.push(byDir);
    } catch (e) {
      console.warn(`Failed to decode character ${relPath}:`, e);
    }
  }

  // 2. Decode Floors
  const floorSprites: string[][][] = [];
  for (const relPath of assetIndex.floors) {
    try {
      const png = await decodePng(`${base}floors/${relPath}`);
      floorSprites.push(readSprite(png, FLOOR_TILE_SIZE, FLOOR_TILE_SIZE));
    } catch (e) {
      console.warn(`Failed to decode floor ${relPath}:`, e);
    }
  }

  // 3. Decode Walls
  const wallSets: string[][][][] = [];
  for (const relPath of assetIndex.walls) {
    try {
      const png = await decodePng(`${base}walls/${relPath}`);
      const set: string[][][] = [];
      for (let mask = 0; mask < WALL_BITMASK_COUNT; mask++) {
        const ox = (mask % WALL_GRID_COLS) * WALL_PIECE_WIDTH;
        const oy = Math.floor(mask / WALL_GRID_COLS) * WALL_PIECE_HEIGHT;
        set.push(readSprite(png, WALL_PIECE_WIDTH, WALL_PIECE_HEIGHT, ox, oy));
      }
      wallSets.push(set);
    } catch (e) {
      console.warn(`Failed to decode wall ${relPath}:`, e);
    }
  }

  // 4. Decode Furniture Sprites
  const furnitureSprites: Record<string, string[][]> = {};
  for (const entry of catalog) {
    try {
      const png = await decodePng(`${base}${entry.furniturePath}`);
      furnitureSprites[entry.id] = readSprite(png, entry.width, entry.height);
    } catch (e) {
      console.warn(`Failed to decode furniture ${entry.id}:`, e);
    }
  }

  // Set templates in engine
  setCharacterTemplates(characters);
  setFloorSprites(floorSprites);
  setWallSprites(wallSets);
  buildDynamicCatalog({ catalog, sprites: furnitureSprites });

  isInitialized = true;
  cachedLayout = layout;

  console.log(`✓ [VorderAssetLoader] Ready! Loaded ${characters.length} characters, ${floorSprites.length} floors, ${wallSets.length} wall sets, ${catalog.length} furniture items.`);

  return layout;
}
