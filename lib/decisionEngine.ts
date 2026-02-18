import { menuDatabase, reasonTemplates, MenuItem, MenuMeta, getDefaultMeta } from './menuData';

type WhoType = '나 혼자' | '커플' | '가족' | '친구';
type HowType = '만들어 먹기' | '배달' | '외식';
type OutdoorType = '근처 간단 외식' | '가까운 시내' | '기분전환 야외';

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
  meat: number; // 0-3 (preference level)
  seafood: number; // 0-3
  veg: number; // 0-3
  time: number; // 0-2
  budget: number; // 0-2
}

interface DecisionInput {
  who: WhoType;
  how: HowType;
  outdoor: OutdoorType | null;
  excludeMenu?: string;
  // Personalized preferences (from survey)
  preferences?: PreferenceVector;
}

interface DecisionResult {
  menu: string;
  reason: string;
  ingredients?: string[];
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

function filterMenuByContext(who: WhoType): MenuItem[] {
  let filtered = [...menuDatabase];
  
  // 가족 모드: 매운 음식 제외
  if (who === '가족') {
    filtered = filtered.filter(item => item.familyFriendly && item.spicyLevel <= 1);
  }
  
  return filtered;
}

function generateReason(who: WhoType, menu: MenuItem): string {
  const whoKey = {
    '나 혼자': 'solo',
    '커플': 'couple',
    '가족': 'family',
    '친구': 'friends',
  }[who] as keyof typeof reasonTemplates;
  
  const templates = reasonTemplates[whoKey];
  return getRandomItem(templates);
}

// Score a menu based on preferences
function scoreMenu(item: MenuItem, prefs: PreferenceVector): number {
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
  
  // Normalize scores to weights
  const totalScore = candidates.reduce((sum, c) => sum + c.score, 0);
  
  if (totalScore === 0) {
    // All scores are 0, pick random
    return getRandomItem(candidates).item;
  }
  
  let random = Math.random() * totalScore;
  
  for (const candidate of candidates) {
    random -= candidate.score;
    if (random <= 0) {
      return candidate.item;
    }
  }
  
  // Fallback
  return candidates[0].item;
}

// Generate personalized reason with fun tone
function generatePersonalizedReason(item: MenuItem, prefs: PreferenceVector, who: WhoType): string {
  const meta = item.meta || getDefaultMeta(item);
  const reasons: string[] = [];
  
  // Analyze why this was recommended (fun tone)
  if (prefs.spicy > 0 && meta.spicy >= 2) {
    const spicyReasons = [
      '매운 거 당기는 날, 이건 거의 운명',
      '매운맛 러버를 위한 완벽한 선택',
      '얼큰하게 한 번 가시죠!',
    ];
    reasons.push(getRandomItem(spicyReasons));
  } else if (prefs.spicy === 0 && meta.spicy === 0) {
    reasons.push('맵찔이도 안심하고 먹을 수 있는 메뉴');
  }
  
  if (prefs.soup >= 1 && meta.soup >= 1) {
    const soupReasons = [
      '오늘은 국물각이야',
      '따뜻한 국물로 힐링 타임',
      '국물 한 모금의 행복',
    ];
    reasons.push(getRandomItem(soupReasons));
  }
  
  if (prefs.preferRice && meta.rice) {
    reasons.push('밥 한 공기 뚝딱 해치우기 좋은 메뉴');
  }
  
  if (prefs.preferNoodle && meta.noodle) {
    reasons.push('면 러버라면 이건 무조건');
  }
  
  if (prefs.meat >= 2 && meta.meat >= 2) {
    const meatReasons = [
      '고기 먹고 싶을 때 이거지!',
      '육식 본능을 만족시키는 선택',
      '고기가 메인이라 든든함',
    ];
    reasons.push(getRandomItem(meatReasons));
  }
  
  if (prefs.seafood >= 2 && meta.seafood >= 2) {
    reasons.push('신선한 바다의 맛');
  }
  
  if (prefs.veg >= 2 && meta.veg >= 2) {
    reasons.push('채소 가득해서 속이 편안한 메뉴');
  }
  
  if (prefs.time === 0 && meta.time === 0) {
    const quickReasons = [
      '빠르게 먹고 치고 빠지기 좋은 선택',
      '시간 없을 때 딱인 메뉴',
      '바쁜 현대인을 위한 메뉴',
    ];
    reasons.push(getRandomItem(quickReasons));
  }
  
  if (prefs.budget === 0 && meta.budget === 0) {
    reasons.push('가성비 갑 메뉴');
  }
  
  // Fallback to generic reason
  if (reasons.length === 0) {
    return generateReason(who, item);
  }
  
  // Pick 1 reason (simpler is better)
  return getRandomItem(reasons);
}

// Personalized decision
function makePersonalizedDecision(input: DecisionInput): DecisionResult {
  const { who, preferences, excludeMenu } = input;
  
  if (!preferences) {
    throw new Error('Preferences required for personalized mode');
  }
  
  // Filter by context
  let availableMenus = filterMenuByContext(who);
  
  // Exclude previous menu
  if (excludeMenu) {
    const filtered = availableMenus.filter(item => item.name !== excludeMenu);
    if (filtered.length > 0) {
      availableMenus = filtered;
    }
  }
  
  // Score all menus
  const scored = availableMenus.map(item => ({
    item,
    score: scoreMenu(item, preferences)
  }));
  
  // Sort by score
  scored.sort((a, b) => b.score - a.score);
  
  // Get top N candidates (top 5 or 30% of available menus, whichever is larger)
  const topN = Math.max(5, Math.ceil(scored.length * 0.3));
  const topCandidates = scored.slice(0, topN).filter(c => c.score > 0);
  
  if (topCandidates.length === 0) {
    // No good candidates, fall back to random
    const selectedMenu = getRandomItem(availableMenus);
    return buildResult(who, input.how, input.outdoor, selectedMenu, generateReason(who, selectedMenu));
  }
  
  // Weighted random selection from top candidates
  const selectedMenu = selectWeightedRandom(topCandidates);
  const reason = generatePersonalizedReason(selectedMenu, preferences, who);
  
  return buildResult(who, input.how, input.outdoor, selectedMenu, reason);
}

// Build result object with actions
function buildResult(who: WhoType, how: HowType, outdoor: OutdoorType | null, selectedMenu: MenuItem, reason: string): DecisionResult {
  const result: DecisionResult = {
    menu: selectedMenu.name,
    reason,
    actions: [],
  };
  
  // Generate actions based on "how"
  if (how === '만들어 먹기') {
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
    let searchQuery = '';
    
    if (outdoor === '근처 간단 외식') {
      searchQuery = `${selectedMenu.name} 맛집`;
    } else if (outdoor === '가까운 시내') {
      searchQuery = `맛집`;
    } else if (outdoor === '기분전환 야외') {
      searchQuery = `전망 좋은 식당`;
    }
    
    result.actions = [
      {
        type: 'restaurant',
        label: '🗺️ 네이버지도에서 식당 찾기',
        url: `https://map.naver.com/v5/search/${encodeURIComponent(searchQuery)}`,
      },
    ];
  }
  
  return result;
}

// Main decision function with mode support
export function makeDecision(input: DecisionInput, opts?: DecisionOptions): DecisionResult {
  const mode = opts?.mode || 'random';
  
  if (mode === 'personalized') {
    return makePersonalizedDecision(input);
  }
  
  // Random mode (existing logic)
  const { who, how, outdoor, excludeMenu } = input;
  
  // Filter menu based on context
  let availableMenus = filterMenuByContext(who);
  
  // Exclude previous menu if provided (with retry logic)
  if (excludeMenu) {
    const filteredMenus = availableMenus.filter(item => item.name !== excludeMenu);
    if (filteredMenus.length > 0) {
      availableMenus = filteredMenus;
    }
  }
  
  const selectedMenu = getRandomItem(availableMenus);
  const reason = generateReason(who, selectedMenu);
  
  return buildResult(who, how, outdoor, selectedMenu, reason);
}
