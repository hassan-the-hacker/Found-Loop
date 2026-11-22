import { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type LostItem = Database['public']['Tables']['lost_items']['Row'];
export type FoundItem = Database['public']['Tables']['found_items']['Row'];
export type PotentialMatch = Database['public']['Tables']['potential_matches']['Row'];
export type OwnershipClaim = Database['public']['Tables']['ownership_claims']['Row'];
export type ItemStatusHistory = Database['public']['Tables']['item_status_history']['Row'];
export type ReportAndFlag = Database['public']['Tables']['reports_and_flags']['Row'];

export type AnyItem = (LostItem & { type: 'LOST' }) | (FoundItem & { type: 'FOUND' });

export interface BrowseFilterState {
  type: 'ALL' | 'LOST' | 'FOUND';
  category: string;
  city: string;
  color: string;
  searchQuery: string;
}

export interface MatchScoreResult {
  score: number;
  tier: 'HIGH' | 'MEDIUM' | 'LOW';
  matchedFields: string[];
  reasons: string[];
}

