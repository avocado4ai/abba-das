import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, getPostBySlug, savePost, deletePost, type PostData } from '@/lib/posts';
import { auth } from '@/auth';

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'create-example-stories') {
      const exampleStories: PostData[] = [
        {
          title: 'הסיפור של הדרך הארוכה',
          slug: 'the-long-path',
          date: new Date().toISOString(),
          weather: 'sunny',
          tags: ['טיול', 'זכרונות', 'משפחה'],
          content: `היום החלטנו ללכת בדרך שלא הכרנו מעולם. הדרך היתה ארוכה וקשה, אבל הנופים היו מדהימים.

לאורך הדרך, שמעתי סיפורים של אנשים שעברו כאן לפני שנים רבות. כל אבן, כל עץ, היו לי חלק מהיסטוריה.

בקצה הדרך, ישבנו וצפינו בשקיעה יפה. זה היה רגע שאני לעולם לא אשכח.`,
        },
        {
          title: 'ערב סיפורים עם הנכדים',
          slug: 'stories-with-grandchildren',
          date: new Date(Date.now() - 86400000).toISOString(),
          weather: 'cloudy',
          tags: ['משפחה', 'ילדים', 'ערב'],
          content: `הילדים התאספו סביב השולחן, וביקשו ממני להספר סיפורים. התחלתי בסיפור על המימד הרחוק של ילדותי.

הילדים היו משוקעים לחלוטין בכל מילה. הם ביקשו לשמוע עוד ועוד.

למדתי שהחיים הטובים ביותר הם לא בדברים חומריים, אלא ברגעים שאנחנו משתפים עם אלה שאנחנו אוהבים.`,
        },
        {
          title: 'ביום היום שלי',
          slug: 'my-birthday',
          date: new Date(Date.now() - 172800000).toISOString(),
          weather: 'sunny',
          tags: ['חגיגה', 'חברים', 'אהבה'],
          content: `בהיום שלי, הכל התאסף סביבי. חברים, משפחה, וגם אנשים שלא הכרתי טוב.

כל אחד הביא איתו סיפור, זיכרון, או פשוט חיוך. התחושה היתה מלאה.

קיבלתי מתנות רבות, אבל המתנה הגדולה ביותר היתה הנוכחות של כל אלה.`,
        },
        {
          title: 'בוקר בגן',
          slug: 'morning-in-garden',
          date: new Date(Date.now() - 259200000).toISOString(),
          weather: 'sunny',
          tags: ['טבע', 'בוקר', 'שקט'],
          content: `התעוררתי מוקדם בבוקר. השמש זה עתה עלתה, והעולם היה שקט לחלוטין.

יצאתי לגן שלי. הפרחים נראו בטריים, הטל עדיין על העלים.

ישבתי שם למשך שעה, פשוט תופס את היופי של הרגע. זה היה מושלם.`,
        },
        {
          title: 'נסיעה בתרן לאבא',
          slug: 'car-trip-memories',
          date: new Date(Date.now() - 345600000).toISOString(),
          weather: 'cloudy',
          tags: ['נסיעה', 'זכרונות', 'דרך'],
          content: `כשהייתי צעיר יותר, היו לנו נסיעות במכונה עם אבא. הוא היה נוהג בעדינות וספר סיפורים לאורך כל הדרך.

אני זוכר שהסתכלתי מהחלון והחלמתי על תכניות עתידיות.

היום אני מבין שאותן נסיעות היו הרגעים החשובים ביותר בחיי.`,
        },
      ];

      const results = [];
      for (const story of exampleStories) {
        try {
          const result = await savePost(story);
          results.push({ slug: story.slug, status: 'success', result });
        } catch (error) {
          console.error(`Error saving ${story.slug} locally:`, error);
          results.push({ slug: story.slug, status: 'error', error: String(error) });
        }
      }

      return NextResponse.json({
        message: 'Example stories creation attempted locally',
        results,
      });
    }

    // Regular POST for creating a single post
    const { title, slug, content, date, weather, tags, featuredImage, contentType, category } = body;
    const post: PostData = {
      title,
      slug,
      content,
      date: date || new Date().toISOString(),
      weather: weather || 'sunny',
      tags: tags || [],
      featuredImage,
      contentType,
      category,
    };

    const result = await savePost(post);
    return NextResponse.json({ message: 'Post created successfully', result });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to create post', details: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, type, index, showInGallery } = await request.json() as {
      slug: string;
      type: 'featured' | 'gallery';
      index?: number;
      showInGallery: boolean;
    };

    if (!slug || !type || typeof showInGallery !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (type === 'featured' && post.featuredImage) {
      post.featuredImage = { ...post.featuredImage, showInGallery };
    } else if (type === 'gallery' && post.gallery && typeof index === 'number') {
      post.gallery = post.gallery.map((img, i) =>
        i === index ? { ...img, showInGallery } : img
      );
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await savePost(post);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/posts error:', error);
    return NextResponse.json({ error: 'Failed to update gallery setting' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    await deletePost(slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
