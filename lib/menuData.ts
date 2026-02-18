// MenuMeta for personalized scoring
export interface MenuMeta {
  spicy: number; // 0-3 (0=안매움, 1=약간, 2=중간, 3=매우매움)
  soup: number; // 0-2 (0=국물없음, 1=약간, 2=국물많음)
  rice: boolean; // 밥 포함 여부
  noodle: boolean; // 면 포함 여부
  meat: number; // 0-3 (0=없음, 1=조금, 2=보통, 3=많음)
  seafood: number; // 0-3
  veg: number; // 0-3 (채소 비중)
  time: number; // 0-2 (0=빠름, 1=보통, 2=오래걸림)
  budget: number; // 0-2 (0=저렴, 1=보통, 2=비쌈)
  tags?: string[]; // 추가 태그
}

export interface MenuItem {
  name: string;
  category: string;
  ingredients?: string[];
  familyFriendly: boolean;
  spicyLevel: number; // 0-3
  difficulty?: string; // 쉬움, 보통, 어려움
  meta?: MenuMeta; // personalized 추천용 메타데이터
}

export const menuDatabase: MenuItem[] = [
  // 한식 (with meta)
  { 
    name: '김치찌개', category: '한식', 
    ingredients: ['김치', '돼지고기', '두부', '대파', '양파'], 
    familyFriendly: true, spicyLevel: 2, difficulty: '쉬움',
    meta: { spicy: 2, soup: 2, rice: true, noodle: false, meat: 2, seafood: 0, veg: 1, time: 0, budget: 0, tags: ['국물', '한식', '집밥'] }
  },
  { 
    name: '된장찌개', category: '한식', 
    ingredients: ['된장', '두부', '감자', '호박', '대파'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '쉬움',
    meta: { spicy: 0, soup: 2, rice: true, noodle: false, meat: 0, seafood: 0, veg: 2, time: 0, budget: 0, tags: ['국물', '한식', '건강'] }
  },
  { 
    name: '불고기', category: '한식', 
    ingredients: ['소고기', '양파', '대파', '당근', '간장'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '보통',
    meta: { spicy: 0, soup: 0, rice: true, noodle: false, meat: 3, seafood: 0, veg: 1, time: 1, budget: 2, tags: ['고기', '한식', '특별식'] }
  },
  { 
    name: '제육볶음', category: '한식', 
    ingredients: ['돼지고기', '고추장', '양파', '대파', '마늘'], 
    familyFriendly: true, spicyLevel: 2, difficulty: '보통',
    meta: { spicy: 2, soup: 0, rice: true, noodle: false, meat: 3, seafood: 0, veg: 1, time: 1, budget: 1, tags: ['고기', '한식', '매운'] }
  },
  { 
    name: '비빔밥', category: '한식', 
    ingredients: ['밥', '시금치', '콩나물', '당근', '고추장'], 
    familyFriendly: true, spicyLevel: 1, difficulty: '쉬움',
    meta: { spicy: 1, soup: 0, rice: true, noodle: false, meat: 0, seafood: 0, veg: 3, time: 0, budget: 0, tags: ['한식', '건강', '채소'] }
  },
  { 
    name: '삼겹살', category: '한식', 
    ingredients: ['삼겹살', '상추', '마늘', '쌈장'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '쉬움',
    meta: { spicy: 0, soup: 0, rice: true, noodle: false, meat: 3, seafood: 0, veg: 1, time: 1, budget: 2, tags: ['고기', '구이', '회식'] }
  },
  { 
    name: '김치볶음밥', category: '한식', 
    ingredients: ['김치', '밥', '계란', '대파', '참기름'], 
    familyFriendly: true, spicyLevel: 2, difficulty: '쉬움',
    meta: { spicy: 2, soup: 0, rice: true, noodle: false, meat: 1, seafood: 0, veg: 1, time: 0, budget: 0, tags: ['한식', '간편', '매운'] }
  },
  { 
    name: '순두부찌개', category: '한식', 
    ingredients: ['순두부', '계란', '대파', '고춧가루'], 
    familyFriendly: true, spicyLevel: 2, difficulty: '쉬움',
    meta: { spicy: 2, soup: 2, rice: true, noodle: false, meat: 1, seafood: 1, veg: 1, time: 0, budget: 0, tags: ['국물', '한식', '얼큰'] }
  },
  { 
    name: '갈비찜', category: '한식', 
    ingredients: ['갈비', '당근', '감자', '대추', '간장'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '어려움',
    meta: { spicy: 0, soup: 1, rice: true, noodle: false, meat: 3, seafood: 0, veg: 1, time: 2, budget: 2, tags: ['고기', '특별식', '한식'] }
  },
  { 
    name: '닭갈비', category: '한식', 
    ingredients: ['닭고기', '고추장', '양배추', '고구마', '떡'], 
    familyFriendly: true, spicyLevel: 2, difficulty: '보통',
    meta: { spicy: 2, soup: 0, rice: true, noodle: false, meat: 3, seafood: 0, veg: 2, time: 1, budget: 1, tags: ['고기', '매운', '한식'] }
  },
  
  // 중식 (with meta)
  { 
    name: '짜장면', category: '중식', 
    familyFriendly: true, spicyLevel: 0,
    meta: { spicy: 0, soup: 0, rice: false, noodle: true, meat: 1, seafood: 0, veg: 1, time: 0, budget: 0, tags: ['면', '중식', '배달'] }
  },
  { 
    name: '짬뽕', category: '중식', 
    familyFriendly: true, spicyLevel: 2,
    meta: { spicy: 2, soup: 2, rice: false, noodle: true, meat: 1, seafood: 2, veg: 1, time: 0, budget: 1, tags: ['면', '국물', '매운', '중식'] }
  },
  { 
    name: '탕수육', category: '중식', 
    familyFriendly: true, spicyLevel: 0,
    meta: { spicy: 0, soup: 0, rice: true, noodle: false, meat: 3, seafood: 0, veg: 0, time: 1, budget: 2, tags: ['고기', '중식', '튀김'] }
  },
  { 
    name: '마파두부', category: '중식', 
    ingredients: ['두부', '돼지고기', '고추', '마늘', '두반장'], 
    familyFriendly: false, spicyLevel: 3, difficulty: '보통',
    meta: { spicy: 3, soup: 1, rice: true, noodle: false, meat: 2, seafood: 0, veg: 1, time: 1, budget: 1, tags: ['매운', '중식'] }
  },
  { 
    name: '볶음밥', category: '중식', 
    ingredients: ['밥', '계란', '당근', '양파', '대파'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '쉬움',
    meta: { spicy: 0, soup: 0, rice: true, noodle: false, meat: 1, seafood: 1, veg: 1, time: 0, budget: 0, tags: ['중식', '간편'] }
  },
  
  // 일식 (with meta)
  { 
    name: '초밥', category: '일식', 
    familyFriendly: true, spicyLevel: 0,
    meta: { spicy: 0, soup: 0, rice: true, noodle: false, meat: 0, seafood: 3, veg: 0, time: 1, budget: 2, tags: ['일식', '생선', '특별식'] }
  },
  { 
    name: '라멘', category: '일식', 
    familyFriendly: true, spicyLevel: 0,
    meta: { spicy: 0, soup: 2, rice: false, noodle: true, meat: 2, seafood: 0, veg: 1, time: 0, budget: 1, tags: ['면', '국물', '일식'] }
  },
  { 
    name: '돈카츠', category: '일식', 
    familyFriendly: true, spicyLevel: 0,
    meta: { spicy: 0, soup: 0, rice: true, noodle: false, meat: 3, seafood: 0, veg: 1, time: 1, budget: 1, tags: ['일식', '튀김', '고기'] }
  },
  { 
    name: '우동', category: '일식', 
    familyFriendly: true, spicyLevel: 0,
    meta: { spicy: 0, soup: 2, rice: false, noodle: true, meat: 0, seafood: 1, veg: 1, time: 0, budget: 0, tags: ['면', '국물', '일식'] }
  },
  { 
    name: '규동', category: '일식', 
    ingredients: ['소고기', '양파', '밥', '계란', '간장'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '쉬움',
    meta: { spicy: 0, soup: 1, rice: true, noodle: false, meat: 3, seafood: 0, veg: 1, time: 0, budget: 1, tags: ['일식', '고기', '덮밥'] }
  },
  { 
    name: '오야코동', category: '일식', 
    ingredients: ['닭고기', '계란', '양파', '밥', '간장'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '쉬움',
    meta: { spicy: 0, soup: 1, rice: true, noodle: false, meat: 2, seafood: 0, veg: 1, time: 0, budget: 1, tags: ['일식', '고기', '덮밥'] }
  },
  
  // 양식
  { name: '파스타', category: '양식', ingredients: ['파스타면', '토마토소스', '마늘', '올리브오일'], familyFriendly: true, spicyLevel: 0, difficulty: '보통' },
  { name: '피자', category: '양식', familyFriendly: true, spicyLevel: 0 },
  { name: '스테이크', category: '양식', ingredients: ['소고기', '소금', '후추', '마늘', '버터'], familyFriendly: true, spicyLevel: 0, difficulty: '보통' },
  { name: '햄버거', category: '양식', familyFriendly: true, spicyLevel: 0 },
  { name: '리조또', category: '양식', ingredients: ['쌀', '버섯', '치즈', '버터', '와인'], familyFriendly: true, spicyLevel: 0, difficulty: '보통' },
  
  // 분식
  { name: '떡볶이', category: '분식', ingredients: ['떡', '고추장', '어묵', '대파', '설탕'], familyFriendly: true, spicyLevel: 2, difficulty: '쉬움' },
  { name: '김밥', category: '분식', ingredients: ['김', '밥', '단무지', '당근', '시금치'], familyFriendly: true, spicyLevel: 0, difficulty: '보통' },
  { name: '라면', category: '분식', ingredients: ['라면', '계란', '대파', '김치'], familyFriendly: true, spicyLevel: 2, difficulty: '쉬움' },
  { name: '만두', category: '분식', familyFriendly: true, spicyLevel: 0 },
  
  // 기타
  { name: '샐러드', category: '건강식', ingredients: ['양상추', '토마토', '오이', '닭가슴살', '드레싱'], familyFriendly: true, spicyLevel: 0, difficulty: '쉬움' },
  { name: '샌드위치', category: '간편식', ingredients: ['식빵', '햄', '치즈', '양상추', '토마토'], familyFriendly: true, spicyLevel: 0, difficulty: '쉬움' },
  { name: '치킨', category: '패스트푸드', familyFriendly: true, spicyLevel: 1 },
];

// Default meta generator for menus without meta
export function getDefaultMeta(item: MenuItem): MenuMeta {
  return {
    spicy: item.spicyLevel || 0,
    soup: item.category === '한식' ? 1 : 0,
    rice: item.category === '한식' || item.category === '일식',
    noodle: item.name.includes('면') || item.name.includes('파스타'),
    meat: item.ingredients?.some(i => i.includes('고기') || i.includes('삼겹살') || i.includes('갈비')) ? 2 : 1,
    seafood: item.ingredients?.some(i => i.includes('생선') || i.includes('새우')) ? 2 : 0,
    veg: item.ingredients?.some(i => i.includes('야채') || i.includes('샐러드')) ? 2 : 1,
    time: 1,
    budget: 1,
    tags: [item.category]
  };
}

export const reasonTemplates = {
  solo: [
    '혼자 먹기 딱 좋은 메뉴예요',
    '간단하게 해결할 수 있어요',
    '부담 없이 즐길 수 있는 메뉴예요',
  ],
  couple: [
    '둘이 나눠 먹기 좋은 메뉴예요',
    '데이트하기 좋은 분위기의 음식이에요',
    '함께 즐기기 완벽한 선택이에요',
  ],
  family: [
    '온 가족이 함께 즐길 수 있어요',
    '아이들도 좋아하는 메뉴예요',
    '가족 식사로 제격이에요',
  ],
  friends: [
    '친구들과 함께 먹기 좋아요',
    '여럿이 나눠 먹기 완벽해요',
    '모임에 딱 맞는 메뉴예요',
  ],
};
