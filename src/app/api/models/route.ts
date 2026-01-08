import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GATEWAYZ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const provider = searchParams.get('provider');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    const gateway = searchParams.get('gateway') || 'openrouter';

    // Build query string
    const queryParams = new URLSearchParams({
      limit,
      offset,
      gateway,
      include_huggingface: 'false',
    });

    if (provider) {
      queryParams.append('provider', provider);
    }

    const response = await fetch(`https://api.gatewayz.ai/v1/models?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch models', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error('Models fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
