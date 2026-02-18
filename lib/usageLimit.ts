export const DAILY_FREE_LIMIT = 100;

export function getTodayUsageKey(): string {
  const today = new Date().toDateString();
  return `usage_${today}`;
}

export function getCurrentUsage(): number {
  if (typeof window === 'undefined') return 0;
  const usageKey = getTodayUsageKey();
  return parseInt(localStorage.getItem(usageKey) || '0');
}

export function incrementUsage(): void {
  if (typeof window === 'undefined') return;
  const usageKey = getTodayUsageKey();
  const currentUsage = getCurrentUsage();
  localStorage.setItem(usageKey, (currentUsage + 1).toString());
}

export function hasReachedLimit(): boolean {
  return getCurrentUsage() >= DAILY_FREE_LIMIT;
}

export function getRemainingUsage(): number {
  return Math.max(0, DAILY_FREE_LIMIT - getCurrentUsage());
}

// Stripe integration placeholder
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'premium_monthly',
    name: '프리미엄 월간',
    price: 9900,
    currency: 'KRW',
    features: [
      '무제한 결정',
      '가족 식단 자동 생성',
      '주간 메뉴 추천',
      '개인 취향 학습',
      '알레르기 필터링',
    ],
  },
];

// Placeholder for Stripe checkout
export async function createCheckoutSession(planId: string): Promise<string> {
  // TODO: Implement Stripe checkout session creation
  // This is a placeholder for future Stripe integration
  console.log('Creating checkout session for plan:', planId);
  return '/checkout?plan=' + planId;
}
