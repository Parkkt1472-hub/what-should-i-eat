'use client';

import { useState, useEffect } from 'react';
import { webAudioEngine } from '@/lib/webAudioEngine';
import { playClickSound, playModalSound } from '@/lib/soundEffects';
import PersonalizedSurveyModal from './PersonalizedSurveyModal';
import HistoryModal from './HistoryModal';
import StatsModal from './StatsModal';
import LocationInputModal from './LocationInputModal';
import LocalRestaurantsModal from './LocalRestaurantsModal';
import { PreferenceVector } from '@/lib/decisionEngine';
import { loadPreferences, hasStoredPreferences } from '@/lib/preferenceStorage';
import { getHistoryCount } from '@/lib/historyStorage';
import { getStats, getCachedTop1Menu } from '@/lib/statsStorage';
import { getStoredLocation, saveLocation, hasStoredLocation } from '@/lib/locationStorage';

interface HomeScreenProps {
  onStartDecision: () => void;
  onStartPersonalized: (preferences: PreferenceVector) => void;
}

export default function HomeScreen({ onStartDecision, onStartPersonalized }: HomeScreenProps) {
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLocalRestaurantsModal, setShowLocalRestaurantsModal] = useState(false);

  const [hasPreferences, setHasPreferences] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [statsCount, setStatsCount] = useState(0);
  const [topMenu, setTopMenu] = useState<{ menuName: string; count: number } | null>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);

  useEffect(() => {
    setHasPreferences(hasStoredPreferences());
    setHistoryCount(getHistoryCount());
    setStatsCount(getStats().totalDecisions);
    setUserLocation(getStoredLocation());
    
    // Get cached top menu (하루 단위 캐시)
    const { getCachedTop1Menu } = require('@/lib/statsStorage');
    const top1 = getCachedTop1Menu();
    if (top1) {
      setTopMenu(top1);
    }

    // 첫 방문 시 지역 입력 모달 표시 (1초 후)
    if (!hasStoredLocation()) {
      setTimeout(() => {
        setShowLocationModal(true);
      }, 1000);
    }

    // 사운드 미리 로드
    webAudioEngine.init();
  }, []);

  useEffect(() => {
    if (!showHistoryModal) setHistoryCount(getHistoryCount());
  }, [showHistoryModal]);

  useEffect(() => {
    if (!showStatsModal) setStatsCount(getStats().totalDecisions);
  }, [showStatsModal]);

  const handleCustomRecommendation = () => {
    playClickSound();
    // 저장된 선호도가 있으면 바로 추천, 없으면 설문
    if (hasPreferences) {
      const stored = loadPreferences();
      if (stored) {
        onStartPersonalized(stored);
        return;
      }
    }
    setShowSurveyModal(true);
  };

  const handleSurveySubmit = (preferences: PreferenceVector) => {
    setShowSurveyModal(false);
    setHasPreferences(true);
    onStartPersonalized(preferences);
  };

  const handleLocationSubmit = (location: string) => {
    saveLocation(location);
    setUserLocation(location);
    setShowLocationModal(false);
  };

  const handleTopMenuClick = () => {
    playClickSound();
    if (topMenu) {
      setShowLocalRestaurantsModal(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="text-center space-y-8 relative z-10 max-w-2xl">
        {/* Premium header with subtle animation */}
        <div className="space-y-4 animate-fade-in">
          <div className="inline-block">
            <div className="text-7xl mb-4 animate-bounce-slow">🍽️</div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-4 leading-tight">
            오늘 뭐 먹지?
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light">
            오늘의 한 끼를 더 가볍게 결정해요
          </p>
        </div>

        {/* 🔥 오늘의 TOP 1 메뉴 배너 - 클릭 가능 */}
        {topMenu && (
          <button
            onClick={handleTopMenuClick}
            className="relative group animate-fade-in w-full cursor-pointer"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse-slow"></div>
            <div className="relative bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02]">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🔥</span>
                <div className="text-center">
                  <p className="text-sm font-semibold opacity-90">
                    {(() => {
                      const hour = new Date().getHours();
                      if (hour >= 6 && hour < 10) return '아침 시간 인기 메뉴';
                      if (hour >= 10 && hour < 15) return '점심 시간 인기 메뉴';
                      if (hour >= 15 && hour < 21) return '저녁 시간 인기 메뉴';
                      return '야식 시간 인기 메뉴';
                    })()}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold">{topMenu.menuName}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {topMenu.count > 0 ? `${topMenu.count}명이 선택했어요!` : '지금 시간대 추천!'}
                  </p>
                  <p className="text-xs opacity-90 mt-2 flex items-center justify-center gap-1">
                    <span>🏪</span>
                    <span>우리동네 맛집 보기</span>
                  </p>
                </div>
                <span className="text-3xl">🔥</span>
              </div>
            </div>
          </button>
        )}

        {/* Main CTA - 무작정 추천받기 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
          <button
            onClick={async () => {
              console.log('[HomeScreen] 🎮 Button clicked!');
              
              // 1. WebAudio unlock (필수!)
              await webAudioEngine.unlock();
              
              // 2. 클릭 사운드 즉시 재생
              playClickSound();
              
              // 3. 결정 시작
              onStartDecision();
            }}
            className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white font-bold py-8 px-12 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">🎲</span>
              <span className="text-xl md:text-2xl leading-tight whitespace-pre-line text-center">
                {"복불복 모드\n내가 골라줄게.\n딱 걸리면 무조건 먹기.\n친구랑 내기 한 판?"}
              </span>
            </div>
          </button>
        </div>

        {/* Secondary CTA - 나의 맞춤형 추천받기 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-pink-500 to-rose-400 rounded-full blur-lg opacity-60 group-hover:opacity-90 transition duration-1000 group-hover:duration-200"></div>
          <button
            onClick={handleCustomRecommendation}
            className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white text-xl md:text-2xl font-bold py-6 px-12 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <span>나의 맞춤형 추천받기</span>
            </span>
          </button>
        </div>

        {/* Info text */}
        <div className="pt-8">
          <p className="text-gray-500 text-sm">
            💡 <strong>Tip:</strong> 맞춤형 추천은 6가지 질문으로 당신에게 맞는 메뉴를 찾아줘요
          </p>
        </div>

        {/* Action Cards - 더 크고 눈에 띄게 */}
        <div className="pt-4 grid grid-cols-2 gap-4 w-full max-w-xl">
          <button
            onClick={() => { playClickSound(); setShowStatsModal(true); }}
            className="group relative bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-base font-bold text-gray-800">통계 보기</p>
              {statsCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">{statsCount}회 추천</p>
              )}
            </div>
          </button>

          <button
            onClick={() => { playClickSound(); setShowHistoryModal(true); }}
            className="group relative bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-purple-200 hover:border-purple-400 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-base font-bold text-gray-800">추천 기록</p>
              {historyCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">{historyCount}개 기록</p>
              )}
            </div>
          </button>
        </div>

        {/* Legal Disclaimer Link */}
        <div className="pt-2">
          <button
            onClick={() => { playClickSound(); setShowDisclaimerModal(true); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            법적 고지사항
          </button>
        </div>
      </div>

      {/* Survey Modal */}
      <PersonalizedSurveyModal
        isOpen={showSurveyModal}
        onClose={() => { playModalSound(); setShowSurveyModal(false); }}
        onSubmit={handleSurveySubmit}
      />

      {/* History Modal */}
      <HistoryModal isOpen={showHistoryModal} onClose={() => { playModalSound(); setShowHistoryModal(false); }} />

      {/* Stats Modal */}
      <StatsModal isOpen={showStatsModal} onClose={() => { playModalSound(); setShowStatsModal(false); }} />

      {/* Location Input Modal */}
      <LocationInputModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSubmit={handleLocationSubmit}
      />

      {/* Local Restaurants Modal */}
      {topMenu && (
        <LocalRestaurantsModal
          isOpen={showLocalRestaurantsModal}
          onClose={() => setShowLocalRestaurantsModal(false)}
          menuName={topMenu.menuName}
          location={userLocation}
        />
      )}

      {/* Legal Disclaimer Modal */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">⚖️ 법적 고지사항</h3>
            <div className="text-sm text-gray-600 space-y-3 max-h-96 overflow-y-auto">
              <p>
                <strong>1. 의료 조언 아님</strong>
                <br />
                본 서비스의 추천은 참고용이며, 의료·건강 상담이나 치료를 대체하지 않습니다.
              </p>
              <p>
                <strong>2. 알레르기 및 식이 제한</strong>
                <br />
                본 서비스는 알레르기/특수 식이 제한을 완전히 고려하지 않습니다. 주문/조리 전 재료를 확인해 주세요.
              </p>
              <p>
                <strong>3. 정보/조건 변동</strong>
                <br />
                메뉴 정보 및 가격/재고/구매 조건은 판매처에 따라 달라질 수 있습니다.
              </p>
              <p>
                <strong>4. 제3자 링크</strong>
                <br />
                외부 서비스로 연결되는 링크가 포함될 수 있으며, 해당 서비스의 정책/내용에 대해 책임지지 않습니다.
              </p>
              <p className="text-xs text-gray-500 pt-2">
                본 서비스를 계속 이용하시면 위 고지사항에 동의하는 것으로 간주됩니다.
              </p>
            </div>
            <button
              onClick={() => setShowDisclaimerModal(false)}
              className="mt-6 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold hover:shadow-lg transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.75;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
