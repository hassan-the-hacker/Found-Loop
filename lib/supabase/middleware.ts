import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/types/database';
import { sanitizeSupabaseUrl, sanitizeSupabaseKey, isPlaceholder, safeParseUser } from './config';
export { safeParseUser };

export async function updateSession(request: NextRequest) {
  // If Supabase redirected to /?code=... instead of /api/auth/callback, intercept and exchange code
  const authCode = request.nextUrl.searchParams.get('code');
  if (authCode && !request.nextUrl.pathname.startsWith('/api/auth/callback')) {
    if (request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1') {
      const liveTarget = new URL('https://found-loop-h9fu.vercel.app/api/auth/callback');
      liveTarget.searchParams.set('code', authCode);
      liveTarget.searchParams.set('next', '/login');
      return NextResponse.redirect(liveTarget);
    }
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = '/api/auth/callback';
    callbackUrl.searchParams.set('code', authCode);
    callbackUrl.searchParams.set('next', '/login');
    return NextResponse.redirect(callbackUrl);
  }

  const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = sanitizeSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const isProtectedPath =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/report') ||
    request.nextUrl.pathname.startsWith('/claims');

  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');

  // Handle local demo mode when placeholder URL is present
  if (isPlaceholder(supabaseUrl) || !supabaseKey || supabaseKey.includes('placeholder')) {
    const sessionCookie = request.cookies.get('foundloop_session')?.value;
    const user = safeParseUser(sessionCookie);

    if (!user && (isProtectedPath || isAdminPath)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    if (user && isAdminPath) {
      const isAdmin = user.email?.toLowerCase().includes('admin') || user.role === 'admin';
      if (!isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  }

  // Cloud Supabase SSR mode
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    supabaseUrl!,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && (isProtectedPath || isAdminPath)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAdminPath) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const profileData = profile as { role?: string } | null;
    if (!profileData || (profileData.role !== 'admin' && profileData.role !== 'moderator')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
