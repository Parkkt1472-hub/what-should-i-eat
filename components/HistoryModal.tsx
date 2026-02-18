'use client';

import React, { useState, useEffect } from 'react';
import { getHistory, clearHistory, removeHistoryItem, HistoryItem } from '@/lib/historyStorage';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  const handleClearAll = () => {
    if (confirm('모든 추천 기록을 삭제하시겠습니까?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeHistoryItem(id);
    setHistory(getHistory());
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">📋 추천 기록</h2>
              <p className="text-sm text-gray-500 mt-1">
                최근 {history.length}개의 추천 기록
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

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-gray-500 text-lg">아직 추천 기록이 없어요</p>
              <p className="text-gray-400 text-sm mt-2">메뉴를 추천받으면 여기에 표시됩니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{item.menuName}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.mode === 'personalized' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.mode === 'personalized' ? '🎯 맞춤형' : '🎲 랜덤'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.reason}</p>
                      {item.who && item.how && (
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>👥 {item.who}</span>
                          <span>•</span>
                          <span>🍴 {item.how}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClearAll}
              className="w-full py-3 px-6 rounded-xl border-2 border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-all"
            >
              🗑️ 전체 기록 삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
