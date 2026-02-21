/**
 * 🎵 UX 사운드 헬퍼 (WebAudio 기반)
 * 
 * 모든 인터랙션에 청각적 피드백 제공
 * - 임팩트 있고 중독성 있는 사운드
 * - 랜덤화로 반복 시 질리지 않음
 */

import { webAudioEngine } from './webAudioEngine';

/**
 * 버튼 클릭 사운드 (WebAudio)
 * - soft glass pop + micro bass tap
 * - 랜덤 pitch/volume
 */
export const playClickSound = () => {
  webAudioEngine.playClick();
};

/**
 * 성공 사운드 (기존 파일 유지)
 */
export const playSuccessSound = () => {
  webAudioEngine.playSuccess();
};

/**
 * 모달 열기/닫기 사운드 (부드러운 클릭)
 */
export const playModalSound = () => {
  webAudioEngine.playClick();
};

/**
 * 탭/스위치 사운드 (매우 부드러운 클릭)
 */
export const playTabSound = () => {
  webAudioEngine.playClick();
};
