/**
 * Anonymous ID & Referral System
 * 익명 사용자 ID 및 공유 추천 시스템
 */

const ANON_ID_KEY = 'wsei_anon_id_v1';
const REFERRER_KEY = 'wsei_referrer_v1';
const SHARE_COUNT_KEY = 'wsei_share_count_v1';

/**
 * 고유한 익명 ID 생성
 */
function generateAnonId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}${randomStr}`;
}

/**
 * 익명 ID 가져오기 (없으면 생성)
 */
export function getAnonId(): string {
  if (typeof window === 'undefined') return '';
  
  try {
    let anonId = localStorage.getItem(ANON_ID_KEY);
    
    if (!anonId) {
      anonId = generateAnonId();
      localStorage.setItem(ANON_ID_KEY, anonId);
      console.log('[AnonID] New ID created:', anonId);
    }
    
    return anonId;
  } catch (error) {
    console.error('[AnonID] Failed to get/create ID:', error);
    return '';
  }
}

/**
 * 공유 URL 생성
 */
export function generateShareUrl(): string {
  if (typeof window === 'undefined') return '';
  
  const anonId = getAnonId();
  const baseUrl = window.location.origin;
  return `${baseUrl}/?ref=${anonId}`;
}

/**
 * URL에서 referrer ID 추출하고 저장
 */
export function processReferrer(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    
    if (ref) {
      const myId = getAnonId();
      
      // 자기 자신은 추천 불가
      if (ref === myId) {
        console.log('[Referral] Self-referral blocked');
        return;
      }
      
      // 이미 추천받은 적 있는지 확인
      const existingRef = localStorage.getItem(REFERRER_KEY);
      if (existingRef) {
        console.log('[Referral] Already has a referrer:', existingRef);
        return;
      }
      
      // Referrer 저장
      localStorage.setItem(REFERRER_KEY, ref);
      console.log('[Referral] Referrer saved:', ref);
      
      // 서버에 추천 기록 전송 (API 호출)
      recordReferral(ref, myId);
    }
  } catch (error) {
    console.error('[Referral] Failed to process referrer:', error);
  }
}

/**
 * 서버에 추천 기록 전송
 */
async function recordReferral(referrerId: string, referredId: string): Promise<void> {
  try {
    const response = await fetch('/api/referral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referrer_id: referrerId,
        referred_id: referredId,
      }),
    });
    
    if (response.ok) {
      console.log('[Referral] Recorded successfully');
    } else {
      console.error('[Referral] Failed to record:', response.status);
    }
  } catch (error) {
    console.error('[Referral] API error:', error);
  }
}

/**
 * 현재 사용자의 공유 카운트 가져오기
 */
export async function getShareCount(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  
  try {
    // 로컬 캐시 확인 (1분 캐시)
    const cached = localStorage.getItem(SHARE_COUNT_KEY);
    if (cached) {
      const { count, expiry } = JSON.parse(cached);
      if (Date.now() < expiry) {
        return count;
      }
    }
    
    // 서버에서 가져오기
    const anonId = getAnonId();
    const response = await fetch(`/api/referral?anon_id=${anonId}`);
    
    if (response.ok) {
      const data = await response.json();
      const count = data.share_count || 0;
      
      // 캐시 저장 (1분)
      localStorage.setItem(SHARE_COUNT_KEY, JSON.stringify({
        count,
        expiry: Date.now() + 60 * 1000,
      }));
      
      return count;
    }
    
    return 0;
  } catch (error) {
    console.error('[ShareCount] Failed to get count:', error);
    return 0;
  }
}

/**
 * 공유 카운트 캐시 무효화 (공유 후 호출)
 */
export function invalidateShareCountCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SHARE_COUNT_KEY);
  } catch (error) {
    console.error('[ShareCount] Failed to invalidate cache:', error);
  }
}
