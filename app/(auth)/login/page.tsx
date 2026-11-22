'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Search, AlertCircle, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('fetch failed') || authError.message.includes('placeholder')) {
          setError(
            'Demo Note: Connect your real Supabase credentials in .env.local to enable cloud auth. In local demo mode, check database-schema.md.'
          );
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data?.user) {
        if (typeof document !== 'undefined') {
          const userStr = JSON.stringify(data.user);
          document.cookie = `foundloop_session=${encodeURIComponent(userStr)}; path=/; max-age=604800; SameSite=Lax`;
          try {
            localStorage.setItem('foundloop_session', userStr);
          } catch {}
        }
        window.location.href = redirectTo;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg border border-border-subtle bg-surface p-8 shadow-sm">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-accent text-white">
          <Search className="h-5 w-5 stroke-[2.5]" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">Welcome Back</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Sign in to manage your reports and track ownership claims.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-primary" htmlFor="email">
            Email Address
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@college.edu or personal email"
              className="block w-full rounded-md border border-[#D1D5DB] py-2 pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-text-primary" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full rounded-md border border-[#D1D5DB] py-2 pl-9 pr-10 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-accent py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* Quick Demo Fill Buttons */}
      <div className="rounded-md border border-border-subtle bg-surface-subtle p-3 space-y-2">
        <span className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
          Demo One-Click Sign In:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('hazyy@yopmail.com', 'password123')}
            className="rounded border border-border-subtle bg-surface px-2.5 py-1 text-xs font-medium text-text-primary hover:bg-border-subtle transition-colors"
          >
            User (hazyy@yopmail.com)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin@foundloop.in', 'Admin@123')}
            className="rounded border border-border-subtle bg-surface px-2.5 py-1 text-xs font-medium text-text-primary hover:bg-border-subtle transition-colors"
          >
            Admin (admin@foundloop.in)
          </button>
        </div>
      </div>

      {/* Footer Link */}
      <div className="border-t border-border-subtle pt-4 text-center text-xs text-text-secondary">
        Don&apos;t have an account yet?{' '}
        <Link href="/register" className="font-semibold text-accent hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-sm text-text-muted">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
