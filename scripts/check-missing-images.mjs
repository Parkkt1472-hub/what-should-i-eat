import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const baseDbPath = path.join(root, 'lib', 'menuDatabase.ts');
const menuDataPath = path.join(root, 'lib', 'menuData.ts');
const publicMenusDir = path.join(root, 'public', 'menus');

const baseSrc = fs.readFileSync(baseDbPath, 'utf8');
const dataSrc = fs.readFileSync(menuDataPath, 'utf8');

function extractArrayBlock(source, marker) {
  const markerIdx = source.indexOf(marker);
  if (markerIdx < 0) throw new Error(`marker not found: ${marker}`);

  const eqIdx = source.indexOf('=', markerIdx);
  const startIdx = source.indexOf('[', eqIdx);
  if (startIdx < 0) throw new Error(`array start not found: ${marker}`);

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
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) return source.slice(startIdx + 1, i);
    }
  }

  throw new Error(`array end not found: ${marker}`);
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

function parseObject(objText) {
  const name = objText.match(/\bname\s*:\s*'([^']+)'/)?.[1] ?? null;
  const imageRaw = objText.match(/\bimage\s*:\s*([^,\n}\r]+)/)?.[1]?.trim() ?? null;
  let image = imageRaw;

  if (image?.startsWith("'") && image.endsWith("'")) {
    image = image.slice(1, -1);
  } else if (image?.startsWith('"') && image.endsWith('"')) {
    image = image.slice(1, -1);
  }

  return { name, image };
}

const baseMenus = splitTopLevelObjects(
  extractArrayBlock(baseSrc, 'export const menuDatabase: MenuItem[] = [')
).map(parseObject);

const detailedMenus = splitTopLevelObjects(
  extractArrayBlock(dataSrc, 'const detailedMenus: MenuItem[] = [')
).map(parseObject);

const detailedByName = new Map(detailedMenus.map((menu) => [menu.name, menu]));

// lib/menuData.ts export const menuDatabase 기준 병합 로직 재현
const runtimeMenus = baseMenus.map((base) => {
  const detailed = detailedByName.get(base.name);
  return detailed
    ? { ...base, ...detailed, image: detailed.image || base.image }
    : base;
});

const menuJpgFiles = new Set(
  fs.readdirSync(publicMenusDir).filter((file) => file.endsWith('.jpg'))
);

const missing = [];
const broken = [];
let okCount = 0;

for (const menu of runtimeMenus) {
  const image = (menu.image ?? '').trim();

  if (!image) {
    missing.push(menu.name);
    continue;
  }

  // .jpg만 유효 대상으로 본다.
  if (!image.startsWith('/menus/') || !image.endsWith('.jpg')) {
    broken.push({ name: menu.name, image });
    continue;
  }

  const fileName = image.replace('/menus/', '');
  // public/menus 실제 파일(대소문자 구분) 존재 체크
  if (!menuJpgFiles.has(fileName)) {
    broken.push({ name: menu.name, image });
    continue;
  }

  okCount += 1;
}

console.log('[MISSING_IMAGE]');
if (missing.length === 0) {
  console.log('- (없음)');
} else {
  for (const name of missing.sort((a, b) => a.localeCompare(b, 'ko'))) {
    console.log(`- ${name} (image 필드 없음)`);
  }
}

console.log('\n[BROKEN_PATH]');
if (broken.length === 0) {
  console.log('- (없음)');
} else {
  for (const item of broken.sort((a, b) => a.name.localeCompare(b.name, 'ko'))) {
    console.log(`- ${item.name} (image 경로: ${item.image} → 파일 없음)`);
  }
}

console.log('\n[OK_COUNT]');
console.log(`총 메뉴 개수: ${runtimeMenus.length}`);
console.log(`정상 이미지 메뉴 개수: ${okCount}`);
console.log(`문제 있는 메뉴 개수: ${missing.length + broken.length}`);
