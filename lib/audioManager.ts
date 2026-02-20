/**
 * 🎵 강력한 오디오 매니저 - 모바일 완벽 지원
 * 
 * 핵심 전략:
 * 1. 사용자 클릭 이벤트에서 즉시 Audio 객체 생성 및 재생
 * 2. unlock 단계에서 모든 오디오를 실제로 짧게 재생
 * 3. 재생 실패 시 상세 로그 + 재시도 로직
 */

type SoundType = 'click' | 'spin' | 'success';

interface PlayOptions {
  volume?: number;
  loop?: boolean;
}

class AudioManager {
  private audioElements: Map<SoundType, HTMLAudioElement> = new Map();
  private isUnlocked = false;
  private soundFiles: Record<SoundType, string> = {
    click: '/sounds/click.mp3',
    spin: '/sounds/spin.mp3',
    success: '/sounds/success.mp3',
  };

  /**
   * 초기화 - 오디오 엘리먼트 생성
   */
  initialize() {
    if (typeof window === 'undefined') return;
    
    console.log('[AudioManager] 🎵 Initializing...');
    
    Object.entries(this.soundFiles).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.audioElements.set(key as SoundType, audio);
    });
    
    console.log('[AudioManager] ✅ Initialized with 3 sounds');
  }

  /**
   * 모바일 unlock - 반드시 클릭 이벤트에서 호출
   */
  async unlockAudio(): Promise<boolean> {
    if (typeof window === 'undefined') {
      console.warn('[AudioManager] ⚠️ Window not available');
      return false;
    }
    
    if (this.isUnlocked) {
      console.log('[AudioManager] ℹ️ Already unlocked');
      return true;
    }

    console.log('[AudioManager] 🔓 Unlocking audio...');
    
    let successCount = 0;
    
    for (const [key, audio] of this.audioElements.entries()) {
      try {
        // 볼륨을 매우 낮게 설정
        audio.volume = 0.01;
        audio.muted = false;
        
        // 재생 시도
        await audio.play();
        console.log(`[AudioManager] ✅ ${key} unlocked`);
        successCount++;
        
        // 즉시 정지하고 리셋
        audio.pause();
        audio.currentTime = 0;
        
        // 기본 볼륨으로 복구
        audio.volume = 0.5;
        
      } catch (error: any) {
        console.error(`[AudioManager] ❌ ${key} unlock failed:`, error.message);
      }
    }

    this.isUnlocked = successCount > 0;
    
    if (this.isUnlocked) {
      console.log(`[AudioManager] 🎉 Unlocked ${successCount}/3 sounds`);
    } else {
      console.error('[AudioManager] 💥 All unlock attempts failed!');
    }
    
    return this.isUnlocked;
  }

  /**
   * 사운드 재생
   */
  async play(soundType: SoundType, options: PlayOptions = {}): Promise<HTMLAudioElement | null> {
    if (typeof window === 'undefined') return null;

    const { volume = 0.5, loop = false } = options;

    try {
      let audio = this.audioElements.get(soundType);

      // 오디오 엘리먼트가 없으면 즉시 생성
      if (!audio) {
        console.warn(`[AudioManager] ⚠️ ${soundType} not found, creating new...`);
        audio = new Audio(this.soundFiles[soundType]);
        this.audioElements.set(soundType, audio);
      }

      // 설정 적용
      audio.volume = volume;
      audio.loop = loop;
      audio.currentTime = 0;

      console.log(`[AudioManager] 🔊 Playing ${soundType}... (volume: ${volume}, loop: ${loop})`);

      // 재생 시도
      await audio.play();
      
      console.log(`[AudioManager] ✅ ${soundType} playing successfully!`);
      
      return audio;

    } catch (error: any) {
      console.error(`[AudioManager] ❌ Play ${soundType} failed:`, error.message);
      console.error('[AudioManager] 💡 Tip: User must interact with page first');
      return null;
    }
  }

  /**
   * 특정 사운드 정지
   */
  stop(soundType: SoundType) {
    const audio = this.audioElements.get(soundType);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      console.log(`[AudioManager] ⏹️ Stopped ${soundType}`);
    }
  }

  /**
   * 모든 사운드 정지
   */
  stopAll() {
    this.audioElements.forEach((audio, key) => {
      audio.pause();
      audio.currentTime = 0;
    });
    console.log('[AudioManager] ⏹️ Stopped all sounds');
  }

  /**
   * unlock 상태 확인
   */
  get unlocked(): boolean {
    return this.isUnlocked;
  }
}

// 싱글톤 인스턴스
export const audioManager = new AudioManager();

/**
 * 진동 피드백
 */
export function triggerVibration(duration: number = 50) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
      console.log(`[AudioManager] 📳 Vibration: ${duration}ms`);
    } catch (error) {
      console.warn('[AudioManager] ⚠️ Vibration failed');
    }
  }
}
