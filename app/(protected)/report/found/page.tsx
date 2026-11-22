'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ITEM_CATEGORIES, INDIAN_CITIES, ITEM_COLORS, CUSTODY_TYPES } from '@/lib/constants';
import ImageUpload from '@/components/forms/ImageUpload';
import { ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function ReportFoundPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(ITEM_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [primaryColor, setPrimaryColor] = useState<string>(ITEM_COLORS[0]);
  const [secondaryColor, setSecondaryColor] = useState('');
  const [foundDate, setFoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [city, setCity] = useState<string>(INDIAN_CITIES[0]);
  const [approximateLocation, setApproximateLocation] = useState('');
  const [custodyType, setCustodyType] = useState<string>(CUSTODY_TYPES[0].value);
  const [custodyDetails, setCustodyDetails] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be signed in to submit a found item report.');
        return;
      }

      const { data, error: insertError } = await (supabase
        .from('found_items') as any)
        .insert({
          user_id: user.id,
          title: title.trim(),
          category,
          description: description.trim(),
          brand: brand.trim() || null,
          primary_color: primaryColor,
          secondary_color: secondaryColor.trim() || null,
          found_date: foundDate,
          city,
          approximate_location: approximateLocation.trim(),
          custody_type: custodyType as any,
          custody_details: custodyDetails.trim() || null,
          image_url: imageUrl,
          status: 'AVAILABLE',
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Trigger automatic background matching
      if (data) {
        fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: data.id, itemType: 'FOUND' }),
        }).catch(() => {});
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/found');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-border-subtle pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-status-found">
          <HeartHandshake className="h-4 w-4" />
          Good Samaritan Found Property Report
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Report a Found Belonging
        </h1>
        <p className="mt-1 text-sm text-text-secondary leading-relaxed">
          Thank you for stepping up to return someone&apos;s lost belonging. Your personal contact information
          remains completely protected.
        </p>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Found item registered! Thank you for helping the community.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Section 1: Item Details */}
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-text-primary border-b border-border-subtle pb-3">
            1. Found Item Details
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-primary" htmlFor="title">
                Item Title / Name *
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Set of 3 Bike Keys with Wooden Keychain"
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm bg-surface focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="brand">
                Brand / Make (If visible)
              </label>
              <input
                id="brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Fastrack, Wildcraft, Honda"
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="primaryColor">
                Primary Color *
              </label>
              <select
                id="primaryColor"
                required
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm bg-surface focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {ITEM_COLORS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="secondaryColor">
                Secondary Color / Pattern
              </label>
              <input
                id="secondaryColor"
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="e.g. Silver metallic, White stitches"
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-primary" htmlFor="description">
                Public Description *
              </label>
              <textarea
                id="description"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe visible traits without giving away all unique features (so the claimant can prove it's theirs)."
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="mt-1 text-[11px] text-text-muted">
                Tip: Keep 1 or 2 small details unmentioned so you can test whoever claims it!
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Date & Discovery Location */}
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-text-primary border-b border-border-subtle pb-3">
            2. When & Where Was It Found?
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="foundDate">
                Date Found *
              </label>
              <input
                id="foundDate"
                type="date"
                required
                value={foundDate}
                onChange={(e) => setFoundDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm bg-surface focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="city">
                City / Region *
              </label>
              <select
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm bg-surface focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-primary" htmlFor="location">
                Exact Discovery Spot / Landmark *
              </label>
              <input
                id="location"
                type="text"
                required
                value={approximateLocation}
                onChange={(e) => setApproximateLocation(e.target.value)}
                placeholder="e.g. Near Canteen Table 4, Block C, or CSMT Suburban Ticket Counter"
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Safe Custody Status */}
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-text-primary border-b border-border-subtle pb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-status-verified" />
            3. Current Custody / Where Is It Stored Right Now?
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="custodyType">
                Who holds custody of the physical item? *
              </label>
              <select
                id="custodyType"
                required
                value={custodyType}
                onChange={(e) => setCustodyType(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm bg-surface focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {CUSTODY_TYPES.map((cust) => (
                  <option key={cust.value} value={cust.value}>
                    {cust.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="custodyDetails">
                Custody Reference / Desk Details (Optional)
              </label>
              <input
                id="custodyDetails"
                type="text"
                value={custodyDetails}
                onChange={(e) => setCustodyDetails(e.target.value)}
                placeholder="e.g. Handed to Officer Deshmukh at Gate 1, or Keeping in my hostel room 204"
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Photograph */}
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-text-primary border-b border-border-subtle pb-3">
            4. Photograph of Found Item
          </h2>
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            label="Upload photo of the found item"
            helperText="Showing a photo helps the legitimate owner identify it immediately."
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
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
            {loading ? 'Submitting Report...' : 'Publish Found Item'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

