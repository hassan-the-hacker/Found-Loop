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
  UserCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, getStatusBadge } from '@/lib/utils';
import { LostItem, FoundItem } from '@/types/app';

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

  // Fallback demo mock if database record not yet committed
  if (!item) {
    if (id.startsWith('demo-')) {
      item = {
        id,
        user_id: 'mock-user',
        title: 'College ID Card & Metro Pass',
        category: 'Documents',
        description: 'Lost near the college library entrance. Has a blue lanyard with an RFID metro tag.',
        brand: 'Mumbai Metro / VJTI',
        primary_color: 'Blue',
        secondary_color: 'White',
        lost_date: '2026-11-20',
        city: 'Mumbai',
        approximate_location: 'Near VJTI Library / Matunga Station',
        latitude: null,
        longitude: null,
        image_url: null,
        private_identifying_details: 'Mock private details',
        status: 'REPORTED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as LostItem;
      isLost = true;
    } else {
      notFound();
    }
  }

  const badge = getStatusBadge(item.status);
  const dateStr = isLost ? (item as LostItem).lost_date : (item as FoundItem).found_date;

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

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column: Photograph Preview */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-subtle aspect-square flex items-center justify-center">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-text-muted p-8 text-center">
                <Box className="h-16 w-16 stroke-[1.2]" />
                <span className="mt-2 text-xs font-medium">No Photograph Provided</span>
                <span className="text-[11px] text-text-muted mt-1">
                  Public identification relies on description and approximate landmark.
                </span>
              </div>
            )}
          </div>

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
              <AuthProtectedLink
                href={`/items/${item.id}/claim`}
                actionType="general"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
              >
                <UserCheck className="h-4 w-4" />
                Claim This Item (Prove Ownership)
              </AuthProtectedLink>
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

