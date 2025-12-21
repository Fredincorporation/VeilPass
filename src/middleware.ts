import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Role enforcement rules. Add more patterns here as the app grows.
const ROLE_RULES: Array<{ pattern: RegExp; role: 'admin' | 'seller' | 'customer' }> = [
  { pattern: /^\/api\/admin(\/|$)/, role: 'admin' },
  { pattern: /^\/admin(\/|$)/, role: 'admin' },

  { pattern: /^\/api\/seller(\/|$)/, role: 'seller' },
  { pattern: /^\/seller(\/|$)/, role: 'seller' },

  // Customer-scoped API and pages: adjust patterns to match your customer URL surface.
  { pattern: /^\/api\/customer(\/|$)/, role: 'customer' },
  { pattern: /^\/customer(\/|$)/, role: 'customer' },
];

// Paths that should be ignored by the middleware (public assets, Next internals)
const IGNORED_PATHS = ['/_next', '/favicon.ico', '/api/crypto/public-key', '/restricted'];

function isIgnored(pathname: string) {
  return IGNORED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/') );
}

/**
 * Middleware enforcement logic
 * - Reads a `veilpass_role` cookie (string: 'admin' | 'seller' | 'customer')
 * - Matches the request pathname against ROLE_RULES
 * - If a rule matches and role !== requiredRole, then:
 *    - For API requests: return 403 JSON { error: 'forbidden' }
 *    - For page requests: redirect to `/restricted` page
 *
 * NOTE: This middleware intentionally keeps logic small and deterministic.
 * For production you should integrate server-side session validation (Supabase, Auth0, etc.)
 * and set a signed `veilpass_role` cookie at login time. See `src/lib/auth-middleware.ts`.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internals and Next assets
  if (isIgnored(pathname) || pathname.startsWith('/_static') || pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  // Determine required role for this path (if any)
  const rule = ROLE_RULES.find((r) => r.pattern.test(pathname));
  if (!rule) return NextResponse.next();

  // Read role cookie value (must be set by auth flow)
  const roleCookie = request.cookies.get('veilpass_role')?.value;

  // Quick deny if cookie missing or doesn't match
  if (!roleCookie || roleCookie !== rule.role) {
    // If API route, return JSON 403
    if (pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ error: 'forbidden', required: rule.role }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
      });
    }

    // For pages, redirect to a restriction page (so UI can explain steps to request access)
    const url = request.nextUrl.clone();
    url.pathname = '/restricted';
    url.searchParams.set('required', rule.role);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Role matches — allow
  return NextResponse.next();
}

export const config = {
  // Only apply middleware to API routes to avoid interfering with page prerendering.
  matcher: [
    '/api/admin/:path*',
    '/api/seller/:path*',
    '/api/customer/:path*',
  ],
};
