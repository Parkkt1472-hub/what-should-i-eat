/**
 * Recommendation History Storage Utility
 * 추천 결과 히스토리를 LocalStorage에 저장/관리하는 유틸리티
 */

const STORAGE_KEY = 'wsei_history_v1';
const MAX_HISTORY_ITEMS = 20;

export interface HistoryItem {
  id: string;
  menuName: string;
  mode: 'random' | 'personalized';
  reason: string;
  who?: string;
  how?: string;
  createdAt: string; // ISO 8601 format
}

/**
 * 추천 결과를 히스토리에 추가
 */
export function addToHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): void {
  try {
    if (typeof window === 'undefined') return;
    
    const history = getHistory();
    
    const newItem: HistoryItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    // 최신 항목을 맨 앞에 추가
    history.unshift(newItem);
    
    // 최대 개수 제한
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to add to history:', error);
  }
}

/**
 * 전체 히스토리 가져오기
 */
export function getHistory(): HistoryItem[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const history = JSON.parse(data);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
}

/**
 * 전체 히스토리 삭제
 */
export function clearHistory(): void {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

/**
 * 특정 히스토리 항목 삭제
 */
export function removeHistoryItem(id: string): void {
  try {
    if (typeof window === 'undefined') return;
    
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove history item:', error);
  }
}

/**
 * 히스토리 항목 개수 가져오기
 */
export function getHistoryCount(): number {
  return getHistory().length;
}

/**
 * 고유 ID 생성
 */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
