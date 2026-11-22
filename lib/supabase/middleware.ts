import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/types/database';
import { sanitizeSupabaseUrl, sanitizeSupabaseKey, isPlaceholder, safeParseUser } from './config';
export { safeParseUser };

export async function updateSession(request: NextRequest) {
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
