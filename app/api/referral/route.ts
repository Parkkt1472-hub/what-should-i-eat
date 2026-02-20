import { NextRequest, NextResponse } from 'next/server';

// 메모리 기반 간단 DB (실제 배포 시 Supabase/Firebase로 교체)
// 구조: { referrerId: Set<referredId> }
const referralDB = new Map<string, Set<string>>();

/**
 * GET /api/referral?anon_id=xxx
 * 특정 사용자의 추천 카운트 조회
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const anonId = searchParams.get('anon_id');

  if (!anonId) {
    return NextResponse.json({ error: 'anon_id is required' }, { status: 400 });
  }

  const referrals = referralDB.get(anonId);
  const shareCount = referrals ? referrals.size : 0;

  return NextResponse.json({
    anon_id: anonId,
    share_count: shareCount,
  });
}

/**
 * POST /api/referral
 * 추천 관계 기록
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrer_id, referred_id } = body;

    if (!referrer_id || !referred_id) {
      return NextResponse.json(
        { error: 'referrer_id and referred_id are required' },
        { status: 400 }
      );
    }

    // 자기 자신 추천 방지
    if (referrer_id === referred_id) {
      return NextResponse.json(
        { error: 'Self-referral is not allowed' },
        { status: 400 }
      );
    }

    // Referrer의 추천 목록 가져오기 (없으면 생성)
    if (!referralDB.has(referrer_id)) {
      referralDB.set(referrer_id, new Set());
    }

    const referrals = referralDB.get(referrer_id)!;

    // 중복 추천 방지
    if (referrals.has(referred_id)) {
      return NextResponse.json(
        { message: 'Already referred', share_count: referrals.size },
        { status: 200 }
      );
    }

    // 추천 추가
    referrals.add(referred_id);

    console.log(
      `[Referral] ${referrer_id} referred ${referred_id} (total: ${referrals.size})`
    );

    return NextResponse.json({
      message: 'Referral recorded',
      referrer_id,
      referred_id,
      share_count: referrals.size,
    });
  } catch (error) {
    console.error('[Referral API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
