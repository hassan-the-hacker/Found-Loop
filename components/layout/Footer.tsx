import Link from 'next/link';
import { Search, Heart, ShieldCheck, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border-subtle bg-surface text-text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-accent text-white">
                <Search className="h-4 w-4 stroke-[2.5]" />
              </div>
              <span className="text-base font-bold text-text-primary">FoundLoop</span>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              A community-first lost and found platform built for Indian universities, transit hubs, offices, and neighborhoods.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <MapPin className="h-3.5 w-3.5" />
              <span>Pan-India Community Initiative</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Platform</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/browse" className="hover:text-text-primary">Browse All Listings</Link>
              </li>
              <li>
                <Link href="/report/lost" className="hover:text-text-primary">Report Lost Property</Link>
              </li>
              <li>
                <Link href="/report/found" className="hover:text-text-primary">Report Found Belonging</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-text-primary">User Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Safety & Rules</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/safety" className="hover:text-text-primary">Privacy & Data Charter</Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-text-primary">Ownership Verification Guide</Link>
              </li>
              <li>
                <span className="text-text-muted">No Public Phone Numbers</span>
              </li>
              <li>
                <span className="text-text-muted">Zero Scammer Reward Demands</span>
              </li>
            </ul>
          </div>

          {/* Technology & Community */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Civic Tech</h4>
            <p className="mt-3 text-xs leading-relaxed text-text-secondary">
              Free and open community tool. No paid AI credits, no tracking ads, and zero monetization barriers for finding your valuables.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-status-verified" />
              <span>Row-Level Security Protected</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
          <p>© {new Date().getFullYear()} FoundLoop. Built with community trust.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-status-lost fill-status-lost" /> for Indian communities.
          </p>
        </div>
      </div>
    </footer>
  );
}

