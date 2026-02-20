import { NextRequest, NextResponse } from 'next/server';

// 30분 캐시
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_VERSION = 'v1';

// 🔴 사람들이 자주 먹는 음식 (희귀도 낮음)
const COMMON_FOODS = [
  // 한식 일상 메뉴
  '김치찌개', '된장찌개', '순두부찌개', '부대찌개',
  '김치볶음밥', '볶음밥', '계란볶음밥',
  '비빔밥', '돌솥비빔밥',
  '제육볶음', '불고기', '삼겹살', '갈비',
  '된장국', '미역국', '김치', '깍두기',
  '라면', '떡볶이', '김밥', '순대', '튀김',
  '국밥', '해장국', '설렁탕', '곰탕',
  
  // 치킨/피자 (매우 흔함)
  '치킨', '후라이드', '양념치킨', '간장치킨',
  '피자', '페퍼로니', '불고기피자',
  
  // 중식 흔한 메뉴
  '짜장면', '짬뽕', '탕수육', '깐풍기',
  
  // 일식 흔한 메뉴
  '돈까스', '우동', '라면',
  
  // 패스트푸드
  '햄버거', '감자튀김',
];

// 🌟 희귀도 점수 계산 (0~100점, 높을수록 희귀함)
function calculateRarityScore(menu: string): number {
  const menuLower = menu.toLowerCase();
  
  // 🔴 매우 흔한 음식 (0~20점)
  if (COMMON_FOODS.some(common => menuLower.includes(common.toLowerCase()))) {
    return 10; // 낮은 희귀도
  }
  
  // 🟡 보통 희귀한 음식 (40~60점)
  const moderateRare = [
    '파스타', '스테이크', '리소토',
    '초밥', '사시미', '라멘', '소바', '덮밥',
    '쌀국수', '팟타이', '월남쌈',
    '마라탕', '훠궈',
  ];
  
  if (moderateRare.some(keyword => menuLower.includes(keyword))) {
    return 50; // 중간 희귀도
  }
  
  // 🟢 희귀한 음식 (70~90점)
  const rare = [
    // 특수 한식
    '추어탕', '복어', '장어', '아귀', '곱창', '막창', '대창',
    '족발', '보쌈', '순대국', '뼈해장국',
    '홍어', '간장게장', '양념게장', '꽃게탕', '대게',
    '전복죽', '해삼', '멍게', '성게',
    
    // 특수 외국 음식
    '타코', '부리또', '퀘사디아', '나초스',
    '탄두리', '난', '커리', '비리야니',
    '케밥', '샤와르마', '팔라펠',
    '분짜', '반쎄오', '짜조',
    '태국', '베트남', '인도', '멕시칸', '중동', '터키',
  ];
  
  if (rare.some(keyword => menuLower.includes(keyword))) {
    return 80; // 높은 희귀도
  }
  
  // 🔵 매우 희귀한 음식 (90~100점)
  const veryRare = [
    '양고기', '램', '염소', '사슴',
    '악어', '캥거루', '타조',
    '에티오피아', '페루', '모로코', '그리스',
    '조지아', '우즈벡', '카자흐',
  ];
  
  if (veryRare.some(keyword => menuLower.includes(keyword))) {
    return 95; // 최고 희귀도
  }
  
  // 기타 (중간 희귀도)
  return 60;
}

// HTML 태그 제거
function stripHtmlTags(text: string): string {
  return text.replace(/<\/?b>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

// 🎯 이색맛집 검색 키워드 (희귀한 음식, 특별한 맛집 위주)
const ADVENTURE_KEYWORDS = [
  '전문점',      // 전문점은 높은 점수
  '정통',        // 정통 요리
  '본격',        // 본격적인
  '숨은맛집',    // 숨은 곳
  '현지맛집',    // 현지 스타일
  '특별한',      // 특별함
  '독특한',      // 독특함
  '희귀한',      // 희귀함
  '맛집',        // 맛집
  '유명한',      // 유명함 (보조)
];

// 체인점 키워드 (제외 대상)
const CHAIN_KEYWORDS = [
  '롯데리아', '맥도날드', 'KFC', '버거킹', '맘스터치',
  '스타벅스', '이디야', '투썸플레이스', '커피빈',
  '교촌치킨', 'BBQ', '굽네치킨', 'bhc',
  'CU', 'GS25', '세븐일레븐',
  '파리바게뜨', '뚜레쥬르',
];

// 광고성 키워드 (감점)
const AD_KEYWORDS = ['체험단', '협찬', '이벤트', '무료', '할인'];

// 체인점 여부 확인
function isChainStore(title: string, address: string): boolean {
  const text = `${title} ${address}`.toLowerCase();
  return CHAIN_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
}

// 지점 패턴 확인 (예: ○○점, ○○지점)
function hasBranchPattern(title: string): boolean {
  return /[가-힣]+\s*[점|지점]$/i.test(title) && 
         !/전문점|맛집|본점/.test(title);
}

// 🎯 모험 점수 계산 (희귀도 기반 + 품질 지표)
function calculateAdventureScore(item: any, keyword: string, menuRarity: number): number {
  let score = 0;
  
  const title = item.title || '';
  const address = item.address || '';
  const category = item.category || '';
  const text = `${title} ${address} ${category}`.toLowerCase();
  
  // 🌟 1. 메뉴 희귀도 점수 (가장 중요) - 최대 50점
  score += menuRarity * 0.5; // 0~100점 → 0~50점
  
  // 🔑 2. 키워드 매칭 점수 - 최대 20점
  if (keyword === '전문점' || keyword === '정통' || keyword === '본격') {
    score += 20; // 전문점 매우 높은 점수
  } else if (keyword === '숨은맛집' || keyword === '현지맛집' || keyword === '독특한' || keyword === '희귀한') {
    score += 15;
  } else if (keyword === '특별한') {
    score += 12;
  } else if (keyword === '유명한' || keyword === '맛집') {
    score += 10;
  } else {
    score += 8;
  }
  
  // 🚫 3. 체인점 완전 제외
  if (isChainStore(title, address)) {
    return -100;
  }
  
  // 🚫 4. 지점 패턴 감점 (단, "전문점"은 예외)
  if (hasBranchPattern(title) && !title.includes('전문점')) {
    score -= 8;
  }
  
  // 🚫 5. 광고성 키워드 감점
  AD_KEYWORDS.forEach(adKeyword => {
    if (text.includes(adKeyword)) {
      score -= 5;
    }
  });
  
  // ✅ 6. 전문점/정통 키워드 추가 가산점
  if (title.includes('전문점')) score += 12;
  if (title.includes('정통') || title.includes('본격')) score += 10;
  if (title.includes('원조') || title.includes('본점')) score += 8;
  
  // ✅ 7. 특수/희귀 카테고리 가산점 - 최대 15점
  const rareCategories = [
    '일식', '이탈리안', '프렌치', '스페인',
    '베트남', '태국', '인도', '중동',
    '멕시칸', '터키', '그리스',
    '퓨전', '이색', '특수',
  ];
  
  rareCategories.forEach(rareCat => {
    if (category.includes(rareCat)) {
      score += 15;
    }
  });
  
  // 🔻 8. 흔한 카테고리 감점
  const commonCategories = [
    '한식>찌개', '한식>백반', '한식>국,탕',
    '분식', '치킨', '피자', '패스트푸드',
    '중식>짜장면', '중식>짬뽕',
  ];
  
  commonCategories.forEach(commonCat => {
    if (category.includes(commonCat)) {
      score -= 10;
    }
  });
  
  // ✅ 9. 품질 지표 키워드 가산점 (소폭)
  if (title.includes('맛있는') || title.includes('유명한')) score += 3;
  if (title.includes('인기')) score += 2;
  
  return score;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const menu = searchParams.get('menu');
  const region = searchParams.get('region');

  if (!menu) {
    return NextResponse.json({ error: 'menu parameter is required' }, { status: 400 });
  }

  const cacheKey = `${CACHE_VERSION}:${region || 'default'}:${menu}:adventure`;

  // 캐시 확인
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    console.log('[adventure API] Cache hit:', cacheKey);
    return NextResponse.json(cached.data);
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Naver API credentials not configured' },
      { status: 500 }
    );
  }

  try {
    console.log('[adventure API] Searching for:', menu, 'in', region || 'all regions');
    
    // 🌟 메뉴 희귀도 계산 (0~100점)
    const menuRarity = calculateRarityScore(menu);
    console.log('[adventure API] Menu rarity score:', menuRarity, '/100');
    
    // 희귀도에 따라 검색 결과 개수 조정
    const displayCount = menuRarity >= 50 ? 10 : 5;

    // 10개 키워드로 병렬 검색
    const searchPromises = ADVENTURE_KEYWORDS.map(async keyword => {
      const query = region ? `${region} ${menu} ${keyword}` : `${menu} ${keyword}`;
      const apiUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
        query
      )}&display=${displayCount}&sort=comment`;

      const response = await fetch(apiUrl, {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      });

      if (!response.ok) {
        console.error(`[adventure API] Keyword "${keyword}" failed:`, response.status);
        return [];
      }

      const data = await response.json();
      
      return (data.items || []).map((item: any) => ({
        ...item,
        keyword,
        adventureScore: calculateAdventureScore(item, keyword, menuRarity),
        menuRarity, // 메뉴 희귀도 점수 저장
      }));
    });

    const allResults = await Promise.all(searchPromises);
    const flatResults = allResults.flat();

    console.log('[adventure API] Total results before filtering:', flatResults.length);

    // 중복 제거 (같은 가게명+주소)
    const uniqueMap = new Map<string, any>();
    
    flatResults.forEach(item => {
      const title = stripHtmlTags(item.title);
      const address = item.address || item.roadAddress || '';
      const key = `${title}:${address}`;
      
      // 이미 있으면 점수가 더 높은 것으로 유지
      if (!uniqueMap.has(key) || uniqueMap.get(key).adventureScore < item.adventureScore) {
        uniqueMap.set(key, {
          ...item,
          title,
          address,
        });
      }
    });

    // 🏆 희귀도 기반 정렬 후 상위 5개 선택
    const sortedResults = Array.from(uniqueMap.values())
      .filter(item => item.adventureScore > 0) // 음수 점수 제외
      .map(item => ({
        ...item,
        // 최종 점수 = 모험 점수 (이미 희귀도 반영됨)
        finalScore: item.adventureScore,
      }))
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 5)
      .map((item, index) => ({
        rank: index + 1,
        title: item.title,
        address: item.address,
        category: item.category || '',
        keyword: item.keyword,
        adventureScore: Math.round(item.finalScore),
        adventureLevel: Math.min(100, Math.round((item.finalScore / 30) * 100)), // 0-100% (점수 범위 조정)
        menuRarity: item.menuRarity, // 메뉴 희귀도
      }));

    console.log('[adventure API] Final TOP5:', sortedResults.length);
    if (sortedResults.length > 0) {
      console.log('[adventure API] Top result:', sortedResults[0].title, 'score:', sortedResults[0].adventureScore);
    }

    const result = { items: sortedResults };

    // 30분 캐시
    cache.set(cacheKey, {
      data: result,
      expiry: Date.now() + 30 * 60 * 1000,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[adventure API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch adventure places' },
      { status: 500 }
    );
  }
}
