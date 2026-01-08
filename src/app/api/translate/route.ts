import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage, explainMode, model } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
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

    // Create a prompt for translation with optional explanation
    let systemPrompt = `You are a professional translator. Translate the following text from ${sourceLanguage || 'detected language'} to ${targetLanguage}. `;

    if (explainMode) {
      systemPrompt += `If there are any phrases, idioms, or cultural nuances that don't translate cleanly, add a brief explanation in parentheses after the translation. Keep explanations concise and helpful.`;
    } else {
      systemPrompt += `Provide only the direct translation without any explanations or additional context.`;
    }

    // Use the selected model or fallback to default
    const selectedModel = model || 'gpt-4o-mini';

    const response = await fetch('https://api.gatewayz.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Translation failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      translatedText,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage,
      model: data.model || selectedModel,
    });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
