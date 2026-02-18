'use client';

import { makeDecision } from '@/lib/decisionEngine';
import { useEffect, useState } from 'react';

interface ResultScreenProps {
  data: any;
  onBackToHome: () => void;
}

export default function ResultScreen({ data, onBackToHome }: ResultScreenProps) {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const decision = makeDecision(data);
    setResult(decision);
  }, [data]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl text-gray-600">결정 중...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍽</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {result.menu}
          </h1>
          <p className="text-lg text-gray-600">{result.reason}</p>
        </div>

        {result.ingredients && result.ingredients.length > 0 && (
          <div className="mb-8 p-6 bg-orange-50 rounded-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-3">필요한 재료</h3>
            <div className="flex flex-wrap gap-2">
              {result.ingredients.map((ingredient: string, index: number) => (
                <span
                  key={index}
                  className="bg-white px-4 py-2 rounded-full text-gray-700 text-sm font-medium shadow-sm"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 mb-8">
          {result.actions.map((action: any, index: number) => (
            <a
              key={index}
              href={action.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white text-lg font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 text-center"
            >
              {action.label}
            </a>
          ))}
        </div>

        <button
          onClick={onBackToHome}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg font-semibold py-4 px-6 rounded-2xl transition-colors"
        >
          처음으로 돌아가기
        </button>
      </div>
    </div>
  );
}
