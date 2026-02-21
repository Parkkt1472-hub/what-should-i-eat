/**
 * 🎵 WebAudio 기반 고급 사운드 엔진
 * 
 * 특징:
 * - HTMLAudio 대신 WebAudio API 사용
 * - 임팩트 있고 중독성 있는 사운드
 * - 랜덤 pitch/volume으로 반복 시 질리지 않음
 * - 세련된 모바일 앱 감성
 */

class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private successAudio: HTMLAudioElement | null = null;
  private clickBuffer: AudioBuffer | null = null;
  private spinBuffer: AudioBuffer | null = null;
  private isUnlocked = false;
  private spinSource: AudioBufferSourceNode | null = null;

  /**
   * AudioContext 초기화
   */
  async init() {
    if (typeof window === 'undefined') return;

    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 마스터 게인 (최대 0.9)
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.9;
      this.masterGain.connect(this.ctx.destination);

      // 오디오 파일 로드
      await this.loadAudioFiles();

      console.log('[WebAudio] ✅ Initialized with audio files');
    } catch (error) {
      console.error('[WebAudio] ❌ Init failed:', error);
    }
  }

  /**
   * 오디오 파일 로드
   */
  private async loadAudioFiles() {
    if (!this.ctx) return;

    try {
      // Click 사운드 로드
      const clickResponse = await fetch('/sounds/click.mp3');
      const clickArrayBuffer = await clickResponse.arrayBuffer();
      this.clickBuffer = await this.ctx.decodeAudioData(clickArrayBuffer);

      // Spin 사운드 로드
      const spinResponse = await fetch('/sounds/spin.mp3');
      const spinArrayBuffer = await spinResponse.arrayBuffer();
      this.spinBuffer = await this.ctx.decodeAudioData(spinArrayBuffer);

      // Success 사운드는 HTMLAudio 유지
      this.successAudio = new Audio('/sounds/success.mp3');
      this.successAudio.preload = 'auto';

      console.log('[WebAudio] 🎵 Audio files loaded');
    } catch (error) {
      console.error('[WebAudio] ❌ Audio file load failed:', error);
    }
  }

  /**
   * 사용자 제스처로 unlock
   */
  async unlock() {
    if (!this.ctx || this.isUnlocked) return;

    try {
      await this.ctx.resume();
      this.isUnlocked = true;
      console.log('[WebAudio] 🔓 Unlocked');
    } catch (error) {
      console.error('[WebAudio] ❌ Unlock failed:', error);
    }
  }

  /**
   * 버튼 클릭 사운드 (실제 파일 재생)
   * - mixkit-arrow-whoosh-1491.wav
   * - 랜덤 pitch ±4%, volume ±5%
   */
  playClick() {
    if (!this.ctx || !this.masterGain || !this.clickBuffer) {
      console.warn('[WebAudio] ⚠️ Click buffer not ready');
      return;
    }

    try {
      // 랜덤화 (반복 시 질리지 않음)
      const pitchVariation = 0.96 + Math.random() * 0.08; // ±4%
      const volumeVariation = 0.95 + Math.random() * 0.1; // ±5%

      // BufferSource 생성
      const source = this.ctx.createBufferSource();
      source.buffer = this.clickBuffer;
      source.playbackRate.value = pitchVariation;

      // Gain 노드
      const gain = this.ctx.createGain();
      gain.gain.value = 0.5 * volumeVariation;

      // High-pass filter (400Hz)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 400;

      // 연결
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      // 재생
      source.start(0);

      console.log('[WebAudio] 🖱️ Click played (pitch:', pitchVariation.toFixed(2), ')');
    } catch (error) {
      console.error('[WebAudio] ❌ Click play failed:', error);
    }
  }

  /**
   * 룰렛 사운드 (실제 파일 재생)
   * - pwlpl-inception-style-rising-tone-377247.mp3
   * - 루프 재생, 수동 중단 가능
   */
  private rouletteGain: GainNode | null = null;

  startRoulette(duration: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.ctx || !this.masterGain || !this.spinBuffer) {
        console.warn('[WebAudio] ⚠️ Spin buffer not ready');
        resolve();
        return;
      }

      try {
        // BufferSource 생성 (루프)
        this.spinSource = this.ctx.createBufferSource();
        this.spinSource.buffer = this.spinBuffer;
        this.spinSource.loop = true;

        // Gain 노드
        this.rouletteGain = this.ctx.createGain();
        this.rouletteGain.gain.value = 0.6;

        // High-pass filter (400Hz)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 400;

        // 연결
        this.spinSource.connect(filter);
        filter.connect(this.rouletteGain);
        this.rouletteGain.connect(this.masterGain);

        // 재생
        this.spinSource.start(0);
        console.log('[WebAudio] 🎰 Spin sound started (loop)');

        // duration 후 자동 중단
        setTimeout(() => {
          this.stopRoulette();
          resolve();
        }, duration);
      } catch (error) {
        console.error('[WebAudio] ❌ Spin play failed:', error);
        resolve();
      }
    });
  }

  stopRoulette() {
    if (this.spinSource) {
      try {
        // Fade out (0.2초)
        if (this.ctx && this.rouletteGain) {
          const now = this.ctx.currentTime;
          this.rouletteGain.gain.linearRampToValueAtTime(0, now + 0.2);
          
          setTimeout(() => {
            if (this.spinSource) {
              this.spinSource.stop();
              this.spinSource = null;
            }
          }, 200);
        } else {
          this.spinSource.stop();
          this.spinSource = null;
        }
        console.log('[WebAudio] ⏹️ Spin sound stopped');
      } catch (error) {
        console.warn('[WebAudio] ⚠️ Spin stop error (already stopped?)');
      }
    }
  }

  /**
   * 성공 사운드 (기존 파일 유지)
   */
  async playSuccess() {
    if (!this.successAudio) return;

    try {
      this.successAudio.currentTime = 0;
      this.successAudio.volume = 0.5;
      await this.successAudio.play();
      console.log('[WebAudio] 🎉 Success played');
    } catch (error) {
      console.error('[WebAudio] ❌ Success play failed:', error);
    }
  }
}

// 싱글톤 인스턴스
export const webAudioEngine = new WebAudioEngine();

/**
 * 진동 피드백
 */
export function vibrate(duration: number = 50) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (error) {
      console.warn('[WebAudio] ⚠️ Vibrate failed');
    }
  }
}
