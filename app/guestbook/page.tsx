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
            <div className="inline-block px-3 py-1 bg-sage/10 border border-sage/20 rounded-full mb-4">
              <span className="text-xs font-bold text-sage">ספר האורחים של אבא-דס</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">ספר אורחים</h1>
            <p className="text-xl text-muted-theme leading-relaxed max-w-md mx-auto">
              מקום לברכות, זיכרונות ומילים חמות לאבא.
            </p>
            <div className="flex justify-center items-center gap-3 mt-6">
              <div className="h-px w-16 bg-border-theme" />
              <span className="text-xs text-muted-theme/50">רוני נאמן</span>
              <div className="h-px w-16 bg-border-theme" />
            </div>
          </div>

          <Comments slug="guestbook" initialComments={initialComments} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border-theme">
        <div className="max-w-2xl mx-auto px-6 text-center text-muted-theme text-xs">
          <p>© {new Date().getFullYear()} אבא-דס · כתוב ע&quot;י רוני נאמן</p>
        </div>
      </footer>
    </div>
  );
}
