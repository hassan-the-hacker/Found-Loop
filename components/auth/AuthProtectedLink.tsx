'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthModal } from './AuthModalContext';

export interface AuthProtectedLinkProps {
  href: string;
  actionType?: 'lost' | 'found' | 'general';
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export default function AuthProtectedLink({
  href,
  actionType = 'general',
  className = '',
  children,
  onClick,
}: AuthProtectedLinkProps) {
  const { user, openAuthModal } = useAuthModal();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }

    if (!user) {
      e.preventDefault();
      openAuthModal(href, actionType);
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

