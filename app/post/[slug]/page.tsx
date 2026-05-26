import { getCommentsForPost } from "@/lib/github";
import { getPostBySlug, getAdjacentPosts } from "@/lib/posts";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Sun, Cloud, CloudRain, Wind, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import PostNavigation from "@/components/PostNavigation";
import ShareButtons from "@/components/ShareButtons";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Comments from "@/components/Comments";
import AudioPlayer from "@/components/AudioPlayer";
import StoryImage from "@/components/StoryImage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) return { title: "הסיפור לא נמצא" };

  const description = post.content.substring(0, 160).replace(/\n/g, ' ');

  return {
    title: `${post.title} | אבא-דס`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.date,
      url: `https://abba-das.vercel.app/post/${slug}`,
    },
  };
}

const WeatherIcon = ({ weather }: { weather?: string }) => {
  switch (weather?.toLowerCase()) {
    case "sunny":
      return <Sun className="w-5 h-5 text-yellow-500" />;
    case "cloudy":
      return <Cloud className="w-5 h-5 text-gray-400" />;
    case "rainy":
      return <CloudRain className="w-5 h-5 text-blue-400" />;
    case "windy":
      return <Wind className="w-5 h-5 text-teal-400" />;
    default:
      return <Sun className="w-5 h-5 text-yellow-500" />;
  }
};

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { next, prev } = await getAdjacentPosts(slug);
  const initialComments = await getCommentsForPost(slug);
  
  // Calculate reading time (~200 words per minute)
  const words = post.content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-sage/30 transition-colors duration-300">
      <ReadingProgressBar />
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border-theme py-3 sm:py-4 md:py-6 transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl md:text-3xl font-bold text-navy tracking-tight hover:text-coral transition-colors duration-250">
            אבא-דס
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeSwitcher />
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-theme hover:text-coral transition-colors duration-250">
              חזרה לבלוג
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* Story Image Hero */}
      <div className="w-full h-56 sm:h-72 md:h-96 mb-8 sm:mb-12">
        <StoryImage slug={slug} title={post.title} className="h-full" />
      </div>

      <main className="grow py-8 sm:py-12 md:py-20">
        <article className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-start mb-6 sm:mb-8 gap-4">
            <div className="space-y-3 sm:space-y-4 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm font-medium text-muted-theme">
                  {post.date ? format(new Date(post.date), "dd MMMM yyyy", { locale: he }) : "תאריך לא ידוע"}
                </span>
                <div className="w-1 h-1 rounded-full bg-border-theme" />
                <WeatherIcon weather={post.weather} />
                <div className="w-1 h-1 rounded-full bg-border-theme" />
                <div className="flex items-center gap-1 text-xs sm:text-sm font-medium text-muted-theme">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                  <span>{readingTime} דק&apos; קריאה</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy leading-tight">
                {post.title}
              </h1>
              <AudioPlayer text={post.content} />
            </div>
            <FavoriteButton slug={slug} />
          </div>

          <div className="font-stories text-lg sm:text-xl text-foreground leading-[1.85] whitespace-pre-wrap py-2">
            {post.content}
          </div>

          <ShareButtons title={post.title} slug={slug} />
          
          <Comments slug={slug} initialComments={initialComments} />
          
          <PostNavigation next={next} prev={prev} />
        </article>
      </main>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border-theme">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center text-muted-theme text-xs sm:text-sm">
          <p>© {new Date().getFullYear()} אבא-דס. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}
