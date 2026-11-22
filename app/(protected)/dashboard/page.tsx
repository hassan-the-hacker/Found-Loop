import Link from 'next/link';
import { redirect } from 'next/navigation';
import { 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowRight,
  ShieldAlert,
  User,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, getStatusBadge } from '@/lib/utils';
import { LostItem, FoundItem, OwnershipClaim } from '@/types/app';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/dashboard');
  }

  // Fetch real counts & items
  let myLost: LostItem[] = [];
  let myFound: FoundItem[] = [];
  let myClaims: OwnershipClaim[] = [];
  let matchCount = 0;

  try {
    const [lostRes, foundRes, claimsRes, matchesRes] = await Promise.all([
      supabase.from('lost_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('found_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('ownership_claims').select('*').eq('claimant_id', user.id).order('created_at', { ascending: false }),
      supabase.from('potential_matches').select('id', { count: 'exact' }),
    ]);

    if (lostRes.data) myLost = lostRes.data as unknown as LostItem[];
    if (foundRes.data) myFound = foundRes.data as unknown as FoundItem[];
    if (claimsRes.data) myClaims = claimsRes.data as unknown as OwnershipClaim[];
    if (matchesRes.count) matchCount = matchesRes.count;
  } catch {
    // Fallback for fresh/offline
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-6 gap-4">
        <div>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Personal Control Center
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            My Dashboard
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Logged in as <strong className="text-text-primary">{user.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/report/lost"
            className="flex items-center gap-1.5 rounded-md bg-status-lost px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            Report Lost
          </Link>
          <Link
            href="/report/found"
            className="flex items-center gap-1.5 rounded-md bg-status-found px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Real Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border-subtle bg-surface p-4 shadow-sm">
          <span className="text-xs font-semibold text-text-secondary">My Lost Reports</span>
          <p className="mt-2 text-2xl font-bold text-text-primary">{myLost.length}</p>
          <span className="text-[11px] text-text-muted">Active search requests</span>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 shadow-sm">
          <span className="text-xs font-semibold text-text-secondary">My Found Reports</span>
          <p className="mt-2 text-2xl font-bold text-text-primary">{myFound.length}</p>
          <span className="text-[11px] text-text-muted">Items in custody</span>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 shadow-sm">
          <span className="text-xs font-semibold text-text-secondary">Filed Claims</span>
          <p className="mt-2 text-2xl font-bold text-text-primary">{myClaims.length}</p>
          <span className="text-[11px] text-text-muted">Pending or verified</span>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 shadow-sm">
          <span className="text-xs font-semibold text-text-secondary">Potential Matches</span>
          <p className="mt-2 text-2xl font-bold text-accent">{matchCount}</p>
          <Link href="/dashboard/matches" className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1 mt-0.5">
            View Suggestions <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Tabs / Sections */}
      <div className="space-y-8">
        {/* Section 1: My Lost Items */}
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-status-lost" />
              My Lost Item Reports
            </h2>
            <Link href="/report/lost" className="text-xs font-semibold text-accent hover:underline">
              + File New Report
            </Link>
          </div>

          {myLost.length > 0 ? (
            <div className="divide-y divide-border-subtle">
              {myLost.map((item) => {
                const b = getStatusBadge(item.status);
                return (
                  <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-text-primary">{item.title}</h4>
                        <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${b.bg} ${b.text} ${b.border}`}>
                          {b.label}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {item.category} · Lost at {item.approximate_location}, {item.city} on {formatDate(item.lost_date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/dashboard/matches?lostId=${item.id}`}
                        className="flex items-center gap-1 rounded border border-border-subtle bg-surface-subtle px-2.5 py-1 text-xs font-medium text-accent hover:bg-border-subtle"
                      >
                        <Sparkles className="h-3 w-3" />
                        Smart Matches
                      </Link>
                      <Link
                        href={`/items/${item.id}?type=LOST`}
                        className="text-xs font-semibold text-text-secondary hover:text-text-primary px-2 py-1"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-text-muted">
              You haven&apos;t filed any lost item reports yet.
            </div>
          )}
        </div>

        {/* Section 2: My Found Items */}
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-status-found" />
              My Found Belonging Reports
            </h2>
            <Link href="/report/found" className="text-xs font-semibold text-accent hover:underline">
              + File Found Belonging
            </Link>
          </div>

          {myFound.length > 0 ? (
            <div className="divide-y divide-border-subtle">
              {myFound.map((item) => {
                const b = getStatusBadge(item.status);
                return (
                  <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-text-primary">{item.title}</h4>
                        <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${b.bg} ${b.text} ${b.border}`}>
                          {b.label}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {item.category} · Found at {item.approximate_location}, {item.city} on {formatDate(item.found_date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/items/${item.id}?type=FOUND`}
                        className="text-xs font-semibold text-accent hover:underline px-2 py-1"
                      >
                        View Listing →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-text-muted">
              You haven&apos;t reported any found items yet.
            </div>
          )}
        </div>

        {/* Section 3: My Claims */}
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              Ownership Claims Filed by Me
            </h2>
          </div>

          {myClaims.length > 0 ? (
            <div className="divide-y divide-border-subtle">
              {myClaims.map((claim) => {
                const b = getStatusBadge(claim.status);
                return (
                  <div key={claim.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-text-primary">
                          Claim Docket #{claim.id.substring(0, 8)}
                        </h4>
                        <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${b.bg} ${b.text} ${b.border}`}>
                          {b.label}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                        {claim.claim_description}
                      </p>
                    </div>

                    <Link
                      href={`/claims/${claim.id}`}
                      className="text-xs font-semibold text-accent hover:underline shrink-0"
                    >
                      Track Verification Timeline →
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-text-muted">
              No active claims submitted. If you find a matching item on the catalog, click &quot;Claim This Item&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

