'use client';

import React, { useEffect, useState } from 'react';

interface AdventurePlace {
  rank: number;
  title: string;
  address: string;
  category: string;
  keyword: string;
  adventureScore: number;
  adventureLevel: number; // 0-100%
}

interface AdventurePlacesProps {
  menuName: string;
  region: string | null;
  shareCount: number;
  onShareClick: () => void;
}

export default function AdventurePlaces({
  menuName,
  region,
  shareCount,
  onShareClick,
}: AdventurePlacesProps) {
  const [places, setPlaces] = useState<AdventurePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); // 펼침/접힘 상태
  
  const isUnlocked = shareCount >= 3;

  useEffect(() => {
    // 자동 로딩 제거 - 클릭 시에만 로딩
    if (isExpanded && places.length === 0) {
      fetchAdventurePlaces();
    }
  }, [isExpanded, menuName, region]);

  const fetchAdventurePlaces = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ menu: menuName });
      if (region) {
        params.append('region', region);
      }

      const response = await fetch(`/api/adventure?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch adventure places');
      }

      const data = await response.json();
      setPlaces(data.items || []);
    } catch (err) {
      console.error('[AdventurePlaces] Error:', err);
      setError('이색맛집 정보를 불러올 수 없어요');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceClick = (place: AdventurePlace) => {
    const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(place.title)}`;
    window.open(naverMapUrl, '_blank', 'noopener,noreferrer');
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
      {/* Header - 클릭 가능 */}
      <button 
        onClick={handleToggle}
        className="w-full text-center mb-4 hover:opacity-80 transition-opacity"
      >
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🎒 이색맛집 TOP5 {isExpanded ? '▼' : '▶'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          (평소에 잘 안먹는 특별한 음식)
        </p>
      </button>

      {/* 펼쳐진 경우에만 내용 표시 */}
      {isExpanded && (
        <>
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-600">이색맛집을 찾는 중...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-6 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && places.length === 0 && (
            <div className="text-center py-6 text-sm text-gray-600">
              이색맛집을 찾지 못했어요 😢
            </div>
          )}

          {!loading && !error && places.length > 0 && (
        <>
          {/* Lock Status */}
          {!isUnlocked && (
            <div className="mb-4 p-4 bg-purple-100 rounded-lg border border-purple-300 text-center">
              <p className="text-sm font-semibold text-purple-800">
                🔒 친구 3명과 공유하면 TOP1·TOP2가 열립니다
              </p>
              <p className="text-xs text-purple-600 mt-1">
                (현재 {shareCount}/3)
              </p>
            </div>
          )}

          {/* Places List */}
          <div className="space-y-3">
            {places.map((place, index) => {
              const isLocked = !isUnlocked && index < 2; // TOP1, TOP2 잠금
              
              return (
                <div
                  key={index}
                  className={`relative ${
                    isLocked ? 'filter blur-sm pointer-events-none' : ''
                  }`}
                >
                  <button
                    onClick={() => handlePlaceClick(place)}
                    disabled={isLocked}
                    className="w-full text-left p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] border-2 border-purple-100 hover:border-purple-300"
                  >
                    <div className="flex items-start gap-3">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          place.rank === 1
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                            : place.rank === 2
                            ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                            : place.rank === 3
                            ? 'bg-gradient-to-r from-orange-300 to-orange-500'
                            : 'bg-gradient-to-r from-purple-400 to-pink-500'
                        }`}>
                          {place.rank}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-lg truncate">
                          {place.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          📍 {place.address}
                        </p>
                        {place.category && (
                          <p className="text-xs text-gray-500 mt-1">
                            {place.category}
                          </p>
                        )}
                        
                        {/* Adventure Level */}
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-semibold text-purple-600">
                            🗺️ 모험도
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                              style={{ width: `${place.adventureLevel}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-purple-600">
                            {place.adventureLevel}%
                          </span>
                        </div>

                        {/* Keyword Badge */}
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            #{place.keyword}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl">🔒</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA Button (if locked) */}
          {!isUnlocked && (
            <button
              onClick={onShareClick}
              className="mt-4 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-xl transition-all transform hover:scale-105"
            >
              🚀 친구에게 공유하고 열기
            </button>
          )}

          {/* Success Message (if unlocked) */}
          {isUnlocked && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
              <p className="text-sm font-semibold text-green-800">
                ✅ 모든 이색맛집이 해금되었습니다!
              </p>
            </div>
          )}
          </>
        )}
        </>
      )}
    </div>
  );
}
