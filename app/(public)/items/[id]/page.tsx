import Link from 'next/link';
import AuthProtectedLink from '@/components/auth/AuthProtectedLink';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Tag,
  ArrowLeft,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Box,
  CheckCircle,
  Building,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, getStatusBadge } from '@/lib/utils';
import { LostItem, FoundItem, OwnershipClaim } from '@/types/app';
import ItemImageGallery from '@/components/items/ItemImageGallery';

interface PageProps {
  params: { id: string };
  searchParams: { type?: 'LOST' | 'FOUND' };
}

export default async function ItemDetailsPage({ params, searchParams }: PageProps) {
  const { id } = params;
  const itemType = searchParams.type || 'FOUND';
  const supabase = createClient();

  let item: (LostItem | FoundItem) | null = null;
  let isLost = itemType === 'LOST';

  try {
    if (isLost) {
      const { data } = await supabase.from('lost_items').select('*').eq('id', id).single();
      if (data) item = data as unknown as LostItem;
    } else {
      const { data } = await supabase.from('found_items').select('*').eq('id', id).single();
      if (data) item = data as unknown as FoundItem;
    }
  } catch {
    // If not found in primary table, try checking the opposite table
  }

  if (!item) {
    // Try the other table
    const { data: altLost } = await supabase.from('lost_items').select('*').eq('id', id).single();
    if (altLost) {
      item = altLost as unknown as LostItem;
      isLost = true;
    } else {
      const { data: altFound } = await supabase.from('found_items').select('*').eq('id', id).single();
      if (altFound) {
        item = altFound as unknown as FoundItem;
        isLost = false;
      }
    }
  }

  if (!item) {
    notFound();
  }

  const badge = getStatusBadge(item.status);
  const dateStr = isLost ? (item as LostItem).lost_date : (item as FoundItem).found_date;

  const { data: { user } } = await supabase.auth.getUser();
  const isOwnerFinder = !isLost && !!user && (item as FoundItem).user_id === user.id;

  let activeItemClaim: OwnershipClaim | null = null;
  if (!isLost && item) {
    const { data: claimData } = await supabase
      .from('ownership_claims')
      .select('*')
      .eq('found_item_id', item.id)
      .order('created_at', { ascending: false });
    if (Array.isArray(claimData) && claimData.length > 0) {
      activeItemClaim = claimData[0] as unknown as OwnershipClaim;
    }
  }

  const allImages: string[] = [];
  if (item.image_url) allImages.push(item.image_url);
  if (Array.isArray(item.additional_images)) {
    item.additional_images.forEach((img) => {
      if (img && typeof img === 'string' && !allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Listings
        </Link>
      </div>

      {/* Owner Finder Alert: If claim has been filed on this found item */}
      {isOwnerFinder && activeItemClaim && (
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-200 text-amber-900 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <span className="rounded bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950">
                  Claim Received
                </span>
                <h3 className="text-sm font-bold text-amber-950 mt-1">
                  Someone Submitted An Ownership Claim For This Belonging!
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                  A community member provided proof answers to claim this item. Please review their answers against the item in your custody.
                </p>
              </div>
            </div>
            <Link
              href={`/claims/${activeItemClaim.id}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-accent-hover shrink-0 self-start sm:self-center"
            >
              Review Claimant&apos;s Proof →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column: Photograph Gallery */}
        <div className="space-y-4">
          <ItemImageGallery title={item.title} images={allImages} />

          {/* Privacy Notice */}
          <div className="rounded-lg border border-border-subtle bg-surface p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-text-primary">
              <Lock className="h-4 w-4 text-accent" />
              <span>Confidentiality Protection Active</span>
            </div>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              To prevent fraudulent claims, private identifying marks (e.g. serial numbers, inner pouch items, specific wallpapers) are locked and never displayed publicly.
            </p>
          </div>
        </div>

        {/* Right Column: Public Attributes & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${isLost ? 'bg-status-lost text-white' : 'bg-status-found text-white'
                  }`}
              >
                {isLost ? 'LOST REPORT' : 'FOUND BELONGING'}
              </span>
              <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {item.title}
            </h1>

            <p className="mt-1 text-xs text-text-muted">
              Reported on {formatDate(item.created_at)}
            </p>
          </div>

          {/* Specifications Table */}
          <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden">
            <div className="border-b border-border-subtle bg-surface-subtle px-4 py-2 text-xs font-semibold text-text-primary">
              Public Attributes
            </div>
            <dl className="divide-y divide-border-subtle text-xs">
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-text-secondary">Category</dt>
                <dd className="font-semibold text-text-primary">{item.category}</dd>
              </div>

              {item.brand && (
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-text-secondary">Brand</dt>
                  <dd className="font-semibold text-text-primary">{item.brand}</dd>
                </div>
              )}

              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-text-secondary">Primary Color</dt>
                <dd className="font-semibold text-text-primary">{item.primary_color}</dd>
              </div>

              {item.secondary_color && (
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-text-secondary">Secondary Color</dt>
                  <dd className="font-semibold text-text-primary">{item.secondary_color}</dd>
                </div>
              )}

              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-text-secondary">{isLost ? 'Date Lost' : 'Date Found'}</dt>
                <dd className="font-semibold text-text-primary">{formatDate(dateStr)}</dd>
              </div>

              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-text-secondary">City / Region</dt>
                <dd className="font-semibold text-text-primary">{item.city}</dd>
              </div>

              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-text-secondary">Approximate Location</dt>
                <dd className="font-semibold text-text-primary text-right">{item.approximate_location}</dd>
              </div>

              {!isLost && (item as FoundItem).custody_type && (
                <div className="flex justify-between px-4 py-2.5 bg-surface-subtle/50">
                  <dt className="text-text-secondary flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    Physical Custody
                  </dt>
                  <dd className="font-semibold text-accent">
                    {(item as FoundItem).custody_type.replace(/_/g, ' ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Description
            </h3>
            <p className="text-xs leading-relaxed text-text-secondary rounded-lg border border-border-subtle bg-surface p-3.5">
              {item.description}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isLost ? (
              isOwnerFinder ? (
                activeItemClaim ? (
                  <Link
                    href={`/claims/${activeItemClaim.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Review Ownership Claim & Proof →
                  </Link>
                ) : (
                  <div className="rounded-md border border-border-subtle bg-surface-subtle p-3 text-center text-xs text-text-secondary">
                    You reported this found item. When someone claims it, their verification proof will appear here.
                  </div>
                )
              ) : (
                <AuthProtectedLink
                  href={`/items/${item.id}/claim`}
                  actionType="general"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
                >
                  <UserCheck className="h-4 w-4" />
                  Claim This Item (Prove Ownership)
                </AuthProtectedLink>
              )
            ) : (
              <AuthProtectedLink
                href="/report/found"
                actionType="found"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-status-found px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                <CheckCircle className="h-4 w-4" />
                I Found An Item Matching This Report
              </AuthProtectedLink>
            )}

            <div className="flex items-center justify-between text-xs text-text-muted px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-status-verified" />
                Ownership verified prior to handover
              </span>

              <button
                type="button"
                className="flex items-center gap-1 hover:text-status-lost transition-colors"
                title="Flag this report for moderator review"
              >
                <AlertTriangle className="h-3 w-3" />
                Flag Listing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

