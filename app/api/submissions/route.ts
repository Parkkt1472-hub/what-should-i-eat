import { NextRequest, NextResponse } from 'next/server';

// 간단한 메모리 DB (실제 배포 시 Supabase로 교체)
interface LocalSubmission {
  id: string;
  user_id: string;
  restaurant_name: string;
  region: string;
  description: string;
  image_url?: string;
  status: 'pending' | 'approved';
  created_at: string;
}

const submissionsDB: LocalSubmission[] = [];

/**
 * GET /api/submissions
 * 제보 목록 조회 (approved만)
 */
export async function GET(request: NextRequest) {
  const approved = submissionsDB.filter(s => s.status === 'approved');
  
  // 최신순 정렬
  approved.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // 사용자 ID 마스킹 (abc...123)
  const masked = approved.map(s => ({
    ...s,
    user_id: maskUserId(s.user_id),
  }));

  return NextResponse.json({ items: masked });
}

/**
 * POST /api/submissions
 * 제보 등록
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, restaurant_name, region, description, image_url } = body;

    if (!user_id || !restaurant_name || !region || !description) {
      return NextResponse.json(
        { error: 'user_id, restaurant_name, region, description are required' },
        { status: 400 }
      );
    }

    const submission: LocalSubmission = {
      id: generateId(),
      user_id,
      restaurant_name,
      region,
      description,
      image_url: image_url || undefined,
      status: 'approved', // 초기엔 자동 승인 (운영 편의)
      created_at: new Date().toISOString(),
    };

    submissionsDB.push(submission);

    console.log('[Submissions] New submission:', submission.id, restaurant_name);

    return NextResponse.json({
      message: 'Submission created',
      submission: {
        ...submission,
        user_id: maskUserId(submission.user_id),
      },
    });
  } catch (error) {
    console.error('[Submissions API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function maskUserId(userId: string): string {
  if (userId.length <= 6) return userId;
  const start = userId.substring(0, 3);
  const end = userId.substring(userId.length - 3);
  return `${start}...${end}`;
}
