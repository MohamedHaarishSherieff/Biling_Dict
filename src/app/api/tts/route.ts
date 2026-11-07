import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const text = searchParams.get('text');
  const lang = (searchParams.get('lang') || 'en').toLowerCase();

  if (!text || !text.trim()) {
    return new NextResponse('Text parameter is required', { status: 400 });
  }

  // Map language codes to supported TTS codes
  const validLangs = ['ta', 'te', 'kn', 'ml', 'hi', 'en'];
  const targetLang = validLangs.includes(lang) ? lang : 'en';

  try {
    const encoded = encodeURIComponent(text.trim());
    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${targetLang}&client=tw-ob`;

    const res = await fetch(googleTTSUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!res.ok) {
      return new NextResponse('Failed to fetch audio from TTS provider', { status: 502 });
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new NextResponse(`TTS Error: ${message}`, { status: 500 });
  }
}
