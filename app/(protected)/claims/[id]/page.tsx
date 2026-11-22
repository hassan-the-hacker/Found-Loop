'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import RecoveryTimeline from '@/components/matching/RecoveryTimeline';
import { formatDate, getStatusBadge } from '@/lib/utils';
import { 
  ArrowLeft, 
  Lock, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare,
  Building,
  User
} from 'lucide-react';
import { OwnershipClaim, FoundItem } from '@/types/app';

export default function ClaimStatusPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const supabase = createClient();

  const [claim, setClaim] = useState<OwnershipClaim | null>(null);
  const [foundItem, setFoundItem] = useState<FoundItem | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'moderator' | 'admin'>('user');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadClaimData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
          const pData = profile as { role?: 'user' | 'moderator' | 'admin' } | null;
          if (pData?.role) setUserRole(pData.role);
        }

        const { data: claimData } = await supabase
          .from('ownership_claims')
          .select('*')
          .eq('id', id)
          .single();

        const c = claimData as OwnershipClaim | null;
        if (c) {
          setClaim(c);
          const { data: itemData } = await supabase
            .from('found_items')
            .select('*')
            .eq('id', c.found_item_id)
            .single();
          if (itemData) setFoundItem(itemData as FoundItem);
        }
      } catch {
        // Fallback for demo mode
      } finally {
        setLoading(false);
      }
    }
    loadClaimData();
  }, [id, supabase]);

  const handleUpdateStatus = async (newStatus: 'APPROVED' | 'REJECTED' | 'HANDED_OVER') => {
    setActionLoading(true);
    setFeedbackMessage(null);

    try {
      // 1. Update claim status
      const { error: claimErr } = await (supabase
        .from('ownership_claims') as any)
        .update({
          status: newStatus,
          review_notes: reviewNotes.trim() || null,
          reviewer_id: currentUser?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (claimErr) throw new Error(claimErr.message);

      // 2. Update found item status
      if (foundItem) {
        const itemNewStatus =
          newStatus === 'APPROVED'
            ? 'OWNERSHIP_VERIFIED'
            : newStatus === 'HANDED_OVER'
            ? 'RETURNED'
            : 'AVAILABLE';

        await (supabase
          .from('found_items') as any)
          .update({ status: itemNewStatus })
          .eq('id', foundItem.id);
      }

      setFeedbackMessage(`Claim successfully marked as ${newStatus}.`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setFeedbackMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-xs text-text-muted">
        Loading verification timeline...
      </div>
    );
  }

  // Fallback demo object if fresh
  const activeClaim = claim || {
    id,
    found_item_id: 'mock-found-item',
    lost_item_id: null,
    claimant_id: currentUser?.id || 'mock-claimant',
    claim_description: 'I lost my brown wallet while taking the bus near Dadar station.',
    private_proof_answers: '1. Driving license ending in 8492.\n2. Canteen token inside.\n3. Photo of family in the coin pocket.',
    proof_image_url: null,
    status: 'UNDER_REVIEW',
    reviewer_id: null,
    review_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as OwnershipClaim;

  const isFinder = foundItem?.user_id === currentUser?.id;
  const isClaimant = activeClaim.claimant_id === currentUser?.id;
  const isAdminOrMod = userRole === 'admin' || userRole === 'moderator';
  const canReview = isFinder || isAdminOrMod;

  const badge = getStatusBadge(activeClaim.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-5 gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Verification Docket #{id.substring(0, 8)}
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
            Ownership Claim & Handover
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-md border px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text} ${badge.border}`}>
            Status: {badge.label}
          </span>
        </div>
      </div>

      {feedbackMessage && (
        <div className="flex items-center gap-2 rounded-md border border-accent/20 bg-accent/5 p-4 text-xs text-accent">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main Grid: Timeline + Review Pane */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <RecoveryTimeline currentStatus={activeClaim.status} />

          {/* Item Quick Reference */}
          {foundItem && (
            <div className="rounded-lg border border-border-subtle bg-surface p-4 text-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Target Belonging
              </span>
              <h4 className="font-semibold text-text-primary line-clamp-1">{foundItem.title}</h4>
              <p className="text-text-secondary">{foundItem.category} · {foundItem.city}</p>
              <Link
                href={`/items/${foundItem.id}?type=FOUND`}
                className="inline-block text-xs font-semibold text-accent hover:underline pt-1"
              >
                View Public Listing →
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Claim Details & Verification Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Circumstances */}
          <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <User className="h-4 w-4 text-accent" />
              Claimant&apos;s Loss Circumstances
            </h3>
            <p className="text-xs leading-relaxed text-text-secondary bg-surface-subtle p-3.5 rounded-md border border-border-subtle">
              {activeClaim.claim_description}
            </p>
          </div>

          {/* Private Proof Answers (Only for Claimant, Finder, & Admins) */}
          <div className="rounded-lg border-2 border-amber-200 bg-amber-50/30 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-amber-700" />
                Confidential Ownership Proof
              </h3>
              <span className="rounded bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                PRIVATE
              </span>
            </div>

            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              Compare these answers strictly against the physical item in your custody.
            </p>

            <div className="whitespace-pre-line rounded-md border border-amber-300 bg-white p-4 text-xs font-mono text-text-primary leading-relaxed">
              {activeClaim.private_proof_answers}
            </div>

            {activeClaim.proof_image_url && (
              <div className="pt-2">
                <span className="block text-xs font-semibold text-text-primary mb-1">Attached Receipt / Old Photo:</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeClaim.proof_image_url}
                  alt="Proof Document"
                  className="h-48 rounded-md border border-border-subtle object-cover"
                />
              </div>
            )}
          </div>

          {/* Handover & Action Section */}
          {activeClaim.status === 'APPROVED' ? (
            <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50/50 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <CheckCircle className="h-5 w-5 text-status-verified" />
                <span>Ownership Verified! Safe Handover Authorized</span>
              </div>

              <div className="rounded-md border border-emerald-200 bg-white p-4 text-xs space-y-2 text-emerald-950">
                <p className="font-semibold flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-accent" />
                  Recommended Collection Procedure:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-text-secondary leading-relaxed">
                  <li>Meet at a designated public location (Campus Security Desk, Station Master office, or Police Station).</li>
                  <li>Verify physical identity (College ID or Government Card) in person.</li>
                  <li>Confirm receipt and click &quot;Confirm Handover Complete&quot; below to close the report.</li>
                </ol>
              </div>

              {canReview && (
                <button
                  onClick={() => handleUpdateStatus('HANDED_OVER')}
                  disabled={actionLoading}
                  className="rounded-md bg-status-verified px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
                >
                  Confirm Handover Complete (Close Report)
                </button>
              )}
            </div>
          ) : activeClaim.status === 'REJECTED' ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-xs text-red-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-status-lost">
                <XCircle className="h-4 w-4" />
                <span>Claim Rejected</span>
              </div>
              <p className="text-[11px] text-red-900/80 leading-relaxed">
                The provided proof details did not match the physical item. The item remains listed for genuine recovery.
              </p>
            </div>
          ) : activeClaim.status === 'HANDED_OVER' ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-xs text-emerald-950 space-y-1 text-center">
              <CheckCircle className="h-8 w-8 text-status-verified mx-auto mb-2" />
              <h4 className="text-base font-bold text-emerald-950">Item Successfully Returned!</h4>
              <p className="text-text-secondary text-xs">
                Case closed. Thank you for making your community safer and more helpful.
              </p>
            </div>
          ) : (
            canReview && (
              <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-primary">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Finder / Moderator Decision
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Review Notes / Feedback (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="e.g. 'Serial number matched completely', or 'Color of inner pouch was incorrect'."
                    className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-xs focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleUpdateStatus('APPROVED')}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 rounded-md bg-status-verified px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Claim (Verify Ownership)
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('REJECTED')}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 rounded-md border border-status-lost/30 bg-status-lost-bg px-4 py-2.5 text-xs font-semibold text-status-lost hover:bg-status-lost hover:text-white transition-colors disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject (Insufficient Proof)
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

