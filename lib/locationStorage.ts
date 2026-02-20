/**
 * Location Storage Utility
 * 사용자 지역 정보를 LocalStorage에 저장/관리
 */

const STORAGE_KEY = 'wsei_user_location_v1';

/**
 * 저장된 지역 정보 가져오기
 */
export function getStoredLocation(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to get stored location:', error);
    return null;
  }
}

/**
 * 지역 정보 저장
 */
export function saveLocation(location: string): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, location.trim());
  } catch (error) {
    console.error('Failed to save location:', error);
  }
}

/**
 * 지역 정보가 저장되어 있는지 확인
 */
export function hasStoredLocation(): boolean {
  const location = getStoredLocation();
  return Boolean(location && location.length > 0);
}

/**
 * 지역 정보 삭제
 */
export function clearLocation(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear location:', error);
  }
}
