/**
 * 사운드 재생 유틸리티
 * 사용자 인터랙션 내에서만 호출해야 함 (자동 재생 금지)
 */

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private initialized = false;

  // 사운드 파일 경로
  private soundPaths = {
    click: '/sounds/click.mp3',
    spin: '/sounds/spin.mp3',
    success: '/sounds/success.mp3',
  };

  /**
   * 사운드 미리 로드 (선택적)
   */
  preload() {
    if (typeof window === 'undefined') return;
    
    Object.entries(this.soundPaths).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds.set(key, audio);
    });
    
    this.initialized = true;
  }

  /**
   * 사운드 재생
   * @param key 사운드 키 ('click' | 'spin' | 'success')
   * @param options 재생 옵션
   */
  play(
    key: keyof typeof this.soundPaths,
    options?: {
      volume?: number;
      loop?: boolean;
    }
  ): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;

    try {
      let audio = this.sounds.get(key);
      
      // 사운드가 로드되지 않았으면 새로 생성
      if (!audio) {
        audio = new Audio(this.soundPaths[key]);
        this.sounds.set(key, audio);
      }

      // 옵션 설정
      audio.volume = options?.volume ?? 0.4;
      audio.loop = options?.loop ?? false;

      // 재생 전 리셋
      audio.currentTime = 0;
      
      // 재생 (Promise로 처리)
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('[Sound] Play failed:', key, error);
        });
      }

      return audio;
    } catch (error) {
      console.warn('[Sound] Error playing:', key, error);
      return null;
    }
  }

  /**
   * 특정 사운드 정지
   */
  stop(key: keyof typeof this.soundPaths) {
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
    this.sounds.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}

// 싱글톤 인스턴스
export const soundManager = new SoundManager();

/**
 * 진동 피드백 (모바일 지원 시)
 */
export function vibrate(duration: number = 50) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (error) {
      console.warn('[Vibrate] Failed:', error);
    }
  }
}
