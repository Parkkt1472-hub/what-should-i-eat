'use client';

// import Image from 'next/image'; // Removed to fix 400 errors
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { webAudioEngine, vibrate } from '@/lib/webAudioEngine';
import { playClickSound, playSuccessSound } from '@/lib/soundEffects';
import { getRandomMent } from '@/lib/randomMents';

import { makeDecision } from '@/lib/decisionEngine';
import { incrementUsage } from '@/lib/usageLimit';

import { addToHistory } from '@/lib/historyStorage';
import { recordDecision } from '@/lib/statsStorage';
import { menuDatabase } from '@/lib/menuData';
import { getCurrentWeather, getWeatherDescription, type WeatherData } from '@/lib/weatherService';
import { getStoredLocation } from '@/lib/locationStorage';
import LocalRestaurantsModal from './LocalRestaurantsModal';
import MoodPlacesModal from './MoodPlacesModal';
import AdventurePlaces from './AdventurePlaces';
import LocalSubmissions from './LocalSubmissions';
import QuickRecipeBadge from './QuickRecipeBadge';
import { getAnonId, generateShareUrl, processReferrer, getShareCount } from '@/lib/anonIdStorage';

// 쿠팡 파트너스 재료 구매 링크
const COUPANG_INGREDIENT_BUY_URL = 'https://link.coupang.com/a/dOo6AY';

interface ResultScreenProps {
  data: any;
  onBackToHome: () => void;
}

export default function ResultScreen({ data, onBackToHome }: ResultScreenProps) {
  const [result, setResult] = useState<any>(null);
  const [imageError, setImageError] = useState(false);
  const [previousMenu, setPreviousMenu] = useState<string>('');

  // 룰렛/공유/적중률
  const [isRouletting, setIsRouletting] = useState(true);
  const [rouletteMenu, setRouletteMenu] = useState<string>('');
  const [matchScore, setMatchScore] = useState<number>(0);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherDesc, setWeatherDesc] = useState<string | null>(null);
  const [showLocalRestaurants, setShowLocalRestaurants] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [shareCount, setShareCount] = useState<number>(0);
  const [randomMent, setRandomMent] = useState<string>('');
  const [almostMenu, setAlmostMenu] = useState<string>('');
  const [showAlmost, setShowAlmost] = useState(false);

  const mode = useMemo(() => (data?.preferences ? 'personalized' : 'random'), [data]);

  // Get image from menuDatabase instead of constructing path
  const getMenuImage = (menuName: string): string => {
    const menuItem = menuDatabase.find((m: any) => m.name === menuName);
    return menuItem?.image || '/menus/placeholder.jpg';
  };

  // 날씨 정보 가져오기 + 익명 ID 초기화
  useEffect(() => {
    getCurrentWeather().then((w) => {
      if (w) {
        setWeather(w);
        setWeatherDesc(getWeatherDescription(w));
      }
    });
    setUserLocation(getStoredLocation());
    
    // 익명 ID 초기화 및 referrer 처리
    getAnonId();
    processReferrer();
    
    // Share count 가져오기
    getShareCount().then(count => {
      setShareCount(count);
      console.log('[ResultScreen] Share count:', count);
    });
  }, []);

  // 룰렛 애니메이션 + 실제 결정(미리 계산 후 마지막에 확정)
  useEffect(() => {
    if (!isRouletting) return;

    const candidateMenus = menuDatabase.map((m: any) => m.name);
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let spinAudio: HTMLAudioElement | null = null;

    let elapsed = 0;
    const duration = 2500 + Math.random() * 1000; // 2.5~3.5초 (긴장감 강화)

    // 실제 추천 미리 계산 (이전 메뉴 제외도 반영)
    const decision = makeDecision(
      {
        ...data,
        ...(previousMenu ? { excludeMenu: previousMenu } : {}),
      },
      { mode }
    );

    // 🎵 Spin 사운드 재생 (실제 파일, 루프)
    console.log('[Roulette] 🔊 Starting spin sound (pwlpl-inception)...');
    webAudioEngine.startRoulette(duration).then(() => {
      console.log('[Roulette] ✅ Spin sound completed');
    });

    intervalId = setInterval(() => {
      elapsed += 50;

      // "거의 다른 메뉴" 효과 (마지막 300ms)
      if (elapsed >= duration - 300 && elapsed < duration && !showAlmost) {
        setShowAlmost(true);
        // 실제 결과와 다른 랜덤 메뉴 표시
        const differentMenus = candidateMenus.filter((m: string) => m !== decision.menu);
        const almost = differentMenus[Math.floor(Math.random() * differentMenus.length)];
        setAlmostMenu(almost);
        setRouletteMenu(almost);
      }

      if (elapsed >= duration) {
        if (intervalId) clearInterval(intervalId);
        webAudioEngine.stopRoulette();

        setIsRouletting(false);
        setShowAlmost(false);
        setResult(decision);
        setPreviousMenu(decision.menu);

        // 날씨 설명을 메뉴에 맞춰 업데이트
        if (weather) {
          setWeatherDesc(getWeatherDescription(weather, decision.menu));
        }

        // 랜덤 멘트 선택
        setRandomMent(getRandomMent());

        // 🎉 성공 사운드 + 진동
        console.log('[Roulette] 🔊 Playing success sound...');
        webAudioEngine.playSuccess();
        vibrate(50);

        // 통계 기록
        const menuItem: any = menuDatabase.find((m: any) => m.name === decision.menu);
        const spicyForStats =
          menuItem?.meta?.spicy ?? menuItem?.spicyLevel ?? menuItem?.spicy ?? undefined;
        recordDecision(decision.menu, spicyForStats);

        // 히스토리 저장
        addToHistory({
          menuName: decision.menu,
          mode,
          reason: decision.reason,
          who: data?.who,
          how: data?.how,
        });

        // 적중률 (참고용, personalized일 때만)
        if (mode === 'personalized') {
          const score = 75 + Math.floor(Math.random() * 20); // 75~94
          setMatchScore(score);
        } else {
          setMatchScore(0);
        }
      } else if (!showAlmost) {
        // 룰렛 동안 랜덤 메뉴 표시
        const randomMenu = candidateMenus[Math.floor(Math.random() * candidateMenus.length)];
        setRouletteMenu(randomMenu);
      }
    }, 50);

    return () => {
      if (intervalId) clearInterval(intervalId);
      webAudioEngine.stopRoulette();
    };
  }, [data, isRouletting, mode, previousMenu]);

  const handleGetAnotherRecommendation = () => {
    playClickSound();
    incrementUsage();
    setImageError(false);
    setShowShareSuccess(false);
    setResult(null);
    setIsRouletting(true);
  };

  const handleShare = async () => {
    if (!result?.menu) return;

    const shareUrl = generateShareUrl(); // ref 파라미터 포함
    const shareData = {
      title: '오늘 뭐 먹지?',
      text: `오늘 뭐 먹지에서 나온 내 메뉴 👉 ${result.menu} 🍽️\n\n${result.reason ?? ''}`.trim(),
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData as any);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 2000);
      }
      
      // Share count 갱신 (약간의 딜레이 후)
      setTimeout(async () => {
        const count = await getShareCount();
        setShareCount(count);
      }, 1000);
    } catch {
      // 공유 취소/실패는 조용히 무시
    }
  };

  // 딥링크(배달앱 등) 안정적으로 열기: 모바일에서 iframe + visibility 체크
  const handleActionClick = (action: any) => (e: MouseEvent) => {
    if (!action?.deepLink || action.type !== 'delivery') return;

    e.preventDefault();

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    const fallback = action.fallbackUrl || action.url;

    if (isAndroid || isIOS) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = action.deepLink;
      document.body.appendChild(iframe);

      let appOpened = false;
      const checkVisibility = () => {
        if (document.hidden) appOpened = true;
      };
      document.addEventListener('visibilitychange', checkVisibility);

      setTimeout(() => {
        document.removeEventListener('visibilitychange', checkVisibility);
        try {
          document.body.removeChild(iframe);
        } catch {}

        if (!appOpened) {
          window.open(fallback, '_blank');
        }
      }, 1500);
    } else {
      window.open(fallback, '_blank');
    }
  };

  // 룰렛 화면
  if (isRouletting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative z-10 text-center">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-12 border border-orange-100">
            <div className="text-6xl mb-4">🎰</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-pulse">
              {rouletteMenu || '추천 중...'}
            </h2>
            <p className="text-gray-500">완벽한 메뉴를 찾는 중...</p>
          </div>
        </div>

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
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  // 결과가 아직 없으면 로딩
  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl text-gray-600 animate-pulse">결정 중...</div>
      </div>
    );
  }

  const gradients = [
    'from-orange-500 to-red-500',
    'from-pink-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-teal-500',
    'from-indigo-500 to-blue-500',
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-orange-100 result">
          {/* Food image */}
          <div className="relative w-full h-80 bg-gradient-to-br from-orange-100 to-amber-100">
            {!imageError ? (
              <img
                src={getMenuImage(result.menu)}
                alt={result.menu}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  console.error('[Image Error]', result.menu, e.currentTarget.src);
                  e.currentTarget.src = '/menus/placeholder.jpg';
                  setImageError(true);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-9xl">{result.emoji || '🍽️'}</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">{result.menu}</h1>

              {mode === 'personalized' && matchScore > 0 && (
                <div className="inline-block bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-sm font-semibold text-orange-600">
                    🎯 취향 적중률 {matchScore}%
                  </span>
                  <span className="text-xs text-gray-500 ml-2">(참고용)</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* 🍳 만들어먹기 전용 5분컷 배지 */}
            {result.how === '만들어 먹기' && (
              <QuickRecipeBadge menuName={result.menu} menuDatabase={menuDatabase} />
            )}

            {/* Weather Info */}
            {weatherDesc && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                <p className="text-base text-blue-800 font-medium flex items-center gap-2">
                  <span>🌡️</span>
                  <span>{weatherDesc}</span>
                </p>
              </div>
            )}

            {/* \ub79c\ub364 \uba58\ud2b8 */}
            {randomMent && (
              <div className="mb-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4">
                <p className="text-lg font-bold text-orange-700 text-center">
                  {randomMent}
                </p>
              </div>
            )}

            {/* Reason */}
            <div className="mb-6">
              <p className="text-xl text-gray-700 leading-relaxed">{result.reason}</p>
            </div>

            {/* 맛집 TOP5 섹션 - 외식일 때만 표시 */}
            {result.how === '외식' && (
              <div className="mb-6">
                {result.outdoor === '기분전환 야외' ? (
                  <button
                    onClick={() => { playClickSound(); setShowLocalRestaurants(true); }}
                    className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-300 rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">🌿</span>
                      <div className="text-center">
                        <p className="text-base font-bold text-purple-800">
                          기분전환 {result.menu} 맛집 TOP5
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          {userLocation ? `${userLocation} 근교 100km 반경` : '근교 지역'} · 네이버 리뷰순
                        </p>
                      </div>
                      <span className="text-2xl">🌿</span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => { playClickSound(); setShowLocalRestaurants(true); }}
                    className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-300 rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">🏪</span>
                      <div className="text-center">
                        <p className="text-base font-bold text-green-800">
                          우리동네 {result.menu} 맛집 TOP5
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {userLocation ? `${userLocation} 기준` : '가까운 곳 기준'} · 네이버 리뷰순
                        </p>
                      </div>
                      <span className="text-2xl">🏪</span>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Ingredients - 만들어먹기일 때 항상 표시 */}
            {(result.how === '만들어 먹기' || (result.ingredients && result.ingredients.length > 0)) && (
              <div className="mb-6">
                {result.ingredients && result.ingredients.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">필요한 재료</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.ingredients.map((ingredient: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-100"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {result.how === '만들어 먹기' && (
                  <a
                    href={COUPANG_INGREDIENT_BUY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    🛒 쿠팡에서 재료 구매하기
                  </a>
                )}
              </div>
            )}

            {/* Action buttons (recipes / videos / delivery etc) */}
            {Array.isArray(result.actions) && result.actions.length > 0 && (
              <div className="space-y-3 pt-2">
                {result.actions.map((action: any, index: number) => {
                  const gradient = gradients[index % gradients.length];
                  return (
                    <a
                      key={index}
                      href={action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleActionClick(action)}
                      className={`block w-full py-4 px-6 rounded-xl bg-gradient-to-r ${gradient} text-white font-semibold text-center hover:shadow-xl transition-all transform hover:scale-105`}
                    >
                      {action.label}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Secondary actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleGetAnotherRecommendation}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-xl transition-all transform hover:scale-105"
              >
                🎲 다시 돌리기
              </button>
            </div>

            {/* 이색맛집 TOP5 섹션 - 외식하기 선택 시에만 표시 */}
            {data?.how === '외식' && result?.menu && userLocation && (
              <AdventurePlaces
                menuName={result.menu}
                region={userLocation}
                shareCount={shareCount}
                onShareClick={handleShare}
              />
            )}

            {/* 친구에게 공유하기 - 외식하기 선택 시에만 표시 */}
            {data?.how === '외식' && (
              <div className="mt-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                  <button
                    onClick={handleShare}
                    className="relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">📤</span>
                    <span>친구에게 공유하기</span>
                    <span className="text-xl">✨</span>
                  </span>
                </button>
              </div>

              {showShareSuccess && (
                <div className="mt-3 text-center text-sm text-green-600 font-medium animate-fade-in">
                  ✅ 링크가 복사되었습니다!
                </div>
              )}
            </div>
            )}

            {/* 현지인맛집 제보하기 섹션 - 외식하기 선택 시에만 표시 */}
            {data?.how === '외식' && <LocalSubmissions />}

            <button
              onClick={() => { playClickSound(); onBackToHome(); }}
              className="mt-4 w-full py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
            >
              🏠 처음으로 돌아가기
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">💡 마음에 안 들면 언제든 다시 돌려보세요!</p>
        </div>
      </div>

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
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
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
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          50% {
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .result {
          animation: popIn 0.4s ease-out;
        }
      `}</style>

      {/* Local Restaurants Modal */}
      {result && (
        <>
          {result.outdoor === '기분전환 야외' ? (
            <MoodPlacesModal
              isOpen={showLocalRestaurants}
              onClose={() => setShowLocalRestaurants(false)}
              menuName={result.menu}
              location={userLocation}
            />
          ) : (
            <LocalRestaurantsModal
              isOpen={showLocalRestaurants}
              onClose={() => setShowLocalRestaurants(false)}
              menuName={result.menu}
              location={userLocation}
            />
          )}
        </>
      )}
    </div>
  );
}
