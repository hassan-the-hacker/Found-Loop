'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface NotificationItem {
  id: string;
  type: 'INCOMING_CLAIM' | 'CLAIM_STATUS_UPDATE';
  title: string;
  message: string;
  link: string;
  time: string;
  read: boolean;
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadNotifications() {
      if (!userId) return;

      try {
        // 1. Fetch user's found items
        const { data: foundItems } = await supabase
          .from('found_items')
          .select('id, title, status')
          .eq('user_id', userId);

        const foundMap = new Map((foundItems || []).map((f: any) => [f.id, f.title]));
        const foundIds = Array.from(foundMap.keys());

        // 2. Fetch all claims
        const { data: allClaims } = await supabase
          .from('ownership_claims')
          .select('*')
          .order('created_at', { ascending: false });

        const notifs: NotificationItem[] = [];

        if (Array.isArray(allClaims)) {
          // Check for incoming claims on items I found
          allClaims.forEach((claim: any) => {
            if (foundMap.has(claim.found_item_id)) {
              const itemTitle = foundMap.get(claim.found_item_id) || 'Found Belonging';
              const isPending = claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW';

              notifs.push({
                id: `in_${claim.id}`,
                type: 'INCOMING_CLAIM',
                title: isPending ? '⚠️ New Ownership Claim!' : 'Ownership Claim Update',
                message: isPending
                  ? `Someone claimed "${itemTitle}": "${claim.claim_description?.substring(0, 50) || 'Ownership answers submitted'}..."`
                  : `Claim for "${itemTitle}" status is now ${claim.status}.`,
                link: `/claims/${claim.id}`,
                time: claim.created_at,
                read: false,
              });
            }

            // Also notify if I was the claimant and my claim status changed
            if (claim.claimant_id === userId && claim.status !== 'SUBMITTED') {
              notifs.push({
                id: `out_${claim.id}`,
                type: 'CLAIM_STATUS_UPDATE',
                title: `Claim Update: ${claim.status}`,
                message: `Your claim for item has been updated to ${claim.status}.`,
                link: `/claims/${claim.id}`,
                time: claim.updated_at || claim.created_at,
                read: false,
              });
            }
          });
        }

        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.read).length);
      } catch {
        // Silent error fallback
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [userId, supabase]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-md p-1.5 text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors focus:outline-none"
        aria-label="Notifications"
        title="View Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-lost text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border-subtle bg-surface shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in-50 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3 bg-surface-subtle/50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {unreadCount} New
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-text-muted hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link}
                  onClick={() => setIsOpen(false)}
                  className="block p-3.5 hover:bg-surface-subtle transition-colors group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-text-primary group-hover:text-accent flex items-center justify-between">
                        <span>{notif.title}</span>
                        <ArrowRight className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-text-muted">
                <ShieldCheck className="h-8 w-8 text-text-muted mx-auto mb-1.5 stroke-[1.2]" />
                <p className="font-medium text-text-primary">No new notifications</p>
                <p className="text-[11px] mt-0.5 text-text-secondary">
                  When someone claims an item you found, you will be notified here instantly.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border-subtle p-2.5 text-center bg-surface-subtle/30 rounded-b-xl">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-accent hover:underline"
            >
              Go to Dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

