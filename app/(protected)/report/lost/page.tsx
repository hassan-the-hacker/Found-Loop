'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ITEM_CATEGORIES, INDIAN_CITIES, ITEM_COLORS } from '@/lib/constants';
import ImageUpload from '@/components/forms/ImageUpload';
import Select from '@/components/ui/Select';
import DatePicker from '@/components/ui/DatePicker';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ReportLostPage() {
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
  const [lostDate, setLostDate] = useState(new Date().toISOString().split('T')[0]);
  const [city, setCity] = useState<string>(INDIAN_CITIES[0]);
  const [approximateLocation, setApproximateLocation] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [privateDetails, setPrivateDetails] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be signed in to submit a report.');
        return;
      }

      const { data, error: insertError } = await (supabase
        .from('lost_items') as any)
        .insert({
          user_id: user.id,
          title: title.trim(),
          category,
          description: description.trim(),
          brand: brand.trim() || null,
          primary_color: primaryColor,
          secondary_color: secondaryColor.trim() || null,
          lost_date: lostDate,
          city,
          approximate_location: approximateLocation.trim(),
          image_url: imageUrl,
          private_identifying_details: privateDetails.trim(),
          status: 'REPORTED',
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
          body: JSON.stringify({ itemId: data.id, itemType: 'LOST' }),
        }).catch(() => {});
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/lost');
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
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-status-lost">
          <span className="h-2 w-2 rounded-full bg-status-lost" />
          Lost Property Form
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Report a Lost Item
        </h1>
        <p className="mt-1 text-sm text-text-secondary leading-relaxed">
          Provide accurate details about your missing property. Public fields help finders locate you,
          while private details protect you against fraudulent claims.
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
          <span>Report submitted successfully! Redirecting to your dashboard...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Section 1: Basic Information */}
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-text-primary border-b border-border-subtle pb-3">
            1. Basic Item Details
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
                placeholder="e.g. Black Dell Inspiron 15 Laptop in Grey Bag"
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="mt-1 text-[11px] text-text-muted">
                Be specific with brand, model, and prominent attributes.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="category">
                Category *
              </label>
              <div className="mt-1">
                <Select
                  id="category"
                  value={category}
                  onChange={setCategory}
                  options={ITEM_CATEGORIES as any}
                  type="category"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="brand">
                Brand / Manufacturer (If applicable)
              </label>
              <input
                id="brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Titan, Wildcraft, Samsung"
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="primaryColor">
                Primary Color *
              </label>
              <div className="mt-1">
                <Select
                  id="primaryColor"
                  value={primaryColor}
                  onChange={setPrimaryColor}
                  options={ITEM_COLORS as any}
                  type="color"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="secondaryColor">
                Secondary Color / Accent
              </label>
              <input
                id="secondaryColor"
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="e.g. Red stripes, Gold buckle"
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
                placeholder="Describe visible condition, wear and tear, or general appearance without revealing secret identifying marks."
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Date & Location */}
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-text-primary border-b border-border-subtle pb-3">
            2. When & Where Was It Lost?
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="lostDate">
                Date Lost *
              </label>
              <div className="mt-1">
                <DatePicker
                  id="lostDate"
                  value={lostDate}
                  onChange={setLostDate}
                  maxDate={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary" htmlFor="city">
                City / Region *
              </label>
              <div className="mt-1">
                <Select
                  id="city"
                  value={city}
                  onChange={setCity}
                  options={INDIAN_CITIES as any}
                  type="city"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-primary" htmlFor="location">
                Approximate Landmark / Area *
              </label>
              <input
                id="location"
                type="text"
                required
                value={approximateLocation}
                onChange={(e) => setApproximateLocation(e.target.value)}
                placeholder="e.g. Dadar Station Platform 4, Near Canteen at IIT Bombay, Rajiv Chowk Gate 2"
                className="mt-1 block w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="mt-1 text-[11px] text-text-muted">
                State public landmarks. Never provide your private home address.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Photograph */}
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-text-primary border-b border-border-subtle pb-3">
            3. Photograph (Optional)
          </h2>
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            label="Upload an old photo or reference image"
            helperText="Clear reference photos help potential finders recognize your belonging."
          />
        </div>

        {/* Section 4: Private Identifying Information (The Security Lock) */}
        <div className="rounded-lg border-2 border-amber-200 bg-amber-50/40 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
            <Lock className="h-4 w-4 text-amber-700" />
            <span>4. Private Identifying Information (CONFIDENTIAL) *</span>
          </div>

          <p className="text-xs text-amber-950/80 leading-relaxed">
            This information is <strong>never displayed on public pages</strong>. It is safely locked
            in the database and only used to verify your ownership when a matching found item is discovered.
          </p>

          <div>
            <textarea
              id="privateDetails"
              required
              rows={3}
              value={privateDetails}
              onChange={(e) => setPrivateDetails(e.target.value)}
              placeholder="Examples: 'Lock screen wallpaper is a golden retriever', 'Serial number ends in 4821', 'Aadhaar card name is Ramesh Kumar', 'Keyring has a broken red heart tag', 'Inside wallet is a metro card with 250 balance'."
              className="mt-1 block w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <p className="mt-1 text-[11px] text-amber-900/70 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Only verified moderators or the finder reviewing your claim will compare this.
            </p>
          </div>
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
            {loading ? 'Submitting Report...' : 'Publish Lost Report'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

