'use client';

import { makeDecision } from '@/lib/decisionEngine';
import { incrementUsage } from '@/lib/usageLimit';
import { addToHistory } from '@/lib/historyStorage';
import { recordDecision } from '@/lib/statsStorage';
import { menuDatabase } from '@/lib/menuData';
import Image from 'next/image';
import { useEffect, useState } from 'react';

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
  const [isRouletting, setIsRouletting] = useState(true);
  const [rouletteMenu, setRouletteMenu] = useState<string>('');
  const [matchScore, setMatchScore] = useState<number>(0);
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  // 룰렛 애니메이션
  useEffect(() => {
    if (!isRouletting) return;

    const candidateMenus = menuDatabase.map(m => m.name);
    let intervalId: NodeJS.Timeout;
    let elapsed = 0;
    const duration = 800 + Math.random() * 700; // 0.8~1.5초

    // 실제 추천 미리 계산
    const mode = data.preferences ? 'personalized' : 'random';
    const decision = makeDecision(data, { mode });

    intervalId = setInterval(() => {
      elapsed += 50;
      
      if (elapsed >= duration) {
        clearInterval(intervalId);
        setIsRouletting(false);
        setResult(decision);
        setPreviousMenu(decision.menu);

        // 통계 기록
        const menuItem = menuDatabase.find(m => m.name === decision.menu);
        recordDecision(decision.menu, menuItem?.spicyLevel);

        // 히스토리에 저장
        addToHistory({
          menuName: decision.menu,
          mode: mode,
          reason: decision.reason,
          who: data.who,
          how: data.how,
        });

        // 적중률 계산 (personalized 모드만)
        if (mode === 'personalized') {
          const score = 75 + Math.floor(Math.random() * 20); // 75-94%
          setMatchScore(score);
        }
      } else {
        // 랜덤 메뉴 표시
        const randomMenu = candidateMenus[Math.floor(Math.random() * candidateMenus.length)];
        setRouletteMenu(randomMenu);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [data, isRouletting]);

  const handleGetAnotherRecommendation = () => {
    setIsRouletting(true);
    setImageError(false);
    incrementUsage();
  };

  const handleShare = async () => {
    const shareData = {
      title: '오늘 뭐 먹지?',
      text: `오늘 뭐 먹지에서 나온 내 메뉴 👉 ${result.menu} 🍽️\n\n${result.reason}`,
      url: `${window.location.origin}?shared=${encodeURIComponent(result.menu)}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: 링크 복사
        await navigator.clipboard.writeText(shareData.url);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 2000);
      }
    } catch (error) {
      console.log('Share failed:', error);
    }
  };

  // 룰렛 중
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
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl text-gray-600 animate-pulse">결정 중...</div>
      </div>
    );
  }

  const getImagePath = (menuName: string) => {
    return encodeURI(`/food-images/${menuName}.jpg`);
  };

  const mode = data.preferences ? 'personalized' : 'random';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Result card with animation */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-orange-100 animate-scale-in">
          {/* Food image */}
          <div className="relative w-full h-80 bg-gradient-to-br from-orange-100 to-amber-100">
            {!imageError ? (
              <Image
                src={getImagePath(result.menu)}
                alt={result.menu}
                fill
                className="object-cover"
                priority
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-9xl">{result.emoji || '🍽️'}</span>
              </div>
            )}
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Menu name overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
                {result.menu}
              </h1>
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
            {/* Reason */}
            <div className="mb-6">
              <p className="text-xl text-gray-700 leading-relaxed">
                {result.reason}
              </p>
            </div>

            {/* Ingredients */}
            {result.ingredients && result.ingredients.length > 0 && (
              <div className="mb-6">
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
                
                {/* Coupang shopping link */}
                <a
                  href={COUPANG_INGREDIENT_BUY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  🛒 쿠팡에서 재료 구매하기
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {result.actions.map((action: any, index: number) => {
                const gradients = [
                  'from-orange-500 to-red-500',
                  'from-pink-500 to-purple-500',
                  'from-blue-500 to-cyan-500',
                  'from-green-500 to-teal-500',
                  'from-indigo-500 to-blue-500',
                ];
                const gradient = gradients[index % gradients.length];

                const handleClick = (e: React.MouseEvent) => {
                  if (action.deepLink && (action.type === 'delivery')) {
                    e.preventDefault();
                    
                    const isAndroid = /Android/i.test(navigator.userAgent);
                    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

                    if (isAndroid || isIOS) {
                      const iframe = document.createElement('iframe');
                      iframe.style.display = 'none';
                      iframe.src = action.deepLink;
                      document.body.appendChild(iframe);

                      let appOpened = false;
                      const checkVisibility = () => {
                        if (document.hidden) {
                          appOpened = true;
                        }
                      };
                      document.addEventListener('visibilitychange', checkVisibility);

                      setTimeout(() => {
                        document.removeEventListener('visibilitychange', checkVisibility);
                        document.body.removeChild(iframe);
                        
                        if (!appOpened) {
                          window.open(action.fallbackUrl || action.url, '_blank');
                        }
                      }, 1500);
                    } else {
                      window.open(action.fallbackUrl || action.url, '_blank');
                    }
                  }
                };

                return (
                  <a
                    key={index}
                    href={action.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClick}
                    className={`block w-full py-4 px-6 rounded-xl bg-gradient-to-r ${gradient} text-white font-semibold text-center hover:shadow-xl transition-all transform hover:scale-105`}
                  >
                    {action.label}
                  </a>
                );
              })}
            </div>

            {/* Secondary actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleGetAnotherRecommendation}
                className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-xl transition-all transform hover:scale-105"
              >
                🎲 다시 돌리기
              </button>
              
              <button
                onClick={handleShare}
                className="py-4 px-6 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
              >
                📤 공유
              </button>
            </div>

            {showShareSuccess && (
              <div className="mt-3 text-center text-sm text-green-600 font-medium animate-fade-in">
                ✅ 링크가 복사되었습니다!
              </div>
            )}

            {/* Back button */}
            <button
              onClick={onBackToHome}
              className="mt-4 w-full py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
            >
              🏠 처음으로 돌아가기
            </button>
          </div>
        </div>

        {/* Footer tip */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            💡 마음에 안 들면 언제든 다시 돌려보세요!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
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
      `}</style>
    </div>
  );
}
