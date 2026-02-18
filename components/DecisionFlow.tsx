'use client';

import { useState } from 'react';

interface DecisionFlowProps {
  onComplete: (data: any) => void;
}

type WhoType = '나 혼자' | '커플' | '가족' | '친구';
type HowType = '만들어 먹기' | '배달' | '외식';
type OutdoorType = '근처 간단 외식' | '가까운 시내' | '기분전환 야외';

export default function DecisionFlow({ onComplete }: DecisionFlowProps) {
  const [step, setStep] = useState<'who' | 'how' | 'outdoor'>('who');
  const [who, setWho] = useState<WhoType>('나 혼자');
  const [how, setHow] = useState<HowType | null>(null);

  const handleWhoSelect = (selected: WhoType) => {
    setWho(selected);
    setStep('how');
  };

  const handleHowSelect = (selected: HowType) => {
    setHow(selected);
    
    if (selected === '외식') {
      setStep('outdoor');
    } else {
      // Generate decision
      onComplete({
        who,
        how: selected,
        outdoor: null,
      });
    }
  };

  const handleOutdoorSelect = (selected: OutdoorType) => {
    onComplete({
      who,
      how: '외식',
      outdoor: selected,
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {step === 'who' && (
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
              누가 먹나요?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {(['나 혼자', '커플', '가족', '친구'] as WhoType[]).map((option) => (
                <button
                  key={option}
                  onClick={() => handleWhoSelect(option)}
                  className="bg-white hover:bg-orange-50 border-2 border-orange-200 hover:border-orange-400 text-gray-800 text-xl font-semibold py-8 px-6 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'how' && (
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
              어떻게 먹을까요?
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {(['만들어 먹기', '배달', '외식'] as HowType[]).map((option) => (
                <button
                  key={option}
                  onClick={() => handleHowSelect(option)}
                  className="bg-white hover:bg-orange-50 border-2 border-orange-200 hover:border-orange-400 text-gray-800 text-xl font-semibold py-8 px-6 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'outdoor' && (
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
              어디서 먹을까요?
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {(['근처 간단 외식', '가까운 시내', '기분전환 야외'] as OutdoorType[]).map((option) => (
                <button
                  key={option}
                  onClick={() => handleOutdoorSelect(option)}
                  className="bg-white hover:bg-orange-50 border-2 border-orange-200 hover:border-orange-400 text-gray-800 text-xl font-semibold py-8 px-6 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
