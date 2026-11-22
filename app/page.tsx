import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  FileText, 
  Lock,
  Tag
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { LostItem, FoundItem } from '@/types/app';

export default async function HomePage() {
  const supabase = createClient();

  // Fetch recent lost and found items
  let recentLost: LostItem[] = [];
  let recentFound: FoundItem[] = [];

  try {
    const [lostRes, foundRes] = await Promise.all([
      supabase
        .from('lost_items')
        .select('*')
        .eq('status', 'REPORTED')
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('found_items')
        .select('*')
        .eq('status', 'AVAILABLE')
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    if (lostRes.data) recentLost = lostRes.data as unknown as LostItem[];
    if (foundRes.data) recentFound = foundRes.data as unknown as FoundItem[];
  } catch {
    // Graceful fallback for local offline demo
  }

  // Fallback demo data if database is empty/fresh
  const sampleLost = recentLost.length > 0 ? recentLost : [
    {
      id: 'demo-1',
      title: 'College ID Card & Metro Pass',
      category: 'Documents',
      city: 'Mumbai',
      approximate_location: 'Near VJTI Library / Matunga Station',
      lost_date: '2026-11-20',
      primary_color: 'Blue',
      status: 'REPORTED',
    },
    {
      id: 'demo-2',
      title: 'Titan Fastrack Black Watch',
      category: 'Accessories',
      city: 'Delhi NCR',
      approximate_location: 'Rajiv Chowk Metro Gate 3',
      lost_date: '2026-11-21',
      primary_color: 'Black',
      status: 'REPORTED',
    },
    {
      id: 'demo-3',
      title: 'Dark Brown Leather Wallet',
      category: 'Wallets',
      city: 'Bengaluru',
      approximate_location: 'Koramangala 4th Block Bus Stop',
      lost_date: '2026-11-21',
      primary_color: 'Brown',
      status: 'REPORTED',
    },
  ];

  const sampleFound = recentFound.length > 0 ? recentFound : [
    {
      id: 'demo-4',
      title: 'HP Laptop Charger (Type-C)',
      category: 'Electronics',
      city: 'Pune',
      approximate_location: 'Shivajinagar Railway Station Waiting Hall',
      found_date: '2026-11-21',
      primary_color: 'Black',
      status: 'AVAILABLE',
      custody_type: 'SECURITY_DESK',
    },
    {
      id: 'demo-5',
      title: 'Set of 3 Keys with Wooden Keychain',
      category: 'Keys',
      city: 'Mumbai',
      approximate_location: 'Marine Drive Promenade bench near Nariman Pt',
      found_date: '2026-11-22',
      primary_color: 'Silver',
      status: 'AVAILABLE',
      custody_type: 'WITH_FINDER',
    },
    {
      id: 'demo-6',
      title: 'Boat Airdopes Earphone Case',
      category: 'Electronics',
      city: 'Hyderabad',
      approximate_location: 'Hitec City Metro Station Concourse',
      found_date: '2026-11-22',
      primary_color: 'White',
      status: 'AVAILABLE',
      custody_type: 'LOST_AND_FOUND_OFFICE',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="border-b border-border-subtle bg-surface px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-subtle px-3 py-1 text-xs font-medium text-text-secondary">
            <span className="flex h-2 w-2 rounded-full bg-status-verified" />
            Community-Powered Lost & Found Network for India
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-text-primary sm:text-5xl sm:leading-tight">
            Lost Something? <br className="hidden sm:inline" />
            Let&apos;s Find It Together.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
            A simple community platform to report lost items, share found belongings, and reconnect people with what matters.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/report/lost"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-hover sm:w-auto"
            >
              <span>I Lost Something</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/report/found"
              className="flex w-full items-center justify-center gap-2 rounded-md border border-[#D1D5DB] bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-surface-subtle sm:w-auto"
            >
              <span>I Found Something</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-text-secondary" />
              Private identifying details protected
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-text-secondary" />
              Proof of ownership mandatory
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-text-secondary" />
              100% Free & Open
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">How FoundLoop Works</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Structured reporting and weighted matching designed to prevent chaos and safeguard ownership.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 font-bold text-accent">
              1
            </div>
            <h3 className="mt-4 text-base font-semibold text-text-primary">Report Accurately</h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              Report what was lost or found. Provide public details (category, color, landmark) and lock your private identifying marks.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 font-bold text-accent">
              2
            </div>
            <h3 className="mt-4 text-base font-semibold text-text-primary">Smart Matching</h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              Our local algorithm calculates similarity across category, location, and keywords—surfacing high-probability potential matches.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 font-bold text-accent">
              3
            </div>
            <h3 className="mt-4 text-base font-semibold text-text-primary">Verify & Recover</h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              The owner submits private proof answers. Once the finder or moderator verifies ownership, safe collection is arranged.
            </p>
          </div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-border-subtle gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">Recent Community Reports</h2>
            <p className="mt-1 text-xs text-text-secondary">Public-safe summaries reported in colleges, railway stations, and transit hubs.</p>
          </div>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            Browse All Active Listings
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recently Lost */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-status-lost">
                <span className="h-2 w-2 rounded-full bg-status-lost" />
                Recently Lost Items
              </span>
              <span className="text-xs text-text-muted">Seeking Recovery</span>
            </div>

            <div className="space-y-3">
              {sampleLost.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border-subtle bg-surface p-4 transition-all hover:border-border-focus/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-status-lost-bg px-2 py-0.5 text-[11px] font-semibold text-status-lost">
                          LOST
                        </span>
                        <span className="rounded bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-semibold text-text-primary">{item.title}</h4>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-text-muted shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.lost_date)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                    <span className="flex items-center gap-1 text-text-muted">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {item.approximate_location}, {item.city}
                    </span>
                    <Link
                      href={`/browse?q=${encodeURIComponent(item.title)}`}
                      className="font-medium text-accent hover:underline"
                    >
                      Check Matches →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Found */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-status-found">
                <span className="h-2 w-2 rounded-full bg-status-found" />
                Recently Found Belongings
              </span>
              <span className="text-xs text-text-muted">In Safe Keeping</span>
            </div>

            <div className="space-y-3">
              {sampleFound.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border-subtle bg-surface p-4 transition-all hover:border-border-focus/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-status-found-bg px-2 py-0.5 text-[11px] font-semibold text-status-found">
                          FOUND
                        </span>
                        <span className="rounded bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-semibold text-text-primary">{item.title}</h4>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-text-muted shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.found_date)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                    <span className="flex items-center gap-1 text-text-muted">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {item.approximate_location}, {item.city}
                    </span>
                    <Link
                      href="/browse?type=FOUND"
                      className="font-medium text-accent hover:underline"
                    >
                      Claim Item →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border-subtle bg-surface p-8 shadow-sm">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-status-verified">
              <ShieldCheck className="h-3.5 w-3.5" />
              The FoundLoop Safety Charter
            </div>
            <h3 className="mt-3 text-xl font-bold text-text-primary">
              Engineered to prevent scams, harassment, and false claims.
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              Returning a lost item shouldn&apos;t put you at risk. We enforce strict safety barriers on all transactions.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-border-subtle bg-surface-subtle p-3.5">
              <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-accent" />
                Zero Public Contact Info
              </div>
              <p className="mt-1 text-[11px] text-text-secondary leading-relaxed">
                Personal mobile numbers and email addresses are never revealed on public item listings.
              </p>
            </div>

            <div className="rounded-md border border-border-subtle bg-surface-subtle p-3.5">
              <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                Approximate Locations
              </div>
              <p className="mt-1 text-[11px] text-text-secondary leading-relaxed">
                Only broad neighborhoods or transit stations are shown instead of exact residential addresses.
              </p>
            </div>

            <div className="rounded-md border border-border-subtle bg-surface-subtle p-3.5">
              <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-accent" />
                Proof of Ownership
              </div>
              <p className="mt-1 text-[11px] text-text-secondary leading-relaxed">
                Claimants must describe private details (wallpaper, secret marks) before handover is authorized.
              </p>
            </div>

            <div className="rounded-md border border-border-subtle bg-surface-subtle p-3.5">
              <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-accent" />
                Zero Reward Extortion
              </div>
              <p className="mt-1 text-[11px] text-text-secondary leading-relaxed">
                FoundLoop is a community service. Finders demanding ransom or reward fees are promptly suspended.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

