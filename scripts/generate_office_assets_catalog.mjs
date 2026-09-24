import fs from 'fs';
import path from 'path';

const assetsDir = path.resolve('public/office-assets');

function flattenManifest(node, inherited) {
  if (node.type === 'asset') {
    const orientation = node.orientation ?? inherited.orientation;
    const state = node.state ?? inherited.state;
    return [
      {
        id: node.id,
        name: inherited.name,
        label: inherited.name,
        category: inherited.category,
        file: node.file,
        width: node.width,
        height: node.height,
        footprintW: node.footprintW,
        footprintH: node.footprintH,
        isDesk: inherited.category === 'desks',
        canPlaceOnWalls: inherited.canPlaceOnWalls,
        canPlaceOnSurfaces: inherited.canPlaceOnSurfaces,
        backgroundTiles: inherited.backgroundTiles,
        groupId: inherited.groupId,
        ...(orientation ? { orientation } : {}),
        ...(state ? { state } : {}),
        ...(node.mirrorSide ? { mirrorSide: true } : {}),
        ...(inherited.rotationScheme ? { rotationScheme: inherited.rotationScheme } : {}),
        ...(inherited.animationGroup ? { animationGroup: inherited.animationGroup } : {}),
        ...(node.frame !== undefined ? { frame: node.frame } : {}),
      },
    ];
  }

  const results = [];
  if (node.members) {
    for (const member of node.members) {
      const childProps = { ...inherited };
      if (node.groupType === 'rotation' && node.rotationScheme) {
        childProps.rotationScheme = node.rotationScheme;
      }
      if (node.groupType === 'state' && node.orientation) {
        childProps.orientation = node.orientation;
      }
      if (node.state) {
        childProps.state = node.state;
      }
      if (node.groupType === 'animation') {
        const orient = node.orientation ?? inherited.orientation ?? '';
        const st = node.state ?? inherited.state ?? '';
        childProps.animationGroup = `${inherited.groupId}_${orient}_${st}`.toUpperCase();
      }
      if (node.orientation && !childProps.orientation) {
        childProps.orientation = node.orientation;
      }
      results.push(...flattenManifest(member, childProps));
    }
  }
  return results;
}

function buildFurnitureCatalog(assetsDir) {
  const furnitureDir = path.join(assetsDir, 'furniture');
  if (!fs.existsSync(furnitureDir)) return [];

  const catalog = [];
  const dirs = fs.readdirSync(furnitureDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();

  for (const folderName of dirs) {
    const manifestPath = path.join(furnitureDir, folderName, 'manifest.json');
    if (!fs.existsSync(manifestPath)) continue;
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      if (manifest.type === 'asset') {
        if (!manifest.width || !manifest.height || !manifest.footprintW || !manifest.footprintH) continue;
        const file = manifest.file ?? `${manifest.id}.png`;
        catalog.push({
          id: manifest.id,
          name: manifest.name,
          label: manifest.name,
          category: manifest.category,
          file,
          furniturePath: `furniture/${folderName}/${file}`,
          width: manifest.width,
          height: manifest.height,
          footprintW: manifest.footprintW,
          footprintH: manifest.footprintH,
          isDesk: manifest.category === 'desks',
          canPlaceOnWalls: manifest.canPlaceOnWalls,
          canPlaceOnSurfaces: manifest.canPlaceOnSurfaces,
          backgroundTiles: manifest.backgroundTiles,
          groupId: manifest.id,
        });
      } else {
        if (!manifest.members) continue;
        const inherited = {
          groupId: manifest.id,
          name: manifest.name,
          category: manifest.category,
          canPlaceOnWalls: manifest.canPlaceOnWalls,
          canPlaceOnSurfaces: manifest.canPlaceOnSurfaces,
          backgroundTiles: manifest.backgroundTiles,
          ...(manifest.rotationScheme ? { rotationScheme: manifest.rotationScheme } : {}),
        };
        const rootGroup = {
          type: 'group',
          groupType: manifest.groupType,
          rotationScheme: manifest.rotationScheme,
          members: manifest.members,
        };
        const assets = flattenManifest(rootGroup, inherited);
        for (const asset of assets) {
          catalog.push({
            ...asset,
            furniturePath: `furniture/${folderName}/${asset.file}`,
          });
        }
      }
    } catch (e) {
      console.error(`Error parsing ${manifestPath}:`, e);
    }
  }
  return catalog;
}

function buildAssetIndex(assetsDir) {
  function listSorted(subdir, pattern) {
    const dir = path.join(assetsDir, subdir);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => pattern.test(f))
      .sort((a, b) => {
        const na = parseInt(/(\d+)/.exec(a)?.[1] ?? '0', 10);
        const nb = parseInt(/(\d+)/.exec(b)?.[1] ?? '0', 10);
        return na - nb;
      });
  }

  let defaultLayout = null;
  let bestRev = 0;
  if (fs.existsSync(assetsDir)) {
    for (const f of fs.readdirSync(assetsDir)) {
      const m = /^default-layout-(\d+)\.json$/.exec(f);
      if (m) {
        const rev = parseInt(m[1], 10);
        if (rev > bestRev) {
          bestRev = rev;
          defaultLayout = f;
        }
      }
    }
    if (!defaultLayout && fs.existsSync(path.join(assetsDir, 'default-layout.json'))) {
      defaultLayout = 'default-layout.json';
    }
  }

  return {
    floors: listSorted('floors', /^floor_\d+\.png$/i),
    walls: listSorted('walls', /^wall_\d+\.png$/i),
    characters: listSorted('characters', /^char_\d+\.png$/i),
    defaultLayout,
  };
}

const catalog = buildFurnitureCatalog(assetsDir);
const assetIndex = buildAssetIndex(assetsDir);

fs.writeFileSync(path.join(assetsDir, 'furniture-catalog.json'), JSON.stringify(catalog, null, 2));
fs.writeFileSync(path.join(assetsDir, 'asset-index.json'), JSON.stringify(assetIndex, null, 2));

console.log(`✓ Generated furniture-catalog.json (${catalog.length} items)`);
console.log(`✓ Generated asset-index.json (floors: ${assetIndex.floors.length}, walls: ${assetIndex.walls.length}, chars: ${assetIndex.characters.length})`);
