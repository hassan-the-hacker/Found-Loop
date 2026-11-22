export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone_number: string | null
          role: 'user' | 'moderator' | 'admin'
          avatar_url: string | null
          is_suspended: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone_number?: string | null
          role?: 'user' | 'moderator' | 'admin'
          avatar_url?: string | null
          is_suspended?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone_number?: string | null
          role?: 'user' | 'moderator' | 'admin'
          avatar_url?: string | null
          is_suspended?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lost_items: {
        Row: {
          id: string
          user_id: string
          title: string
          category: string
          description: string
          brand: string | null
          primary_color: string
          secondary_color: string | null
          lost_date: string
          city: string
          approximate_location: string
          latitude: number | null
          longitude: number | null
          image_url: string | null
          private_identifying_details: string
          status: 'REPORTED' | 'MATCH_PENDING' | 'CLAIM_SUBMITTED' | 'VERIFIED' | 'RETURNED' | 'CLOSED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category: string
          description: string
          brand?: string | null
          primary_color: string
          secondary_color?: string | null
          lost_date: string
          city: string
          approximate_location: string
          latitude?: number | null
          longitude?: number | null
          image_url?: string | null
          private_identifying_details: string
          status?: 'REPORTED' | 'MATCH_PENDING' | 'CLAIM_SUBMITTED' | 'VERIFIED' | 'RETURNED' | 'CLOSED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: string
          description?: string
          brand?: string | null
          primary_color?: string
          secondary_color?: string | null
          lost_date?: string
          city?: string
          approximate_location?: string
          latitude?: number | null
          longitude?: number | null
          image_url?: string | null
          private_identifying_details?: string
          status?: 'REPORTED' | 'MATCH_PENDING' | 'CLAIM_SUBMITTED' | 'VERIFIED' | 'RETURNED' | 'CLOSED'
          created_at?: string
          updated_at?: string
        }
      }
      found_items: {
        Row: {
          id: string
          user_id: string
          title: string
          category: string
          description: string
          brand: string | null
          primary_color: string
          secondary_color: string | null
          found_date: string
          city: string
          approximate_location: string
          latitude: number | null
          longitude: number | null
          image_url: string | null
          custody_type: 'WITH_FINDER' | 'POLICE_STATION' | 'SECURITY_DESK' | 'LOST_AND_FOUND_OFFICE'
          custody_details: string | null
          status: 'AVAILABLE' | 'CLAIM_UNDER_REVIEW' | 'OWNERSHIP_VERIFIED' | 'RETURNED' | 'CLOSED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category: string
          description: string
          brand?: string | null
          primary_color: string
          secondary_color?: string | null
          found_date: string
          city: string
          approximate_location: string
          latitude?: number | null
          longitude?: number | null
          image_url?: string | null
          custody_type?: 'WITH_FINDER' | 'POLICE_STATION' | 'SECURITY_DESK' | 'LOST_AND_FOUND_OFFICE'
          custody_details?: string | null
          status?: 'AVAILABLE' | 'CLAIM_UNDER_REVIEW' | 'OWNERSHIP_VERIFIED' | 'RETURNED' | 'CLOSED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: string
          description?: string
          brand?: string | null
          primary_color?: string
          secondary_color?: string | null
          found_date?: string
          city?: string
          approximate_location?: string
          latitude?: number | null
          longitude?: number | null
          image_url?: string | null
          custody_type?: 'WITH_FINDER' | 'POLICE_STATION' | 'SECURITY_DESK' | 'LOST_AND_FOUND_OFFICE'
          custody_details?: string | null
          status?: 'AVAILABLE' | 'CLAIM_UNDER_REVIEW' | 'OWNERSHIP_VERIFIED' | 'RETURNED' | 'CLOSED'
          created_at?: string
          updated_at?: string
        }
      }
      potential_matches: {
        Row: {
          id: string
          lost_item_id: string
          found_item_id: string
          similarity_score: number
          tier: 'HIGH' | 'MEDIUM' | 'LOW'
          matched_fields: string[]
          reasons: string[]
          status: 'SUGGESTED' | 'REVIEWED' | 'CLAIM_INITIATED' | 'DISMISSED'
          created_at: string
        }
        Insert: {
          id?: string
          lost_item_id: string
          found_item_id: string
          similarity_score: number
          tier: 'HIGH' | 'MEDIUM' | 'LOW'
          matched_fields: string[]
          reasons: string[]
          status?: 'SUGGESTED' | 'REVIEWED' | 'CLAIM_INITIATED' | 'DISMISSED'
          created_at?: string
        }
        Update: {
          id?: string
          lost_item_id?: string
          found_item_id?: string
          similarity_score?: number
          tier?: 'HIGH' | 'MEDIUM' | 'LOW'
          matched_fields?: string[]
          reasons?: string[]
          status?: 'SUGGESTED' | 'REVIEWED' | 'CLAIM_INITIATED' | 'DISMISSED'
          created_at?: string
        }
      }
      ownership_claims: {
        Row: {
          id: string
          found_item_id: string
          lost_item_id: string | null
          claimant_id: string
          claim_description: string
          private_proof_answers: string
          proof_image_url: string | null
          status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'HANDED_OVER'
          reviewer_id: string | null
          review_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          found_item_id: string
          lost_item_id?: string | null
          claimant_id: string
          claim_description: string
          private_proof_answers: string
          proof_image_url?: string | null
          status?: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'HANDED_OVER'
          reviewer_id?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          found_item_id?: string
          lost_item_id?: string | null
          claimant_id?: string
          claim_description?: string
          private_proof_answers?: string
          proof_image_url?: string | null
          status?: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'HANDED_OVER'
          reviewer_id?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      item_status_history: {
        Row: {
          id: string
          item_type: 'LOST' | 'FOUND' | 'CLAIM'
          item_id: string
          previous_status: string | null
          new_status: string
          changed_by: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_type: 'LOST' | 'FOUND' | 'CLAIM'
          item_id: string
          previous_status?: string | null
          new_status: string
          changed_by: string
          notes?: string | null
          created_at?: string
        }
      }
      reports_and_flags: {
        Row: {
          id: string
          reporter_id: string
          item_type: 'LOST' | 'FOUND' | 'CLAIM' | 'USER'
          item_id: string
          reason: 'SPAM' | 'SCAM_REWARD_DEMAND' | 'INAPPROPRIATE_CONTENT' | 'DUPLICATE' | 'OTHER'
          details: string | null
          status: 'PENDING' | 'REVIEWED' | 'ACTION_TAKEN' | 'DISMISSED'
          resolved_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          item_type: 'LOST' | 'FOUND' | 'CLAIM' | 'USER'
          item_id: string
          reason: 'SPAM' | 'SCAM_REWARD_DEMAND' | 'INAPPROPRIATE_CONTENT' | 'DUPLICATE' | 'OTHER'
          details?: string | null
          status?: 'PENDING' | 'REVIEWED' | 'ACTION_TAKEN' | 'DISMISSED'
          resolved_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          item_type?: 'LOST' | 'FOUND' | 'CLAIM' | 'USER'
          item_id?: string
          reason?: 'SPAM' | 'SCAM_REWARD_DEMAND' | 'INAPPROPRIATE_CONTENT' | 'DUPLICATE' | 'OTHER'
          details?: string | null
          status?: 'PENDING' | 'REVIEWED' | 'ACTION_TAKEN' | 'DISMISSED'
          resolved_by?: string | null
          created_at?: string
        }
      }
    }
  }
}

