import { auth } from "@/auth"

export default auth((req) => {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!req.auth) {
      const signInUrl = new URL('/api/auth/signin', req.nextUrl.origin);
      signInUrl.searchParams.append('callbackUrl', req.nextUrl.href);
      return Response.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: ['/admin/:path*'],
};
