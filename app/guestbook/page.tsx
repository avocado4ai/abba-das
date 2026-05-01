import { getCommentsForPost } from "@/lib/github";
import Comments from "@/components/Comments";
import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export const metadata = {
  title: "ספר אורחים | אבא-דס",
  description: "כתבו הודעה, ברכה או זיכרון בספר האורחים של אבא.",
};

export default async function GuestbookPage() {
  const initialComments = await getCommentsForPost("guestbook");

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border-theme py-6 transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-navy tracking-tight">
            אבא-דס
          </Link>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-theme hover:text-navy transition-colors">
              חזרה לבלוג
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow py-20">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage/10 text-sage mb-6">
              <MessageSquareText className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-navy mb-4">ספר אורחים</h1>
            <p className="text-xl text-muted-theme leading-relaxed">
              מקום לברכות, זיכרונות ומילים חמות לאבא.
            </p>
          </div>

          <Comments slug="guestbook" initialComments={initialComments} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border-theme bg-navy/5">
        <div className="max-w-2xl mx-auto px-6 text-center text-muted-theme text-sm">
          <p>© {new Date().getFullYear()} אבא-דס. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}
