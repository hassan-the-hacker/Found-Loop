'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, PlusCircle, User, LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/app';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data as Profile);
      }
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    if (typeof document !== 'undefined') {
      document.cookie = 'foundloop_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Browse Items', href: '/browse' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Safety', href: '/safety' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-white shadow-sm">
            <Search className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-text-primary">FoundLoop</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Lost & Found Community</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/report/lost"
            className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-subtle"
          >
            <PlusCircle className="h-3.5 w-3.5 text-status-lost" />
            Report Lost
          </Link>
          <Link
            href="/report/found"
            className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-subtle"
          >
            <PlusCircle className="h-3.5 w-3.5 text-status-found" />
            Report Found
          </Link>

          {user ? (
            <div className="flex items-center gap-2 border-l border-border-subtle pl-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-md bg-surface-subtle px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-border-subtle"
              >
                <User className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-200"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                title="Logout"
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-subtle hover:text-text-primary"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-border-subtle pl-3">
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border-subtle bg-surface px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                {link.name}
              </Link>
            ))}

            <div className="mt-2 flex flex-col gap-2 border-t border-border-subtle pt-3">
              <Link
                href="/report/lost"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md border border-border-subtle p-2 text-sm font-semibold text-text-primary"
              >
                <PlusCircle className="h-4 w-4 text-status-lost" />
                Report Lost Item
              </Link>
              <Link
                href="/report/found"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md border border-border-subtle p-2 text-sm font-semibold text-text-primary"
              >
                <PlusCircle className="h-4 w-4 text-status-found" />
                Report Found Item
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md bg-surface-subtle p-2 text-sm font-medium text-text-primary"
                  >
                    <User className="h-4 w-4" />
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-2 rounded-md p-2 text-sm font-medium text-status-lost hover:bg-status-lost-bg text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center rounded-md border border-border-subtle py-2 text-sm font-medium text-text-primary"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center rounded-md bg-accent py-2 text-sm font-semibold text-white shadow-sm"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

