import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug, savePost } from '@/lib/posts';
import { auth } from '@/auth';

const GALLERY_SLUG = 'gallery-uploads';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { src, caption, alt } = await req.json() as { src: string; caption?: string; alt?: string };
  if (!src) return NextResponse.json({ error: 'Missing src' }, { status: 400 });

  let post = await getPostBySlug(GALLERY_SLUG);

  if (!post) {
    post = {
      title: 'תמונות גלריה',
      slug: GALLERY_SLUG,
      content: 'אוסף תמונות גלריה עצמאיות.',
      date: new Date().toISOString(),
      contentType: 'photo',
      category: 'moments',
      archived: true,
      gallery: [],
    };
  }

  const gallery = [...(post.gallery || []), { src, alt: alt || '', caption: caption || '' }];
  await savePost({ ...post, gallery });

  return NextResponse.json({ success: true });
}
