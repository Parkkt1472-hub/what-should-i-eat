/**
 * Preference Storage Utility
 * 사용자 선호도 프로필을 LocalStorage에 저장/로드하는 유틸리티
 */

import { PreferenceVector } from './decisionEngine';

const STORAGE_KEY = 'wsei_prefs_v1';

/**
 * 선호도 프로필을 LocalStorage에 저장
 */
export function savePreferences(preferences: PreferenceVector): void {
  try {
    if (typeof window === 'undefined') return;
    
    const data = {
      preferences,
      savedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

/**
 * LocalStorage에서 선호도 프로필 로드
 * @returns 저장된 선호도 또는 null
 */
export function loadPreferences(): PreferenceVector | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return parsed.preferences || null;
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return null;
  }
}

/**
 * 저장된 선호도 프로필 삭제 (초기화)
 */
export function clearPreferences(): void {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear preferences:', error);
  }
}

/**
 * 저장된 선호도가 있는지 확인
 */
export function hasStoredPreferences(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    return false;
  }
}
