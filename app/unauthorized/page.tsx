import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/10 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">גישה נדחתה</h1>
          <p className="text-foreground/70">
            אתה לא מאופשר לגשת לדף זה. צור קשר עם מנהל המערכת אם אתה מאמין שזאת טעות.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-sage text-cream rounded-2xl font-bold hover:bg-sage/90 transition-all"
          >
            חזור לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
