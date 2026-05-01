import { getAllPosts } from "@/lib/github";
import PostList from "@/components/PostList";
import ExportButton from "@/components/ExportButton";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import DynamicStats from "@/components/DynamicStats";
import OnThisDay from "@/components/OnThisDay";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-sage/30 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border-theme py-6 transition-colors duration-300 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-foreground tracking-tight hover:text-sage transition-colors">
            אבא-דס
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/guestbook" className="text-sm font-medium text-muted-theme hover:text-sage transition-colors hover:underline">
              ספר אורחים
            </Link>
            <ThemeSwitcher />
            <ExportButton posts={posts} />
            <Link href="/admin" className="text-sm font-medium text-muted-theme hover:text-sage transition-colors hover:underline">
              ניהול
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-sage/5 via-transparent to-transparent" />
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none flex justify-center items-center">
            <Image src="/hero-illustration.svg" alt="" width={800} height={400} className="w-full max-w-4xl object-cover blur-sm" priority />
          </div>
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-sage/10 border border-sage/30 rounded-full mb-6">
            <span className="text-sm font-bold text-sage">סיפורים שלנו</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
            הסיפורים של אבא
          </h2>

          <div className="flex justify-center mb-8">
            <Image src="/ornament.svg" alt="" width={200} height={40} className="h-8 w-auto opacity-60" priority />
          </div>

          <p className="text-lg md:text-xl text-foreground/70 max-w-xl mx-auto leading-relaxed mb-16 font-stories">
            זכרונות, מחשבות ורגעים קטנים מהחיים, כפי שתועדו בבוקר של יום חדש.
          </p>

          <div className="flex justify-center">
            <DynamicStats posts={posts} />
          </div>
        </div>
      </section>

      {/* Posts Feed */}
      <main className="flex-grow pb-32">
        <div className="max-w-2xl mx-auto px-6">
          <OnThisDay posts={posts} />
          <PostList initialPosts={posts} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t border-border-theme bg-white/2 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-theme">
              © {new Date().getFullYear()} אבא-דס. כל הזכויות שמורות.
            </p>
            <p className="text-xs text-muted-theme/60">
              עשויה באהבה עם ❤️ עבור משפחתנו
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
