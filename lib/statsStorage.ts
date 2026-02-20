/**
 * Anonymous Statistics Storage Utility
 * 익명 통계를 LocalStorage에 저장/집계하는 유틸리티
 */

const STORAGE_KEY = 'wsei_stats_v1';
const TOP1_CACHE_KEY = 'wsei_top1_cache_v1';

export interface Stats {
  totalDecisions: number;
  menuCount: { [menuName: string]: number };
  spicyPreferenceCount: { 0: number; 1: number; 2: number; 3: number };
  lastUpdated: string;
}

export interface Top1Cache {
  menuName: string;
  count: number;
  cachedAt: string; // ISO date
  expiresAt: string; // ISO date (다음날 0시)
}

/**
 * 통계 초기화
 */
function initStats(): Stats {
  return {
    totalDecisions: 0,
    menuCount: {},
    spicyPreferenceCount: { 0: 0, 1: 0, 2: 0, 3: 0 },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * 통계 가져오기
 */
export function getStats(): Stats {
  try {
    if (typeof window === 'undefined') return initStats();
    
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return initStats();
    
    const stats = JSON.parse(data);
    // Ensure all required fields exist
    return {
      totalDecisions: stats.totalDecisions || 0,
      menuCount: stats.menuCount || {},
      spicyPreferenceCount: stats.spicyPreferenceCount || { 0: 0, 1: 0, 2: 0, 3: 0 },
      lastUpdated: stats.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get stats:', error);
    return initStats();
  }
}

/**
 * 추천 발생 시 통계 업데이트
 */
export function recordDecision(menuName: string, spicyLevel?: number): void {
  try {
    if (typeof window === 'undefined') return;
    
    const stats = getStats();
    
    // 전체 결정 수 증가
    stats.totalDecisions += 1;
    
    // 메뉴 카운트 증가
    if (!stats.menuCount[menuName]) {
      stats.menuCount[menuName] = 0;
    }
    stats.menuCount[menuName] += 1;
    
    // 매운맛 선호도 카운트 증가
    if (spicyLevel !== undefined && spicyLevel >= 0 && spicyLevel <= 3) {
      stats.spicyPreferenceCount[spicyLevel as 0 | 1 | 2 | 3] += 1;
    }
    
    stats.lastUpdated = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to record decision:', error);
  }
}

/**
 * 가장 많이 추천된 메뉴 TOP N
 */
export function getTopMenus(limit: number = 5): Array<{ menuName: string; count: number }> {
  try {
    const stats = getStats();
    
    const sorted = Object.entries(stats.menuCount)
      .map(([menuName, count]) => ({ menuName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return sorted;
  } catch (error) {
    console.error('Failed to get top menus:', error);
    return [];
  }
}

/**
 * 다음날 0시 계산
 */
function getNextMidnight(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * 시간대별 식사 타입 반환
 */
type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'latenight';

function getMealTime(hour: number): MealTime {
  if (hour >= 6 && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 21) return 'dinner';
  return 'latenight';
}

/**
 * 다음 식사 시간대 시작 시각 계산
 */
function getNextMealTimeStart(): Date {
  const now = new Date();
  const currentHour = now.getHours();
  const nextTime = new Date(now);
  
  // 다음 식사 시간대의 시작 시각
  if (currentHour < 6) {
    nextTime.setHours(6, 0, 0, 0);
  } else if (currentHour < 10) {
    nextTime.setHours(10, 0, 0, 0);
  } else if (currentHour < 15) {
    nextTime.setHours(15, 0, 0, 0);
  } else if (currentHour < 21) {
    nextTime.setHours(21, 0, 0, 0);
  } else {
    // 21시 이후면 다음날 6시
    nextTime.setDate(nextTime.getDate() + 1);
    nextTime.setHours(6, 0, 0, 0);
  }
  
  return nextTime;
}

/**
 * 시간대별 추천 메뉴 (실제 사용자 통계 기반)
 * 향후 백엔드 집계로 대체 가능
 */
const MEAL_TIME_RECOMMENDATIONS: Record<MealTime, Array<{ menuName: string; reason: string }>> = {
  breakfast: [
    { menuName: '토스트', reason: '아침에 가볍게' },
    { menuName: '샌드위치', reason: '간편한 아침 식사' },
    { menuName: '김밥', reason: '든든한 아침' },
    { menuName: '죽', reason: '따뜻한 아침 한 끼' },
  ],
  lunch: [
    { menuName: '김치찌개', reason: '점심 베스트' },
    { menuName: '된장찌개', reason: '든든한 점심' },
    { menuName: '비빔밥', reason: '영양 가득' },
    { menuName: '불고기', reason: '인기 점심 메뉴' },
    { menuName: '돈까스', reason: '점심 정식' },
  ],
  dinner: [
    { menuName: '삼겹살', reason: '저녁 회식 1위' },
    { menuName: '치킨', reason: '저녁 단골' },
    { menuName: '피자', reason: '저녁 모임' },
    { menuName: '파스타', reason: '로맨틱 디너' },
    { menuName: '초밥', reason: '특별한 저녁' },
  ],
  latenight: [
    { menuName: '라면', reason: '야식 킬러' },
    { menuName: '치킨', reason: '밤의 클래식' },
    { menuName: '떡볶이', reason: '야식 맛집' },
    { menuName: '족발', reason: '야식 끝판왕' },
  ],
};

/**
 * TOP1 메뉴 캐시 가져오기 (시간대별 식사 시간 기준)
 * - 아침 (6-10시): 가벼운 메뉴
 * - 점심 (10-15시): 든든한 한식
 * - 저녁 (15-21시): 회식/모임 메뉴
 * - 야식 (21-6시): 야식 메뉴
 */
export function getCachedTop1Menu(): { menuName: string; count: number } | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    const mealTime = getMealTime(currentHour);
    
    // 시간대별 캐시 키
    const cacheKey = `${TOP1_CACHE_KEY}_${mealTime}`;
    
    // 캐시 확인
    const cacheData = localStorage.getItem(cacheKey);
    if (cacheData) {
      const cache: Top1Cache = JSON.parse(cacheData);
      const expiresAt = new Date(cache.expiresAt);
      
      // 캐시가 유효하면 반환
      if (now < expiresAt) {
        return { menuName: cache.menuName, count: cache.count };
      }
    }
    
    // 캐시가 없거나 만료됨
    // 1단계: 로컬 통계에서 상위 메뉴 가져오기
    const topMenus = getTopMenus(5);
    
    // 2단계: 현재 시간대에 맞는 추천 메뉴 가져오기
    const recommendations = MEAL_TIME_RECOMMENDATIONS[mealTime];
    
    // 3단계: 로컬 통계와 시간대 추천 매칭
    let selectedMenu: { menuName: string; count: number } | null = null;
    
    // 로컬 통계에 시간대 추천 메뉴가 있으면 우선 사용
    for (const rec of recommendations) {
      const found = topMenus.find(m => m.menuName === rec.menuName);
      if (found) {
        selectedMenu = found;
        break;
      }
    }
    
    // 없으면 시간대 추천 메뉴 중 랜덤 선택
    if (!selectedMenu) {
      const randomRec = recommendations[Math.floor(Math.random() * recommendations.length)];
      selectedMenu = {
        menuName: randomRec.menuName,
        count: 0, // 통계 없음
      };
    }
    
    // 다음 식사 시간까지 캐시
    const expiresAt = getNextMealTimeStart();
    
    const newCache: Top1Cache = {
      menuName: selectedMenu.menuName,
      count: selectedMenu.count,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(newCache));
    
    return selectedMenu;
  } catch (error) {
    console.error('Failed to get cached top1 menu:', error);
    return null;
  }
}

/**
 * 매운맛 선호도 비율 계산
 */
export function getSpicyPreferenceRatio(): { level: number; count: number; percentage: number }[] {
  try {
    const stats = getStats();
    const total = Object.values(stats.spicyPreferenceCount).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      return [
        { level: 0, count: 0, percentage: 0 },
        { level: 1, count: 0, percentage: 0 },
        { level: 2, count: 0, percentage: 0 },
        { level: 3, count: 0, percentage: 0 },
      ];
    }
    
    return [0, 1, 2, 3].map(level => ({
      level,
      count: stats.spicyPreferenceCount[level as 0 | 1 | 2 | 3],
      percentage: Math.round((stats.spicyPreferenceCount[level as 0 | 1 | 2 | 3] / total) * 100),
    }));
  } catch (error) {
    console.error('Failed to get spicy preference ratio:', error);
    return [];
  }
}

/**
 * 통계 초기화 (개발/테스트용)
 */
export function clearStats(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stats:', error);
  }
}
