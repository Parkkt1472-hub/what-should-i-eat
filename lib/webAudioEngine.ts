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
  private isUnlocked = false;

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

      // 성공 사운드는 기존 HTMLAudio 유지
      this.successAudio = new Audio('/sounds/success.mp3');
      this.successAudio.preload = 'auto';

      console.log('[WebAudio] ✅ Initialized');
    } catch (error) {
      console.error('[WebAudio] ❌ Init failed:', error);
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
   * 버튼 클릭 사운드 (임팩트 강화)
   * - soft glass pop + micro bass tap
   * - 길이: 0.10~0.14초
   * - 랜덤 pitch ±4%, volume ±5%
   */
  playClick() {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    
    // 랜덤화 (반복 시 질리지 않음)
    const pitchVariation = 0.96 + Math.random() * 0.08; // ±4%
    const volumeVariation = 0.95 + Math.random() * 0.1; // ±5%

    // === High-frequency Glass Pop (1.6~2.5kHz) ===
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    const popFilter = this.ctx.createBiquadFilter();

    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(2000 * pitchVariation, now);
    popOsc.frequency.exponentialRampToValueAtTime(1600 * pitchVariation, now + 0.08);

    popFilter.type = 'highpass';
    popFilter.frequency.value = 400; // 저음 차단

    popGain.gain.setValueAtTime(0.4 * volumeVariation, now);
    popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    popOsc.connect(popFilter);
    popFilter.connect(popGain);
    popGain.connect(this.masterGain);

    popOsc.start(now);
    popOsc.stop(now + 0.12);

    // === Micro Bass Tap (120~180Hz, 매우 짧게) ===
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();

    bassOsc.type = 'triangle';
    bassOsc.frequency.value = 150 * pitchVariation;

    bassGain.gain.setValueAtTime(0.15 * volumeVariation, now);
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

    bassOsc.connect(bassGain);
    bassGain.connect(this.masterGain);

    bassOsc.start(now);
    bassOsc.stop(now + 0.04);

    console.log('[WebAudio] 🖱️ Click played');
  }

  /**
   * 룰렛 사운드 (중독성 구조)
   * - start → acceleration loop → slow down → stop
   */
  private rouletteInterval: number | null = null;
  private rouletteGain: GainNode | null = null;

  startRoulette(duration: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.ctx || !this.masterGain) {
        resolve();
        return;
      }

      const now = this.ctx.currentTime;

      // === Start Whoosh (0.2초) ===
      this.playStartWhoosh();

      // === Acceleration Loop ===
      let tickCount = 0;
      let tickInterval = 80; // 초기 간격 (ms)
      const minInterval = 40; // 최소 간격
      let currentPitch = 1.0;

      this.rouletteInterval = window.setInterval(() => {
        // 가속 (점점 빨라짐)
        if (tickInterval > minInterval) {
          tickInterval = Math.max(minInterval, tickInterval - 2);
        }

        // Pitch 상승 (긴장감)
        currentPitch = Math.min(1.15, currentPitch + 0.005);

        this.playRouletteTickHigh(currentPitch);
        tickCount++;
      }, tickInterval);

      // === Slow Down & Stop ===
      setTimeout(() => {
        if (this.rouletteInterval) {
          clearInterval(this.rouletteInterval);
          this.rouletteInterval = null;
        }

        // 감속 구간
        this.playSlowDownTicks(() => {
          // Stop tick
          this.playStopTick();
          console.log('[WebAudio] 🎰 Roulette stopped');
          resolve();
        });
      }, duration - 500); // 마지막 500ms는 감속
    });
  }

  stopRoulette() {
    if (this.rouletteInterval) {
      clearInterval(this.rouletteInterval);
      this.rouletteInterval = null;
    }
    console.log('[WebAudio] ⏹️ Roulette stopped manually');
  }

  /**
   * Start Whoosh (0.2초)
   */
  private playStartWhoosh() {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15);

    filter.type = 'highpass';
    filter.frequency.value = 600;

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * High-frequency Tick (가속 루프용)
   */
  private playRouletteTickHigh(pitch: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = 1200 * pitch;

    filter.type = 'highpass';
    filter.frequency.value = 500;

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Slow Down Ticks (감속 구간)
   */
  private playSlowDownTicks(onComplete: () => void) {
    if (!this.ctx) {
      onComplete();
      return;
    }

    let delays = [0, 60, 140, 240, 360]; // 점점 간격 증가
    delays.forEach((delay, index) => {
      setTimeout(() => {
        this.playRouletteTickHigh(1.0 - index * 0.05); // Pitch 하강
        if (index === delays.length - 1) {
          setTimeout(onComplete, 100);
        }
      }, delay);
    });
  }

  /**
   * Stop Tick (짧고 또렷한 메탈릭)
   */
  private playStopTick() {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.value = 2400;

    filter.type = 'highpass';
    filter.frequency.value = 800;

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
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
