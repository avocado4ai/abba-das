'use client';

import { useState, useEffect, Suspense } from "react";
import { Loader2, LogIn, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

async function handleSignInAction(callbackUrl: string) {
  'use server';
  const { signIn } = await import("@/auth");
  try {
    await signIn("authelia", {
      redirectTo: callbackUrl
    });
  } catch (err) {
    console.error('Server sign in error:', err);
    throw err;
  }
}

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  useEffect(() => {
    const errorCode = searchParams.get('error');
    if (errorCode === 'AccessDenied') {
      setError('גישה נדחתה. אנא בדוק שיש לך הרשאות הנדרשות.');
    } else if (errorCode) {
      setError('אירעה שגיאה בהתחברות. אנא נסה שוב.');
    }
  }, [searchParams]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await handleSignInAction(callbackUrl);
    } catch (err) {
      console.error('Sign in error:', err);
      setError('נכשל בהתחברות. אנא נסה שוב.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sage/5 via-background to-background px-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <Image
              src="/ornament.svg"
              alt=""
              width={100}
              height={40}
              className="h-10 w-auto opacity-80"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            אבא-דס
          </h1>
          <p className="text-foreground/70 text-lg">
            ניהול סיפורים
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white/5 rounded-3xl border border-border-theme p-8 shadow-lg space-y-6">
          {/* Error Message */}
          {error && (
            <div
              className="p-4 rounded-xl flex items-center gap-3 bg-red-500/10 border border-red-500/20"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* Info Message */}
          <div className="p-4 rounded-xl flex items-start gap-3 bg-sage/10 border border-sage/20">
            <div className="text-sm text-sage leading-relaxed">
              <p className="font-bold mb-1">התחברות דרוש</p>
              <p className="text-sage/80">
                אתה צריך להתחבר כדי לגשת לדף ניהול הסיפורים.
              </p>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-coral to-warm-gold hover:from-coral/90 hover:to-warm-gold/90 text-cream px-6 py-4 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-coral/50 focus:ring-offset-2 transition-all duration-250 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>מתחבר...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" aria-hidden="true" />
                <span>התחברות דרך Authelia</span>
              </>
            )}
          </button>

          {/* Help Text */}
          <p className="text-xs text-muted-theme text-center">
            אם יש לך בעיות בהתחברות, צור קשר עם מנהל המערכת
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-theme/60">
          © {new Date().getFullYear()} אבא-דס. כל הזכויות שמורות.
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
