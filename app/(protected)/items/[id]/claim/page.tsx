'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/forms/ImageUpload';
import { ArrowLeft, Lock, ArrowRight, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { FoundItem } from '@/types/app';

export default function ClaimItemPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const supabase = createClient();

  const [foundItem, setFoundItem] = useState<FoundItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Claim fields
  const [claimDescription, setClaimDescription] = useState('');
  const [privateAnswers, setPrivateAnswers] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      const { data } = await supabase.from('found_items').select('*').eq('id', id).single();
      if (data) setFoundItem(data as FoundItem);
    }
    loadItem();
  }, [id, supabase]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be signed in to submit an ownership claim.');
        return;
      }

      // 1. Insert ownership claim
      const { data, error: claimError } = await (supabase
        .from('ownership_claims') as any)
        .insert({
          found_item_id: id,
          claimant_id: user.id,
          claim_description: claimDescription.trim(),
          private_proof_answers: privateAnswers.trim(),
          proof_image_url: proofImageUrl,
          status: 'SUBMITTED',
        })
        .select()
        .single();

      if (claimError) {
        throw new Error(claimError.message);
      }

      // 2. Update found item status to CLAIM_UNDER_REVIEW
      await (supabase
        .from('found_items') as any)
        .update({ status: 'CLAIM_UNDER_REVIEW' })
        .eq('id', id);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/claims/${data.id}`);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Claim submission failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Link
          href={`/items/${id}?type=FOUND`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Found Belonging Details
        </Link>
      </div>

      <div className="border-b border-border-subtle pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Submit Ownership Verification Claim
        </h1>
        <p className="mt-1 text-xs text-text-secondary">
          Claiming item:{' '}
          <span className="font-semibold text-text-primary">
            {foundItem ? foundItem.title : 'Found Belonging'}
          </span>
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Claim filed successfully! Loading verification progress...</span>
        </div>
      )}

      {/* Warning Alert */}
      <div className="rounded-md border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-950 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-amber-900">
          <ShieldAlert className="h-4 w-4 text-amber-700" />
          <span>Proof Requirement Mandatory</span>
        </div>
        <p className="leading-relaxed text-[11px] text-amber-900/80">
          To protect community members against fraud, you must provide specific identifying traits
          that only the legitimate owner would know. False or fraudulent claims result in permanent account suspension.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleClaimSubmit} className="space-y-6">
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-semibold text-text-primary" htmlFor="claimDescription">
              Circumstances of Loss *
            </label>
            <textarea
              id="claimDescription"
              required
              rows={3}
              value={claimDescription}
              onChange={(e) => setClaimDescription(e.target.value)}
              placeholder="Explain how, where, and when you lost this item (e.g. 'Left it on the seat when deboarding the train at Dadar around 6:30 PM')."
              className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="border-t border-border-subtle pt-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <Lock className="h-3.5 w-3.5 text-accent" />
              <span>Private Proof Answers (Crucial for Verification) *</span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Describe unique internal characteristics, exact serial codes, lock-screen image, names on internal cards, or hidden scratches.
            </p>
            <textarea
              id="privateAnswers"
              required
              rows={4}
              value={privateAnswers}
              onChange={(e) => setPrivateAnswers(e.target.value)}
              placeholder="Examples:&#10;1. In the small zipper pocket there is a blue 50-rupee note and a college canteen coupon.&#10;2. Phone IMEI or partial serial number.&#10;3. Name written inside: 'S. Kulkarni'."
              className="block w-full rounded-md border border-amber-300 bg-amber-50/20 px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="border-t border-border-subtle pt-4">
            <ImageUpload
              value={proofImageUrl}
              onChange={setProofImageUrl}
              label="Purchase Receipt / Bill / Photo of You with the Item (Optional)"
              helperText="Uploading an original invoice or previous photo provides instant conclusive verification."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-border-subtle bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-surface-subtle"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover disabled:opacity-60"
          >
            {loading ? 'Submitting Claim...' : 'Submit Claim for Review'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

