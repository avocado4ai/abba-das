import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";
import ExportButton from "@/components/ExportButton";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import DynamicStats from "@/components/DynamicStats";
import OnThisDay from "@/components/OnThisDay";
import ContentTypeGuide from "@/components/ContentTypeGuide";
import Image from "next/image";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";

export const dynamic = "force-dynamic";

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
      <section className="relative py-10 sm:py-14 md:py-18 px-4 sm:px-6 overflow-hidden">
        {/* Gradient Background with Decorative Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-b from-sage/5 via-transparent to-transparent" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Badge with new color */}
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-linear-to-r from-coral/10 to-warm-gold/10 border border-coral/30 rounded-full mb-3 sm:mb-6 animate-fadeInUp">
            <span className="text-xs sm:text-sm font-bold bg-linear-to-r from-coral to-warm-gold bg-clip-text text-transparent">סיפורים שלנו</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-3 sm:mb-6 leading-tight tracking-tight animate-fadeInUp">
            הסיפורים של אבא
          </h2>

          {/* Decorative divider */}
          <div className="flex justify-center items-center gap-2 mb-6 sm:mb-8">
            <div className="w-16 sm:w-24 h-px bg-linear-to-r from-transparent to-coral/50" />
            <Image src="/ornament.svg" alt="" width={160} height={32} className="h-5 sm:h-7 w-auto opacity-50" priority />
            <div className="w-16 sm:w-24 h-px bg-linear-to-l from-transparent to-coral/50" />
          </div>

          <figure className="mx-auto mb-6 sm:mb-8 max-w-xs sm:max-w-sm overflow-hidden rounded-lg border border-border-theme bg-background shadow-xl animate-fadeInUp">
            <Image
              src="/images/abba-ima-gemini-portrait.svg"
              alt="אבא ואימא ליד הים"
              width={512}
              height={512}
              className="h-auto w-full object-cover"
              priority
            />
          </figure>

          <p className="text-sm sm:text-base md:text-xl text-foreground/80 max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10 font-stories animate-fadeInUp px-2">
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
      <main className="grow pb-16 sm:pb-32">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <OnThisDay posts={posts} />
          <PostList initialPosts={posts} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border-theme">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="space-y-1.5">
            <p className="text-xs sm:text-sm font-medium text-muted-theme">
              © {new Date().getFullYear()} אבא-דס. כל הזכויות שמורות.
            </p>
            <p className="text-xs text-muted-theme/50">
              עשויה באהבה עבור משפחתנו
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
