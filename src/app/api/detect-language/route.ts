import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GATEWAYZ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.gatewayz.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a language detection expert. Identify the language of the given text and respond with ONLY the language name in English (e.g., "English", "Spanish", "French", "Japanese", etc.). Do not provide any additional information or explanation.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Language detection failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const detectedLanguage = data.choices?.[0]?.message?.content?.trim() || 'Unknown';

    return NextResponse.json({
      language: detectedLanguage,
    });

  } catch (error) {
    console.error('Language detection error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
