import { menuDatabase, reasonTemplates, MenuItem, getDefaultMeta } from './menuData';
import { getCurrentWeather, getWeatherMultiplier, type WeatherData } from './weatherService';
import { getHistory } from './historyStorage';

type WhoType = '나 혼자' | '커플' | '가족' | '친구';
type HowType = '만들어 먹기' | '배달' | '외식';
type OutdoorType = '근처에서 찾기' | '기분전환 야외';


const FIVE_MINUTE_HOME_MENU_NAMES = new Set([
  '참치마요덮밥',
  '김치계란덮밥',
  '간장계란밥',
  '버터간장밥',
  '카레라이스(즉석카레)',
  '고추장참치비빔밥',
  '소세지야채볶음밥',
  '베이컨김치볶음밥',
  '라면계란볶이',
  '비빔라면 + 계란후라이',
  '참치라면',
  '우동면 간장볶음',
  '치즈토스트',
  '햄치즈롤(식빵말이)',
  '계란마요토스트',
  '프렌치토스트',
  '두부부침',
  '김치두부',
  '참치김치찌개',
  '계란말이',
]);

const normalizeMenuName = (s: string): string =>
  s.replace(/\s+/g, '').replace(/[+()]/g, '').toLowerCase();

const normalizeHowValue = (value: string): string => normalizeMenuName(value);

const isMakeHow = (how: string): boolean => {
  const normalized = normalizeHowValue(how);
  return normalized === '만들어먹기' || normalized === 'cook';
};

const MAKE_CATEGORY_NORMALIZED = normalizeMenuName('만들어먹기');
const NORMALIZED_MAKE_ALLOWLIST = new Set(
  Array.from(FIVE_MINUTE_HOME_MENU_NAMES).map((name) => normalizeMenuName(name))
);

function getMakeCategoryMenus(menus: MenuItem[]): MenuItem[] {
  return menus.filter((menu) => normalizeMenuName(menu.category) === MAKE_CATEGORY_NORMALIZED);
}

function filterFiveMinuteHomeMenus(menus: MenuItem[]): MenuItem[] {
  return getMakeCategoryMenus(menus).filter((menu) =>
    NORMALIZED_MAKE_ALLOWLIST.has(normalizeMenuName(menu.name))
  );
}

function resolveMakeMenusWithFallback(
  menus: MenuItem[],
  context: { who: WhoType; how: string; outdoor: OutdoorType | null; mode: DecisionMode }
): MenuItem[] {
  if (!isMakeHow(context.how)) return menus;

  const totalMenusCount = menus.length;
  const makeCategoryMenus = getMakeCategoryMenus(menus);
  const afterCategoryFilterCount = makeCategoryMenus.length;
  const allowlistedMenus = filterFiveMinuteHomeMenus(menus);
  const allowlistedCount = allowlistedMenus.length;

  if (allowlistedCount > 0) {
    return allowlistedMenus;
  }

  const categoryNormalizedNames = new Set(makeCategoryMenus.map((menu) => normalizeMenuName(menu.name)));
  const allowlistNotInMenuDatabase = Array.from(FIVE_MINUTE_HOME_MENU_NAMES).filter(
    (name) => !categoryNormalizedNames.has(normalizeMenuName(name))
  );
  const menuDatabaseNotInAllowlist = makeCategoryMenus
    .filter((menu) => !NORMALIZED_MAKE_ALLOWLIST.has(normalizeMenuName(menu.name)))
    .map((menu) => menu.name);

  console.info('[DecisionEngine] make-mode filtering snapshot', {
    input: { who: context.who, how: context.how, outdoor: context.outdoor, mode: context.mode },
    totalMenusCount,
    afterCategoryFilterCount,
    makeQuickAllowlistCount: allowlistedCount,
    finalAvailableMenusCount: allowlistedCount,
  });

  if (allowlistedCount > 0) {
    return allowlistedMenus;
  }

  console.error('[DecisionEngine] make-quick allowlist produced 0 menus; applying fallback', {
    input: { who: context.who, how: context.how, outdoor: context.outdoor, mode: context.mode },
    totalMenusCount,
    afterCategoryFilterCount,
    makeQuickAllowlistCount: allowlistedCount,
    finalAvailableMenusCount: allowlistedCount,
    allowlistNotInMenuDatabase,
    menuDatabaseNotInAllowlist,
    activeFilter: 'category=만들어먹기 + normalized allowlist',
  });

  if (afterCategoryFilterCount > 0) {
    console.warn('[DecisionEngine] fallback #1: using make-category menus without allowlist');
    return makeCategoryMenus;
  }

  console.error('[DecisionEngine] fallback #2: make category empty, using full menu pool');
  return menus;
}

// Decision modes
export type DecisionMode = 'random' | 'personalized';

export interface DecisionOptions {
  mode?: DecisionMode;
}

// Preference vector for personalized recommendation
export interface PreferenceVector {
  spicy: number; // 0-3
  soup: number; // 0-2
  preferRice: boolean;
  preferNoodle: boolean;
  meat: number; // 0-3
  seafood: number; // 0-3
  veg: number; // 0-3
  time: number; // 0-2
  budget: number; // 0-2
}

export interface DecisionInput {
  who: WhoType;
  how: HowType;
  outdoor: OutdoorType | null;
  excludeMenu?: string;
  // Personalized preferences (from survey)
  preferences?: PreferenceVector;
}

export interface DecisionResult {
  menu: string;
  reason: string;
  ingredients?: string[];
  how?: HowType; // 추가: 어떻게 먹을지 정보
  outdoor?: OutdoorType | null; // 추가: 외식 옵션 정보
  actions: {
    type: 'recipe' | 'youtube' | 'shopping' | 'delivery' | 'restaurant';
    label: string;
    url: string;
    deepLink?: string;
    fallbackUrl?: string;
  }[];
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// 최근 N개 히스토리에서 나온 메뉴 이름 가져오기
function getRecentMenuNames(count: number = 5): string[] {
  try {
    const history = getHistory();
    return history.slice(0, count).map(item => item.menuName);
  } catch {
    return [];
  }
}

// 최근 메뉴를 제외한 다양한 메뉴 선택 (개선된 랜덤)
function selectDiverseMenu(availableMenus: MenuItem[], excludeMenu?: string): MenuItem {
  if (availableMenus.length === 0) {
    console.error('[DecisionEngine] selectDiverseMenu received 0 menus, fallback to full menuDatabase');
    return getRandomItem(menuDatabase);
  }
  
  // 1. 명시적으로 제외할 메뉴 필터링
  let filtered = excludeMenu 
    ? availableMenus.filter(item => item.name !== excludeMenu)
    : availableMenus;
  
  // 2. 최근 5개 히스토리 메뉴 제외 (다양성 확보)
  const recentMenus = getRecentMenuNames(5);
  if (recentMenus.length > 0) {
    const withoutRecent = filtered.filter(item => !recentMenus.includes(item.name));
    // 제외 후에도 충분한 선택지가 있으면 사용
    if (withoutRecent.length >= Math.min(5, filtered.length * 0.3)) {
      filtered = withoutRecent;
    }
  }
  
  // 3. Fisher-Yates shuffle로 랜덤 섞기 (더 나은 분포)
  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // 4. 섞인 배열의 첫 번째 항목 반환
  return shuffled[0];
}

function filterMenuByContext(who: WhoType): MenuItem[] {
  let filtered = [...menuDatabase];

  // 가족 모드: 매운 음식 제외
  if (who === '가족') {
    filtered = filtered.filter((item) => item.familyFriendly && item.spicyLevel <= 1);
  }

  return filtered;
}

function generateReason(who: WhoType, menu: MenuItem): string {
  const whoKey =
    ({
      '나 혼자': 'solo',
      커플: 'couple',
      가족: 'family',
      친구: 'friends',
    }[who] as keyof typeof reasonTemplates) ?? 'solo';

  // 메뉴 특성 기반 추가 설명
  const meta = menu.meta || getDefaultMeta(menu);
  const extras: string[] = [];
  
  if (meta.spicy >= 2) extras.push('매콤한 맛이 일품');
  if (meta.soup >= 2) extras.push('따뜻한 국물이 최고');
  if (meta.meat >= 3) extras.push('고기가 가득');
  if (meta.seafood >= 2) extras.push('신선한 해산물');
  if (meta.veg >= 3) extras.push('채소 가득');
  
  const baseReason = getRandomItem(reasonTemplates[whoKey]);
  
  // 특성이 있으면 추가, 없으면 기본 문구만
  if (extras.length > 0) {
    return `${baseReason} (${extras.join(', ')})`;
  }
  
  return baseReason;
}

// Score a menu based on preferences and weather
function scoreMenu(item: MenuItem, prefs: PreferenceVector, weather?: WeatherData | null): number {
  const meta = item.meta || getDefaultMeta(item);
  let score = 100; // Base score

  // Strong dislikes - heavy penalty
  if (prefs.spicy === 0 && meta.spicy >= 2) {
    score -= 100; // Effectively excluded
  }

  // Spicy preference matching
  const spicyDiff = Math.abs(prefs.spicy - meta.spicy);
  score -= spicyDiff * 15;

  // Soup preference
  if (prefs.soup === 0 && meta.soup >= 2) {
    score -= 30;
  } else if (prefs.soup === 2 && meta.soup === 0) {
    score -= 20;
  } else {
    score += (2 - Math.abs(prefs.soup - meta.soup)) * 10;
  }

  // Rice vs Noodle preference
  if (prefs.preferRice && !prefs.preferNoodle && meta.rice) {
    score += 25;
  }
  if (prefs.preferNoodle && !prefs.preferRice && meta.noodle) {
    score += 25;
  }
  if (prefs.preferRice && prefs.preferNoodle) {
    if (meta.rice || meta.noodle) score += 15;
  }

  // Protein preferences
  score += Math.max(0, 15 - Math.abs(prefs.meat - meta.meat) * 8);
  score += Math.max(0, 15 - Math.abs(prefs.seafood - meta.seafood) * 8);
  score += Math.max(0, 10 - Math.abs(prefs.veg - meta.veg) * 5);

  // Time preference
  score -= Math.abs(prefs.time - meta.time) * 10;

  // Budget preference
  score -= Math.abs(prefs.budget - meta.budget) * 12;

  // Weather-based multiplier (참고용)
  if (weather) {
    const multiplier = getWeatherMultiplier(weather);
    
    // Apply weather multipliers to relevant menu attributes
    if (meta.soup >= 2) {
      score = score * multiplier.soup;
    }
    if (meta.spicy >= 2) {
      score = score * multiplier.spicy;
    }
    // Cold food bonus (샐러드, 냉면 등 차가운 음식은 tags에 'cold' 포함)
    if (meta.tags?.includes('cold')) {
      score = score * multiplier.cold;
    }
  }

  return Math.max(0, score);
}

// Select from candidates with weighted random
function selectWeightedRandom(candidates: { item: MenuItem; score: number }[]): MenuItem {
  if (candidates.length === 0) {
    throw new Error('No candidates available');
  }
  if (candidates.length === 1) {
    return candidates[0].item;
  }

  const totalScore = candidates.reduce((sum, c) => sum + c.score, 0);
  if (totalScore === 0) return getRandomItem(candidates).item;

  let random = Math.random() * totalScore;
  for (const candidate of candidates) {
    random -= candidate.score;
    if (random <= 0) return candidate.item;
  }
  return candidates[0].item;
}

// Generate personalized reason with fun tone
function generatePersonalizedReason(item: MenuItem, prefs: PreferenceVector, who: WhoType): string {
  const meta = item.meta || getDefaultMeta(item);
  const reasons: string[] = [];

  if (prefs.spicy > 0 && meta.spicy >= 2) {
    reasons.push(
      getRandomItem([
        '매운 거 당기는 날, 이건 거의 운명',
        '매운맛 러버를 위한 완벽한 선택',
        '얼큰하게 한 번 가시죠!',
      ])
    );
  } else if (prefs.spicy === 0 && meta.spicy === 0) {
    reasons.push('맵찔이도 안심하고 먹을 수 있는 메뉴');
  }

  if (prefs.soup >= 1 && meta.soup >= 1) {
    reasons.push(getRandomItem(['오늘은 국물각이야', '따뜻한 국물로 힐링 타임', '국물 한 모금의 행복']));
  }

  if (prefs.preferRice && meta.rice) reasons.push('밥 한 공기 뚝딱 해치우기 좋은 메뉴');
  if (prefs.preferNoodle && meta.noodle) reasons.push('면 러버라면 이건 무조건');

  if (prefs.meat >= 2 && meta.meat >= 2) {
    reasons.push(getRandomItem(['고기 먹고 싶을 때 이거지!', '육식 본능을 만족시키는 선택', '고기가 메인이라 든든함']));
  }
  if (prefs.seafood >= 2 && meta.seafood >= 2) reasons.push('신선한 바다의 맛');
  if (prefs.veg >= 2 && meta.veg >= 2) reasons.push('채소 가득해서 속이 편안한 메뉴');

  if (prefs.time === 0 && meta.time === 0) {
    reasons.push(getRandomItem(['빠르게 먹고 치고 빠지기 좋은 선택', '시간 없을 때 딱인 메뉴', '바쁜 현대인을 위한 메뉴']));
  }
  if (prefs.budget === 0 && meta.budget === 0) reasons.push('가성비 갑 메뉴');

  if (reasons.length === 0) return generateReason(who, item);
  return getRandomItem(reasons);
}

// Build result object with actions
function buildResult(
  who: WhoType,
  how: HowType,
  outdoor: OutdoorType | null,
  selectedMenu: MenuItem,
  reason: string
): DecisionResult {
  const result: DecisionResult = {
    menu: selectedMenu.name,
    reason,
    how, // 추가
    outdoor, // 추가
    actions: [],
  };

  if (isMakeHow(how)) {
    result.ingredients = selectedMenu.ingredients || [];

    result.actions = [
      {
        type: 'recipe',
        label: '레시피 보기',
        url: `https://www.google.com/search?q=${encodeURIComponent(selectedMenu.name + ' 레시피')}`,
      },
      {
        type: 'youtube',
        label: '유튜브로 배우기',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMenu.name + ' 레시피')}`,
      },
    ];

    if (selectedMenu.ingredients && selectedMenu.ingredients.length > 0) {
      const ingredientQuery = selectedMenu.ingredients.join(' ');
      result.actions.push({
        type: 'shopping',
        label: '토스쇼핑에서 재료 구매',
        url: `https://toss.im/shopping/search?q=${encodeURIComponent(ingredientQuery)}`,
      });
    }
  } else if (how === '배달') {
    const encodedMenu = encodeURIComponent(selectedMenu.name);

    result.actions = [
      {
        type: 'delivery',
        label: '🛵 배민에서 보기',
        url: `https://www.baemin.com/`,
        deepLink: `baemin://`,
        fallbackUrl: `https://www.baemin.com/`,
      },
      {
        type: 'delivery',
        label: '🛵 쿠팡이츠에서 보기',
        url: `https://www.coupangeats.com/`,
        deepLink: `coupangeats://`,
        fallbackUrl: `https://www.coupangeats.com/`,
      },
      {
        type: 'delivery',
        label: '🗺️ 네이버지도에서 보기',
        url: `https://map.naver.com/v5/search/${encodedMenu}`,
      },
    ];
  } else if (how === '외식') {
    // 외식은 ResultScreen의 TOP5 모달로만 처리
    // actions는 비워둠 (네이버 지도 바로 연결하지 않음)
    result.actions = [];
  }

  return result;
}

// Personalized decision
function makePersonalizedDecision(input: DecisionInput): DecisionResult {
  const { who, how, preferences, excludeMenu } = input;
  if (!preferences) throw new Error('Preferences required for personalized mode');

  let availableMenus = filterMenuByContext(who);

  // 🍳 만들어 먹기 선택 시 만들어먹기 카테고리만 필터링
  if (isMakeHow(how)) {
    availableMenus = resolveMakeMenusWithFallback(availableMenus, { who, how, outdoor: input.outdoor, mode: 'personalized' });
  }

  if (excludeMenu) {
    const filtered = availableMenus.filter((item) => item.name !== excludeMenu);
    if (filtered.length > 0) availableMenus = filtered;
  }

  const scored = availableMenus.map((item) => ({
    item,
    score: scoreMenu(item, preferences, null), // Weather will be integrated in future version
  }));

  scored.sort((a, b) => b.score - a.score);

  const topN = Math.max(5, Math.ceil(scored.length * 0.3));
  const topCandidates = scored.slice(0, topN).filter((c) => c.score > 0);

  if (topCandidates.length === 0) {
    const selectedMenu = selectDiverseMenu(availableMenus, excludeMenu);
    return buildResult(who, input.how, input.outdoor, selectedMenu, generateReason(who, selectedMenu));
  }

  const selectedMenu = selectWeightedRandom(topCandidates);
  const reason = generatePersonalizedReason(selectedMenu, preferences, who);

  return buildResult(who, input.how, input.outdoor, selectedMenu, reason);
}

// Main decision function with mode support
export function makeDecision(input: DecisionInput, opts?: DecisionOptions): DecisionResult {
  const mode = opts?.mode || 'random';

  if (mode === 'personalized') {
    return makePersonalizedDecision(input);
  }

  const { who, how, outdoor, excludeMenu } = input;

  let availableMenus = filterMenuByContext(who);

  // 🍳 만들어 먹기 선택 시 만들어먹기 카테고리만 필터링
  if (isMakeHow(how)) {
    availableMenus = resolveMakeMenusWithFallback(availableMenus, { who, how, outdoor, mode });
  }

  // selectDiverseMenu 함수가 내부에서 excludeMenu와 최근 히스토리를 처리
  const selectedMenu = selectDiverseMenu(availableMenus, excludeMenu);
  const reason = generateReason(who, selectedMenu);

  return buildResult(who, how, outdoor, selectedMenu, reason);
}
