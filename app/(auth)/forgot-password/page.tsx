'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Search, AlertCircle, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-border-subtle bg-surface p-8 shadow-sm">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-accent text-white">
            <Search className="h-5 w-5 stroke-[2.5]" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">Reset Password</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Enter your registered email to receive recovery instructions.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-sm text-emerald-950">Reset link dispatched</p>
                <p className="mt-1 leading-relaxed">
                  We have sent instructions to <strong>{email}</strong>. Please check your inbox and spam folder.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-md border border-border-subtle bg-surface py-2.5 text-sm font-semibold text-text-primary hover:bg-surface-subtle"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="email">
                Registered Email
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
                  placeholder="name@example.com"
                  className="block w-full rounded-md border border-[#D1D5DB] py-2 pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-accent py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? 'Sending link...' : 'Send Recovery Link'}
            </button>
          </form>
        )}

        <div className="border-t border-border-subtle pt-4 text-center text-xs text-text-secondary">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

