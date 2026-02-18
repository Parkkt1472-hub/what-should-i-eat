import { menuDatabase, reasonTemplates, MenuItem } from './menuData';

type WhoType = '나 혼자' | '커플' | '가족' | '친구';
type HowType = '만들어 먹기' | '배달' | '외식';
type OutdoorType = '근처 간단 외식' | '가까운 시내' | '기분전환 야외';

interface DecisionInput {
  who: WhoType;
  how: HowType;
  outdoor: OutdoorType | null;
  excludeMenu?: string;
}

interface DecisionResult {
  menu: string;
  reason: string;
  ingredients?: string[];
  actions: {
    type: 'recipe' | 'youtube' | 'shopping' | 'delivery' | 'restaurant';
    label: string;
    url: string;
  }[];
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function filterMenuByContext(who: WhoType): MenuItem[] {
  let filtered = [...menuDatabase];
  
  // 가족 모드: 매운 음식 제외
  if (who === '가족') {
    filtered = filtered.filter(item => item.familyFriendly && item.spicyLevel <= 1);
  }
  
  return filtered;
}

function generateReason(who: WhoType, menu: MenuItem): string {
  const whoKey = {
    '나 혼자': 'solo',
    '커플': 'couple',
    '가족': 'family',
    '친구': 'friends',
  }[who] as keyof typeof reasonTemplates;
  
  const templates = reasonTemplates[whoKey];
  return getRandomItem(templates);
}

export function makeDecision(input: DecisionInput): DecisionResult {
  const { who, how, outdoor, excludeMenu } = input;
  
  // Filter menu based on context
  let availableMenus = filterMenuByContext(who);
  
  // Exclude previous menu if provided (with retry logic)
  if (excludeMenu) {
    const filteredMenus = availableMenus.filter(item => item.name !== excludeMenu);
    if (filteredMenus.length > 0) {
      availableMenus = filteredMenus;
    }
  }
  
  const selectedMenu = getRandomItem(availableMenus);
  const reason = generateReason(who, selectedMenu);
  
  const result: DecisionResult = {
    menu: selectedMenu.name,
    reason,
    actions: [],
  };
  
  // Generate actions based on "how"
  if (how === '만들어 먹기') {
    result.ingredients = selectedMenu.ingredients || [];
    
    result.actions = [
      {
        type: 'recipe',
        label: '레시피 보기',
        url: `https://www.google.com/search?q=${encodeURIComponent(selectedMenu.name + ' 레시피')}`,
      },
      {
        type: 'youtube',
        label: '유튜브로 배우기',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMenu.name + ' 레시피')}`,
      },
    ];
    
    if (selectedMenu.ingredients && selectedMenu.ingredients.length > 0) {
      const ingredientQuery = selectedMenu.ingredients.join(' ');
      result.actions.push({
        type: 'shopping',
        label: '토스쇼핑에서 재료 구매',
        url: `https://toss.im/shopping/search?q=${encodeURIComponent(ingredientQuery)}`,
      });
    }
  } else if (how === '배달') {
    result.actions = [
      {
        type: 'delivery',
        label: '🛵 배민에서 보기',
        url: `https://search.naver.com/search.naver?query=${encodeURIComponent('배민 ' + selectedMenu.name + ' 주문')}`,
      },
      {
        type: 'delivery',
        label: '🛵 쿠팡이츠에서 보기',
        url: `https://search.naver.com/search.naver?query=${encodeURIComponent('쿠팡이츠 ' + selectedMenu.name + ' 주문')}`,
      },
      {
        type: 'delivery',
        label: '🗺️ 네이버지도에서 보기',
        url: `https://map.naver.com/v5/search/${encodeURIComponent(selectedMenu.name)}`,
      },
    ];
  } else if (how === '외식') {
    let searchQuery = '';
    
    if (outdoor === '근처 간단 외식') {
      searchQuery = `${selectedMenu.name} 맛집`;
    } else if (outdoor === '가까운 시내') {
      searchQuery = `맛집`;
    } else if (outdoor === '기분전환 야외') {
      searchQuery = `전망 좋은 식당`;
    }
    
    result.actions = [
      {
        type: 'restaurant',
        label: '🗺️ 네이버지도에서 식당 찾기',
        url: `https://map.naver.com/v5/search/${encodeURIComponent(searchQuery)}`,
      },
    ];
  }
  
  return result;
}
