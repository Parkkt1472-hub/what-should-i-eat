'use client';

import React, { useState } from 'react';
import { PreferenceVector } from '@/lib/decisionEngine';

interface PersonalizedSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (preferences: PreferenceVector) => void;
}

export default function PersonalizedSurveyModal({ isOpen, onClose, onSubmit }: PersonalizedSurveyModalProps) {
  const [preferences, setPreferences] = useState<PreferenceVector>({
    spicy: 1,
    soup: 1,
    preferRice: true,
    preferNoodle: true,
    meat: 2,
    seafood: 1,
    veg: 1,
    time: 1,
    budget: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              🎯 나의 맞춤형 추천받기
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              6가지 질문에 답하면 당신에게 딱 맞는 메뉴를 추천해드려요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question 1: Spicy */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-800">
                1. 🌶️ 매운 음식을 얼마나 좋아하시나요?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 0, label: '안먹어요', emoji: '🚫' },
                  { value: 1, label: '약간', emoji: '😊' },
                  { value: 2, label: '중간', emoji: '😋' },
                  { value: 3, label: '매우', emoji: '🔥' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, spicy: option.value })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      preferences.spicy === option.value
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Soup */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-800">
                2. 🍲 국물 음식을 선호하시나요?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 0, label: '국물 없는 게 좋아요', emoji: '🍛' },
                  { value: 1, label: '상관없어요', emoji: '😊' },
                  { value: 2, label: '국물 많이!', emoji: '🍜' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, soup: option.value })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      preferences.soup === option.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Rice or Noodle */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-800">
                3. 🍚 밥과 면 중 무엇을 선호하시나요?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, preferRice: true, preferNoodle: false })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    preferences.preferRice && !preferences.preferNoodle
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🍚</div>
                  <div className="text-xs font-medium">밥</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, preferRice: false, preferNoodle: true })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    !preferences.preferRice && preferences.preferNoodle
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🍜</div>
                  <div className="text-xs font-medium">면</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, preferRice: true, preferNoodle: true })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    preferences.preferRice && preferences.preferNoodle
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="text-2xl mb-1">😊</div>
                  <div className="text-xs font-medium">둘 다</div>
                </button>
              </div>
            </div>

            {/* Question 4: Protein preferences */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-800">
                4. 🥩 단백질 선호도는?
              </label>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>고기 🥩</span>
                    <span className="font-medium">{['안먹어요', '조금', '보통', '많이'][preferences.meat]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    value={preferences.meat}
                    onChange={(e) => setPreferences({ ...preferences, meat: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>해산물 🦐</span>
                    <span className="font-medium">{['안먹어요', '조금', '보통', '많이'][preferences.seafood]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    value={preferences.seafood}
                    onChange={(e) => setPreferences({ ...preferences, seafood: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>채소 🥬</span>
                    <span className="font-medium">{['안먹어요', '조금', '보통', '많이'][preferences.veg]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    value={preferences.veg}
                    onChange={(e) => setPreferences({ ...preferences, veg: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Question 5: Time */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-800">
                5. ⏱️ 조리/대기 시간은?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 0, label: '빠르게', emoji: '⚡' },
                  { value: 1, label: '보통', emoji: '⏳' },
                  { value: 2, label: '천천히', emoji: '🕐' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, time: option.value })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      preferences.time === option.value
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 6: Budget */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-800">
                6. 💰 가격대는?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 0, label: '저렴하게', emoji: '💵' },
                  { value: 1, label: '보통', emoji: '💴' },
                  { value: 2, label: '괜찮아요', emoji: '💳' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, budget: option.value })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      preferences.budget === option.value
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all"
              >
                맞춤 추천 받기 🎯
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
