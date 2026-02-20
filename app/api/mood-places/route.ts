import { NextRequest, NextResponse } from 'next/server';

// 30분 캐시 저장소
const cache = new Map<string, { data: any; expiry: number }>();

// HTML 태그 제거 함수
function stripHtmlTags(text: string): string {
  return text.replace(/<\/?b>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

// 지역별 근교 리스트 정의 (100km 반경 근사)
const REGIONAL_PRESETS: Record<string, string[]> = {
  // 부산/경남권
  '양산': ['양산', '부산', '울산', '김해', '창원', '밀양', '거제', '통영', '진해', '경주'],
  '부산': ['부산', '양산', '김해', '울산', '거제', '통영', '창원', '밀양', '진해', '경주'],
  '울산': ['울산', '부산', '양산', '경주', '포항', '김해', '창원', '밀양'],
  '경남': ['창원', '김해', '진해', '거제', '통영', '부산', '양산', '울산', '사천', '밀양'],
  
  // 서울/경기권
  '서울': ['서울', '인천', '수원', '성남', '부천', '고양', '용인', '안양', '남양주', '화성'],
  '경기': ['수원', '성남', '용인', '고양', '부천', '안양', '화성', '평택', '시흥', '파주'],
  '인천': ['인천', '서울', '부천', '김포', '시흥', '수원', '안산', '고양'],
  
  // 대구/경북권
  '대구': ['대구', '경산', '구미', '포항', '경주', '안동', '영천', '칠곡'],
  '경북': ['구미', '포항', '경주', '안동', '대구', '경산', '영천', '영주', '상주', '김천'],
  
  // 대전/충청권
  '대전': ['대전', '세종', '청주', '천안', '아산', '공주', '논산', '보령'],
  '충남': ['천안', '아산', '공주', '논산', '보령', '대전', '세종', '청주', '서산'],
  '충북': ['청주', '충주', '제천', '대전', '세종', '천안', '음성'],
  '세종': ['세종', '대전', '청주', '천안', '공주'],
  
  // 광주/전라권
  '광주': ['광주', '나주', '순천', '목포', '여수', '전주', '익산'],
  '전남': ['순천', '여수', '목포', '나주', '광양', '광주', '해남', '완도'],
  '전북': ['전주', '익산', '군산', '정읍', '김제', '광주', '완주'],
  
  // 강원권
  '강원': ['춘천', '원주', '강릉', '속초', '동해', '삼척', '태백', '홍천'],
  
  // 제주권
  '제주': ['제주', '서귀포', '애월', '조천', '한림', '성산'],
};

// 지역 매칭 함수 (사용자 입력 지역 → 프리셋 키 찾기)
function findRegionalPreset(userRegion: string): string[] {
  if (!userRegion) {
    // 기본값: 전국 주요 도시
    return ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '수원', '창원', '성남'];
  }

  const normalized = userRegion.trim();
  
  // 직접 매칭
  if (REGIONAL_PRESETS[normalized]) {
    return REGIONAL_PRESETS[normalized];
  }
  
  // 부분 매칭 (예: "부산 해운대" → "부산")
  for (const [key, preset] of Object.entries(REGIONAL_PRESETS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return preset;
    }
  }
  
  // 광역시/도 키워드 매칭
  if (normalized.includes('서울') || normalized.includes('경기')) {
    return REGIONAL_PRESETS['서울'];
  }
  if (normalized.includes('부산') || normalized.includes('경남')) {
    return REGIONAL_PRESETS['부산'];
  }
  if (normalized.includes('대구') || normalized.includes('경북')) {
    return REGIONAL_PRESETS['대구'];
  }
  if (normalized.includes('인천')) {
    return REGIONAL_PRESETS['인천'];
  }
  if (normalized.includes('광주') || normalized.includes('전남')) {
    return REGIONAL_PRESETS['광주'];
  }
  if (normalized.includes('대전') || normalized.includes('충남') || normalized.includes('충북')) {
    return REGIONAL_PRESETS['대전'];
  }
  if (normalized.includes('울산')) {
    return REGIONAL_PRESETS['울산'];
  }
  if (normalized.includes('강원')) {
    return REGIONAL_PRESETS['강원'];
  }
  if (normalized.includes('제주')) {
    return REGIONAL_PRESETS['제주'];
  }
  if (normalized.includes('전북')) {
    return REGIONAL_PRESETS['전북'];
  }
  
  // 매칭 실패 시 기본값
  return ['서울', '부산', '대구', '인천', '광주', '대전'];
}

// 분위기 키워드 랜덤 선택
function getMoodKeyword(): string {
  const keywords = [
    '드라이브',
    '데이트',
    '혼밥',
    '가성비',
    '분위기',
    '현지인',
    '웨이팅',
    '숨은맛집',
    '핫플',
    '맛집',
  ];
  return keywords[Math.floor(Math.random() * keywords.length)];
}

interface LocalItem {
  title: string;
  address: string;
  category: string;
  link?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const menu = searchParams.get('menu');
  const region = searchParams.get('region') || '';

  if (!menu) {
    return NextResponse.json({ error: 'menu parameter is required' }, { status: 400 });
  }

  const cacheKey = `mood:${region}:${menu}`;

  // 캐시 확인 (30분)
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    console.log('Cache hit:', cacheKey);
    return NextResponse.json(cached.data);
  }

  // 네이버 API 인증
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Naver API credentials not configured' },
      { status: 500 }
    );
  }

  try {
    // 근교 지역 리스트 가져오기
    const nearbyRegions = findRegionalPreset(region);
    console.log('Region:', region, '→ Nearby:', nearbyRegions);

    // 분위기 키워드 랜덤 선택
    const moodKeyword = getMoodKeyword();
    console.log('Mood keyword:', moodKeyword);

    // 각 지역별 병렬 검색
    const searchPromises = nearbyRegions.map(async (r) => {
      const query = `${r} ${menu} ${moodKeyword}`;
      const apiUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
        query
      )}&display=5&sort=comment`;

      try {
        const response = await fetch(apiUrl, {
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
          },
        });

        if (!response.ok) {
          console.error(`Naver API failed for ${r}:`, response.status);
          return [];
        }

        const data = await response.json();
        return data.items || [];
      } catch (error) {
        console.error(`Error fetching for ${r}:`, error);
        return [];
      }
    });

    // 모든 결과 수집
    const allResults = await Promise.all(searchPromises);
    const flatResults: any[] = allResults.flat();

    // 중복 제거 (title + address 조합)
    const uniqueMap = new Map<string, LocalItem>();
    for (const item of flatResults) {
      const title = stripHtmlTags(item.title || '');
      const address = item.address || item.roadAddress || '';
      const key = `${title}:${address}`;
      
      if (!uniqueMap.has(key) && title.trim()) {
        uniqueMap.set(key, {
          title,
          address,
          category: item.category || '',
        });
      }
    }

    // 리스트로 변환 (이미 리뷰 많은 순으로 정렬됨)
    const uniqueItems = Array.from(uniqueMap.values());

    // 최종 TOP5
    const top5 = uniqueItems.slice(0, 5);

    const result = { items: top5 };

    // 30분 캐시 저장
    cache.set(cacheKey, {
      data: result,
      expiry: Date.now() + 30 * 60 * 1000,
    });

    console.log(`Found ${top5.length} unique places for ${menu} in ${region}`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Mood places API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mood places' },
      { status: 500 }
    );
  }
}
