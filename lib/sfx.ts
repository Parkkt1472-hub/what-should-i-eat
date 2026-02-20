/**
 * 사운드 이펙트 매니저 (모바일 unlock 패턴 포함)
 * 
 * 모바일(iOS Safari 포함)에서 사운드 재생이 차단되는 문제 해결:
 * - 사용자 클릭 이벤트 내부에서 모든 오디오를 unlock 처리
 * - unlock: volume=0으로 짧게 재생 후 즉시 정지
 * - 이후 setTimeout 등 비동기 컨텍스트에서도 재생 가능
 */

type SoundKey = 'click' | 'spin' | 'success';

class SoundEffectManager {
  private sounds: Map<SoundKey, HTMLAudioElement> = new Map();
  private unlocked = false;

  private soundPaths: Record<SoundKey, string> = {
    click: '/sounds/click.mp3',
    spin: '/sounds/spin.mp3',
    success: '/sounds/success.mp3',
  };

  /**
   * 사운드 초기화 (프리로드)
   */
  init() {
    if (typeof window === 'undefined') return;

    Object.entries(this.soundPaths).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds.set(key as SoundKey, audio);
    });
  }

  /**
   * 모바일 사운드 unlock
   * 반드시 사용자 클릭 이벤트 핸들러 내부에서 호출해야 함
   */
  async unlock() {
    if (typeof window === 'undefined' || this.unlocked) return;

    console.log('[SFX] 🔓 Unlocking audio for mobile...');

    try {
      // 각 사운드를 순차적으로 unlock
      for (const [key, audio] of this.sounds.entries()) {
        try {
          audio.volume = 0.01; // 거의 무음
          audio.muted = false;
          
          await audio.play();
          console.log(`[SFX] ✅ ${key} unlocked`);
          
          // 즉시 정지
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0.4; // 기본 볼륨으로 복구
        } catch (err) {
          console.warn(`[SFX] ⚠️ ${key} unlock failed:`, err);
        }
      }

      this.unlocked = true;
      console.log('[SFX] ✅ All audio unlocked successfully!');
    } catch (error) {
      console.error('[SFX] ❌ Unlock critical error:', error);
    }
  }

  /**
   * 사운드 재생
   */
  play(key: SoundKey, options?: { volume?: number; loop?: boolean }): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;

    try {
      let audio = this.sounds.get(key);

      if (!audio) {
        audio = new Audio(this.soundPaths[key]);
        audio.preload = 'auto';
        this.sounds.set(key, audio);
      }

      // 오디오 설정
      audio.volume = options?.volume ?? 0.4;
      audio.loop = options?.loop ?? false;
      audio.currentTime = 0;

      // 재생 시도
      const playPromise = audio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            console.log(`[SFX] ✅ ${key} 재생 성공`);
          })
          .catch((err) => {
            console.warn(`[SFX] ❌ ${key} 재생 실패:`, err.message);
            console.warn('[SFX] 해결 방법: 사용자가 페이지를 먼저 클릭해야 합니다.');
          });
      }

      return audio;
    } catch (error) {
      console.warn(`[SFX] ❌ ${key} 에러:`, error);
      return null;
    }
  }

  /**
   * 특정 사운드 정지
   */
  stop(key: SoundKey) {
    const audio = this.sounds.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * 모든 사운드 정지
   */
  stopAll() {
    this.sounds.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}

// 싱글톤 인스턴스
export const sfx = new SoundEffectManager();

/**
 * 진동 피드백 (모바일 지원 시)
 */
export function vibrate(duration: number = 50) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (error) {
      console.warn('[SFX] Vibrate failed:', error);
    }
  }
}
