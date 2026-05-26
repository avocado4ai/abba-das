'use client';

import { useState, Suspense } from "react";
import { Loader2, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { handleCredentialsSignIn, handleSignInAction } from "@/app/auth/actions";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthCallbackError: 'שגיאה בהתחברות דרך Authelia. נסה שם משתמש וסיסמה.',
  AccessDenied: 'גישה נדחתה. אין לך הרשאות לדף זה.',
  CredentialsSignin: 'שם משתמש או סיסמה שגויים.',
};

function SignInContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSSOLoading, setIsSSOLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const errorCode = searchParams.get('error');
  const displayError = error ?? (errorCode ? (ERROR_MESSAGES[errorCode] ?? 'אירעה שגיאה בהתחברות.') : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      await handleCredentialsSignIn(username.trim(), password, callbackUrl);
    } catch (err: any) {
      // Next redirects throw — anything else is a real error
      if (err?.message?.includes('NEXT_REDIRECT')) throw err;
      setError(ERROR_MESSAGES.CredentialsSignin);
      setIsLoading(false);
    }
  };

  const handleSSO = async () => {
    setIsSSOLoading(true);
    setError(null);
    try {
      await handleSignInAction(callbackUrl);
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT')) throw err;
      setError('שגיאה בהפניה ל-Authelia.');
      setIsSSOLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-sage/5 via-background to-background px-6">
      <div className="w-full max-w-sm space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <Image src="/ornament.svg" alt="" width={100} height={40} className="h-10 w-auto opacity-80" priority />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">אבא-דס</h1>
          <p className="text-muted-theme text-base">כניסה לניהול</p>
        </div>

        {/* Card */}
        <div className="bg-white/8 rounded-3xl border border-border-theme p-8 shadow-sm space-y-5">

          {/* Error */}
          {displayError && (
            <div className="p-3 rounded-xl flex items-center gap-3 bg-red-500/10 border border-red-500/20" role="alert">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
              <p className="text-sm font-medium text-red-600">{displayError}</p>
            </div>
          )}

          {/* Credentials form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-medium text-foreground">
                שם משתמש
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading || isSSOLoading}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-border-theme text-foreground placeholder:text-muted-theme focus:outline-none focus:ring-2 focus:ring-sage/50 disabled:opacity-50 text-base"
                placeholder="hadas-abba"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                סיסמה
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading || isSSOLoading}
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-white/5 border border-border-theme text-foreground placeholder:text-muted-theme focus:outline-none focus:ring-2 focus:ring-sage/50 disabled:opacity-50 text-base"
                  placeholder="••••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-theme hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                    : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isSSOLoading || !username.trim() || !password}
              aria-busy={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-coral to-warm-gold hover:from-coral/90 hover:to-warm-gold/90 text-cream px-6 py-3.5 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-coral/50 focus:ring-offset-2 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /><span>מתחבר...</span></>
                : <><LogIn className="w-4 h-4" aria-hidden="true" /><span>כניסה</span></>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border-theme" />
            <span className="text-xs text-muted-theme">או</span>
            <div className="flex-1 h-px bg-border-theme" />
          </div>

          {/* SSO fallback */}
          <button
            onClick={handleSSO}
            disabled={isLoading || isSSOLoading}
            aria-busy={isSSOLoading}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-border-theme text-foreground px-6 py-3 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sage/50 transition-colors duration-200 disabled:opacity-50"
          >
            {isSSOLoading
              ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              : null}
            כניסה דרך Authelia
          </button>
        </div>

        <p className="text-center text-xs text-muted-theme">
          © {new Date().getFullYear()} אבא-דס
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
