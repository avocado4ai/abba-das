import { NextRequest, NextResponse } from 'next/server';
import { savePostToGitHub } from '@/lib/github';

export async function POST(req: NextRequest) {
  try {
    const postData = await req.json();
    
    if (!postData.title || !postData.content || !postData.slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await savePostToGitHub(postData);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save post' }, { status: 500 });
  }
}
