'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AuthModal from './AuthModal';

interface AuthModalContextType {
  user: { id: string; email?: string } | null;
  openAuthModal: (targetUrl?: string, actionType?: 'lost' | 'found' | 'general') => void;
  closeAuthModal: () => void;
  requireAuth: (targetUrl: string, actionType?: 'lost' | 'found' | 'general') => boolean;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState('/dashboard');
  const [actionType, setActionType] = useState<'lost' | 'found' | 'general'>('general');
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser((prev) => {
        if (prev?.id === user?.id) return prev;
        return user;
      });
    }
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser((prev) => {
        const nextId = session?.user?.id ?? null;
        const prevId = prev?.id ?? null;
        if (nextId === prevId) return prev;
        return session?.user ?? null;
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = useCallback(
    (url: string = '/dashboard', type: 'lost' | 'found' | 'general' = 'general') => {
      setTargetUrl(url);
      setActionType(type);
      setIsOpen(true);
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const requireAuth = useCallback(
    (url: string, type: 'lost' | 'found' | 'general' = 'general'): boolean => {
      if (user) {
        router.push(url);
        return true;
      }
      openAuthModal(url, type);
      return false;
    },
    [user, router, openAuthModal]
  );

  return (
    <AuthModalContext.Provider
      value={{
        user,
        openAuthModal,
        closeAuthModal,
        requireAuth,
      }}
    >
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={closeAuthModal}
        targetUrl={targetUrl}
        actionType={actionType}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}

