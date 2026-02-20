import { NextRequest, NextResponse } from 'next/server';
import { EXOTIC_KEYWORDS } from '@/lib/menuDatabase';

// ====== Simple in-memory cache (10 minutes) ======
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_VERSION = 'v9'; // v9: exotic mode 추가

// ====== Utils ======
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<\/?b>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .trim();
}

function getAddress(item: any): string {
  return (item.roadAddress || item.address || '').trim();
}

/**
 * Location match:
 * - loose match: compare normalized strings
 * - also checks token-level match
 */
function isInLocation(address: string, location: string | null): boolean {
  if (!location) return true;
  if (!address) return false;

  const normAddr = address.replace(/\s+/g, '').toLowerCase();
  const normLoc = location.replace(/\s+/g, '').toLowerCase();

  if (normAddr.includes(normLoc)) return true;

  // allow "시/군" suffix
  if (normAddr.includes(normLoc + '시') || normAddr.includes(normLoc + '군')) return true;

  // token match
  const tokens = address.split(/\s+/).map(t => t.toLowerCase());
  return tokens.some(t => t.includes(normLoc) || t.includes(normLoc + '시') || t.includes(normLoc + '군'));
}

// 술집/바 계열을 "후순위"로만 내리기 위한 키워드
const ALCOHOLISH_KEYWORDS = [
  '술집',
  '호프',
  '포장마차',
  '바',
  '이자카야',
  '와인',
  '맥주',
  'pub',
  'bar',
  '칵테일',
];

// 음식점 우선순위 키워드 (카테고리/타이틀에 있으면 가점)
const FOOD_PRIORITY_KEYWORDS = [
  '음식점',
  '식당',
  '한식',
  '중식',
  '일식',
  '양식',
  '분식',
  '치킨',
  '피자',
  '국밥',
  '면',
  '고기',
  '구이',
  '뷔페',
];

// 아이템 점수화: 높을수록 상단
function scoreItem(item: any, isExotic: boolean = false): number {
  const title = cleanText(item.title || '');
  const category = (item.category || '').toString();
  const address = getAddress(item);

  let score = 0;

  // 기본 존재 가점
  if (title) score += 10;
  if (address) score += 3;
  if (category) score += 3;

  const hay = `${title} ${category}`.toLowerCase();

  // 음식점/식당 계열 가점
  for (const k of FOOD_PRIORITY_KEYWORDS) {
    if (hay.includes(k.toLowerCase())) score += 5;
  }

  // 술집/바 계열 감점 (제외 X, 후순위)
  for (const k of ALCOHOLISH_KEYWORDS) {
    if (hay.includes(k.toLowerCase())) score -= 15;
  }

  // category에 "음식점>" 형태가 많으면 살짝 가점
  if (category.includes('음식점')) score += 6;

  // Exotic 모드에서 이색 키워드 보너스
  if (isExotic) {
    for (const keyword of EXOTIC_KEYWORDS) {
      if (hay.includes(keyword)) score += 8;
    }
  }

  return score;
}

/**
 * Exotic mode: 이색 키워드를 추가하여 2-4번 검색 후 merge
 */
async function fetchExoticResults(
  baseQuery: string,
  clientId: string,
  clientSecret: string,
  location: string | null
): Promise<any[]> {
  console.log('[naver-local API] 🎒 Exotic mode activated');

  const allItems: any[] = [];
  const seenTitles = new Set<string>();

  // 1. 기본 쿼리 검색
  try {
    const baseUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
      baseQuery
    )}&display=20&sort=comment`;

    const baseRes = await fetch(baseUrl, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (baseRes.ok) {
      const baseData = await baseRes.json();
      const baseItems = Array.isArray(baseData.items) ? baseData.items : [];
      
      for (const item of baseItems) {
        const title = cleanText(item.title);
        if (title && !seenTitles.has(title)) {
          seenTitles.add(title);
          allItems.push(item);
        }
      }
      
      console.log('[naver-local API] Base query returned:', baseItems.length, 'items');
    }
  } catch (err) {
    console.error('[naver-local API] Base query error:', err);
  }

  // 2. 이색 키워드 2-4개 랜덤 선택
  const shuffled = [...EXOTIC_KEYWORDS].sort(() => Math.random() - 0.5);
  const selectedKeywords = shuffled.slice(0, 3); // 3개 선택

  console.log('[naver-local API] Selected exotic keywords:', selectedKeywords);

  // 3. 각 키워드로 검색
  for (const keyword of selectedKeywords) {
    try {
      const exoticQuery = `${baseQuery} ${keyword}`;
      const exoticUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
        exoticQuery
      )}&display=15&sort=comment`;

      const exoticRes = await fetch(exoticUrl, {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      });

      if (exoticRes.ok) {
        const exoticData = await exoticRes.json();
        const exoticItems = Array.isArray(exoticData.items) ? exoticData.items : [];
        
        for (const item of exoticItems) {
          const title = cleanText(item.title);
          if (title && !seenTitles.has(title)) {
            seenTitles.add(title);
            allItems.push(item);
          }
        }
        
        console.log(`[naver-local API] Keyword "${keyword}" returned:`, exoticItems.length, 'items');
      }

      // Rate limiting 방지
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error(`[naver-local API] Error with keyword "${keyword}":`, err);
    }
  }

  console.log('[naver-local API] Total unique exotic items:', allItems.length);
  return allItems;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const menu = searchParams.get('menu');
  const location = searchParams.get('location');
  const mode = searchParams.get('mode'); // 'exotic' for 이색맛집
  const isExotic = searchParams.get('isExotic') === 'true'; // alternative

  const exoticMode = mode === 'exotic' || isExotic;

  console.log('[naver-local API] Received request - menu:', menu, 'location:', location, 'exotic:', exoticMode);

  // menu 없으면 location만으로 맛집 검색
  const baseMenu = menu || '맛집';

  // ====== Query ======
  const query = location ? `${location} ${baseMenu}` : baseMenu;

  // cache key
  const cacheKey = `${CACHE_VERSION}:${location || 'default'}:${baseMenu}:${exoticMode ? 'exotic' : 'normal'}`;

  console.log('[naver-local API] Search query:', query);
  console.log('[naver-local API] Cache key:', cacheKey);

  // cache hit
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    console.log('[naver-local API] Cache hit:', cacheKey);
    return NextResponse.json(cached.data);
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[naver-local API] ❌ Naver API credentials not configured!');
    console.error('[naver-local API] Please set NAVER_CLIENT_ID and NAVER_CLIENT_SECRET in .env.local');

    const mockData = {
      items: Array.from({ length: 5 }).map((_, i) => ({
        title: `${location || ''} ${baseMenu} ${exoticMode ? '이색' : ''} 테스트 맛집 ${i + 1}`.trim(),
        address: `${location || '서울'} 테스트 주소 ${i + 1}`,
        category: '음식점>한식',
      })),
      meta: { mock: true, exotic: exoticMode },
    };

    console.warn('[naver-local API] 🔧 Returning MOCK data (API keys not configured)');

    // cache mock too (to reduce spam logs)
    cache.set(cacheKey, { data: mockData, expiry: Date.now() + 10 * 60 * 1000 });

    return NextResponse.json(mockData);
  }

  try {
    let items: any[] = [];

    // Exotic 모드: 이색 키워드로 다중 검색
    if (exoticMode) {
      items = await fetchExoticResults(query, clientId, clientSecret, location);
    } else {
      // 일반 모드: 단일 검색
      const apiUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
        query
      )}&display=50&sort=comment`;

      console.log('[naver-local API] Calling Naver API:', apiUrl);

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
      items = Array.isArray(data.items) ? data.items : [];
    }

    console.log('[naver-local API] Total items from Naver:', items.length);

    // basic sanitize: title 있는 것만
    let filtered = items
      .filter(it => cleanText(it.title).length > 0)
      .map(it => ({
        title: cleanText(it.title),
        address: getAddress(it),
        category: (it.category || '').toString(),
      }));

    console.log('[naver-local API] After basic filtering:', filtered.length);

    // location filtering (but only if it doesn't kill the list)
    if (location && filtered.length > 10) {
      const locFiltered = filtered.filter(it => isInLocation(it.address, location));
      console.log('[naver-local API] After location filtering:', locFiltered.length);

      // 너무 줄면 무시, 충분하면 적용
      if (locFiltered.length >= 5) {
        filtered = locFiltered;
      } else {
        console.log('[naver-local API] ⚠️ Location filter removed too many results, ignoring it');
      }
    }

    // scoring & sorting: 음식점 우선, 술집 후순위
    const scored = filtered
      .map(it => ({ ...it, _score: scoreItem(it, exoticMode) }))
      .sort((a, b) => b._score - a._score);

    const top5 = scored.slice(0, 5).map(({ _score, ...rest }) => rest);

    const result = {
      items: top5,
      meta: {
        query,
        location: location || null,
        exotic: exoticMode,
        totalFromNaver: items.length,
        afterFiltering: filtered.length,
      },
    };

    console.log('[naver-local API] ✅ Final result:', result.items.length, 'items');
    result.items.forEach((it, idx) => {
      console.log(`  ${idx + 1}. ${it.title} | ${it.category} | ${it.address}`);
    });

    // cache save
    cache.set(cacheKey, { data: result, expiry: Date.now() + 10 * 60 * 1000 });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[naver-local API] ❌ Error:', error);
    return NextResponse.json({ error: 'Failed to fetch local search results' }, { status: 500 });
  }
}
