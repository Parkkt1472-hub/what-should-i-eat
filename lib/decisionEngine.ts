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

// Generate personalized reason
function generatePersonalizedReason(item: MenuItem, prefs: PreferenceVector, who: WhoType): string {
  const meta = item.meta || getDefaultMeta(item);
  const reasons: string[] = [];
  
  // Analyze why this was recommended
  if (prefs.spicy > 0 && meta.spicy >= 2) {
    reasons.push('매운 음식을 좋아하시는 분께 딱이에요');
  } else if (prefs.spicy === 0 && meta.spicy === 0) {
    reasons.push('맵지 않아 부담 없이 드실 수 있어요');
  }
  
  if (prefs.soup >= 1 && meta.soup >= 1) {
    reasons.push('따뜻한 국물이 생각날 때 좋아요');
  }
  
  if (prefs.preferRice && meta.rice) {
    reasons.push('밥과 함께 든든하게 즐기실 수 있어요');
  }
  
  if (prefs.preferNoodle && meta.noodle) {
    reasons.push('면 요리를 선호하시는 분께 추천드려요');
  }
  
  if (prefs.meat >= 2 && meta.meat >= 2) {
    reasons.push('고기가 풍부해서 만족스러워요');
  }
  
  if (prefs.seafood >= 2 && meta.seafood >= 2) {
    reasons.push('신선한 해산물 맛을 즐기실 수 있어요');
  }
  
  if (prefs.veg >= 2 && meta.veg >= 2) {
    reasons.push('채소가 많아 건강하게 드실 수 있어요');
  }
  
  if (prefs.time === 0 && meta.time === 0) {
    reasons.push('빠르게 준비할 수 있어 시간이 없을 때 좋아요');
  }
  
  if (prefs.budget === 0 && meta.budget === 0) {
    reasons.push('경제적이면서도 맛있는 선택이에요');
  }
  
  // Fallback to generic reason
  if (reasons.length === 0) {
    return generateReason(who, item);
  }
  
  // Pick 1-2 reasons
  if (reasons.length === 1) {
    return reasons[0];
  }
  
  const selected = [reasons[0]];
  if (reasons.length > 1 && Math.random() > 0.5) {
    selected.push(reasons[Math.floor(Math.random() * (reasons.length - 1)) + 1]);
  }
  
  return selected.join('. ');
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
