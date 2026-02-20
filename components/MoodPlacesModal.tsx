'use client';

import React, { useEffect, useState } from 'react';

interface MoodPlace {
  title: string;
  address: string;
  category: string;
}

interface MoodPlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuName: string;
  location: string | null;
}

export default function MoodPlacesModal({
  isOpen,
  onClose,
  menuName,
  location,
}: MoodPlacesModalProps) {
  const [places, setPlaces] = useState<MoodPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && menuName) {
      fetchMoodPlaces();
    }
  }, [isOpen, menuName, location]);

  const fetchMoodPlaces = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ menu: menuName });
      if (location) {
        params.append('region', location);
      }

      const response = await fetch(`/api/mood-places?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch mood places');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPlaces(data.items || []);
    } catch (err) {
      console.error('Error fetching mood places:', err);
      setError('기분전환 맛집 정보를 불러오는 중 문제가 발생했어요');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                🌿 기분전환 {menuName} 맛집 TOP5
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {location ? `${location} 근교 100km 반경` : '근교 지역'} · 네이버 리뷰순
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
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-xl p-4 animate-pulse"
                >
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😢</div>
              <p className="text-gray-600 text-lg">{error}</p>
            </div>
          )}

          {!loading && !error && places.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg">근처에 해당 메뉴 취급 가게를 찾지 못했어요</p>
              <p className="text-gray-500 text-sm mt-2">다른 메뉴로 다시 시도해보세요</p>
            </div>
          )}

          {!loading && !error && places.length > 0 && (
            <div className="space-y-3">
              {places.map((place, index) => {
                // 네이버 지도 검색 URL 생성 (가게명 기반)
                const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(place.title)}`;
                // 인스타그램 검색 URL 생성 (가게명 기반)
                const instagramUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(place.title.replace(/\s+/g, ''))}`;
                
                return (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">
                          {place.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">{place.address}</p>
                        {place.category && (
                          <p className="text-xs text-purple-600 font-medium">
                            {place.category.split('>').pop()?.trim() || place.category}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* 버튼 그룹 */}
                    <div className="space-y-2">
                      {/* 네이버 지도에서 보기 버튼 */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(naverMapUrl, '_blank', 'noopener,noreferrer');
                        }}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        네이버지도에서 보기
                      </button>
                      
                      {/* 인스타그램으로 보기 버튼 */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(instagramUrl, '_blank', 'noopener,noreferrer');
                        }}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        인스타그램으로 보기
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
