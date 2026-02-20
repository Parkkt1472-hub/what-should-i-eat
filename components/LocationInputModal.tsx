'use client';

import React, { useState } from 'react';

interface LocationInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (location: string) => void;
}

export default function LocationInputModal({ isOpen, onClose, onSubmit }: LocationInputModalProps) {
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    if (location.trim().length > 0) {
      onSubmit(location.trim());
      setLocation('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">📍 우리동네 설정</h2>
              <p className="text-sm text-gray-600 mt-1">
                근처 맛집을 찾기 위해 지역을 알려주세요!
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              지역 입력
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="예: 강남구, 양산, 부산 해운대"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors text-lg"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 시/구/동 이름을 입력해주세요
            </p>
          </div>

          {/* Examples */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-600 mb-2">예시:</p>
            <div className="flex flex-wrap gap-2">
              {['강남구', '양산', '부산 해운대', '서울 마포구'].map((example) => (
                <button
                  key={example}
                  onClick={() => setLocation(example)}
                  className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full text-sm transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setLocation('');
                onClose();
              }}
              className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
            >
              나중에
            </button>
            <button
              onClick={handleSubmit}
              disabled={location.trim().length === 0}
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
