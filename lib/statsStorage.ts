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
 * TOP1 메뉴 캐시 가져오기 (하루 단위 캐시)
 */
export function getCachedTop1Menu(): { menuName: string; count: number } | null {
  try {
    if (typeof window === 'undefined') return null;
    
    // 캐시 확인
    const cacheData = localStorage.getItem(TOP1_CACHE_KEY);
    if (cacheData) {
      const cache: Top1Cache = JSON.parse(cacheData);
      const now = new Date();
      const expiresAt = new Date(cache.expiresAt);
      
      // 캐시가 유효하면 반환
      if (now < expiresAt) {
        return { menuName: cache.menuName, count: cache.count };
      }
    }
    
    // 캐시가 없거나 만료됨 - 새로 계산
    const topMenus = getTopMenus(1);
    if (topMenus.length === 0) return null;
    
    const top1 = topMenus[0];
    const now = new Date();
    const expiresAt = getNextMidnight();
    
    // 캐시 저장 (다음날 0시까지 유효)
    const newCache: Top1Cache = {
      menuName: top1.menuName,
      count: top1.count,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    
    localStorage.setItem(TOP1_CACHE_KEY, JSON.stringify(newCache));
    
    return top1;
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
