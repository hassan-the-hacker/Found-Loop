import { CheckCircle2, Circle, Clock } from 'lucide-react';

export type TimelineStatus =
  | 'REPORTED'
  | 'MATCH_PENDING'
  | 'CLAIM_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'OWNERSHIP_VERIFIED'
  | 'READY_COLLECTION'
  | 'RETURNED'
  | 'CLOSED';

interface RecoveryTimelineProps {
  currentStatus: TimelineStatus | string;
}

const STEPS = [
  { key: 'REPORTED', label: 'Report Submitted', desc: 'Listing active on platform' },
  { key: 'MATCH_PENDING', label: 'Potential Match', desc: 'Similarity identified' },
  { key: 'CLAIM_SUBMITTED', label: 'Claim Filed', desc: 'Proof details provided' },
  { key: 'UNDER_REVIEW', label: 'Under Review', desc: 'Finder/Moderator checking' },
  { key: 'OWNERSHIP_VERIFIED', label: 'Ownership Verified', desc: 'Identity confirmed' },
  { key: 'RETURNED', label: 'Successfully Returned', desc: 'Handover complete' },
];

export default function RecoveryTimeline({ currentStatus }: RecoveryTimelineProps) {
  const getStepIndex = (status: string) => {
    const s = (status || '').toUpperCase().trim();
    switch (s) {
      case 'REPORTED':
      case 'AVAILABLE':
        return 0;
      case 'MATCH_PENDING':
        return 1;
      case 'CLAIM_SUBMITTED':
        return 2;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'CLAIM_UNDER_REVIEW':
        return 3;
      case 'OWNERSHIP_VERIFIED':
      case 'VERIFIED':
      case 'APPROVED':
        return 4;
      case 'RETURNED':
      case 'HANDED_OVER':
      case 'CLOSED':
        return 5;
      default:
        return 0;
    }
  };

  const activeIdx = getStepIndex(currentStatus);

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
      <h3 className="text-sm font-bold tracking-tight text-text-primary uppercase">
        Item Recovery Progress
      </h3>
      <p className="mt-1 text-xs text-text-secondary">
        End-to-end chain of custody from initial report to verified community return.
      </p>

      <div className="mt-6 space-y-6">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={step.key} className="relative flex items-start gap-4">
              {/* Connecting line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`absolute left-[13px] top-7 -bottom-6 w-0.5 ${
                    isCompleted ? 'bg-status-verified' : 'bg-border-subtle'
                  }`}
                />
              )}

              {/* Icon Marker */}
              <div className="z-10 mt-0.5">
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-status-verified fill-emerald-50" />
                ) : isCurrent ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-accent bg-accent-subtle">
                    <Clock className="h-3.5 w-3.5 text-accent animate-pulse" />
                  </div>
                ) : (
                  <Circle className="h-6 w-6 text-text-muted stroke-[1.5]" />
                )}
              </div>

              {/* Content */}
              <div>
                <h4
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-accent font-bold'
                      : isCompleted
                      ? 'text-text-primary'
                      : 'text-text-muted'
                  }`}
                >
                  {step.label}
                  {isCurrent && (
                    <span className="ml-2 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                      Active Step
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-text-secondary mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

