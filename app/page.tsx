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
import { Camera } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-sage/30 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border-theme py-2.5 sm:py-4 md:py-6 transition-colors duration-300 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-row-reverse md:flex-row justify-between items-center">
          <Link href="/" className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight hover:text-coral transition-colors duration-250">
            אבא-דס
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/guestbook" className="text-sm font-medium text-muted-theme hover:text-coral transition-colors duration-250 hover:underline">
              ספר אורחים
            </Link>
            <Link href="/gallery" className="flex items-center gap-1.5 text-sm font-medium text-muted-theme hover:text-coral transition-colors duration-250 hover:underline">
              <Camera className="w-4 h-4" aria-hidden="true" />
              גלריה
            </Link>
            <ThemeSwitcher />
            <ExportButton posts={posts} />
            <Link href="/admin" className="text-sm font-medium text-muted-theme hover:text-coral transition-colors duration-250 hover:underline">
              ניהול
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2 sm:gap-4">
            <MobileNav posts={posts} />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-6 sm:py-14 md:py-18 px-4 sm:px-6 overflow-hidden">
        {/* Gradient Background with Decorative Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-sage/5 via-transparent to-transparent" />
          {/* Decorative blobs */}
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-sage/8 blur-3xl animate-blob opacity-70" />
          <div className="absolute top-10 right-1/4 w-64 h-64 rounded-full bg-coral/6 blur-3xl animate-blob animation-delay-2000 opacity-60" />
          <div className="absolute bottom-0 left-1/2 w-56 h-56 rounded-full bg-warm-gold/5 blur-3xl animate-blob animation-delay-4000 opacity-50" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Badge with new color */}
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-linear-to-r from-coral/10 to-warm-gold/10 border border-coral/30 rounded-full mb-2 sm:mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <span className="text-xs sm:text-sm font-bold bg-linear-to-r from-coral to-warm-gold bg-clip-text text-transparent">סיפורים שלנו</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-foreground mb-2 sm:mb-6 leading-tight tracking-tight animate-fadeInUp" style={{ animationDelay: '0.25s' }}>
            הסיפורים של אבא
          </h2>

          {/* Decorative divider */}
          <div className="hidden sm:flex justify-center items-center gap-2 mb-6 sm:mb-8">
            <div className="w-24 h-px bg-linear-to-r from-transparent to-coral/50" />
            <Image src="/ornament.svg" alt="" width={160} height={32} className="h-7 w-auto opacity-50" priority />
            <div className="w-24 h-px bg-linear-to-l from-transparent to-coral/50" />
          </div>

          <figure className="relative mx-auto mb-4 sm:mb-8 max-w-[160px] sm:max-w-sm animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-sage/20 via-coral/10 to-warm-gold/20 blur-sm" />
            <div className="relative overflow-hidden rounded-xl border border-border-theme bg-background shadow-xl transition-transform duration-500 hover:-rotate-1">
              <Image
                src="/images/abba-ima-beach.webp"
                alt="אבא ואימא ליד הים - צילום ראליסטי"
                width={512}
                height={512}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </figure>

          <p className="hidden sm:block text-base md:text-xl text-foreground/80 max-w-xl mx-auto leading-relaxed mb-10 font-stories animate-fadeInUp px-2" style={{ animationDelay: '0.55s' }}>
            זכרונות, מחשבות ורגעים קטנים מהחיים, כפי שתועדו בבוקר של יום חדש.
          </p>

          <div className="flex justify-center animate-fadeInUp mt-2 sm:mt-0" style={{ animationDelay: '0.7s' }}>
            <DynamicStats posts={posts} />
          </div>
        </div>
      </section>

      {/* Posts Feed */}
      <main id="stories" className="grow pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <OnThisDay posts={posts} />
          <PostList initialPosts={posts} />
        </div>
      </main>

      {/* Content Type Guide */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <ContentTypeGuide />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-14 border-t border-border-theme bg-foreground/[0.02]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 mb-8">
            {/* Brand */}
            <div className="text-center sm:text-right">
              <p className="font-bold text-foreground text-lg mb-1">אבא-דס</p>
              <p className="text-xs text-muted-theme leading-relaxed">סיפורים, זכרונות ורגעים<br />מחיי הכותב</p>
            </div>
            {/* Links */}
            <div className="text-center">
              <p className="font-bold text-foreground text-sm mb-3">קישורים</p>
              <div className="flex flex-col gap-2">
                <Link href="/guestbook" className="text-xs text-muted-theme hover:text-coral transition-colors no-underline">ספר אורחים</Link>
                <Link href="/print" className="text-xs text-muted-theme hover:text-coral transition-colors no-underline">הדפסת סיפורים</Link>
                <Link href="/feed.xml" className="text-xs text-muted-theme hover:text-coral transition-colors no-underline">פיד RSS</Link>
              </div>
            </div>
            {/* Author */}
            <div className="text-center sm:text-left">
              <p className="font-bold text-foreground text-sm mb-1">הכותב</p>
              <p className="text-sm text-foreground font-medium">רוני נעמן</p>
              <p className="text-xs text-muted-theme mt-1">עשויה באהבה עבור המשפחה</p>
            </div>
          </div>
          <div className="border-t border-border-theme pt-5 text-center">
            <p className="text-xs text-muted-theme/60" suppressHydrationWarning>
              © {new Date().getFullYear()} אבא-דס. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
