'use client';

import { useState } from 'react';
import PersonalizedSurveyModal from './PersonalizedSurveyModal';
import { PreferenceVector } from '@/lib/decisionEngine';

interface HomeScreenProps {
  onStartDecision: () => void;
  onStartPersonalized: (preferences: PreferenceVector) => void;
}

export default function HomeScreen({ onStartDecision, onStartPersonalized }: HomeScreenProps) {
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const handleCustomRecommendation = () => {
    setShowSurveyModal(true);
  };

  const handleSurveySubmit = (preferences: PreferenceVector) => {
    setShowSurveyModal(false);
    onStartPersonalized(preferences);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="text-center space-y-8 relative z-10 max-w-2xl">
        {/* Premium header with subtle animation */}
        <div className="space-y-4 animate-fade-in">
          <div className="inline-block">
            <div className="text-7xl mb-4 animate-bounce-slow">🍽️</div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-4 leading-tight">
            오늘 뭐 먹지?
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light">
            AI가 당신의 완벽한 한 끼를 찾아드립니다
          </p>
        </div>
        
        {/* Main CTA - 무작정 추천받기 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
          <button
            onClick={onStartDecision}
            className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white text-2xl md:text-3xl font-bold py-8 px-16 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            <span className="flex items-center gap-3">
              <span className="text-3xl">🎲</span>
              <span>무작정 추천받기</span>
              <span className="text-3xl">✨</span>
            </span>
          </button>
        </div>
        
        {/* Secondary CTA - 나의 맞춤형 추천받기 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-pink-500 to-rose-400 rounded-full blur-lg opacity-60 group-hover:opacity-90 transition duration-1000 group-hover:duration-200"></div>
          <button
            onClick={handleCustomRecommendation}
            className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white text-xl md:text-2xl font-bold py-6 px-12 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <span>나의 맞춤형 추천받기</span>
            </span>
          </button>
        </div>

        {/* Info text */}
        <div className="pt-8">
          <p className="text-gray-500 text-sm">
            💡 <strong>Tip:</strong> 맞춤형 추천은 6가지 질문으로 당신에게 딱 맞는 메뉴를 찾아줘요
          </p>
        </div>

        {/* Legal disclaimer link */}
        <div className="pt-4">
          <button
            onClick={() => setShowDisclaimerModal(true)}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            법적 고지사항
          </button>
        </div>
      </div>

      {/* Survey Modal */}
      <PersonalizedSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        onSubmit={handleSurveySubmit}
      />

      {/* Legal Disclaimer Modal */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">⚖️ 법적 고지사항</h3>
            <div className="text-sm text-gray-600 space-y-3 max-h-96 overflow-y-auto">
              <p>
                <strong>1. 의료 조언 아님 (Non-Medical Advice)</strong><br />
                본 서비스는 음식 메뉴 추천을 위한 정보 제공 목적으로만 사용됩니다. 본 서비스의 추천은 의료적 진단, 치료, 또는 영양 상담을 대체하지 않으며, 특정 건강 상태나 식이 요법이 필요한 경우 반드시 전문 의료인과 상담하시기 바랍니다.
              </p>
              <p>
                <strong>2. 광고 및 후원 아님 (Non-Advertising)</strong><br />
                본 서비스에서 제공하는 메뉴 추천은 특정 음식점, 배달 서비스, 또는 식품 브랜드의 광고나 후원을 받지 않습니다. 추천 결과는 사용자가 입력한 선호도와 컨텍스트를 기반으로 생성되며, 어떠한 상업적 이익과도 무관합니다.
              </p>
              <p>
                <strong>3. 알레르기 및 식이 제한 (Allergy & Dietary Restrictions)</strong><br />
                본 서비스는 알레르기 정보나 특수 식이 제한사항을 완전히 고려하지 않습니다. 음식 알레르기가 있거나 특정 식이 요법을 따르는 경우, 반드시 메뉴를 주문하거나 조리하기 전에 재료를 확인하시기 바랍니다.
              </p>
              <p>
                <strong>4. 책임의 제한 (Limitation of Liability)</strong><br />
                본 서비스의 추천 결과를 사용함으로써 발생하는 어떠한 건강상, 재정적, 또는 기타 손해에 대해 서비스 제공자는 법적 책임을 지지 않습니다. 사용자는 자신의 판단과 책임 하에 본 서비스를 이용해야 합니다.
              </p>
              <p>
                <strong>5. 정보의 정확성 (Information Accuracy)</strong><br />
                본 서비스는 메뉴, 레시피, 재료 정보의 정확성을 보장하지 않으며, 정보는 예고 없이 변경될 수 있습니다. 사용자는 최종 결정을 내리기 전에 독립적으로 정보를 확인할 책임이 있습니다.
              </p>
              <p>
                <strong>6. 제3자 링크 (Third-Party Links)</strong><br />
                본 서비스는 배달 플랫폼, 레시피 사이트, 쇼핑 사이트 등 외부 서비스로의 링크를 제공할 수 있습니다. 이러한 외부 사이트의 내용, 정책, 또는 관행에 대해 서비스 제공자는 책임을 지지 않습니다.
              </p>
              <p className="text-xs text-gray-500 pt-2">
                본 서비스를 계속 이용하시면 위 고지사항에 동의하는 것으로 간주됩니다.
              </p>
            </div>
            <button
              onClick={() => setShowDisclaimerModal(false)}
              className="mt-6 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold hover:shadow-lg transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
