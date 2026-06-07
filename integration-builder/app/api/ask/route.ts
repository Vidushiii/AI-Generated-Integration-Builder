import { NextRequest, NextResponse } from 'next/server';
import { askAboutDoc } from '@/app/lib/claude';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { docText, question, userKey } = await req.json();

    if (!docText || !question) {
      return NextResponse.json({ error: 'docText and question required' }, { status: 400 });
    }

    const answer = await askAboutDoc(docText, question, userKey);
    return NextResponse.json({ answer });
  } catch (err: any) {
    if (err.message === 'NO_KEY' || err.status === 401) {
      return NextResponse.json({ error: 'API_KEY_REQUIRED' }, { status: 401 });
    }
    if (err.status === 429) {
      return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });
    }
    console.error('[/api/ask]', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}
