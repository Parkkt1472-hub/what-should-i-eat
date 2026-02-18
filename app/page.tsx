'use client';

import { useState } from 'react';
import HomeScreen from '@/components/HomeScreen';
import DecisionFlow from '@/components/DecisionFlow';
import ResultScreen from '@/components/ResultScreen';
import UsageLimitModal from '@/components/UsageLimitModal';
import { hasReachedLimit, incrementUsage } from '@/lib/usageLimit';
import { PreferenceVector } from '@/lib/decisionEngine';

export default function Home() {
  const [screen, setScreen] = useState<'home' | 'decision' | 'result'>('home');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [decisionData, setDecisionData] = useState<any>(null);
  const [personalizedPreferences, setPersonalizedPreferences] = useState<PreferenceVector | null>(null);

  const handleStartDecision = () => {
    // Check usage limit
    if (hasReachedLimit()) {
      setShowLimitModal(true);
      return;
    }
    
    // Clear personalized preferences for random mode
    setPersonalizedPreferences(null);
    setScreen('decision');
  };

  const handleStartPersonalized = (preferences: PreferenceVector) => {
    // Check usage limit
    if (hasReachedLimit()) {
      setShowLimitModal(true);
      return;
    }
    
    // Store preferences and start decision flow
    setPersonalizedPreferences(preferences);
    setScreen('decision');
  };

  const handleDecisionComplete = (data: any) => {
    // Increment usage
    incrementUsage();
    
    // Attach personalized preferences to decision data if available
    const enrichedData = {
      ...data,
      preferences: personalizedPreferences,
    };
    
    setDecisionData(enrichedData);
    setScreen('result');
  };

  const handleBackToHome = () => {
    setScreen('home');
    setDecisionData(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {screen === 'home' && (
        <HomeScreen 
          onStartDecision={handleStartDecision}
          onStartPersonalized={handleStartPersonalized}
        />
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
