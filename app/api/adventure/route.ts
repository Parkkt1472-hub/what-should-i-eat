import { NextRequest, NextResponse } from 'next/server';

// 30분 캐시
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_VERSION = 'v1';

// 평범한 한식 메뉴 리스트
const COMMON_KOREAN_FOODS = [
  '김치찌개', '된장찌개', '순두부찌개',
  '김치볶음밥', '볶음밥',
  '비빔밥', '돌솥비빔밥',
  '제육볶음', '불고기',
  '된장국', '미역국',
  '김치', '깍두기',
  '라면', '떡볶이',
  '순대', '튀김',
  '국밥', '해장국',
];

// 메뉴가 이색적인지 판단
function isExoticMenu(menu: string): boolean {
  const menuLower = menu.toLowerCase();
  
  // 평범한 한식이면 false
  if (COMMON_KOREAN_FOODS.some(common => menuLower.includes(common))) {
    return false;
  }
  
  // 일본/중식/양식/동남아/기타 외국 음식이면 true
  const exoticKeywords = [
    '스시', '초밥', '라멘', '우동', '소바', '오야코동', '가츠동', '덮밥',
    '파스타', '피자', '리소토', '스테이크', '리조또',
    '팟타이', '쌀국수', '분짜', '월남쌈',
    '카레', '탄두리', '난',
    '타코', '부리또', '퀘사디아',
    '훠궈', '마라탕',
  ];
  
  return exoticKeywords.some(keyword => menuLower.includes(keyword));
}

// HTML 태그 제거
function stripHtmlTags(text: string): string {
  return text.replace(/<\/?b>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

// 이색맛집 검색 키워드 (평소에 잘 안먹는 음식, 특별한 곳 위주)
const ADVENTURE_KEYWORDS = [
  '숨은맛집',
  '현지맛집', 
  '유명한',
  '맛있는',
  '전문점',
  '정통',
  '본격',
  '특별한',
  '인기',
  '맛집',
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

// 모험 점수 계산 (평소에 잘 안먹는 음식 위주)
function calculateAdventureScore(item: any, keyword: string): number {
  let score = 0;
  
  const title = item.title || '';
  const address = item.address || '';
  const category = item.category || '';
  const text = `${title} ${address} ${category}`.toLowerCase();
  
  // 기본 점수: 키워드 매칭
  if (keyword === '전문점' || keyword === '정통' || keyword === '본격') {
    score += 15; // 전문점 높은 점수
  } else if (keyword === '숨은맛집' || keyword === '현지맛집') {
    score += 12;
  } else if (keyword === '유명한' || keyword === '인기') {
    score += 10;
  } else {
    score += 8;
  }
  
  // 체인점은 완전 제외
  if (isChainStore(title, address)) {
    return -100;
  }
  
  // 지점 패턴 감점 (단, "전문점"은 예외)
  if (hasBranchPattern(title) && !title.includes('전문점')) {
    score -= 5;
  }
  
  // 광고성 키워드 감점
  AD_KEYWORDS.forEach(adKeyword => {
    if (text.includes(adKeyword)) {
      score -= 3;
    }
  });
  
  // 전문점 키워드 가산점
  if (title.includes('전문점') || title.includes('정통') || title.includes('본격')) {
    score += 8;
  }
  
  // 특이한 카테고리 가산점
  // 일본/이탈리안/중식 전문/베트남/태국 등
  if (category.includes('일식') || category.includes('이탈리안') || 
      category.includes('베트남') || category.includes('태국') ||
      category.includes('인도') || category.includes('멕시칸') ||
      category.includes('스페인') || category.includes('프랑스') ||
      category.includes('퓨전') || category.includes('이색')) {
    score += 6;
  }
  
  // 평범한 카테고리 감점
  if (category.includes('한식>찌개') || category.includes('한식>백반') ||
      category.includes('한식>국,탕') || category.includes('분식')) {
    score -= 5;
  }
  
  // 리뷰/평점 관련 키워드 가산점
  if (title.includes('맛있는') || title.includes('유명한') || title.includes('인기')) {
    score += 3;
  }
  
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
    
    // 메뉴가 이색적인지 판단
    const isExotic = isExoticMenu(menu);
    console.log('[adventure API] Is exotic menu:', isExotic);
    
    // 이색 메뉴가 아니면 결과 개수 줄이기
    const displayCount = isExotic ? 10 : 5;

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
        adventureScore: calculateAdventureScore(item, keyword),
        isExoticMenu: isExotic, // 메뉴 희귀도 저장
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

    // 점수 순으로 정렬하고 상위 5개 선택
    const sortedResults = Array.from(uniqueMap.values())
      .filter(item => item.adventureScore > 0) // 음수 점수 제외
      .map(item => ({
        ...item,
        // 이색 메뉴면 보너스 점수 추가
        finalScore: item.adventureScore + (item.isExoticMenu ? 5 : 0),
      }))
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 5)
      .map((item, index) => ({
        rank: index + 1,
        title: item.title,
        address: item.address,
        category: item.category || '',
        keyword: item.keyword,
        adventureScore: item.finalScore,
        adventureLevel: Math.min(100, Math.round((item.finalScore / 25) * 100)), // 0-100%
        isExoticMenu: item.isExoticMenu,
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
