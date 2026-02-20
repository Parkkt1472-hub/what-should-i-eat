import { NextRequest, NextResponse } from 'next/server';

// 30분 캐시
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_VERSION = 'v1';

// HTML 태그 제거
function stripHtmlTags(text: string): string {
  return text.replace(/<\/?b>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

// 이색맛집 검색 키워드 (외곽지, 특이한 음식 위주)
const ADVENTURE_KEYWORDS = [
  '숨은맛집',
  '현지맛집',
  '시골맛집',
  '산속맛집',
  '외곽맛집',
  '드라이브맛집',
  '이색요리',
  '특이한',
  '전통요리',
  '희귀한',
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

// 모험 점수 계산
function calculateAdventureScore(item: any, keyword: string): number {
  let score = 0;
  
  const title = item.title || '';
  const address = item.address || '';
  const category = item.category || '';
  const text = `${title} ${address} ${category}`.toLowerCase();
  
  // 기본 점수: 키워드 매칭 (외곽/특이한 음식 위주)
  if (keyword === '숨은맛집' || keyword === '현지맛집') {
    score += 12;
  } else if (keyword === '산속맛집' || keyword === '시골맛집' || keyword === '외곽맛집') {
    score += 18; // 외곽지 높은 점수
  } else if (keyword === '이색요리' || keyword === '특이한' || keyword === '희귀한') {
    score += 15; // 특이한 음식 높은 점수
  } else {
    score += 10;
  }
  
  // 체인점은 완전 제외
  if (isChainStore(title, address)) {
    return -100;
  }
  
  // 지점 패턴은 큰 감점
  if (hasBranchPattern(title)) {
    score -= 8;
  }
  
  // 광고성 키워드 감점
  AD_KEYWORDS.forEach(adKeyword => {
    if (text.includes(adKeyword)) {
      score -= 3;
    }
  });
  
  // 외곽/산속/시골 위치 가산점
  if (text.includes('산') || text.includes('시골') || text.includes('외곽') || 
      text.includes('드라이브') || text.includes('교외')) {
    score += 5;
  }
  
  // 특이한 음식 카테고리 가산점
  if (category.includes('퓨전') || category.includes('이색') || 
      category.includes('향토') || category.includes('토속') ||
      category.includes('전통')) {
    score += 4;
  }
  
  // 일반적인 카테고리는 감점
  if (category.includes('한식>찌개') || category.includes('한식>백반') ||
      category.includes('중식>짜장면') || category.includes('패스트푸드')) {
    score -= 3;
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

    // 10개 키워드로 병렬 검색
    const searchPromises = ADVENTURE_KEYWORDS.map(async keyword => {
      const query = region ? `${region} ${menu} ${keyword}` : `${menu} ${keyword}`;
      const apiUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
        query
      )}&display=10&sort=comment`;

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
      .sort((a, b) => b.adventureScore - a.adventureScore)
      .slice(0, 5)
      .map((item, index) => ({
        rank: index + 1,
        title: item.title,
        address: item.address,
        category: item.category || '',
        keyword: item.keyword,
        adventureScore: item.adventureScore,
        adventureLevel: Math.min(100, Math.round((item.adventureScore / 20) * 100)), // 0-100%
      }));

    console.log('[adventure API] Final TOP5:', sortedResults.length);

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
