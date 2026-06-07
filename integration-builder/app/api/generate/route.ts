import { NextRequest, NextResponse } from 'next/server';
import { generateIntegration, parseDocumentation } from '@/app/lib/claude';

// Vercel Pro: up to 300 s. Hobby plan ignores this and caps at 10 s.
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { docText, selectedOutputs, userKey, parsedDoc } = await req.json();

    if (!docText) {
      return NextResponse.json({ error: 'docText required' }, { status: 400 });
    }

    let parsed = parsedDoc;
    if (!parsed) {
      parsed = await parseDocumentation(docText, userKey);
    }

    const generated = await generateIntegration(docText, selectedOutputs ?? [], userKey);

    return NextResponse.json({ parsedDoc: parsed, generatedOutput: generated });
  } catch (err: any) {
    if (err.message === 'NO_KEY' || err.status === 401) {
      return NextResponse.json({ error: 'API_KEY_REQUIRED' }, { status: 401 });
    }
    if (err.status === 429) {
      return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });
    }
    console.error('[/api/generate]', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}
