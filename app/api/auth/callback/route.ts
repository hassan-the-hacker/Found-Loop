import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(new URL(next, requestUrl.origin));
      if (data?.user) {
        response.cookies.set('foundloop_session', encodeURIComponent(JSON.stringify(data.user)), {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax',
        });
      }
      return response;
    }
  }

  // Return the user to login with error parameter
  return NextResponse.redirect(new URL('/login?error=auth-callback-failed', requestUrl.origin));
}

