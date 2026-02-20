'use client';

import React, { useEffect, useState } from 'react';

interface LocalRestaurant {
  title: string;
  address: string;
  category: string;
  link: string;
}

interface LocalRestaurantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuName: string;
  location: string | null;
}

export default function LocalRestaurantsModal({
  isOpen,
  onClose,
  menuName,
  location,
}: LocalRestaurantsModalProps) {
  const [restaurants, setRestaurants] = useState<LocalRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && menuName) {
      fetchRestaurants();
    }
  }, [isOpen, menuName, location]);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ menu: menuName });
      if (location) {
        params.append('location', location);
      }

      const response = await fetch(`/api/naver-local?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setRestaurants(data.items || []);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('가게 정보를 불러오는 중 문제가 발생했어요');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                🏪 {location ? `${location} ` : '우리동네 '}{menuName} TOP5
              </h2>
              <p className="text-sm text-gray-600 mt-1">리뷰가 많은 순서로 추천해요</p>
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

          {!loading && !error && restaurants.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg">근처에 해당 메뉴 취급 가게를 찾지 못했어요</p>
              <p className="text-gray-500 text-sm mt-2">다른 메뉴로 다시 시도해보세요</p>
            </div>
          )}

          {!loading && !error && restaurants.length > 0 && (
            <div className="space-y-3">
              {restaurants.map((restaurant, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(restaurant.link, '_blank', 'noopener,noreferrer');
                  }}
                  className="block w-full text-left p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-xl border border-orange-200 transition-all transform hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">
                        {restaurant.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">{restaurant.address}</p>
                      {restaurant.category && (
                        <p className="text-xs text-orange-600 font-medium">
                          {restaurant.category.split('>').pop()?.trim() || restaurant.category}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-orange-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
