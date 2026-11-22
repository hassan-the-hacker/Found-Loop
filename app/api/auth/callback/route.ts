import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/login';

  // If user clicked link that routed to localhost, forward to live Vercel domain
  if (requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1') {
    const liveTarget = new URL('https://found-loop-h9fu.vercel.app/api/auth/callback');
    if (code) liveTarget.searchParams.set('code', code);
    liveTarget.searchParams.set('next', next);
    return NextResponse.redirect(liveTarget);
  }

  const targetOrigin = requestUrl.origin;

  if (code) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const destination = new URL('/login?confirmed=true', targetOrigin);
        const response = NextResponse.redirect(destination);
        if (data?.user) {
          response.cookies.set('foundloop_session', encodeURIComponent(JSON.stringify(data.user)), {
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
          });
        }
        return response;
      }
    } catch (err) {
      console.error('Code exchange error:', err);
    }
  }

  // Return the user to login page
  return NextResponse.redirect(new URL('/login?confirmed=true', targetOrigin));
}

