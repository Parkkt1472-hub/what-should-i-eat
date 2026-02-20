'use client';

import React, { useEffect, useState } from 'react';
import { getAnonId } from '@/lib/anonIdStorage';

interface LocalSubmission {
  id: string;
  user_id: string;
  restaurant_name: string;
  region: string;
  description: string;
  image_url?: string;
  created_at: string;
}

export default function LocalSubmissions() {
  const [submissions, setSubmissions] = useState<LocalSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [restaurantName, setRestaurantName] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (showList) {
      fetchSubmissions();
    }
  }, [showList]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.items || []);
      }
    } catch (error) {
      console.error('[LocalSubmissions] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurantName || !region || !description) {
      alert('모든 필수 항목을 입력해주세요!');
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: getAnonId(),
          restaurant_name: restaurantName,
          region,
          description,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // Reset form
        setRestaurantName('');
        setRegion('');
        setDescription('');
        
        // Close form after 2 seconds
        setTimeout(() => {
          setShowForm(false);
          setSubmitSuccess(false);
        }, 2000);
      } else {
        alert('제보 등록에 실패했어요. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('[LocalSubmissions] Submit error:', error);
      alert('제보 등록 중 오류가 발생했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          🧡 현지인맛집 제보하기
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          숨은 맛집을 알려주세요!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => {
            setShowList(!showList);
            setShowForm(false);
          }}
          className="flex-1 py-3 px-4 rounded-lg bg-white border-2 border-orange-300 text-orange-700 font-semibold hover:bg-orange-50 transition-all"
        >
          📋 제보 목록 보기
        </button>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setShowList(false);
          }}
          className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:shadow-lg transition-all"
        >
          ✍️ 제보하기
        </button>
      </div>

      {/* Submissions List */}
      {showList && (
        <div className="mt-4 p-4 bg-white rounded-lg border-2 border-orange-200">
          {loading && (
            <div className="text-center py-4 text-sm text-gray-600">
              로딩 중...
            </div>
          )}

          {!loading && submissions.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-2">아직 제보가 없어요.</p>
              <p className="text-sm text-orange-600">첫 제보자가 되어주세요! 🎉</p>
            </div>
          )}

          {!loading && submissions.length > 0 && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">🍽️</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800">{sub.restaurant_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">📍 {sub.region}</p>
                      <p className="text-sm text-gray-700 mt-2">{sub.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        제보자: {sub.user_id}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submission Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 p-4 bg-white rounded-lg border-2 border-orange-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                가게명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="예: 할머니 손맛집"
                className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                지역 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="예: 부산 해운대"
                className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                한줄설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 50년 전통 국밥집, 현지인만 아는 맛집"
                rows={3}
                className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '제보 중...' : '제보하기'}
            </button>

            {submitSuccess && (
              <div className="text-center text-sm font-semibold text-green-600 animate-fade-in">
                ✅ 제보가 등록되었습니다!
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
