'use client';

interface UsageLimitModalProps {
  onClose: () => void;
}

export default function UsageLimitModal({ onClose }: UsageLimitModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
            ⚡
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          무제한 결정 받기
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          오늘의 무료 추천 횟수를 모두 사용하셨습니다.
          <br />
          프리미엄으로 업그레이드하고 무제한으로 이용하세요!
        </p>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
            <span className="text-2xl">✨</span>
            <div>
              <h3 className="font-semibold text-gray-800">무제한 결정</h3>
              <p className="text-sm text-gray-600">하루 제한 없이 언제든지 추천받기</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
            <span className="text-2xl">🍱</span>
            <div>
              <h3 className="font-semibold text-gray-800">가족 식단 자동 생성</h3>
              <p className="text-sm text-gray-600">일주일 메뉴를 한 번에 계획</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
            <span className="text-2xl">📅</span>
            <div>
              <h3 className="font-semibold text-gray-800">주간 메뉴 추천</h3>
              <p className="text-sm text-gray-600">AI가 맞춤 식단 제안</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
            <span className="text-2xl">🧠</span>
            <div>
              <h3 className="font-semibold text-gray-800">개인 취향 학습</h3>
              <p className="text-sm text-gray-600">더 정확한 추천 경험</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
            <span className="text-2xl">🚫</span>
            <div>
              <h3 className="font-semibold text-gray-800">알레르기 필터링</h3>
              <p className="text-sm text-gray-600">안전한 식사 선택</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6 p-6 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl border-2 border-orange-200">
          <div className="text-4xl font-bold text-gray-800 mb-1">
            ₩9,900
            <span className="text-lg font-normal text-gray-600">/월</span>
          </div>
          <p className="text-sm text-gray-600">언제든지 취소 가능</p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => {
            alert('프리미엄 구독 기능은 준비 중입니다!');
            onClose();
          }}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg font-bold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95 mb-3"
        >
          프리미엄 시작하기
        </button>

        {/* Secondary button */}
        <button
          onClick={onClose}
          className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
        >
          내일 다시 이용하기
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
