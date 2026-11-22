import { ShieldCheck, Lock, MapPin, AlertTriangle, EyeOff, UserX } from 'lucide-react';

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="border-b border-border-subtle pb-6 text-center">
        <div className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-3 py-1 text-xs font-semibold text-status-verified mb-2">
          <ShieldCheck className="h-4 w-4" />
          The FoundLoop Trust Framework
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Safety & Privacy Charter
        </h1>
        <p className="mt-2 text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
          How we protect your identity, prevent extortion scams, and maintain a secure community platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-text-primary">
            <EyeOff className="h-5 w-5 text-accent" />
            <span>1. Zero Public Contact Details</span>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary">
            Never under any circumstances are your personal phone numbers, private residential addresses, or personal email addresses published on public listings. All correspondence occurs via verified platform claims.
          </p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-text-primary">
            <MapPin className="h-5 w-5 text-accent" />
            <span>2. Approximate Public Locations</span>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary">
            Reports strictly request broad civic landmarks (e.g. &apos;Dadar Station Platform 4&apos; or &apos;IIT Bombay Main Gate&apos;) rather than precise private spots, preserving your daily movement privacy.
          </p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-text-primary">
            <Lock className="h-5 w-5 text-accent" />
            <span>3. Two-Tier Proof Verification</span>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary">
            Potential owners must prove ownership by answering private questions (lock screen wallpaper, internal contents, serial digits) before any physical meeting is authorized.
          </p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-text-primary">
            <UserX className="h-5 w-5 text-status-lost" />
            <span>4. Zero Ransom & Extortion Policy</span>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary">
            FoundLoop is a civic volunteer network. Demanding reward fees, ransoms, or payment before handing over an item is strictly prohibited and results in immediate, permanent ban.
          </p>
        </div>
      </div>

      {/* Recommended Handover Safety Checklist */}
      <div className="rounded-lg border border-border-subtle bg-surface p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-status-verified" />
          Recommended Handover Protocol for Indian Campuses & Stations
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-xs text-text-secondary leading-relaxed">
          <li><strong>Always meet in a daylight public location:</strong> Choose campus security booths, station superintendent offices, college reception desks, or well-lit concourses.</li>
          <li><strong>Never meet alone at night in secluded areas:</strong> Bring a friend, roommate, or security guard along if meeting in person.</li>
          <li><strong>Inspect the physical item on the spot:</strong> Turn on mobile devices or verify document photographs before confirming completion.</li>
          <li><strong>Deposit high-value electronics with official desks:</strong> If you find a high-value phone or laptop, you are encouraged to deposit it with the nearest Station Master or Security Desk and report its custody location on FoundLoop.</li>
        </ol>
      </div>
    </div>
  );
}

