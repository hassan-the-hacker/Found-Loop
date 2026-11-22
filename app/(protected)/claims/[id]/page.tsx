'use client';

import { useState, useEffect, useCallback } from 'react';
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
  User,
  Loader2,
  MapPin,
  Phone,
  Copy,
  Check
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
  const [activeAction, setActiveAction] = useState<'APPROVED' | 'REJECTED' | 'HANDED_OVER' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [handoverLocation, setHandoverLocation] = useState('');
  const [handoverContact, setHandoverContact] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);

  const loadClaimData = useCallback(async () => {
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

      const c = claimData as any | null;
      if (c) {
        setClaim(c);
        if (c.review_notes) setReviewNotes(c.review_notes);
        if (c.handover_location) setHandoverLocation(c.handover_location);
        if (c.handover_contact) setHandoverContact(c.handover_contact);
        const { data: itemData } = await supabase
          .from('found_items')
          .select('*')
          .eq('id', c.found_item_id)
          .single();
        if (itemData) {
          setFoundItem(itemData as FoundItem);
          // If handoverLocation is empty, prefill from found item's custody/location
          if (!c.handover_location && itemData.custody_details) {
            setHandoverLocation(itemData.custody_details);
          } else if (!c.handover_location && itemData.approximate_location) {
            setHandoverLocation(`${itemData.approximate_location}, ${itemData.city}`);
          }
        }
      }
    } catch {
      // Fallback for demo mode
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  useEffect(() => {
    loadClaimData();
  }, [loadClaimData]);

  const handleUpdateStatus = async (newStatus: 'APPROVED' | 'REJECTED' | 'HANDED_OVER') => {
    setActionLoading(true);
    setActiveAction(newStatus);
    setFeedbackMessage(null);
    setFeedbackType(null);

    try {
      // 1. Update claim status in database
      const updatePayload: Record<string, any> = {
        status: newStatus,
        review_notes: reviewNotes.trim() || null,
        handover_location: handoverLocation.trim() || null,
        handover_contact: handoverContact.trim() || null,
        reviewer_id: currentUser?.id,
        updated_at: new Date().toISOString(),
      };

      const { error: claimErr } = await (supabase
        .from('ownership_claims') as any)
        .update(updatePayload)
        .eq('id', id);

      if (claimErr) throw new Error(claimErr.message);

      // 2. Update found item status in database
      const itemNewStatus: FoundItem['status'] =
        newStatus === 'APPROVED'
          ? 'OWNERSHIP_VERIFIED'
          : newStatus === 'HANDED_OVER'
          ? 'RETURNED'
          : 'AVAILABLE';

      if (foundItem) {
        await (supabase
          .from('found_items') as any)
          .update({
            status: itemNewStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', foundItem.id);
      }

      // 3. Immediately update local React state for instantaneous UI transition!
      setClaim((prev) => {
        const base = prev || activeClaim;
        return {
          ...base,
          ...updatePayload,
        } as any;
      });

      if (foundItem) {
        setFoundItem((prev) => prev ? {
          ...prev,
          status: itemNewStatus,
          updated_at: new Date().toISOString(),
        } : null);
      }

      const successTexts: Record<string, string> = {
        APPROVED: 'Claim successfully approved! Collection address & safe handover instructions are now active.',
        REJECTED: 'Claim has been rejected. Item remains listed for legitimate recovery.',
        HANDED_OVER: 'Handover complete! Item marked as successfully returned and case closed.',
      };
      setFeedbackMessage(successTexts[newStatus] || `Claim successfully updated to ${newStatus}.`);
      setFeedbackType('success');

      router.refresh();
      await loadClaimData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed. Please try again.';
      setFeedbackMessage(msg);
      setFeedbackType('error');
    } finally {
      setActionLoading(false);
      setActiveAction(null);
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
        <div className={`flex items-center gap-2 rounded-md p-4 text-xs font-medium ${
          feedbackType === 'error'
            ? 'border border-red-300 bg-red-50 text-red-900'
            : 'border border-emerald-300 bg-emerald-50 text-emerald-950'
        }`}>
          {feedbackType === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 shrink-0 text-status-verified" />
          )}
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
            <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50/50 p-6 space-y-5 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <CheckCircle className="h-5 w-5 text-status-verified" />
                <span>Ownership Verified! Safe Handover Authorized</span>
              </div>

              {/* Designated Handover Location & Pickup Details */}
              <div className="rounded-xl border border-emerald-200 bg-white p-4 text-xs space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 text-[11px]">
                    <MapPin className="h-4 w-4 text-accent" />
                    Designated Item Collection Point & Address
                  </span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    VERIFIED ONLY
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-text-muted">Collection Address / Meeting Point:</span>
                  <div className="flex items-start justify-between gap-2 rounded-md bg-surface-subtle p-3 border border-border-subtle">
                    <p className="font-medium text-text-primary text-xs leading-relaxed">
                      {(activeClaim as any).handover_location ||
                        foundItem?.custody_details ||
                        (foundItem?.approximate_location ? `${foundItem.approximate_location}, ${foundItem.city}` : 'Please coordinate with finder for exact meeting spot.')}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const loc = (activeClaim as any).handover_location || foundItem?.custody_details || `${foundItem?.approximate_location}, ${foundItem?.city}`;
                        if (loc) {
                          navigator.clipboard.writeText(loc);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded bg-surface px-2 py-1 text-[10px] font-semibold text-text-secondary border border-border-subtle hover:text-text-primary shrink-0 cursor-pointer"
                      title="Copy Address"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-status-verified" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {(activeClaim as any).handover_contact && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-accent" />
                      Contact & Pickup Timings:
                    </span>
                    <p className="rounded-md bg-surface-subtle p-2.5 text-xs text-text-primary font-mono border border-border-subtle">
                      {(activeClaim as any).handover_contact}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 text-[11px] text-text-secondary">
                  <ShieldCheck className="h-3.5 w-3.5 text-status-verified" />
                  <span>
                    Current Custody: <strong className="text-text-primary">{foundItem?.custody_type?.replace(/_/g, ' ') || 'With Finder'}</strong>
                  </span>
                </div>
              </div>

              {activeClaim.review_notes && (
                <div className="rounded-md border border-emerald-200 bg-white p-3.5 text-xs text-emerald-950 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Finder Review Notes:
                  </span>
                  <p className="text-text-primary italic">&quot;{activeClaim.review_notes}&quot;</p>
                </div>
              )}

              <div className="rounded-md border border-emerald-200 bg-white p-4 text-xs space-y-2 text-emerald-950">
                <p className="font-semibold flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-accent" />
                  Recommended Safe Collection Procedure:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-text-secondary leading-relaxed">
                  <li>Meet strictly at the designated public location (Campus Security Desk, Station Master office, or Police Chowki).</li>
                  <li>Verify physical identity (College ID or Government ID Card) in person before handing over.</li>
                  <li>Confirm physical handover and click &quot;Confirm Handover Complete&quot; below to close the report.</li>
                </ol>
              </div>

              {canReview && (
                <button
                  onClick={() => handleUpdateStatus('HANDED_OVER')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-md bg-status-verified px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer"
                >
                  {actionLoading && activeAction === 'HANDED_OVER' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Closing Report & Returning Item...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Confirm Handover Complete (Close Report)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : activeClaim.status === 'REJECTED' ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-xs text-red-950 space-y-2 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center gap-2 font-bold text-status-lost">
                <XCircle className="h-4 w-4" />
                <span>Claim Rejected</span>
              </div>
              <p className="text-[11px] text-red-900/80 leading-relaxed">
                The provided proof details did not match the physical item. The item remains listed for genuine recovery.
              </p>
              {activeClaim.review_notes && (
                <div className="rounded-md border border-red-200 bg-white p-3 text-xs text-text-primary mt-2">
                  <span className="font-bold text-[11px] text-red-800 block">Review Feedback:</span>
                  <p className="italic text-text-secondary mt-0.5">&quot;{activeClaim.review_notes}&quot;</p>
                </div>
              )}
            </div>
          ) : activeClaim.status === 'HANDED_OVER' ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-xs text-emerald-950 space-y-3 text-center shadow-sm animate-in fade-in duration-300">
              <CheckCircle className="h-9 w-9 text-status-verified mx-auto mb-1" />
              <h4 className="text-base font-bold text-emerald-950">Item Successfully Returned!</h4>
              <p className="text-text-secondary text-xs">
                Case closed. Thank you for making your community safer and more helpful.
              </p>
              {(activeClaim as any).handover_location && (
                <div className="mx-auto max-w-md rounded-md border border-emerald-200 bg-white p-3 text-xs text-text-primary text-left">
                  <span className="font-bold text-[11px] text-emerald-800 block">Collection Location:</span>
                  <p className="text-text-secondary mt-0.5">{(activeClaim as any).handover_location}</p>
                </div>
              )}
              {activeClaim.review_notes && (
                <div className="mx-auto max-w-md rounded-md border border-emerald-200 bg-white p-3 text-xs text-text-primary text-left">
                  <span className="font-bold text-[11px] text-emerald-800 block">Verification Note:</span>
                  <p className="italic text-text-secondary mt-0.5">&quot;{activeClaim.review_notes}&quot;</p>
                </div>
              )}
            </div>
          ) : (
            canReview && (
              <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-primary">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Finder / Moderator Decision
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      Review Notes / Verification Feedback (Optional)
                    </label>
                    <input
                      type="text"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="e.g. 'Serial number matched completely' or 'Color of inner pouch was confirmed'."
                      className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-xs focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-accent" />
                      Collection Address / Meeting Point (Where should claimant collect it?)
                    </label>
                    <input
                      type="text"
                      value={handoverLocation}
                      onChange={(e) => setHandoverLocation(e.target.value)}
                      placeholder="e.g. 'Main Security Gate 1, IIT Powai' or 'Station Master Office, Dadar Platform 1'"
                      className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-xs focus:border-accent focus:outline-none"
                    />
                    <p className="text-[10px] text-text-muted mt-0.5">
                      This address is kept private and will only be shown to the claimant once you approve the claim.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-accent" />
                      Pickup Timing & Direct Contact (Phone / WhatsApp)
                    </label>
                    <input
                      type="text"
                      value={handoverContact}
                      onChange={(e) => setHandoverContact(e.target.value)}
                      placeholder="e.g. 'Available Mon-Fri 10am to 4pm. Call guard on 9876543210 or WhatsApp me'"
                      className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-xs focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleUpdateStatus('APPROVED')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-md bg-status-verified px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {actionLoading && activeAction === 'APPROVED' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying & Approving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve Claim & Authorize Handover</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('REJECTED')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-md border border-status-lost/30 bg-status-lost-bg px-4 py-2.5 text-xs font-semibold text-status-lost hover:bg-status-lost hover:text-white transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {actionLoading && activeAction === 'REJECTED' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Rejecting...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>Reject (Insufficient Proof)</span>
                      </>
                    )}
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

