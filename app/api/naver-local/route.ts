import { NextRequest, NextResponse } from 'next/server';

// 10분 캐시 저장소
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_VERSION = 'v5'; // 캐시 버전 (변경 시 기존 캐시 무효화)

// HTML 태그 제거 함수
function stripHtmlTags(text: string): string {
  return text.replace(/<\/?b>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

// 시간대별 식사 타입 반환
type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'latenight';

function getMealTime(hour: number): MealTime {
  if (hour >= 6 && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 21) return 'dinner';
  return 'latenight';
}

// 시간대별 검색 키워드
const MEAL_TIME_KEYWORDS: Record<MealTime, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  latenight: '', // 야식은 키워드 없음 (술집 포함)
};

// 제외할 카테고리 키워드 (시간대별)
const EXCLUDED_CATEGORIES: Record<MealTime, string[]> = {
  breakfast: ['술집', '포장마차', '호프,요리', '바', '이자카야', '와인', '맥주'],
  lunch: ['술집', '포장마차', '호프,요리', '바', '이자카야', '와인', '맥주'],
  dinner: [], // 저녁은 술집 포함 가능
  latenight: [], // 야식은 모두 포함
};

// 카테고리 필터링 함수
function shouldExcludeByCategory(category: string, mealTime: MealTime): boolean {
  const excludeList = EXCLUDED_CATEGORIES[mealTime];
  return excludeList.some(keyword => category.includes(keyword));
}

// 지역 검증 함수 (주소에 location이 포함되어 있는지 확인)
function isInLocation(address: string, location: string | null): boolean {
  if (!location) return true; // 지역 지정 없으면 모두 통과
  
  // 주소를 공백 제거하고 정규화 (대소문자 구분 없이)
  const normalizedAddress = address.replace(/\s+/g, '').toLowerCase();
  const normalizedLocation = location.replace(/\s+/g, '').toLowerCase();
  
  // 주소에 지역명이 포함되어 있는지 확인
  // 예: location="양산" → "경남양산시", "양산시", "양산군" 등 모두 허용
  if (normalizedAddress.includes(normalizedLocation)) {
    return true;
  }
  
  // 특수 케이스: "시" 또는 "군" 추가해서 재검색
  // 예: "양산" → "양산시" 또는 "양산군"도 허용
  const locationWithSuffix = normalizedLocation + '시';
  const locationWithGun = normalizedLocation + '군';
  
  return normalizedAddress.includes(locationWithSuffix) || 
         normalizedAddress.includes(locationWithGun);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const menu = searchParams.get('menu');
  const location = searchParams.get('location');

  console.log('[naver-local API] Received request - menu:', menu, 'location:', location);

  if (!menu) {
    return NextResponse.json({ error: 'menu parameter is required' }, { status: 400 });
  }

  // 현재 시간대 파악
  const now = new Date();
  const currentHour = now.getHours();
  const mealTime = getMealTime(currentHour);
  const mealKeyword = MEAL_TIME_KEYWORDS[mealTime];

  // 시간대 키워드 추가 (야식 제외)
  let query = location ? `${location} ${menu}` : menu;
  if (mealKeyword) {
    query = `${query} ${mealKeyword}`;
  }
  
  const cacheKey = `${CACHE_VERSION}:${location || 'default'}:${menu}:${mealTime}`;

  console.log('[naver-local API] Meal time:', mealTime);
  console.log('[naver-local API] Search query:', query);
  console.log('[naver-local API] Cache key:', cacheKey);

  // 캐시 확인
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    console.log('Cache hit:', cacheKey);
    return NextResponse.json(cached.data);
  }

  // 네이버 API 호출
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[naver-local API] ❌ Naver API credentials not configured!');
    console.error('[naver-local API] Please set NAVER_CLIENT_ID and NAVER_CLIENT_SECRET in .env.local');
    console.error('[naver-local API] Visit https://developers.naver.com to get API keys');
    
    // 임시 목 데이터 반환 (개발용)
    const mockData = {
      items: [
        {
          title: `${location || ''} ${menu} 맛집 1`,
          address: `${location || '서울'} 테스트 주소 1`,
          category: '음식점>한식',
        },
        {
          title: `${location || ''} ${menu} 맛집 2`,
          address: `${location || '서울'} 테스트 주소 2`,
          category: '음식점>한식',
        },
        {
          title: `${location || ''} ${menu} 맛집 3`,
          address: `${location || '서울'} 테스트 주소 3`,
          category: '음식점>한식',
        },
        {
          title: `${location || ''} ${menu} 맛집 4`,
          address: `${location || '서울'} 테스트 주소 4`,
          category: '음식점>한식',
        },
        {
          title: `${location || ''} ${menu} 맛집 5`,
          address: `${location || '서울'} 테스트 주소 5`,
          category: '음식점>한식',
        },
      ],
    };
    
    console.warn('[naver-local API] 🔧 Returning MOCK data (API keys not configured)');
    return NextResponse.json(mockData);
  }

  try {
    // display를 30으로 늘려서 필터링 후에도 충분한 결과 확보
    const apiUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
      query
    )}&display=30&sort=comment`;

    console.log('[naver-local API] Calling Naver API with URL:', apiUrl);
    console.log('[naver-local API] Location filter:', location || '(none)');

    const response = await fetch(apiUrl, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error(`Naver API failed: ${response.status}`);
    }

    const data = await response.json();

    console.log('[naver-local API] Naver API returned', data.items?.length || 0, 'items');
    
    // 결과가 없으면 시간대 키워드 없이 재검색
    if (!data.items || data.items.length === 0) {
      if (mealKeyword) {
        console.log('[naver-local API] No results with meal keyword, retrying without it...');
        const fallbackQuery = location ? `${location} ${menu}` : menu;
        const fallbackUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
          fallbackQuery
        )}&display=30&sort=comment`;
        
        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
          },
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          data.items = fallbackData.items || [];
          console.log('[naver-local API] Fallback search returned', data.items.length, 'items');
        }
      }
    }
    
    if (data.items && data.items.length > 0) {
      console.log('[naver-local API] Sample items with addresses and categories:');
      data.items.slice(0, 5).forEach((item: any, idx: number) => {
        const address = item.address || item.roadAddress || '';
        console.log(`  ${idx + 1}. ${stripHtmlTags(item.title)}`);
        console.log(`      주소: ${address}`);
        console.log(`      카테고리: "${item.category}"`);
      });
    }

    // 필요한 필드만 추출 및 HTML 태그 제거
    // title이 없는 항목 제외
    // 지역 필터링 추가
    // 시간대별 카테고리 필터링 추가
    let filtered = data.items.filter((item: any) => {
      // title 없으면 제외
      if (!item.title || !stripHtmlTags(item.title).trim()) {
        return false;
      }
      
      // 지역 검증 (주소 기반)
      const address = item.address || item.roadAddress || '';
      const inLocation = isInLocation(address, location);
      
      if (!inLocation) {
        console.log('[naver-local API] ❌ Excluded by location:', stripHtmlTags(item.title), '- address:', address, '- looking for:', location);
        return false;
      } else {
        console.log('[naver-local API] ✅ Included:', stripHtmlTags(item.title), '- address:', address);
      }
      
      // 카테고리 기반 필터링
      const category = item.category || '';
      if (shouldExcludeByCategory(category, mealTime)) {
        console.log('[naver-local API] Excluded by category:', stripHtmlTags(item.title), '- category:', category);
        return false;
      }
      
      return true;
    });

    console.log('[naver-local API] After filtering:', filtered.length, 'items (need at least 5)');
    
    // 필터링 후 결과가 5개 미만이면 카테고리 필터링만 제거 (지역 필터링은 유지)
    if (filtered.length < 5) {
      console.log('[naver-local API] Too few results after filtering, removing category filter but keeping location filter');
      filtered = data.items.filter((item: any) => {
        if (!item.title || !stripHtmlTags(item.title).trim()) {
          return false;
        }
        
        // 지역 검증은 계속 유지
        const address = item.address || item.roadAddress || '';
        return isInLocation(address, location);
      });
      
      console.log('[naver-local API] After location-only filtering:', filtered.length, 'items');
    }
    
    // 여전히 부족하면 display를 늘려서 재검색
    if (filtered.length < 5 && data.items.length >= 20) {
      console.log('[naver-local API] Still too few results, increasing display to 50');
      const retryUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
        query
      )}&display=50&sort=comment`;
      
      const retryResponse = await fetch(retryUrl, {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      });
      
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        console.log('[naver-local API] Retry search returned', retryData.items?.length || 0, 'items');
        
        // 지역 필터링만 적용
        filtered = (retryData.items || []).filter((item: any) => {
          if (!item.title || !stripHtmlTags(item.title).trim()) {
            return false;
          }
          
          const address = item.address || item.roadAddress || '';
          return isInLocation(address, location);
        });
        
        console.log('[naver-local API] After retry location filtering:', filtered.length, 'items');
      }
    }
    
    const filteredData = {
      items: filtered
        .slice(0, 5) // 상위 5개만
        .map((item: any) => ({
          title: stripHtmlTags(item.title),
          address: item.address || item.roadAddress || '',
          category: item.category || '',
        })),
    };

    console.log('[naver-local API] Final result:', filteredData.items.length, 'items');
    if (filteredData.items.length > 0) {
      console.log('[naver-local API] First item:', filteredData.items[0].title);
    }

    // 10분 캐시 저장
    cache.set(cacheKey, {
      data: filteredData,
      expiry: Date.now() + 10 * 60 * 1000,
    });

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Naver Local API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch local search results' },
      { status: 500 }
    );
  }
}
