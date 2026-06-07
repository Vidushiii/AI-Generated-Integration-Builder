import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'url required' }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IntegrationBuilder/1.0)',
        Accept: 'text/html,text/plain,application/json',
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${res.status} ${res.statusText}` },
        { status: 400 }
      );
    }

    const contentType = res.headers.get('content-type') ?? '';
    let text = await res.text();

    // Strip HTML tags to extract readable text
    if (contentType.includes('text/html')) {
      text = text
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    // Cap at 100k chars to avoid overwhelming the model
    const truncated = text.slice(0, 100_000);
    return NextResponse.json({ text: truncated, truncated: text.length > 100_000 });
  } catch (err: any) {
    console.error('[/api/fetch-docs]', err);
    return NextResponse.json({ error: err.message ?? 'Failed to fetch URL' }, { status: 500 });
  }
}
