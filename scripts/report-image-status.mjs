import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const menuDatabasePath = path.join(repoRoot, 'lib', 'menuDatabase.ts');
const menuDataPath = path.join(repoRoot, 'lib', 'menuData.ts');
const resultScreenPath = path.join(repoRoot, 'components', 'ResultScreen.tsx');
const reportPath = path.join(repoRoot, 'REPORT_IMAGE_STATUS.md');

const srcBase = fs.readFileSync(menuDatabasePath, 'utf8');
const srcData = fs.readFileSync(menuDataPath, 'utf8');
const srcResult = fs.readFileSync(resultScreenPath, 'utf8');

function extractArrayBlock(source, marker) {
  const markerIdx = source.indexOf(marker);
  if (markerIdx < 0) throw new Error(`Marker not found: ${marker}`);
  const eqIdx = source.indexOf('=', markerIdx);
  const startIdx = source.indexOf('[', eqIdx);
  if (startIdx < 0) throw new Error(`Array start not found for marker: ${marker}`);

  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (let i = startIdx; i < source.length; i += 1) {
    const ch = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        inString = false;
      }
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
      if (depth === 0) {
        return source.slice(startIdx + 1, i);
      }
    }
  }

  throw new Error(`Array end not found for marker: ${marker}`);
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
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        inString = false;
      }
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
  const nameMatch = objectText.match(/\bname\s*:\s*'([^']+)'/);
  const name = nameMatch?.[1] ?? null;

  const categoryMatch = objectText.match(/\bcategory\s*:\s*'([^']+)'/);
  const category = categoryMatch?.[1] ?? null;

  const imageMatch = objectText.match(/\bimage\s*:\s*([^,\n}\r]+)/);
  const rawImage = imageMatch ? imageMatch[1].trim() : null;
  const image = rawImage?.startsWith("'") && rawImage?.endsWith("'")
    ? rawImage.slice(1, -1)
    : rawImage?.startsWith('"') && rawImage?.endsWith('"')
      ? rawImage.slice(1, -1)
      : rawImage;

  return { name, category, image };
}

const baseArray = extractArrayBlock(srcBase, 'export const menuDatabase: MenuItem[] = [');
const detailedArray = extractArrayBlock(srcData, 'const detailedMenus: MenuItem[] = [');

const baseMenus = splitTopLevelObjects(baseArray).map(parseMenuObject);
const detailedMenus = splitTopLevelObjects(detailedArray).map(parseMenuObject);

const detailedByName = new Map(detailedMenus.map((menu) => [menu.name, menu]));
const baseNameSet = new Set(baseMenus.map((menu) => menu.name));

// runtime merge logic currently used in lib/menuData.ts
const runtimeMenus = baseMenus.map((menu) => detailedByName.get(menu.name) ?? menu);

const imageFieldUsed = srcResult.includes('menuItem?.image ||') ? 'image' : 'unknown';

function classify(menu) {
  const image = menu.image;
  if (!image || image === 'null' || image === "''" || image === '""') {
    return { status: 'MISSING_FIELD' };
  }

  const normalized = image.startsWith('/') ? image.slice(1) : image;
  const expected = path.join(repoRoot, 'public', normalized);
  if (fs.existsSync(expected)) {
    return { status: 'OK', imagePath: image };
  }

  return {
    status: 'BROKEN_PATH',
    imagePath: image,
    expectedPath: path.join('public', normalized),
  };
}

const evaluated = runtimeMenus
  .filter((m) => m.name)
  .map((menu) => ({ ...menu, ...classify(menu) }))
  .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

const ok = evaluated.filter((m) => m.status === 'OK');
const broken = evaluated.filter((m) => m.status === 'BROKEN_PATH');
const missing = evaluated.filter((m) => m.status === 'MISSING_FIELD');

const make20Names = [
  '참치마요덮밥', '김치계란덮밥', '간장계란밥', '버터간장밥', '카레라이스(즉석카레)',
  '고추장참치비빔밥', '소세지야채볶음밥', '베이컨김치볶음밥', '라면계란볶이', '비빔라면 + 계란후라이',
  '참치라면', '우동면 간장볶음', '치즈토스트', '햄치즈롤(식빵말이)', '계란마요토스트',
  '프렌치토스트', '두부부침', '김치두부', '참치김치찌개', '계란말이',
];

const problematicMake20 = evaluated.filter(
  (m) => make20Names.includes(m.name) && (m.status === 'BROKEN_PATH' || m.status === 'MISSING_FIELD')
);

const lines = [];
lines.push(`ResultScreen 이미지 필드 기준: ${imageFieldUsed}`);
lines.push('');
lines.push(`총 메뉴 수: ${evaluated.length}`);
lines.push(`OK: ${ok.length}`);
lines.push(`BROKEN_PATH: ${broken.length}`);
lines.push(`MISSING_FIELD: ${missing.length}`);
lines.push('');
lines.push('[OK]');
for (const m of ok) lines.push(`- ${m.name} — ${m.imagePath}`);
lines.push('');
lines.push('[BROKEN_PATH]');
if (broken.length === 0) {
  lines.push('- (없음)');
} else {
  for (const m of broken) lines.push(`- ${m.name} — ${m.imagePath} (expected ${m.expectedPath} not found)`);
}
lines.push('');
lines.push('[MISSING_FIELD]');
if (missing.length === 0) {
  lines.push('- (없음)');
} else {
  for (const m of missing) lines.push(`- ${m.name}`);
}
lines.push('');
lines.push('[만들어먹기 20개 중 문제 항목(BROKEN_PATH/MISSING_FIELD)]');
if (problematicMake20.length === 0) {
  lines.push('- (없음)');
} else {
  for (const m of problematicMake20) {
    if (m.status === 'BROKEN_PATH') {
      lines.push(`- ${m.name} — BROKEN_PATH (${m.imagePath}, expected ${m.expectedPath})`);
    } else {
      lines.push(`- ${m.name} — MISSING_FIELD`);
    }
  }
}

fs.writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf8');

console.log(`[report-image-status] Generated: ${path.relative(repoRoot, reportPath)}`);
console.log(`[report-image-status] total=${evaluated.length} ok=${ok.length} broken=${broken.length} missing=${missing.length}`);
console.log(`[report-image-status] runtime image field in ResultScreen: ${imageFieldUsed}`);
console.log(`[report-image-status] detailedMenus excluded by current merge rule: ${detailedMenus.filter((m) => !baseNameSet.has(m.name)).length}`);
