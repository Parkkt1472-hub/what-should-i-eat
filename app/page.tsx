'use client';

import { useState } from 'react';
import HomeScreen from '@/components/HomeScreen';
import DecisionFlow from '@/components/DecisionFlow';
import ResultScreen from '@/components/ResultScreen';
import UsageLimitModal from '@/components/UsageLimitModal';
import { hasReachedLimit, incrementUsage } from '@/lib/usageLimit';

export default function Home() {
  const [screen, setScreen] = useState<'home' | 'decision' | 'result'>('home');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [decisionData, setDecisionData] = useState<any>(null);

  const handleStartDecision = () => {
    // Check usage limit
    if (hasReachedLimit()) {
      setShowLimitModal(true);
      return;
    }
    
    setScreen('decision');
  };

  const handleDecisionComplete = (data: any) => {
    // Increment usage
    incrementUsage();
    
    setDecisionData(data);
    setScreen('result');
  };

  const handleBackToHome = () => {
    setScreen('home');
    setDecisionData(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {screen === 'home' && (
        <HomeScreen onStartDecision={handleStartDecision} />
      )}
      {screen === 'decision' && (
        <DecisionFlow onComplete={handleDecisionComplete} />
      )}
      {screen === 'result' && decisionData && (
        <ResultScreen data={decisionData} onBackToHome={handleBackToHome} />
      )}
      {showLimitModal && (
        <UsageLimitModal onClose={() => setShowLimitModal(false)} />
      )}
    </main>
  );
}
