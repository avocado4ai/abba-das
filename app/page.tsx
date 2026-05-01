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
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border-theme py-6 transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-navy tracking-tight">אבא-דס</h1>
          <div className="flex items-center gap-4">
            <Link href="/guestbook" className="text-sm font-medium text-muted-theme hover:text-navy transition-colors">
              ספר אורחים
            </Link>
            <ThemeSwitcher />
            <ExportButton posts={posts} />
            <Link href="/admin" className="text-sm font-medium text-muted-theme hover:text-navy transition-colors">
              ניהול
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none flex justify-center items-center">
          <Image src="/hero-illustration.svg" alt="" width={800} height={400} className="w-full max-w-4xl object-cover" priority />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4 leading-tight">
            הסיפורים של אבא
          </h2>
          <div className="flex justify-center mb-6">
            <Image src="/ornament.svg" alt="" width={200} height={40} className="h-6 w-auto opacity-60" priority />
          </div>
          <p className="text-xl text-navy/70 max-w-lg mx-auto leading-relaxed mb-12">
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
      <footer className="py-12 border-t border-navy/5 bg-navy/5">
        <div className="max-w-2xl mx-auto px-6 text-center text-navy/40 text-sm">
          <p>© {new Date().getFullYear()} אבא-דס. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}
