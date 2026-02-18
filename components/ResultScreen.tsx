'use client';

import { makeDecision } from '@/lib/decisionEngine';
import { incrementUsage } from '@/lib/usageLimit';
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

  useEffect(() => {
    // Determine mode based on whether preferences are provided
    const mode = data.preferences ? 'personalized' : 'random';
    const decision = makeDecision(data, { mode });
    setResult(decision);
    setPreviousMenu(decision.menu);
  }, [data]);

  const handleGetAnotherRecommendation = () => {
    // Increment usage for each new recommendation
    incrementUsage();
    
    // Generate new decision with excluded previous menu
    const mode = data.preferences ? 'personalized' : 'random';
    const newDecision = makeDecision({
      ...data,
      excludeMenu: previousMenu,
    }, { mode });
    
    setResult(newDecision);
    setPreviousMenu(newDecision.menu);
    setImageError(false);
  };

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl text-gray-600 animate-pulse">결정 중...</div>
      </div>
    );
  }

  const getImagePath = (menuName: string) => {
    // 한글/공백/특수문자 안전하게 인코딩
    return encodeURI(`/food-images/${menuName}.jpg`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-fade-in">
        {/* Result card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            
            {/* Menu name overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h2 className="text-5xl font-bold text-white drop-shadow-lg mb-2">
                {result.menu}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <p className="text-xl text-white/90 drop-shadow-md">{result.reason}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Ingredients */}
            {result.ingredients && result.ingredients.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">🥘</span>
                  필요한 재료
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.ingredients.map((ingredient: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-full text-gray-700 text-sm font-medium"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Coupang Partners Button (재료가 있을 때만 표시) */}
            {result.ingredients && result.ingredients.length > 0 && (
              <a
                href={COUPANG_INGREDIENT_BUY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full flex items-center justify-between bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">🛒</span>
                  <span>쿠팡에서 재료 구매하기</span>
                </span>
                <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}

            {/* Action buttons */}
            <div className="space-y-3 pt-4">
              {result.actions.map((action: any, index: number) => {
                const colors = [
                  'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
                  'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
                  'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
                  'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
                  'from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600',
                ];
                
                const icons = ['📖', '🎥', '🛒', '🛵', '🗺️'];
                
                const handleClick = (e: React.MouseEvent) => {
                  // For delivery apps with deep links
                  if (action.deepLink && action.fallbackUrl) {
                    e.preventDefault();
                    
                    // Try deep link (will open app if installed)
                    window.location.href = action.deepLink;
                    
                    // Fallback to website after short delay
                    setTimeout(() => {
                      // Only open fallback if still on same page (app didn't open)
                      if (!document.hidden) {
                        window.location.href = action.fallbackUrl;
                      }
                    }, 1000);
                  }
                };
                
                return (
                  <a
                    key={index}
                    href={action.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClick}
                    className={`group w-full flex items-center justify-between bg-gradient-to-r ${colors[index % colors.length]} text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-2xl">{icons[index % icons.length]}</span>
                      <span>{action.label}</span>
                    </span>
                    <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                );
              })}
            </div>

            {/* Another recommendation button */}
            <button
              onClick={handleGetAnotherRecommendation}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl">🔁</span>
                <span>다른 추천</span>
              </span>
            </button>

            {/* Reset button */}
            <button
              onClick={onBackToHome}
              className="w-full mt-2 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 px-6 rounded-2xl transform transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl">🏠</span>
                <span>처음으로 돌아가기</span>
              </span>
            </button>
          </div>
        </div>

        {/* Fun fact or tip */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            💡 <strong>Tip:</strong> 매일 다른 메뉴를 시도해보세요!
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
