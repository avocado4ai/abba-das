import { getAllPosts } from "@/lib/github";
import PostList from "@/components/PostList";
import ExportButton from "@/components/ExportButton";

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="flex flex-col min-h-screen bg-cream selection:bg-sage/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-cream/80 backdrop-blur-md border-b border-navy/10 py-6">
        <div className="max-w-2xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-navy tracking-tight">אבא-דס</h1>
          <div className="flex items-center gap-4">
            <ExportButton posts={posts} />
            <a href="/admin" className="text-sm font-medium text-navy/60 hover:text-navy transition-colors">
              ניהול
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4 leading-tight">
            הסיפורים של אבא
          </h2>
          <p className="text-xl text-navy/70 max-w-lg mx-auto leading-relaxed">
            זכרונות, מחשבות ורגעים קטנים מהחיים, כפי שתועדו בבוקר של יום חדש.
          </p>
        </div>
      </section>

      {/* Posts Feed */}
      <main className="flex-grow pb-32">
        <div className="max-w-2xl mx-auto px-6">
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
