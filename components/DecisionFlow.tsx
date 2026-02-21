'use client';

import { useState } from 'react';
import { playTabSound } from '@/lib/soundEffects';

interface DecisionFlowProps {
  onComplete: (data: any) => void;
}

type WhoType = '나 혼자' | '커플' | '가족' | '친구';
type HowType = '만들어 먹기' | '배달' | '외식';
type OutdoorType = '근처에서 찾기' | '기분전환 야외';

const whoIcons: Record<WhoType, string> = {
  '나 혼자': '👤',
  '커플': '💑',
  '가족': '👨‍👩‍👧‍👦',
  '친구': '👥',
};

const howIcons: Record<HowType, string> = {
  '만들어 먹기': '👨‍🍳',
  '배달': '🛵',
  '외식': '🏪',
};

const outdoorIcons: Record<OutdoorType, string> = {
  '근처에서 찾기': '📍',
  '기분전환 야외': '🌿',
};

export default function DecisionFlow({ onComplete }: DecisionFlowProps) {
  const [step, setStep] = useState<'who' | 'how' | 'outdoor'>('who');
  const [who, setWho] = useState<WhoType>('나 혼자');
  const [how, setHow] = useState<HowType | null>(null);

  const handleWhoSelect = (selected: WhoType) => {
    playTabSound();
    setWho(selected);
    setTimeout(() => setStep('how'), 300);
  };

  const handleHowSelect = (selected: HowType) => {
    playTabSound();
    setHow(selected);
    
    if (selected === '외식') {
      setTimeout(() => setStep('outdoor'), 300);
    } else {
      setTimeout(() => {
        onComplete({
          who,
          how: selected,
          outdoor: null,
        });
      }, 300);
    }
  };

  const handleOutdoorSelect = (selected: OutdoorType) => {
    playTabSound();
    setTimeout(() => {
      onComplete({
        who,
        how: '외식',
        outdoor: selected,
      });
    }, 300);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 'who' ? 'bg-orange-500 scale-125' : 'bg-orange-300'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 'how' ? 'bg-orange-500 scale-125' : 'bg-orange-300'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 'outdoor' ? 'bg-orange-500 scale-125' : 'bg-orange-300'}`}></div>
          </div>
        </div>

        {step === 'who' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
                누가 먹나요?
              </h2>
              <p className="text-gray-600 text-lg">함께하는 사람에 맞춰 추천해드릴게요</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {(['나 혼자', '커플', '가족', '친구'] as WhoType[]).map((option) => (
                <button
                  key={option}
                  onClick={() => handleWhoSelect(option)}
                  className="group relative bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-orange-200 hover:border-orange-400 hover:shadow-2xl text-gray-800 text-xl md:text-2xl font-semibold py-10 md:py-12 px-6 rounded-3xl transform transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center gap-3">
                    <span className="text-5xl md:text-6xl">{whoIcons[option]}</span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'how' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
                어떻게 먹을까요?
              </h2>
              <p className="text-gray-600 text-lg">선택하신 방식에 맞춰 추천해드릴게요</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {(['만들어 먹기', '배달', '외식'] as HowType[]).map((option) => (
                <button
                  key={option}
                  onClick={() => handleHowSelect(option)}
                  className="group relative bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-orange-200 hover:border-orange-400 hover:shadow-2xl text-gray-800 text-xl md:text-2xl font-semibold py-10 md:py-12 px-8 rounded-3xl transform transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-4">
                    <span className="text-5xl">{howIcons[option]}</span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'outdoor' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
                어디서 먹을까요?
              </h2>
              <p className="text-gray-600 text-lg">장소에 맞는 맛집을 찾아드릴게요</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {(['근처에서 찾기', '기분전환 야외'] as OutdoorType[]).map((option) => (
                <button
                  key={option}
                  onClick={() => handleOutdoorSelect(option)}
                  className="group relative bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-orange-200 hover:border-orange-400 hover:shadow-2xl text-gray-800 text-xl md:text-2xl font-semibold py-12 md:py-16 px-8 rounded-3xl transform transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center justify-center gap-4">
                    <span className="text-6xl">{outdoorIcons[option]}</span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
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
