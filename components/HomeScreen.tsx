'use client';

import { useState } from 'react';

interface HomeScreenProps {
  onStartDecision: () => void;
}

export default function HomeScreen({ onStartDecision }: HomeScreenProps) {
  const [showEnhance, setShowEnhance] = useState(false);

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
            AI가 당신의 완벽한 한 끼를 찾아드립니다
          </p>
        </div>
        
        {/* Premium CTA button with glow effect */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
          <button
            onClick={onStartDecision}
            className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white text-2xl md:text-3xl font-bold py-8 px-20 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            <span className="flex items-center gap-3">
              <span className="text-3xl">✨</span>
              <span>지금 추천받기</span>
              <span className="text-3xl">✨</span>
            </span>
          </button>
        </div>
        
        {/* Enhanced info button */}
        <button
          onClick={() => setShowEnhance(!showEnhance)}
          className="group text-gray-600 hover:text-gray-800 text-sm font-medium transition-all duration-300 flex items-center gap-2 mx-auto"
        >
          <span className="border-b-2 border-dotted border-gray-400 group-hover:border-gray-600">
            정확도 높이기
          </span>
          <svg 
            className={`w-4 h-4 transition-transform duration-300 ${showEnhance ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Premium info card */}
        {showEnhance && (
          <div className="mt-8 p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-orange-100 max-w-md mx-auto animate-slide-up">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-2xl">
                  🎯
                </div>
                <h3 className="text-2xl font-bold text-gray-800">프리미엄 기능</h3>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                <strong className="text-gray-800">정확도 높이기</strong>는 향후 업데이트에서 제공됩니다.
              </p>
              
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🧠</span>
                  <div>
                    <p className="font-semibold text-gray-800">AI 학습</p>
                    <p className="text-sm text-gray-600">개인 취향 자동 분석</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🍱</span>
                  <div>
                    <p className="font-semibold text-gray-800">식단 관리</p>
                    <p className="text-sm text-gray-600">알레르기 & 영양 필터</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="font-semibold text-gray-800">주간 플래닝</p>
                    <p className="text-sm text-gray-600">자동 메뉴 생성</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats or features */}
        <div className="grid grid-cols-3 gap-4 pt-12 max-w-lg mx-auto">
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-100">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">35+</div>
            <div className="text-sm text-gray-600 mt-1">메뉴</div>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-100">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">3초</div>
            <div className="text-sm text-gray-600 mt-1">추천 속도</div>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-100">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">100%</div>
            <div className="text-sm text-gray-600 mt-1">무료</div>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-8 text-center text-gray-500 text-sm z-10">
        <p className="flex items-center gap-2 justify-center">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          하루 3회 무료 추천 제공
        </p>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
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
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
