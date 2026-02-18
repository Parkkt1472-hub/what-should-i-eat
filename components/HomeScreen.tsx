'use client';

import { useState } from 'react';

interface HomeScreenProps {
  onStartDecision: () => void;
}

export default function HomeScreen({ onStartDecision }: HomeScreenProps) {
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomRecommendation = () => {
    // 맞춤형 추천 시작 - DecisionFlow로 이동
    onStartDecision();
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
            AI가 당신의 완벽한 한 끼를 찾아드립니다
          </p>
        </div>
        
        {/* Main CTA - 무작정 추천받기 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
          <button
            onClick={onStartDecision}
            className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white text-2xl md:text-3xl font-bold py-8 px-16 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            <span className="flex items-center gap-3">
              <span className="text-3xl">🎲</span>
              <span>무작정 추천받기</span>
              <span className="text-3xl">✨</span>
            </span>
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
            💡 <strong>Tip:</strong> 맞춤형 추천은 상황과 기분에 맞는 메뉴를 제안합니다
          </p>
        </div>
      </div>

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
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
