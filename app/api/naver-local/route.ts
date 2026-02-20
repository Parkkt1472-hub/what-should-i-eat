import { NextRequest, NextResponse } from 'next/server';

// 10분 캐시 저장소
const cache = new Map<string, { data: any; expiry: number }>();

// HTML 태그 제거 함수
function stripHtmlTags(text: string): string {
  return text.replace(/<\/?b>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const menu = searchParams.get('menu');
  const location = searchParams.get('location');

  console.log('[naver-local API] Received request - menu:', menu, 'location:', location);

  if (!menu) {
    return NextResponse.json({ error: 'menu parameter is required' }, { status: 400 });
  }

  // 지역이 없으면 메뉴만 검색
  const query = location ? `${location} ${menu}` : menu;
  const cacheKey = `${location || 'default'}:${menu}`;

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
    const apiUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
      query
    )}&display=5&sort=comment`;

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
    const filteredData = {
      items: data.items
        .filter((item: any) => item.title && stripHtmlTags(item.title).trim())
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
