import Link from 'next/link';
import AuthProtectedLink from '@/components/auth/AuthProtectedLink';
import {
  PlusCircle,
  Search,
  Sparkles,
  Lock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="border-b border-border-subtle pb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          How FoundLoop Works
        </h1>
        <p className="mt-2 text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
          A practical, privacy-respecting guide to reporting lost items, connecting with finders,
          and safely proving ownership.
        </p>
      </div>

      {/* 5-Step Process */}
      <div className="space-y-8">
        {/* Step 1 */}
        <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-lg border border-border-subtle bg-surface shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-white font-bold text-lg">
            1
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">
              Step 1: File an Accurate Report
            </h3>
            <p className="text-xs leading-relaxed text-text-secondary">
              Whether you lost a belonging or discovered one, create a structured report. You specify the category, brand, primary color, date, and approximate landmark.
            </p>
            <div className="rounded border border-amber-200 bg-amber-50/50 p-2.5 text-[11px] text-amber-900 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              <span><strong>The Privacy Lock:</strong> You provide private identification marks (wallpaper, inner pockets, serial codes) that are locked and hidden from public view.</span>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-lg border border-border-subtle bg-surface shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-white font-bold text-lg">
            2
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">
              Step 2: Deterministic Smart Matching
            </h3>
            <p className="text-xs leading-relaxed text-text-secondary">
              Instead of relying on luck in noisy social media groups, our algorithm automatically cross-checks lost items with found items across category, city, keywords, colors, and date proximity.
            </p>
            <div className="rounded border border-border-subtle bg-surface-subtle p-2.5 text-[11px] text-text-secondary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>Pairs scoring $\ge 50\%$ trigger match suggestions on your user dashboard.</span>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-lg border border-border-subtle bg-surface shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-white font-bold text-lg">
            3
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">
              Step 3: Ownership Verification Claim
            </h3>
            <p className="text-xs leading-relaxed text-text-secondary">
              Similarity is NOT proof of ownership. To claim an item, the owner submits private proof answers (e.g. what is written inside, wallpaper description, purchase invoice).
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-lg border border-border-subtle bg-surface shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-white font-bold text-lg">
            4
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">
              Step 4: Finder / Moderator Evaluation
            </h3>
            <p className="text-xs leading-relaxed text-text-secondary">
              The finder or authorized community moderator compares the claimant&apos;s private answers with the physical item in their custody. If verified, the status upgrades to <strong>Ownership Verified</strong>.
            </p>
          </div>
        </div>

        {/* Step 5 */}
        <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-lg border border-border-subtle bg-surface shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-white font-bold text-lg">
            5
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">
              Step 5: Safe In-Person Handover
            </h3>
            <p className="text-xs leading-relaxed text-text-secondary">
              Handover is coordinated at a verified public place (Campus Security Gate, Station Master Office, Reception, or Police Station). Once collected, the case is marked <strong>Successfully Returned</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="rounded-lg border border-border-subtle bg-surface p-8 text-center space-y-4 shadow-sm">
        <h3 className="text-xl font-bold text-text-primary">Ready to get started?</h3>
        <p className="text-xs text-text-secondary max-w-md mx-auto">
          Help build a trusted, helpful community in your college, station, or neighborhood.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <AuthProtectedLink
            href="/report/lost"
            actionType="lost"
            className="rounded-md bg-accent px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-accent-hover"
          >
            I Lost Something
          </AuthProtectedLink>
          <AuthProtectedLink
            href="/report/found"
            actionType="found"
            className="rounded-md border border-[#D1D5DB] bg-surface px-5 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-subtle"
          >
            I Found Something
          </AuthProtectedLink>
        </div>
      </div>
    </div>
  );
}

