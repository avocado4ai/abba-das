import { NextRequest, NextResponse } from 'next/server';
import { savePost } from '@/lib/posts';
import { getHistoricalWeather } from '@/lib/weather';

export async function POST(req: NextRequest) {
  try {
    const postData = await req.json();
    
    if (!postData.title || !postData.content || !postData.slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch weather if not provided
    if (!postData.weather) {
      try {
        postData.weather = await getHistoricalWeather(postData.date);
      } catch {
        console.error('Weather fetch failed, defaulting to sunny');
        postData.weather = 'sunny';
      }
    }

    const result = await savePost(postData);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save post' },
      { status: 500 }
    );
  }
}
