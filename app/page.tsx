import { getAllPosts } from "@/lib/github";
import PostList from "@/components/PostList";
import ExportButton from "@/components/ExportButton";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import DynamicStats from "@/components/DynamicStats";
import OnThisDay from "@/components/OnThisDay";
import ContentTypeGuide from "@/components/ContentTypeGuide";
import Image from "next/image";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-sage/30 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border-theme py-3 sm:py-4 md:py-6 transition-colors duration-300 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight hover:text-coral transition-colors duration-250">
            אבא-דס
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/guestbook" className="text-sm font-medium text-muted-theme hover:text-coral transition-colors duration-250 hover:underline">
              ספר אורחים
            </Link>
            <ThemeSwitcher />
            <ExportButton posts={posts} />
            <Link href="/admin" className="text-sm font-medium text-muted-theme hover:text-coral transition-colors duration-250 hover:underline">
              ניהול
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2 sm:gap-4">
            <ThemeSwitcher />
            <MobileNav posts={posts} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-8 sm:py-16 md:py-32 px-4 sm:px-6 overflow-hidden">
        {/* Gradient Background with Decorative Elements */}
        <div className="absolute inset-0 -z-10">
          {/* Main gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-sage/5 via-transparent to-transparent" />

          {/* Decorative glowing elements */}
          <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-40 sm:w-64 h-40 sm:h-64 bg-coral/10 rounded-full blur-3xl animate-glow" />
          <div className="absolute -bottom-10 sm:bottom-20 left-5 sm:left-10 w-48 sm:w-80 h-48 sm:h-80 bg-warm-gold/5 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1s' }} />
          <div className="hidden sm:block absolute top-1/2 left-1/2 w-96 h-96 bg-teal/5 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }} />

          {/* Hero illustration */}
          <div className="absolute inset-0 z-0 opacity-15 sm:opacity-25 pointer-events-none flex justify-center items-center">
            <Image src="/hero-illustration.svg" alt="" width={800} height={400} className="w-full max-w-4xl object-cover blur-sm" priority />
          </div>
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          {/* Badge with new color */}
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-coral/10 to-warm-gold/10 border border-coral/30 rounded-full mb-3 sm:mb-6 animate-fadeInUp">
            <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-coral to-warm-gold bg-clip-text text-transparent">סיפורים שלנו</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-3 sm:mb-6 leading-tight tracking-tight animate-fadeInUp">
            הסיפורים של אבא
          </h2>

          {/* Decorative line with accent colors */}
          <div className="flex justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 px-4">
            <div className="w-8 sm:w-12 h-1 bg-coral/40 rounded-full" />
            <div className="w-8 sm:w-12 h-1 bg-warm-gold/40 rounded-full" />
            <div className="w-8 sm:w-12 h-1 bg-teal/40 rounded-full" />
            <Image src="/ornament.svg" alt="" width={200} height={40} className="h-6 sm:h-8 w-auto opacity-60 mx-1 sm:mx-2" priority />
            <div className="w-8 sm:w-12 h-1 bg-teal/40 rounded-full" />
            <div className="w-8 sm:w-12 h-1 bg-warm-gold/40 rounded-full" />
            <div className="w-8 sm:w-12 h-1 bg-coral/40 rounded-full" />
          </div>

          <p className="text-sm sm:text-base md:text-xl text-foreground/70 max-w-xl mx-auto leading-relaxed mb-8 sm:mb-16 font-stories animate-fadeInUp px-2">
            זכרונות, מחשבות ורגעים קטנים מהחיים, כפי שתועדו בבוקר של יום חדש.
          </p>

          <div className="flex justify-center animate-fadeInUp">
            <DynamicStats posts={posts} />
          </div>
        </div>
      </section>

      {/* Content Type Guide */}
      <section className="pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <ContentTypeGuide />
        </div>
      </section>

      {/* Posts Feed */}
      <main className="flex-grow pb-16 sm:pb-32">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <OnThisDay posts={posts} />
          <PostList initialPosts={posts} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 sm:py-16 border-t border-border-theme bg-white/2 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="space-y-2 sm:space-y-4">
            <p className="text-xs sm:text-sm font-medium text-muted-theme">
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
