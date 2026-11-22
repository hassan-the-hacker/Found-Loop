'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Search,
  CheckCircle2,
  PlusCircle
} from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl?: string;
  actionType?: 'lost' | 'found' | 'general';
}

export default function AuthModal({
  isOpen,
  onClose,
  targetUrl = '/dashboard',
  actionType = 'general',
}: AuthModalProps) {
  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const registerHref = `/register?redirectTo=${encodeURIComponent(targetUrl)}`;
  const loginHref = `/login?redirectTo=${encodeURIComponent(targetUrl)}`;

  const isLost = actionType === 'lost';
  const isFound = actionType === 'found';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border-subtle bg-surface p-6 sm:p-7 shadow-2xl transition-all z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full mb-3.5 shadow-sm ${isLost
                ? 'bg-status-lost-bg text-status-lost border border-red-200'
                : isFound
                  ? 'bg-status-found-bg text-status-found border border-emerald-200'
                  : 'bg-accent/10 text-accent border border-accent/20'
              }`}
          >
            {isLost ? (
              <Search className="h-6 w-6 stroke-[2.2]" />
            ) : isFound ? (
              <PlusCircle className="h-6 w-6 stroke-[2.2]" />
            ) : (
              <Lock className="h-6 w-6 stroke-[2.2]" />
            )}
          </div>

          <h3 className="text-xl font-bold tracking-tight text-text-primary">
            {isLost
              ? 'Sign Up to Report a Lost Item'
              : isFound
                ? 'Sign Up to Report a Found Item'
                : 'Create Account to Continue'}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
            {isLost
              ? 'Please create a free account or sign in to submit your lost report. Having an account ensures you receive instant match notifications and keeps your personal phone number private.'
              : isFound
                ? 'Please create a free account or sign in to register a found belonging. Having an account allows rightful owners to submit verifiable ownership claims to you securely.'
                : 'Sign up or sign in to publish reports, verify ownership claims, and get automated match alerts.'}
          </p>
        </div>

        {/* Community Trust Points */}
        <div className="mt-5 space-y-2.5 rounded-lg border border-border-subtle bg-surface-subtle p-3.5 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
            <span>
              <strong className="text-text-primary">Privacy Protected:</strong> Phone numbers and private identifying markings are never shown publicly.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-status-found shrink-0" />
            <span>
              <strong className="text-text-primary">100% Free Forever:</strong> Takes under 30 seconds to sign up.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <Link
            href={registerHref}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover text-center"
          >
            <span>Create Free Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href={loginHref}
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-md border border-border-subtle bg-surface px-4 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-subtle text-center"
          >
            Already have an account? Sign In
          </Link>
        </div>

        {/* Dismiss Notice */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-text-muted hover:text-text-secondary transition-colors"
          >
            Cancel and stay on this page
          </button>
        </div>
      </div>
    </div>
  );
}

