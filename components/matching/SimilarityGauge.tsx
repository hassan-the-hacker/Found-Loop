import { Check, AlertCircle } from 'lucide-react';
import { MatchScoreResult } from '@/types/app';

interface SimilarityGaugeProps {
  match: MatchScoreResult;
}

export default function SimilarityGauge({ match }: SimilarityGaugeProps) {
  const { score, tier, reasons } = match;

  const getTierDetails = (t: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (t) {
      case 'HIGH':
        return {
          label: 'High Similarity',
          bg: 'bg-emerald-50',
          text: 'text-emerald-800',
          border: 'border-emerald-200',
          bar: 'bg-emerald-600',
        };
      case 'MEDIUM':
        return {
          label: 'Possible Match',
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          bar: 'bg-amber-500',
        };
      case 'LOW':
      default:
        return {
          label: 'Low Similarity',
          bg: 'bg-stone-50',
          text: 'text-stone-700',
          border: 'border-stone-200',
          bar: 'bg-stone-400',
        };
    }
  };

  const details = getTierDetails(tier);

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Smart Matching Score
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold tracking-tight text-text-primary">
              {score}%
            </span>
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${details.bg} ${details.text} ${details.border}`}
            >
              {details.label}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle border border-border-subtle">
        <div
          className={`h-full transition-all duration-500 ${details.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Matched Attributes Breakdown */}
      <div className="space-y-1.5 pt-2 border-t border-border-subtle">
        <span className="text-xs font-semibold text-text-primary">Matching Breakdown:</span>
        <ul className="space-y-1 text-xs text-text-secondary">
          {reasons.map((reason, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-status-verified shrink-0 stroke-[2.5]" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50/70 p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Note:</strong> This score is an automated suggestion, not proof of
          ownership. Detailed verification is required before any collection occurs.
        </p>
      </div>
    </div>
  );
}

