/**
 * Anonymous Statistics Storage Utility
 * 익명 통계를 LocalStorage에 저장/집계하는 유틸리티
 */

const STORAGE_KEY = 'wsei_stats_v1';

export interface Stats {
  totalDecisions: number;
  menuCount: { [menuName: string]: number };
  spicyPreferenceCount: { 0: number; 1: number; 2: number; 3: number };
  lastUpdated: string;
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
