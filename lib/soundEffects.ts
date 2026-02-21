/**
 * 🎵 UX 사운드 헬퍼
 * 
 * 모든 인터랙션에 청각적 피드백 제공
 */

import { audioManager } from './audioManager';

/**
 * 버튼 클릭 사운드
 */
export const playClickSound = () => {
  audioManager.play('click', { volume: 0.3 }).catch(() => {
    // 사운드 재생 실패 시 무시 (UX를 방해하지 않음)
  });
};

/**
 * 성공 사운드
 */
export const playSuccessSound = () => {
  audioManager.play('success', { volume: 0.4 }).catch(() => {
    // 사운드 재생 실패 시 무시
  });
};

/**
 * 모달 열기/닫기 사운드 (부드러운 클릭)
 */
export const playModalSound = () => {
  audioManager.play('click', { volume: 0.2 }).catch(() => {
    // 사운드 재생 실패 시 무시
  });
};

/**
 * 탭/스위치 사운드 (매우 부드러운 클릭)
 */
export const playTabSound = () => {
  audioManager.play('click', { volume: 0.15 }).catch(() => {
    // 사운드 재생 실패 시 무시
  });
};
