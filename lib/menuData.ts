/**
 * MenuMeta: 개인화 추천을 위한 메뉴 메타데이터
 * 
 * 분류 기준 문서화:
 * 
 * spicy: 매운맛 정도 (0-3)
 *   0 = 안매움 (된장찌개, 불고기, 돈카츠 등)
 *   1 = 약간 매움 (비빔밥, 치킨 등)
 *   2 = 중간 매움 (김치찌개, 제육볶음, 떡볶이, 짬뽕 등)
 *   3 = 매우 매움 (마파두부 등)
 * 
 * soup: 국물 정도 (0-2)
 *   0 = 국물 없음 (불고기, 제육볶음, 샐러드 등)
 *   1 = 국물 약간 (갈비찜, 리조또, 떡볶이 등)
 *   2 = 국물 많음 (김치찌개, 순두부찌개, 짬뽕, 라면 등)
 * 
 * rice: 밥 포함 여부
 *   true = 밥과 함께 먹거나 밥이 포함됨 (한식, 일식 덮밥, 볶음밥, 김밥, 리조또 등)
 *   false = 밥 없음 (면 요리, 빵, 샐러드 등)
 * 
 * noodle: 면 포함 여부
 *   true = 면 요리 (짜장면, 짬뽕, 우동, 라멘, 파스타, 라면 등)
 *   false = 면 없음
 * 
 * meat: 고기 비중 (0-3)
 *   0 = 고기 없음 (된장찌개, 비빔밥, 샐러드 등)
 *   1 = 고기 조금 (짜장면, 파스타, 샌드위치 등)
 *   2 = 고기 보통 (마파두부, 피자, 만두, 오야코동 등)
 *   3 = 고기 많음 (불고기, 제육볶음, 삼겹살, 탕수육, 스테이크, 치킨 등)
 * 
 * seafood: 해산물 비중 (0-3)
 *   0 = 해산물 없음 (불고기, 제육볶음, 치킨 등)
 *   1 = 해산물 조금 (순두부찌개, 볶음밥, 떡볶이 등)
 *   2 = 해산물 보통 (짬뽕 등)
 *   3 = 해산물 많음 (초밥 등)
 * 
 * veg: 채소 비중 (0-3)
 *   0 = 채소 거의 없음 (치킨, 초밥 등)
 *   1 = 채소 조금 (김치찌개, 삼겹살, 햄버거 등)
 *   2 = 채소 보통 (닭갈비, 파스타, 리조또 등)
 *   3 = 채소 많음 (비빔밥, 샐러드 등)
 * 
 * time: 조리/대기 시간 (0-2)
 *   0 = 빠름 (<15분: 김치찌개, 라면, 샌드위치, 햄버거 등)
 *   1 = 보통 (15-30분: 제육볶음, 파스타, 돈카츠 등)
 *   2 = 오래걸림 (>30분: 갈비찜, 스테이크 등)
 * 
 * budget: 가격대 (0-2)
 *   0 = 저렴 (<10,000원: 김치찌개, 라면, 김밥, 샌드위치 등)
 *   1 = 보통 (10,000-20,000원: 짬뽕, 돈카츠, 파스타, 햄버거 등)
 *   2 = 비쌈 (>20,000원: 불고기, 삼겹살, 탕수육, 초밥, 피자, 스테이크, 치킨 등)
 * 
 * tags: 추가 분류 태그
 *   예: ['한식', '국물', '매운', '고기', '튀김', '배달', '건강', '간편' 등]
 */
export interface MenuMeta {
  spicy: number; // 0-3
  soup: number; // 0-2
  rice: boolean;
  noodle: boolean;
  meat: number; // 0-3
  seafood: number; // 0-3
  veg: number; // 0-3
  time: number; // 0-2
  budget: number; // 0-2
  tags?: string[];
}

// 새로운 menuDatabase import
import { menuDatabase as newMenuDatabase, MenuItem as NewMenuItem, EXOTIC_KEYWORDS } from './menuDatabase';

// 기존 인터페이스 유지 (호환성)
export interface MenuItem {
  name: string;
  category: string;
  ingredients?: string[];
  familyFriendly: boolean;
  spicyLevel: number; // 0-3
  difficulty?: string; // 쉬움, 보통, 어려움
  meta?: MenuMeta; // personalized 추천용 메타데이터
  image?: string; // 이미지 경로
  quickRecipes?: string[]; // 만들어먹기 전용 한 줄 레시피
}

// 새 DB를 기존 형식으로 변환
function convertToLegacyFormat(newMenu: NewMenuItem): MenuItem {
  return {
    name: newMenu.name,
    category: newMenu.category,
    familyFriendly: true, // 기본값
    spicyLevel: newMenu.spicy ? 2 : 0,
    ingredients: newMenu.ingredients,
    difficulty: '보통',
    meta: undefined, // 필요시 나중에 추가
    image: newMenu.image // 이미지 경로 추가
  };
}

// 기존 코드 호환성을 위한 기본 데이터 (아래에서 상세 메뉴와 병합 후 export)
const baseMenuDatabase: MenuItem[] = newMenuDatabase.map(convertToLegacyFormat);

// 이색 키워드도 export
export { EXOTIC_KEYWORDS };

// 기존 상세 메뉴 데이터 (meta 정보가 있는 메뉴들)
const detailedMenus: MenuItem[] = [
  // 한식 (with meta) - 상세 정보가 필요한 메뉴들만 여기 유지
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
    image: '/menus/kimchi-bokkeumbap.jpg',
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
  
  // 양식 (with meta)
  { 
    name: '파스타', category: '양식', 
    ingredients: ['파스타면', '토마토소스', '마늘', '올리브오일'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '보통',
    meta: { spicy: 0, soup: 0, rice: false, noodle: true, meat: 1, seafood: 0, veg: 2, time: 1, budget: 1, tags: ['양식', '면', '이탈리안'] }
  },
  { 
    name: '피자', category: '양식', 
    familyFriendly: true, spicyLevel: 0,
    meta: { spicy: 0, soup: 0, rice: false, noodle: false, meat: 2, seafood: 0, veg: 1, time: 1, budget: 2, tags: ['양식', '이탈리안', '배달'] }
  },
  { 
    name: '스테이크', category: '양식', 
    ingredients: ['소고기', '소금', '후추', '마늘', '버터'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '보통',
    meta: { spicy: 0, soup: 0, rice: false, noodle: false, meat: 3, seafood: 0, veg: 1, time: 1, budget: 2, tags: ['양식', '고기', '특별식'] }
  },
  { 
    name: '햄버거', category: '양식', 
    familyFriendly: true, spicyLevel: 0,
    meta: { spicy: 0, soup: 0, rice: false, noodle: false, meat: 2, seafood: 0, veg: 1, time: 0, budget: 1, tags: ['양식', '패스트푸드', '간편'] }
  },
  { 
    name: '리조또', category: '양식', 
    ingredients: ['쌀', '버섯', '치즈', '버터', '와인'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '보통',
    meta: { spicy: 0, soup: 1, rice: true, noodle: false, meat: 1, seafood: 1, veg: 2, time: 1, budget: 2, tags: ['양식', '이탈리안', '크리미'] }
  },
  
  // 분식 (with meta)
  { 
    name: '떡볶이', category: '분식', 
    ingredients: ['떡', '고추장', '어묵', '대파', '설탕'], 
    familyFriendly: true, spicyLevel: 2, difficulty: '쉬움',
    meta: { spicy: 2, soup: 1, rice: false, noodle: false, meat: 0, seafood: 1, veg: 1, time: 0, budget: 0, tags: ['분식', '매운', '간식'] }
  },
  { 
    name: '김밥', category: '분식', 
    ingredients: ['김', '밥', '단무지', '당근', '시금치'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '보통',
    meta: { spicy: 0, soup: 0, rice: true, noodle: false, meat: 1, seafood: 0, veg: 2, time: 1, budget: 0, tags: ['분식', '간편', '도시락'] }
  },
  { 
    name: '라면', category: '분식', 
    ingredients: ['라면', '계란', '대파', '김치'], 
    familyFriendly: true, spicyLevel: 2, difficulty: '쉬움',
    meta: { spicy: 2, soup: 2, rice: false, noodle: true, meat: 0, seafood: 0, veg: 1, time: 0, budget: 0, tags: ['분식', '면', '국물', '간편'] }
  },
  { 
    name: '만두', category: '분식', 
    familyFriendly: true, spicyLevel: 0,
    meta: { spicy: 0, soup: 1, rice: false, noodle: false, meat: 2, seafood: 0, veg: 1, time: 0, budget: 0, tags: ['분식', '간편', '찜'] }
  },
  
  // 기타 (with meta)
  { 
    name: '샐러드', category: '건강식', 
    ingredients: ['양상추', '토마토', '오이', '닭가슴살', '드레싱'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '쉬움',
    meta: { spicy: 0, soup: 0, rice: false, noodle: false, meat: 1, seafood: 0, veg: 3, time: 0, budget: 1, tags: ['건강식', '채소', '다이어트'] }
  },
  { 
    name: '샌드위치', category: '간편식', 
    ingredients: ['식빵', '햄', '치즈', '양상추', '토마토'], 
    familyFriendly: true, spicyLevel: 0, difficulty: '쉬움',
    meta: { spicy: 0, soup: 0, rice: false, noodle: false, meat: 1, seafood: 0, veg: 1, time: 0, budget: 0, tags: ['간편식', '아침', '브런치'] }
  },
  { 
    name: '치킨', category: '패스트푸드', 
    familyFriendly: true, spicyLevel: 1,
    meta: { spicy: 1, soup: 0, rice: false, noodle: false, meat: 3, seafood: 0, veg: 0, time: 0, budget: 2, tags: ['패스트푸드', '튀김', '배달', '파티'] }
  },
  
  // 🍳 만들어먹기 (5분컷 초간단 집냉장고 요리) - 20개
  {
    name: '참치마요덮밥', category: '만들어먹기',
    ingredients: ['참치캔', '마요네즈', '김가루', '밥'],
    familyFriendly: true, spicyLevel: 0, difficulty: '초간단',
    meta: { spicy: 0, soup: 0, rice: true, noodle: false, meat: 0, seafood: 2, veg: 0, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '밥에 참치+마요+김가루 비비면 끝',
      '참치 기름 빼고 마요 섞어서 밥에 올리기',
      '참치캔 하나면 든든한 한 끼 완성'
    ]
  },
  {
    name: '김치계란덮밥', category: '만들어먹기',
    ingredients: ['김치', '계란', '밥', '참기름'],
    familyFriendly: true, spicyLevel: 1, difficulty: '초간단',
    meta: { spicy: 1, soup: 0, rice: true, noodle: false, meat: 0, seafood: 0, veg: 1, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '김치 볶고 계란 올리면 완성',
      '프라이팬에 김치+계란 후라이 얹기',
      '김치 썰어 볶다가 계란 풀어넣기'
    ]
  },
  {
    name: '간장계란밥', category: '만들어먹기',
    ingredients: ['계란', '간장', '밥', '참기름'],
    familyFriendly: true, spicyLevel: 0, difficulty: '초간단',
    meta: { spicy: 0, soup: 0, rice: true, noodle: false, meat: 0, seafood: 0, veg: 0, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '계란 프라이 + 간장 한 스푼',
      '밥에 계란 얹고 간장 둘러주기',
      '반숙 계란 터뜨려 간장에 비비기'
    ]
  },
  {
    name: '버터간장밥', category: '만들어먹기',
    ingredients: ['버터', '간장', '밥', '김가루'],
    familyFriendly: true, spicyLevel: 0, difficulty: '초간단',
    meta: { spicy: 0, soup: 0, rice: true, noodle: false, meat: 0, seafood: 0, veg: 0, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '뜨거운 밥에 버터+간장 넣고 비비기',
      '버터 녹이고 간장 섞어서 밥 볶기',
      '밥에 버터 올리고 간장 둘러 비빔'
    ]
  },
  {
    name: '카레라이스(즉석카레)', category: '만들어먹기',
    ingredients: ['즉석카레', '밥'],
    familyFriendly: true, spicyLevel: 1, difficulty: '초간단',
    meta: { spicy: 1, soup: 1, rice: true, noodle: false, meat: 1, seafood: 0, veg: 1, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '즉석카레 데워서 밥에 부으면 끝',
      '레토르트 카레 3분이면 한 끼 완성',
      '전자레인지 2분 + 밥 = 카레라이스'
    ]
  },
  {
    name: '고추장참치비빔밥', category: '만들어먹기',
    ingredients: ['참치캔', '고추장', '밥', '김가루', '참기름'],
    familyFriendly: true, spicyLevel: 2, difficulty: '초간단',
    meta: { spicy: 2, soup: 0, rice: true, noodle: false, meat: 0, seafood: 2, veg: 0, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '참치+고추장+참기름 비비면 완성',
      '밥에 참치 올리고 고추장 한 스푼',
      '매콤한 참치비빔밥 5분 완성'
    ]
  },
  {
    name: '소세지야채볶음밥', category: '만들어먹기',
    ingredients: ['소세지', '냉동야채', '밥', '간장'],
    familyFriendly: true, spicyLevel: 0, difficulty: '초간단',
    meta: { spicy: 0, soup: 0, rice: true, noodle: false, meat: 2, seafood: 0, veg: 2, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '소세지 썰어 볶다가 밥 넣기',
      '냉동야채+소세지 볶고 간장 한 스푼',
      '한 팬에 재료 다 넣고 볶으면 끝'
    ]
  },
  {
    name: '베이컨김치볶음밥', category: '만들어먹기',
    ingredients: ['베이컨', '김치', '밥', '참기름'],
    familyFriendly: true, spicyLevel: 1, difficulty: '초간단',
    meta: { spicy: 1, soup: 0, rice: true, noodle: false, meat: 2, seafood: 0, veg: 1, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '베이컨+김치 볶다가 밥 넣기',
      '기름 필요없이 베이컨에서 나온 기름으로',
      '한 팬 볶음밥 5분 완성'
    ]
  },
  {
    name: '라면계란볶이', category: '만들어먹기',
    ingredients: ['라면', '계란', '대파', '스프'],
    familyFriendly: true, spicyLevel: 1, difficulty: '초간단',
    meta: { spicy: 1, soup: 0, rice: false, noodle: true, meat: 0, seafood: 0, veg: 0, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '라면 삶아서 물 버리고 스프에 볶기',
      '계란 풀어넣고 볶으면 고소한 맛',
      '물 조금만 남기고 볶으면 쫄깃'
    ]
  },
  {
    name: '비빔라면 + 계란후라이', category: '만들어먹기',
    ingredients: ['라면', '계란', '스프', '참기름'],
    familyFriendly: true, spicyLevel: 2, difficulty: '초간단',
    meta: { spicy: 2, soup: 0, rice: false, noodle: true, meat: 0, seafood: 0, veg: 0, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '라면 삶아 물 버리고 스프 비비기',
      '계란 후라이 올리면 비주얼까지',
      '매콤한 비빔라면 3분 완성'
    ]
  },
  {
    name: '참치라면', category: '만들어먹기',
    ingredients: ['라면', '참치캔', '대파', '스프'],
    familyFriendly: true, spicyLevel: 1, difficulty: '초간단',
    meta: { spicy: 1, soup: 2, rice: false, noodle: true, meat: 0, seafood: 2, veg: 0, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '라면 끓일 때 참치 넣으면 끝',
      '참치 기름이 국물에 고소함 추가',
      '참치캔 하나로 라면 업그레이드'
    ]
  },
  {
    name: '우동면 간장볶음', category: '만들어먹기',
    ingredients: ['우동면', '간장', '야채', '참기름'],
    familyFriendly: true, spicyLevel: 0, difficulty: '초간단',
    meta: { spicy: 0, soup: 0, rice: false, noodle: true, meat: 0, seafood: 0, veg: 2, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '우동면 삶아서 간장에 볶기',
      '야채 있으면 같이 볶으면 더 맛있어',
      '참기름 둘러 고소하게 마무리'
    ]
  },
  {
    name: '치즈토스트', category: '만들어먹기',
    ingredients: ['식빵', '치즈', '버터'],
    familyFriendly: true, spicyLevel: 0, difficulty: '초간단',
    meta: { spicy: 0, soup: 0, rice: false, noodle: false, meat: 0, seafood: 0, veg: 0, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '식빵에 치즈 넣고 토스트기에',
      '버터 발라 팬에 구우면 더 고소',
      '치즈 녹으면 완성, 3분 완성'
    ]
  },
  {
    name: '햄치즈롤(식빵말이)', category: '만들어먹기',
    ingredients: ['식빵', '햄', '치즈'],
    familyFriendly: true, spicyLevel: 0, difficulty: '초간단',
    meta: { spicy: 0, soup: 0, rice: false, noodle: false, meat: 1, seafood: 0, veg: 0, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '식빵에 햄+치즈 넣고 말아서 팬에',
      '돌돌 말아 이쑤시개로 고정',
      '노릇노릇 구우면 간식 완성'
    ]
  },
  {
    name: '계란마요토스트', category: '만들어먹기',
    ingredients: ['식빵', '계란', '마요네즈'],
    familyFriendly: true, spicyLevel: 0, difficulty: '초간단',
    meta: { spicy: 0, soup: 0, rice: false, noodle: false, meat: 0, seafood: 0, veg: 0, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '계란 삶아서 으깨고 마요 섞기',
      '식빵에 발라서 구우면 끝',
      '에그마요 샌드위치 5분 완성'
    ]
  },
  {
    name: '프렌치토스트', category: '만들어먹기',
    ingredients: ['식빵', '계란', '우유', '설탕'],
    familyFriendly: true, spicyLevel: 0, difficulty: '초간단',
    meta: { spicy: 0, soup: 0, rice: false, noodle: false, meat: 0, seafood: 0, veg: 0, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '계란+우유 섞어 식빵 적셔 굽기',
      '달콤한 브런치 5분 완성',
      '설탕 뿌려 캐러멜라이즈까지'
    ]
  },
  {
    name: '두부부침', category: '만들어먹기',
    ingredients: ['두부', '간장', '참기름', '대파'],
    familyFriendly: true, spicyLevel: 0, difficulty: '초간단',
    meta: { spicy: 0, soup: 0, rice: false, noodle: false, meat: 0, seafood: 0, veg: 1, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '두부 썰어 팬에 노릇하게 굽기',
      '간장 양념장 찍어먹으면 꿀맛',
      '단백질 가득 건강한 한 끼'
    ]
  },
  {
    name: '김치두부', category: '만들어먹기',
    ingredients: ['두부', '김치', '참기름', '대파'],
    familyFriendly: true, spicyLevel: 1, difficulty: '초간단',
    meta: { spicy: 1, soup: 0, rice: false, noodle: false, meat: 0, seafood: 0, veg: 2, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '두부 썰어 김치랑 같이 볶기',
      '참기름 둘러 고소하게 마무리',
      '매콤한 김치두부 5분 완성'
    ]
  },
  {
    name: '참치김치찌개', category: '만들어먹기',
    ingredients: ['참치캔', '김치', '두부', '대파'],
    familyFriendly: true, spicyLevel: 2, difficulty: '초간단',
    meta: { spicy: 2, soup: 2, rice: true, noodle: false, meat: 0, seafood: 2, veg: 1, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '김치+참치+물 끓이면 끝',
      '참치 기름이 국물을 감칠맛나게',
      '두부 넣고 5분이면 찌개 완성'
    ]
  },
  {
    name: '계란말이', category: '만들어먹기',
    ingredients: ['계란', '대파', '소금', '참기름'],
    familyFriendly: true, spicyLevel: 0, difficulty: '초간단',
    meta: { spicy: 0, soup: 0, rice: false, noodle: false, meat: 0, seafood: 0, veg: 0, time: 0, budget: 0, tags: ['5분컷', '냉장고', '간단'] },
    quickRecipes: [
      '계란 풀어 팬에 부어 말기',
      '대파 다져 넣으면 향긋',
      '단백질 폭탄 반찬 5분 완성'
    ]
  },
];

const detailedMenuMap = new Map(detailedMenus.map((menu) => [menu.name, menu]));
const baseMenuNameSet = new Set(baseMenuDatabase.map((menu) => menu.name));
const excludedDetailedMenus = detailedMenus
  .filter((menu) => !baseMenuNameSet.has(menu.name))
  .map((menu) => menu.name);

if (excludedDetailedMenus.length > 0) {
  console.info('[menuData] Excluded detailedMenus not present in baseMenuDatabase:', excludedDetailedMenus);
}

// 상세 메뉴는 baseMenuDatabase에 존재하는 항목만 보강
export const menuDatabase: MenuItem[] = baseMenuDatabase.map(
  (menu) => detailedMenuMap.get(menu.name) ?? menu
);

// Default meta generator for menus without meta
export function getDefaultMeta(item: MenuItem): MenuMeta {
  const menuName = item.name.toLowerCase();
  const ingredientsText = (item.ingredients || []).join(' ').toLowerCase();
  const fullText = `${menuName} ${ingredientsText}`;
  
  // 국물 메뉴 판단 (국, 탕, 찌개, 전골, 죽, 국수 등)
  const isSoup = /국|탕|찌개|전골|죽|라면|우동|칼국수/.test(menuName);
  
  // 해산물 판단 - 메뉴 이름과 재료 모두에서 체크
  const seafoodKeywords = ['꼬막', '전복', '장어', '오징어', '새우', '생선', '문어', '낙지', '조개', '굴', '게', '대게', '도다리', '매생이', '명란', '연어', '참치', '광어', '우럭', '숭어'];
  const hasSeafood = seafoodKeywords.some(kw => fullText.includes(kw));
  
  // 고기 판단 - 메뉴 이름과 재료 모두에서 체크
  const meatKeywords = ['고기', '삼겹살', '갈비', '불고기', '제육', '소고기', '돼지고기', '닭', '양고기', '육회', '스테이크', '치킨'];
  const hasMeat = meatKeywords.some(kw => fullText.includes(kw));
  
  // 채소 판단
  const vegKeywords = ['야채', '샐러드', '비빔', '나물', '시금치', '콩나물'];
  const hasVeg = vegKeywords.some(kw => fullText.includes(kw));
  
  return {
    spicy: item.spicyLevel || 0,
    soup: isSoup ? 2 : 0,
    rice: item.category === '한식' || item.category === '일식' || /밥|덮밥|비빔/.test(menuName),
    noodle: /면|파스타|우동|라면|국수/.test(menuName),
    meat: hasMeat ? 2 : 0,
    seafood: hasSeafood ? 2 : 0,
    veg: hasVeg ? 2 : 1,
    time: 1,
    budget: 1,
    tags: [item.category]
  };
}

export const reasonTemplates = {
  solo: [
    '혼밥러의 최애 메뉴 등장!',
    '혼자 먹어도 전혀 외롭지 않은 선택',
    '치고 빠지기 딱 좋은 메뉴',
    '나만의 시간, 이 메뉴로 완성',
    '혼자만의 꿀조합 타임!',
    '오늘 나에게 주는 힐링 한 끼',
    '혼밥 마스터의 선택은 역시 이거지',
    '조용히 즐기는 나만의 행복',
    '혼자 먹는 게 제일 맛있는 메뉴',
    '나를 위한 완벽한 저녁',
    '오늘은 이걸로 셀프 위로 타임!',
    'Me time 완성하는 한 끼',
    '혼밥의 정석, 바로 이거!',
    '나 혼자 산다 출연진도 먹을 메뉴',
    '혼자라서 더 맛있는 이 기분',
  ],
  couple: [
    '연인이랑 먹으면 분위기 100배',
    '둘이 먹다 하나 죽어도 모를 맛',
    '데이트 코스 완성하는 메뉴',
    '커플의 취향 저격 메뉴',
    '같이 먹으면 더 맛있는 마법',
    '오늘 이거 먹고 사랑이 더 깊어짐',
    '썸 타는 두 사람에게 딱인 메뉴',
    '같이 먹으면 대화가 끊이지 않는 선택',
    '연인과 함께라면 무조건 성공',
    '이거 먹고 사진 찍으면 인스타 대박',
    '로맨틱 저녁의 완성',
    '커플 밥약의 정답은 바로 이거',
    '먹방 데이트 성공 보장 메뉴',
    '둘이서 나눠 먹기 딱 좋은 양',
    '오늘 저녁은 이걸로 분위기 UP!',
  ],
  family: [
    '온 가족 만족도 MAX 메뉴',
    '세대 불문 사랑받는 국민 메뉴',
    '가족 식탁의 평화를 지키는 선택',
    '아이들 입맛도 저격하는 메뉴',
    '가족 모두가 웃는 식탁 완성',
    '할머니부터 손주까지 다 좋아하는 메뉴',
    '가족 저녁 메뉴 고민 끝!',
    '아빠도 엄마도 아이들도 만족',
    '온 가족이 둘러앉아 먹기 딱',
    '가족 외식 단골 메뉴 등극',
    '집안 분위기 화기애애해지는 선택',
    '아이들 "야호!" 소리 나오는 메뉴',
    '세대 갈등 해결하는 마법의 한 끼',
    '가족 회식의 정석',
    '명절 분위기 나는 든든한 식사',
  ],
  friends: [
    '친구들이랑 같이 먹으면 꿀맛',
    '모임 분위기 UP 시키는 메뉴',
    '여럿이 먹어야 제맛인 선택',
    '친구들과 나누는 행복한 한 끼',
    '다같이 먹으면 2배로 맛있어짐',
    '친구들이 "오 이거 완전 대박!" 할 메뉴',
    '회식 메뉴로 완벽한 선택',
    '여럿이 나눠 먹으면 행복지수 상승',
    '술 한잔 곁들이면 금상첨화',
    '친구들 입맛 저격하는 선택',
    '모두가 만족하는 회식의 정석',
    '같이 먹으면서 수다 떨기 딱',
    '친구들 "여기 맛집이네!" 보장 메뉴',
    '단체 회식 성공의 지름길',
    '다 같이 먹고 웃으면 끝',
  ],
};
