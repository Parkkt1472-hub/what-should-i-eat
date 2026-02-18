'use client';

interface UsageLimitModalProps {
  onClose: () => void;
}

export default function UsageLimitModal({ onClose }: UsageLimitModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          오늘의 무료 추천 완료! 🎉
        </h2>
        
        <p className="text-gray-600 text-center mb-8">
          오늘 3회 무료 추천을 모두 사용하셨습니다.
          <br />
          내일 다시 이용하시거나, 프리미엄으로 업그레이드하세요!
        </p>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            무제한 결정 받기
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>무제한 결정</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>가족 식단 자동 생성</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>주간 메뉴 추천</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>개인 취향 학습</span>
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white text-lg font-bold py-4 px-6 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 mb-3"
        >
          프리미엄 구독하기 (준비 중)
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg font-semibold py-4 px-6 rounded-full transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
