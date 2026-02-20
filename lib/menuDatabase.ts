/**
 * 확장된 메뉴 데이터베이스
 * - 100개 이상의 한국 대표 메뉴
 * - 묶기 규칙 적용 (떡볶이/치킨/피자/파스타 등 단일화)
 * - 제외 규칙 적용 (술안주/커피/디저트/동남아/인도 등 제외)
 */

export interface MenuItem {
  id: string;               // 영문 소문자 + 하이픈 (예: kimchi-jjigae)
  name: string;             // 한글 메뉴명
  category: '한식' | '중식' | '일식' | '분식' | '치킨' | '양식' | '패스트푸드' | '아시안';
  spicy: boolean;           // 매운지 여부
  alcoholFriendly: boolean; // 술과 잘 어울리는지
  image: string;            // 이미지 경로
  // 기존 호환성을 위한 추가 필드
  ingredients?: string[];
  familyFriendly?: boolean;
  spicyLevel?: number;
  difficulty?: string;
  meta?: any;
}

export const menuDatabase: MenuItem[] = [
  // ===== 한식 (70개) =====
  
  // 찌개/국물류 (20개)
  { id: 'kimchi-jjigae', name: '김치찌개', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/kimchi-jjigae.jpg' },
  { id: 'doenjang-jjigae', name: '된장찌개', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/doenjang-jjigae.jpg' },
  { id: 'sundubu-jjigae', name: '순두부찌개', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/sundubu-jjigae.jpg' },
  { id: 'budae-jjigae', name: '부대찌개', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/budae-jjigae.jpg' },
  { id: 'dakdoritang', name: '닭도리탕', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/dakdoritang.jpg' },
  { id: 'gamjatang', name: '감자탕', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/gamjatang.jpg' },
  { id: 'ppyeo-haejangguk', name: '뼈해장국', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/ppyeo-haejangguk.jpg' },
  { id: 'haejangguk', name: '해장국', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/haejangguk.jpg' },
  { id: 'galbitang', name: '갈비탕', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/galbitang.jpg' },
  { id: 'seolleongtang', name: '설렁탕', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/seolleongtang.jpg' },
  { id: 'gomtang', name: '곰탕', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/gomtang.jpg' },
  { id: 'samgyetang', name: '삼계탕', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/samgyetang.jpg' },
  { id: 'gopchang-jeongol', name: '곱창전골', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/gopchang-jeongol.jpg' },
  { id: 'sundae-jeongol', name: '순대전골', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/sundae-jeongol.jpg' },
  { id: 'doejigukbap', name: '돼지국밥', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/doejigukbap.jpg' },
  { id: 'sundae-gukbap', name: '순대국밥', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/sundae-gukbap.jpg' },
  { id: 'kongnamul-gukbap', name: '콩나물국밥', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/kongnamul-gukbap.jpg' },
  { id: 'gul-gukbap', name: '굴국밥', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/gul-gukbap.jpg' },
  { id: 'chueotang', name: '추어탕', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/chueotang.jpg' },
  { id: 'yukgaejang', name: '육개장', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/yukgaejang.jpg' },
  
  // 찜/전골류 (5개)
  { id: 'jjimdak', name: '찜닭', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/jjimdak.jpg' },
  { id: 'haemul-jjim', name: '해물찜', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/haemul-jjim.jpg' },
  { id: 'agu-jjim', name: '아구찜', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/agu-jjim.jpg' },
  { id: 'dak-hanmari', name: '닭한마리', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/dak-hanmari.jpg' },
  { id: 'galbi-jjim', name: '갈비찜', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/galbi-jjim.jpg' },
  
  // 면/칼국수류 (8개)
  { id: 'kalguksu', name: '칼국수', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/kalguksu.jpg' },
  { id: 'haemul-kalguksu', name: '해물칼국수', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/haemul-kalguksu.jpg' },
  { id: 'janchi-guksu', name: '잔치국수', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/janchi-guksu.jpg' },
  { id: 'manduguk', name: '만두국', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/manduguk.jpg' },
  { id: 'naengmyeon', name: '냉면', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/naengmyeon.jpg' },
  { id: 'bibim-naengmyeon', name: '비빔냉면', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/bibim-naengmyeon.jpg' },
  { id: 'mulhoe', name: '물회', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/mulhoe.jpg' },
  { id: 'milmyeon', name: '밀면', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/milmyeon.jpg' },
  
  // 구이/볶음류 (12개)
  { id: 'samgyeopsal', name: '삼겹살', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/samgyeopsal.jpg' },
  { id: 'galbi-gui', name: '갈비구이', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/galbi-gui.jpg' },
  { id: 'bulgogi', name: '불고기', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/bulgogi.jpg' },
  { id: 'bossam', name: '보쌈', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/bossam.jpg' },
  { id: 'jeyuk-bokkeum', name: '제육볶음', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/jeyuk-bokkeum.jpg' },
  { id: 'ojingeo-bokkeum', name: '오징어볶음', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/ojingeo-bokkeum.jpg' },
  { id: 'nakji-bokkeum', name: '낙지볶음', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/nakji-bokkeum.jpg' },
  { id: 'dakgalbi', name: '닭갈비', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/dakgalbi.jpg' },
  { id: 'galchijorim', name: '갈치조림', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/galchijorim.jpg' },
  { id: 'jangeo-gui', name: '장어구이', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/jangeo-gui.jpg' },
  { id: 'daegu-tang', name: '대구탕', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/daegu-tang.jpg' },
  { id: 'mulmegi-tang', name: '물메기탕', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/mulmegi-tang.jpg' },
  
  // 밥/덮밥류 (10개)
  { id: 'bibimbap', name: '비빔밥', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/bibimbap.jpg' },
  { id: 'dolsot-bibimbap', name: '돌솥비빔밥', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/dolsot-bibimbap.jpg' },
  { id: 'kimchi-bokkeumbap', name: '김치볶음밥', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/kimchi-bokkeumbap.jpg' },
  { id: 'jeyuk-deopbap', name: '제육덮밥', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/jeyuk-deopbap.jpg' },
  { id: 'bulgogi-deopbap', name: '불고기덮밥', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/bulgogi-deopbap.jpg' },
  { id: 'kkomak-bibimbap', name: '꼬막비빔밥', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/kkomak-bibimbap.jpg' },
  { id: 'jeonbok-juk', name: '전복죽', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/jeonbok-juk.jpg' },
  { id: 'jangeo-deopbap', name: '장어덮밥', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/jangeo-deopbap.jpg' },
  { id: 'ojingeo-deopbap', name: '오징어덮밥', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/ojingeo-deopbap.jpg' },
  { id: 'yukgaejang-deopbap', name: '육개장덮밥', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/yukgaejang-deopbap.jpg' },
  
  // 기타 한식 (15개)
  { id: 'gamja-ongsimi', name: '감자옹심이', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/gamja-ongsimi.jpg' },
  { id: 'hwangtae-haejangguk', name: '황태해장국', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/hwangtae-haejangguk.jpg' },
  { id: 'dodari-ssukguk', name: '도다리쑥국', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/dodari-ssukguk.jpg' },
  { id: 'maesaengi-guk', name: '매생이국', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/maesaengi-guk.jpg' },
  { id: 'jang-gejang', name: '간장게장', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/jang-gejang.jpg' },
  { id: 'yangnyeom-gejang', name: '양념게장', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/yangnyeom-gejang.jpg' },
  { id: 'gul-jjim', name: '굴찜', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/gul-jjim.jpg' },
  { id: 'daege', name: '대게', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/daege.jpg' },
  { id: 'king-crab', name: '킹크랩', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/king-crab.jpg' },
  { id: 'gogi-guksu', name: '고기국수', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/gogi-guksu.jpg' },
  { id: 'okdom-gui', name: '옥돔구이', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/okdom-gui.jpg' },
  { id: 'seongge-miyeokguk', name: '성게미역국', category: '한식', spicy: false, alcoholFriendly: false, image: '/menus/seongge-miyeokguk.jpg' },
  { id: 'baechu-kimchi-jjigae', name: '배추김치찌개', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/baechu-kimchi-jjigae.jpg' },
  { id: 'kkotgetang', name: '꽃게탕', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/kkotgetang.jpg' },
  { id: 'altang', name: '알탕', category: '한식', spicy: true, alcoholFriendly: false, image: '/menus/altang.jpg' },
  
  // ===== 분식 (6개) =====
  { id: 'tteokbokki', name: '떡볶이', category: '분식', spicy: true, alcoholFriendly: false, image: '/menus/tteokbokki.jpg' },
  { id: 'gimbap', name: '김밥', category: '분식', spicy: false, alcoholFriendly: false, image: '/menus/gimbap.jpg' },
  { id: 'ramyeon', name: '라면', category: '분식', spicy: true, alcoholFriendly: false, image: '/menus/ramyeon.jpg' },
  { id: 'sundae', name: '순대', category: '분식', spicy: false, alcoholFriendly: false, image: '/menus/sundae.jpg' },
  { id: 'twigim', name: '튀김', category: '분식', spicy: false, alcoholFriendly: false, image: '/menus/twigim.jpg' },
  { id: 'eomuk', name: '어묵', category: '분식', spicy: false, alcoholFriendly: false, image: '/menus/eomuk.jpg' },
  
  // ===== 치킨 (1개) =====
  { id: 'chikin', name: '치킨', category: '치킨', spicy: false, alcoholFriendly: false, image: '/menus/chikin.jpg' },
  
  // ===== 중식 (6개) =====
  { id: 'jjajangmyeon', name: '짜장면', category: '중식', spicy: false, alcoholFriendly: false, image: '/menus/jjajangmyeon.jpg' },
  { id: 'ganjjajang', name: '간짜장', category: '중식', spicy: false, alcoholFriendly: false, image: '/menus/ganjjajang.jpg' },
  { id: 'jjamppong', name: '짬뽕', category: '중식', spicy: true, alcoholFriendly: false, image: '/menus/jjamppong.jpg' },
  { id: 'tangsuyuk', name: '탕수육', category: '중식', spicy: false, alcoholFriendly: false, image: '/menus/tangsuyuk.jpg' },
  { id: 'bokkeumbap', name: '볶음밥', category: '중식', spicy: false, alcoholFriendly: false, image: '/menus/bokkeumbap.jpg' },
  { id: 'mapadubu', name: '마파두부', category: '중식', spicy: true, alcoholFriendly: false, image: '/menus/mapadubu.jpg' },
  
  // ===== 일식 (5개) =====
  { id: 'chobap', name: '초밥', category: '일식', spicy: false, alcoholFriendly: false, image: '/menus/chobap.jpg' },
  { id: 'udon', name: '우동', category: '일식', spicy: false, alcoholFriendly: false, image: '/menus/udon.jpg' },
  { id: 'ramen', name: '라멘', category: '일식', spicy: false, alcoholFriendly: false, image: '/menus/ramen.jpg' },
  { id: 'donkaseu', name: '돈까스', category: '일식', spicy: false, alcoholFriendly: false, image: '/menus/donkaseu.jpg' },
  { id: 'gyudon', name: '규동', category: '일식', spicy: false, alcoholFriendly: false, image: '/menus/gyudon.jpg' },
  
  // ===== 양식/패스트푸드 (6개) =====
  { id: 'pizza', name: '피자', category: '양식', spicy: false, alcoholFriendly: false, image: '/menus/pizza.jpg' },
  { id: 'pasta', name: '파스타', category: '양식', spicy: false, alcoholFriendly: false, image: '/menus/pasta.jpg' },
  { id: 'steak', name: '스테이크', category: '양식', spicy: false, alcoholFriendly: false, image: '/menus/steak.jpg' },
  { id: 'salad', name: '샐러드', category: '양식', spicy: false, alcoholFriendly: false, image: '/menus/salad.jpg' },
  { id: 'hamburger', name: '햄버거', category: '패스트푸드', spicy: false, alcoholFriendly: false, image: '/menus/hamburger.jpg' },
  { id: 'sandwich', name: '샌드위치', category: '패스트푸드', spicy: false, alcoholFriendly: false, image: '/menus/sandwich.jpg' },
  
  // ===== 아시안 (1개) =====
  { id: 'ssal-guksu', name: '쌀국수', category: '아시안', spicy: false, alcoholFriendly: false, image: '/menus/ssal-guksu.jpg' },
];

// 이색 키워드 풀 (이색맛집 TOP5 검색용)
export const EXOTIC_KEYWORDS = [
  '현지인', '로컬', '숨은맛집', '노포', '백반집', '기사식당', '재래시장', '단골',
  '도다리쑥국', '매생이국', '간장게장', '양념게장', '굴찜', '대게', '킹크랩',
  '고기국수', '갈치조림', '옥돔구이', '전복죽', '성게미역국',
  '감자옹심이', '황태해장국', '장어구이', '대구탕', '물메기탕',
  '전통', '원조', '맛집', '유명한', '인기', '추천'
];

// 메뉴 ID로 메뉴 찾기
export function getMenuById(id: string): MenuItem | undefined {
  return menuDatabase.find(menu => menu.id === id);
}

// 메뉴 이름으로 메뉴 찾기
export function getMenuByName(name: string): MenuItem | undefined {
  return menuDatabase.find(menu => menu.name === name);
}

// 카테고리별 메뉴 필터링
export function getMenusByCategory(category: string): MenuItem[] {
  return menuDatabase.filter(menu => menu.category === category);
}

// 랜덤 메뉴 가져오기
export function getRandomMenu(excludeIds?: string[]): MenuItem {
  const available = excludeIds 
    ? menuDatabase.filter(menu => !excludeIds.includes(menu.id))
    : menuDatabase;
  
  return available[Math.floor(Math.random() * available.length)];
}
