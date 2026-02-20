import { NextRequest, NextResponse } from 'next/server';

// 10분 캐시 저장소
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_VERSION = 'v2'; // 캐시 버전 (변경 시 기존 캐시 무효화)

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
    return NextResponse.json(
      { error: 'Naver API credentials not configured' },
      { status: 500 }
    );
  }

  try {
    // display를 10으로 늘려서 필터링 후에도 충분한 결과 확보
    const apiUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
      query
    )}&display=10&sort=comment`;

    console.log('[naver-local API] Calling Naver API with URL:', apiUrl);

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
    console.log('[naver-local API] First item:', data.items?.[0]);

    // 필요한 필드만 추출 및 HTML 태그 제거
    // title이 없는 항목 제외
    // 시간대별 카테고리 필터링 추가
    const filteredData = {
      items: data.items
        .filter((item: any) => {
          // title 없으면 제외
          if (!item.title || !stripHtmlTags(item.title).trim()) {
            return false;
          }
          
          // 카테고리 기반 필터링
          const category = item.category || '';
          if (shouldExcludeByCategory(category, mealTime)) {
            console.log('[naver-local API] Excluded by category:', stripHtmlTags(item.title), '- category:', category);
            return false;
          }
          
          return true;
        })
        .slice(0, 5) // 필터링 후 상위 5개만
        .map((item: any) => ({
          title: stripHtmlTags(item.title),
          address: item.address || item.roadAddress || '',
          category: item.category || '',
        })),
    };

    console.log('[naver-local API] Filtered data:', filteredData.items.length, 'items');
    console.log('[naver-local API] First filtered item:', filteredData.items[0]);

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
