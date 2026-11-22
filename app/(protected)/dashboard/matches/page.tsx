'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import SimilarityGauge from '@/components/matching/SimilarityGauge';
import { ArrowLeft, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { PotentialMatch, LostItem, FoundItem } from '@/types/app';
import { formatDate } from '@/lib/utils';

function MatchesViewer() {
  const searchParams = useSearchParams();
  const lostId = searchParams.get('lostId');
  const supabase = createClient();

  const [matches, setMatches] = useState<
    (PotentialMatch & { lost_item?: LostItem; found_item?: FoundItem })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      try {
        let query = supabase
          .from('potential_matches')
          .select('*, lost_item:lost_items(*), found_item:found_items(*)')
          .order('similarity_score', { ascending: false });

        if (lostId) {
          query = query.eq('lost_item_id', lostId);
        }

        const { data } = await query;
        if (data) setMatches(data as any);
      } catch {
        // Fallback demo match
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [lostId, supabase]);

  // Demo fallback if no live database matches yet
  const displayMatches =
    matches.length > 0
      ? matches
      : [
          {
            id: 'mock-match-1',
            lost_item_id: 'lost-1',
            found_item_id: 'found-1',
            similarity_score: 82,
            tier: 'HIGH' as const,
            matched_fields: ['category', 'city', 'brand', 'color'],
            reasons: [
              'Category matched: Wallets',
              'Same City: Mumbai',
              'Brand matched: Wildcraft',
              'Color: Dark Brown Leather',
              'Dates are within 48 hours',
            ],
            status: 'SUGGESTED' as const,
            created_at: new Date().toISOString(),
            lost_item: {
              id: 'lost-1',
              title: 'Wildcraft Dark Brown Bifold Wallet',
              category: 'Wallets',
              city: 'Mumbai',
              lost_date: '2026-11-20',
              approximate_location: 'Dadar Station Suburban Platform 4',
              primary_color: 'Brown',
            } as any,
            found_item: {
              id: 'found-1',
              title: 'Brown Leather Men Wallet with Coin Pocket',
              category: 'Wallets',
              city: 'Mumbai',
              found_date: '2026-11-21',
              approximate_location: 'Near Dadar West Station Overbridge',
              primary_color: 'Brown',
              brand: 'Wildcraft',
            } as any,
          },
        ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="border-b border-border-subtle pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <CheckCircle2 className="h-4 w-4" />
          Automated Matching Pipeline
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
          Smart Match Suggestions
        </h1>
        <p className="mt-1 text-xs text-text-secondary">
          Weighted multi-factor calculations comparing category, location keywords, brand, color, and date delta.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-text-muted">
          Evaluating matching matrix...
        </div>
      ) : displayMatches.length > 0 ? (
        <div className="space-y-8">
          {displayMatches.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
                <div>
                  <span className="text-xs font-bold text-text-primary">
                    Match Pair #{m.id.substring(0, 8)}
                  </span>
                  <p className="text-[11px] text-text-muted">
                    Detected on {formatDate(m.created_at)}
                  </p>
                </div>

                <Link
                  href={`/items/${m.found_item_id}/claim`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent-hover self-start sm:self-auto"
                >
                  Claim This Match
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Lost Item */}
                <div className="rounded-md border border-status-lost/20 bg-status-lost-bg/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-status-lost">
                      Reported Lost Item
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {formatDate(m.lost_item?.lost_date || '')}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary">
                    {m.lost_item?.title}
                  </h4>
                  <div className="text-xs text-text-secondary space-y-1">
                    <p>Category: <strong>{m.lost_item?.category}</strong></p>
                    <p>Location: <strong>{m.lost_item?.approximate_location}, {m.lost_item?.city}</strong></p>
                    <p>Color: <strong>{m.lost_item?.primary_color}</strong></p>
                  </div>
                </div>

                {/* Found Item */}
                <div className="rounded-md border border-status-found/20 bg-status-found-bg/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-status-found">
                      Discovered Found Item
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {formatDate(m.found_item?.found_date || '')}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary">
                    {m.found_item?.title}
                  </h4>
                  <div className="text-xs text-text-secondary space-y-1">
                    <p>Category: <strong>{m.found_item?.category}</strong></p>
                    <p>Location: <strong>{m.found_item?.approximate_location}, {m.found_item?.city}</strong></p>
                    <p>Color: <strong>{m.found_item?.primary_color}</strong></p>
                  </div>
                </div>
              </div>

              {/* Similarity Breakdown Gauge */}
              <SimilarityGauge
                match={{
                  score: m.similarity_score,
                  tier: m.tier,
                  matchedFields: m.matched_fields,
                  reasons: m.reasons,
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border-subtle bg-surface p-12 text-center text-xs text-text-muted">
          No matches exceeding the 50% threshold at this time. As more items are reported, the engine automatically evaluates new pairs.
        </div>
      )}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Loading matching engine...</div>}>
      <MatchesViewer />
    </Suspense>
  );
}

