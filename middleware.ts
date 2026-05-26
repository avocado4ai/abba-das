import { auth } from "@/auth"

export default auth((req) => {
  // Check if user is trying to access admin page
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Check if user is authenticated and has proper permissions
    if (!req.auth) {
      const signInUrl = new URL('/api/auth/signin', req.nextUrl.origin);
      signInUrl.searchParams.append('callbackUrl', req.nextUrl.href);
      return Response.redirect(signInUrl);
    }

    // Check if user is in the abba-das admins group (as defined in LLDAP/Authelia)
    const groups = req.auth.user?.groups || [];
    if (!groups.includes('abba-das_admins')) {
      const deniedUrl = new URL('/unauthorized', req.nextUrl.origin);
      return Response.redirect(deniedUrl);
    }
  }
});

export const config = {
  matcher: ['/admin/:path*'],
};
