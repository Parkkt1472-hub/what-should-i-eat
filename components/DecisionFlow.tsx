'use client';

import { useState } from 'react';
import { playTabSound } from '@/lib/soundEffects';

interface DecisionFlowProps {
  onComplete: (data: any) => void;
}

type WhoType = '나 혼자' | '커플' | '가족' | '친구' | '직장동료';
type HowType = '만들어 먹기' | '배달' | '외식';
type OutdoorType = '근처에서 찾기' | '기분전환 야외';

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

  const whoOptions: WhoType[] = ['나 혼자', '친구', '커플', '가족', '직장동료'];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f8f6f5] dark:bg-[#23140f] overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center p-4 pb-2 justify-between">
        <button 
          onClick={() => window.history.back()}
          className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start hover:bg-[#ff6933]/10 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
          🎲 복불복 모드
        </h2>
      </div>

      {/* Progress Indicator */}
      <div className="flex w-full flex-row items-center justify-center gap-3 py-6">
        <div className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${step === 'who' ? 'bg-[#ff6933]' : 'bg-[#ff6933]/30'}`}></div>
        <div className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${step === 'how' ? 'bg-[#ff6933]' : 'bg-[#ff6933]/30'}`}></div>
        <div className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${step === 'outdoor' ? 'bg-[#ff6933]' : 'bg-[#ff6933]/30'}`}></div>
      </div>

      <main className="max-w-md mx-auto w-full px-4 flex-1">
        {/* Step 1: Who? */}
        {step === 'who' && (
          <section className="mb-8 animate-fade-in">
            <h3 className="text-slate-900 dark:text-slate-100 tracking-tight text-2xl font-extrabold leading-tight text-center pb-6">
              누구랑 드시나요?
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {whoOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleWhoSelect(option)}
                  className="group flex min-w-[84px] cursor-pointer items-center justify-between rounded-xl h-14 px-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-transparent hover:border-[#ff6933] transition-all active:scale-95"
                >
                  <span className="text-base font-bold">{option}</span>
                  <span className="material-symbols-outlined text-[#ff6933] opacity-0 group-hover:opacity-100 transition-opacity">
                    check_circle
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 2: How? */}
        {step === 'how' && (
          <section className="mb-8 animate-fade-in">
            <h3 className="text-slate-900 dark:text-slate-100 tracking-tight text-2xl font-extrabold leading-tight text-center pb-6">
              어떻게 먹을까요?
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {(['만들어 먹기', '배달', '외식'] as HowType[]).map((option) => (
                <button
                  key={option}
                  onClick={() => handleHowSelect(option)}
                  className="group flex min-w-[84px] cursor-pointer items-center justify-between rounded-xl h-14 px-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-transparent hover:border-[#ff6933] transition-all active:scale-95"
                >
                  <span className="text-base font-bold">{option}</span>
                  <span className="material-symbols-outlined text-[#ff6933] opacity-0 group-hover:opacity-100 transition-opacity">
                    check_circle
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 3: Where? (Only for 외식) */}
        {step === 'outdoor' && (
          <section className="mb-8 animate-fade-in">
            <h3 className="text-slate-900 dark:text-slate-100 tracking-tight text-2xl font-extrabold leading-tight text-center pb-6">
              어디서 먹을까요?
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {(['근처에서 찾기', '기분전환 야외'] as OutdoorType[]).map((option) => (
                <button
                  key={option}
                  onClick={() => handleOutdoorSelect(option)}
                  className="group flex min-w-[84px] cursor-pointer items-center justify-between rounded-xl h-14 px-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-transparent hover:border-[#ff6933] transition-all active:scale-95"
                >
                  <span className="text-base font-bold">{option}</span>
                  <span className="material-symbols-outlined text-[#ff6933] opacity-0 group-hover:opacity-100 transition-opacity">
                    check_circle
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
