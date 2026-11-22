'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, AlertCircle, ArrowRight, ShieldCheck, X, CheckCheck } from 'lucide-react';
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
  const pathname = usePathname();

  const getReadSet = useCallback((): Set<string> => {
    if (typeof window === 'undefined' || !userId) return new Set();
    try {
      const stored = localStorage.getItem(`foundloop_read_notifs_${userId}`);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch { }
    return new Set();
  }, [userId]);

  const saveReadSet = useCallback((set: Set<string>) => {
    if (typeof window === 'undefined' || !userId) return;
    try {
      localStorage.setItem(`foundloop_read_notifs_${userId}`, JSON.stringify(Array.from(set)));
    } catch { }
  }, [userId]);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      // 1. Fetch user's found items
      const { data: foundItems } = await supabase
        .from('found_items')
        .select('id, title, status')
        .eq('user_id', userId);

      const foundMap = new Map((foundItems || []).map((f: any) => [f.id, f.title]));

      // 2. Fetch all claims
      const { data: allClaims } = await supabase
        .from('ownership_claims')
        .select('*')
        .order('created_at', { ascending: false });

      const notifs: NotificationItem[] = [];
      const readSet = getReadSet();
      let updatedRead = false;

      if (Array.isArray(allClaims)) {
        // Check for incoming claims on items I found
        allClaims.forEach((claim: any) => {
          if (foundMap.has(claim.found_item_id)) {
            const itemTitle = foundMap.get(claim.found_item_id) || 'Found Belonging';
            const isPending = claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW';
            const notifId = `in_${claim.id}`;
            const link = `/claims/${claim.id}`;

            // If user is currently viewing this claim page, automatically mark it as read!
            const isCurrentlyViewing = pathname && pathname.includes(claim.id);
            if (isCurrentlyViewing && !readSet.has(notifId)) {
              readSet.add(notifId);
              updatedRead = true;
            }

            const isRead = readSet.has(notifId);

            notifs.push({
              id: notifId,
              type: 'INCOMING_CLAIM',
              title: isPending ? '⚠️ New Ownership Claim!' : 'Ownership Claim Update',
              message: isPending
                ? `Someone claimed "${itemTitle}": "${claim.claim_description?.substring(0, 50) || 'Ownership answers submitted'}..."`
                : `Claim for "${itemTitle}" status is now ${claim.status}.`,
              link,
              time: claim.created_at,
              read: isRead,
            });
          }

          // Also notify if I was the claimant and my claim status changed
          if (claim.claimant_id === userId && claim.status !== 'SUBMITTED') {
            const notifId = `out_${claim.id}_${claim.status}`;
            const link = `/claims/${claim.id}`;

            const isCurrentlyViewing = pathname && pathname.includes(claim.id);
            if (isCurrentlyViewing && !readSet.has(notifId)) {
              readSet.add(notifId);
              updatedRead = true;
            }

            const isRead = readSet.has(notifId);

            notifs.push({
              id: notifId,
              type: 'CLAIM_STATUS_UPDATE',
              title: `Claim Update: ${claim.status}`,
              message: `Your claim has been updated to ${claim.status}.`,
              link,
              time: claim.updated_at || claim.created_at,
              read: isRead,
            });
          }
        });
      }

      if (updatedRead) {
        saveReadSet(readSet);
      }

      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch {
      // Silent error fallback
    }
  }, [userId, supabase, pathname, getReadSet, saveReadSet]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // If route changes to a claim page, auto-mark matching notifications as read
  useEffect(() => {
    if (!pathname || !notifications.length) return;
    const readSet = getReadSet();
    let changed = false;

    const updated = notifications.map((n) => {
      if (pathname.includes(n.link) || (n.link && pathname.startsWith(n.link))) {
        if (!readSet.has(n.id)) {
          readSet.add(n.id);
          changed = true;
        }
        return { ...n, read: true };
      }
      return n;
    });

    if (changed) {
      saveReadSet(readSet);
      setNotifications(updated);
      setUnreadCount(updated.filter((n) => !n.read).length);
    }
  }, [pathname, notifications, getReadSet, saveReadSet]);

  // Click single notification
  const handleNotifClick = (notifId: string) => {
    const readSet = getReadSet();
    readSet.add(notifId);
    saveReadSet(readSet);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setIsOpen(false);
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const readSet = getReadSet();
    notifications.forEach((n) => readSet.add(n.id));
    saveReadSet(readSet);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

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
        className="relative rounded-md p-1.5 text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors focus:outline-none cursor-pointer"
        aria-label="Notifications"
        title="View Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-lost text-[10px] font-bold text-white shadow-xs">
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
              {unreadCount > 0 ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {unreadCount} New
                </span>
              ) : (
                <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                  All Caught Up
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link}
                  onClick={() => handleNotifClick(notif.id)}
                  className={`block p-3.5 transition-colors group ${
                    notif.read
                      ? 'hover:bg-surface-subtle opacity-75'
                      : 'bg-amber-50/40 hover:bg-amber-50/70 border-l-2 border-accent'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        notif.read ? 'bg-surface-subtle text-text-muted' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs flex items-center gap-1.5 ${
                            notif.read
                              ? 'font-medium text-text-secondary group-hover:text-text-primary'
                              : 'font-bold text-text-primary group-hover:text-accent'
                          }`}
                        >
                          {!notif.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                          )}
                          <span>{notif.title}</span>
                        </h4>
                        <ArrowRight className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
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
                <p className="font-medium text-text-primary">No notifications</p>
                <p className="text-[11px] mt-0.5 text-text-secondary">
                  When someone claims an item you found, you will be notified here instantly.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border-subtle p-2.5 text-center bg-surface-subtle/30 rounded-b-xl flex items-center justify-between px-4">
            <span className="text-[11px] text-text-muted">
              {unreadCount === 0 ? '✓ No unread notifications' : `${unreadCount} unread`}
            </span>
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
