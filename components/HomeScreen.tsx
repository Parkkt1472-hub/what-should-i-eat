'use client';

import { useState } from 'react';

interface HomeScreenProps {
  onStartDecision: () => void;
}

export default function HomeScreen({ onStartDecision }: HomeScreenProps) {
  const [showEnhance, setShowEnhance] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-12">
          오늘 뭐 먹지?
        </h1>
        
        <button
          onClick={onStartDecision}
          className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white text-2xl md:text-3xl font-bold py-8 px-16 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95"
        >
          🍽 오늘 뭐 먹지?
        </button>
        
        <button
          onClick={() => setShowEnhance(!showEnhance)}
          className="block mx-auto text-gray-600 hover:text-gray-800 text-sm underline transition-colors mt-6"
        >
          정확도 높이기
        </button>

        {showEnhance && (
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong>정확도 높이기</strong>는 향후 업데이트에서 제공됩니다.
              <br />
              <br />
              현재는 간단한 클릭만으로 즉시 추천을 받을 수 있습니다.
              <br />
              <br />
              프리미엄 플랜에서는 개인 취향, 알레르기, 식단 기록을 바탕으로 더욱 정확한 추천을 제공합니다.
            </p>
          </div>
        )}
      </div>

      <footer className="absolute bottom-8 text-center text-gray-500 text-sm">
        <p>하루 3회 무료 추천 제공</p>
      </footer>
    </div>
  );
}
