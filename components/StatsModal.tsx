'use client';

import React, { useState, useEffect } from 'react';
import { getStats, getTopMenus, getSpicyPreferenceRatio } from '@/lib/statsStorage';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [stats, setStats] = useState<any>(null);
  const [topMenus, setTopMenus] = useState<any[]>([]);
  const [spicyRatio, setSpicyRatio] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStats(getStats());
      setTopMenus(getTopMenus(5));
      setSpicyRatio(getSpicyPreferenceRatio());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const spicyLabels = ['안매움', '약간', '중간', '매우'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">📊 통계 및 인기 메뉴</h2>
              <p className="text-sm text-gray-500 mt-1">
                이 통계는 참고용입니다
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Total decisions */}
          {stats && (
            <div className="mb-8 text-center">
              <div className="inline-block bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl px-8 py-6 border border-orange-200">
                <p className="text-sm text-gray-600 mb-1">지금까지 총</p>
                <p className="text-5xl font-bold text-orange-600">
                  {stats.totalDecisions}
                </p>
                <p className="text-sm text-gray-600 mt-1">번의 추천이 이루어졌어요!</p>
              </div>
            </div>
          )}

          {/* Top 5 menus */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🏆</span>
              <span>오늘의 인기 메뉴 TOP 5</span>
            </h3>
            {topMenus.length > 0 ? (
              <div className="space-y-3">
                {topMenus.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100"
                  >
                    <div className={`text-3xl font-bold ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-orange-400' :
                      'text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{item.menuName}</p>
                      <p className="text-sm text-gray-500">{item.count}번 추천됨</p>
                    </div>
                    {index === 0 && <span className="text-2xl">👑</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>아직 통계가 없어요</p>
                <p className="text-sm mt-1">메뉴를 추천받으면 통계가 쌓입니다!</p>
              </div>
            )}
          </div>

          {/* Spicy preference ratio */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🌶️</span>
              <span>매운맛 선호 비율</span>
            </h3>
            {spicyRatio.length > 0 && spicyRatio.some(r => r.count > 0) ? (
              <div className="space-y-3">
                {spicyRatio.map((item) => (
                  <div key={item.level} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {spicyLabels[item.level]}
                      </span>
                      <span className="text-gray-500">
                        {item.count}명 ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.level === 0 ? 'bg-blue-400' :
                          item.level === 1 ? 'bg-green-400' :
                          item.level === 2 ? 'bg-orange-400' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>아직 통계가 없어요</p>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              ℹ️ 이 통계는 사용자의 기기에 저장된 데이터 기반으로, 참고용으로만 제공됩니다. 
              실제 인기도나 선호도를 보장하지 않으며, 의료적 조언이나 식이 권장사항이 아닙니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:shadow-lg transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
