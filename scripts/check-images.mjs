import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const menuDatabasePath = path.join(root, 'lib', 'menuDatabase.ts');
const menuDataPath = path.join(root, 'lib', 'menuData.ts');
const menusDir = path.join(root, 'public', 'menus');
const reportPath = path.join(root, 'REPORT_IMAGE_MAPPING.md');

const srcBase = fs.readFileSync(menuDatabasePath, 'utf8');
const srcData = fs.readFileSync(menuDataPath, 'utf8');

function extractArrayBlock(source, marker) {
  const markerIdx = source.indexOf(marker);
  const eqIdx = source.indexOf('=', markerIdx);
  const startIdx = source.indexOf('[', eqIdx);
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (let i = startIdx; i < source.length; i += 1) {
    const ch = source[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) return source.slice(startIdx + 1, i);
    }
  }
  throw new Error(`array parse failed: ${marker}`);
}

function splitTopLevelObjects(arrayContent) {
  const objects = [];
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;
  let current = '';

  for (let i = 0; i < arrayContent.length; i += 1) {
    const ch = arrayContent[i];
    if (inString) {
      current += ch;
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      if (depth > 0) current += ch;
      continue;
    }
    if (ch === '{') {
      depth += 1;
      current += ch;
      continue;
    }
    if (ch === '}') {
      depth -= 1;
      current += ch;
      if (depth === 0) {
        objects.push(current.trim());
        current = '';
      }
      continue;
    }
    if (depth > 0) current += ch;
  }
  return objects;
}

function parseMenuObject(objectText) {
  const name = objectText.match(/\bname\s*:\s*'([^']+)'/)?.[1] ?? null;
  const imageRaw = objectText.match(/\bimage\s*:\s*([^,\n}\r]+)/)?.[1]?.trim() ?? null;
  const image = imageRaw?.startsWith("'") && imageRaw?.endsWith("'")
    ? imageRaw.slice(1, -1)
    : imageRaw;
  return { name, image };
}

const baseMenus = splitTopLevelObjects(
  extractArrayBlock(srcBase, 'export const menuDatabase: MenuItem[] = [')
).map(parseMenuObject);

const detailedMenus = splitTopLevelObjects(
  extractArrayBlock(srcData, 'const detailedMenus: MenuItem[] = [')
).map(parseMenuObject);

const detailedByName = new Map(detailedMenus.map((m) => [m.name, m]));

const menuFiles = fs
  .readdirSync(menusDir)
  .filter((f) => f.toLowerCase().endsWith('.jpg'));
const menuFileSet = new Set(menuFiles);

function pickImage(menuName, baseImage) {
  const slugFile = baseImage?.startsWith('/menus/') ? baseImage.replace('/menus/', '') : null;
  if (slugFile && menuFileSet.has(slugFile)) {
    return { status: 'OK', imagePath: `/menus/${slugFile}` };
  }

  const koreanFile = `${menuName}.jpg`;
  if (menuFileSet.has(koreanFile)) {
    return { status: 'OK', imagePath: `/menus/${koreanFile}` };
  }

  return { status: 'NO_MATCH' };
}

const merged = baseMenus.map((base) => {
  const detailed = detailedByName.get(base.name);
  const finalImage = (detailed?.image || base.image || '').trim();
  const picked = pickImage(base.name, finalImage || base.image || '');
  return { name: base.name, ...picked };
});

const ok = merged.filter((m) => m.status === 'OK').sort((a, b) => a.name.localeCompare(b.name, 'ko'));
const noMatch = merged.filter((m) => m.status === 'NO_MATCH').sort((a, b) => a.name.localeCompare(b.name, 'ko'));

const lines = [];
lines.push(`총 메뉴 수: ${merged.length}`);
lines.push(`OK: ${ok.length}`);
lines.push(`NO_MATCH: ${noMatch.length}`);
lines.push('');
lines.push('[OK]');
for (const m of ok) lines.push(`- ${m.name} -> ${m.imagePath}`);
lines.push('');
lines.push('[NO_MATCH]');
if (noMatch.length === 0) lines.push('- (없음)');
else for (const m of noMatch) lines.push(`- ${m.name}`);

fs.writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf8');

console.log(`[check-images] generated ${path.relative(root, reportPath)}`);
console.log(`[check-images] total=${merged.length} ok=${ok.length} no_match=${noMatch.length}`);
