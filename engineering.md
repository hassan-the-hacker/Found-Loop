# FoundLoop – Engineering & Technical Architecture

## 1. System Architecture Overview

FoundLoop is built as a production-grade full-stack Next.js application utilizing the App Router, TypeScript, Tailwind CSS, and Supabase (PostgreSQL, GoTrue Auth, and Storage).

```
                      ┌──────────────────────────────────────┐
                      │        Next.js (App Router)          │
                      │   Vercel Free Tier Serverless / Edge │
                      └───────┬──────────────────────┬───────┘
                              │                      │
                   React Server Components     Client Components
                   (Data Fetching & SEO)       (Forms, Filters, Maps)
                              │                      │
                              ▼                      ▼
                      ┌──────────────────────────────────────┐
                      │         Supabase Client SDK          │
                      │    (@supabase/ssr + @supabase-js)    │
                      └───────┬──────────────────────┬───────┘
                              │                      │
            ┌─────────────────┼──────────────────────┼─────────────────┐
            ▼                 ▼                      ▼                 ▼
     Supabase Auth     PostgreSQL DB         Storage Bucket      Row Level Security
   (Email & Password)  (Tables & Indexes)    (Item Photos)       (Strict RBAC Policies)
```

---

## 2. Directory Structure

```
foundloop/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (public)/
│   │   ├── page.tsx                      # Landing Page
│   │   ├── browse/page.tsx               # Search & Filter Catalog
│   │   ├── items/[id]/page.tsx           # Item Details & Claim Trigger
│   │   ├── how-it-works/page.tsx
│   │   └── safety/page.tsx
│   ├── (protected)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx                  # User Overview
│   │   │   ├── lost/page.tsx             # My Lost Reports
│   │   │   ├── found/page.tsx            # My Found Reports
│   │   │   ├── matches/page.tsx          # Potential Match Suggestions
│   │   │   ├── claims/page.tsx           # Claims Submitted & Received
│   │   │   └── profile/page.tsx
│   │   ├── report/
│   │   │   ├── lost/page.tsx             # Report Lost Item Form
│   │   │   └── found/page.tsx            # Report Found Item Form
│   │   └── claims/[id]/page.tsx          # Claim Verification & Timeline
│   ├── admin/
│   │   ├── page.tsx                      # Admin & Mod Governance Center
│   │   ├── reports/page.tsx              # Flagged Content Triage
│   │   └── users/page.tsx                # User Management
│   ├── api/
│   │   ├── match/route.ts                # Smart Matching Trigger Endpoint
│   │   └── claims/verify/route.ts        # Claim Status State Machine
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                               # Primitives (Button, Input, Badge, Dialog)
│   ├── layout/                           # Navbar, Footer, MobileNav
│   ├── items/                            # ItemCard, ItemGrid, FilterSidebar
│   ├── map/                              # LocationPicker, ApproximateMap (Leaflet)
│   ├── matching/                         # MatchComparisonCard, SimilarityGauge
│   └── forms/                            # LostForm, FoundForm, ClaimForm
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser client
│   │   ├── server.ts                     # Server-side cookies client
│   │   └── middleware.ts                 # Auth session & route protection
│   ├── matching-engine.ts                # Deterministic Weighted Match Algorithm
│   ├── utils.ts                          # Formatting, date helpers, sanitization
│   └── constants.ts                      # Categories, Indian Cities, Colors
├── types/
│   ├── database.ts                       # Supabase generated database types
│   └── app.ts                            # Domain models (Item, Claim, Match)
└── public/
    └── icons/
```

---

## 3. The Smart Matching Engine (Deterministic Algorithm)

The platform rejects costly, non-deterministic third-party AI APIs in favor of a weighted multi-factor matching algorithm implemented in TypeScript.

### Algorithm Logic & Weights
Every time a report is filed (Lost or Found), the matching engine queries active opposite records in the database with matching criteria:

$$\text{Total Score} = W_{\text{cat}} + W_{\text{city}} + W_{\text{name}} + W_{\text{brand}} + W_{\text{color}} + W_{\text{date}} + W_{\text{desc}}$$

| Factor | Weight | Scoring Mechanism |
|---|---|---|
| **Category** | **25%** | Exact match required. (0% if categories differ completely). |
| **City** | **20%** | Exact match on Indian City (e.g. Mumbai vs Mumbai = 20%; different cities = 0%). |
| **Item Name / Title** | **20%** | Normalized token overlap + Dice coefficient on title keywords. |
| **Brand** | **15%** | Levenshtein distance on brand string (e.g. *"Apple"*, *"Titan"*, *"Wildcraft"*). |
| **Primary Color** | **10%** | Exact color match = 10%; complementary neutral match = 5%. |
| **Date Delta** | **10%** | Lost date vs Found date gap: <br>• $\le 2$ days: 10%<br>• $3-7$ days: 7%<br>• $8-14$ days: 4%<br>• $> 30$ days: 0% |
| **Keyword Match** | **Bonus (+5%)** | Overlap in descriptions (e.g., *"sticker"*, *"broken glass"*, *"blue keychain"*). |

### Match Classification
- **Score $\ge 75\%$:** `High Similarity` (Highlighted with priority notification)
- **Score $50\% - 74\%$:** `Possible Match` (Listed on dashboard)
- **Score $< 50\%$:** Not surfaced automatically to prevent notification fatigue.

```typescript
// Sample Implementation Structure (lib/matching-engine.ts)
export interface MatchResult {
  score: number;
  tier: 'HIGH' | 'MEDIUM' | 'LOW';
  matchedFields: string[];
  reasons: string[];
}

export function calculateMatchScore(lost: LostItem, found: FoundItem): MatchResult {
  // Category mismatch is an immediate disqualifier
  if (lost.category !== found.category) {
    return { score: 0, tier: 'LOW', matchedFields: [], reasons: ['Category mismatch'] };
  }
  
  let score = 25;
  const matchedFields = ['category'];
  const reasons = [`Category: ${lost.category}`];
  
  // 1. City Check
  if (lost.city.toLowerCase() === found.city.toLowerCase()) {
    score += 20;
    matchedFields.push('city');
    reasons.push(`Same City: ${lost.city}`);
  }
  
  // 2. Name & Token Overlap
  const nameScore = calculateTokenSimilarity(lost.title, found.title);
  if (nameScore > 0.4) {
    const pts = Math.round(nameScore * 20);
    score += pts;
    matchedFields.push('name');
    reasons.push(`Title keywords matched (${pts} pts)`);
  }
  
  // 3. Brand
  if (lost.brand && found.brand && isFuzzyEqual(lost.brand, found.brand)) {
    score += 15;
    matchedFields.push('brand');
    reasons.push(`Brand matched: ${lost.brand}`);
  }
  
  // 4. Color
  if (lost.color.toLowerCase() === found.color.toLowerCase()) {
    score += 10;
    matchedFields.push('color');
    reasons.push(`Color: ${lost.color}`);
  }
  
  // 5. Date Difference
  const daysDiff = Math.abs(new Date(found.found_date).getTime() - new Date(lost.lost_date).getTime()) / (1000 * 3600 * 24);
  if (daysDiff <= 2) {
    score += 10;
    matchedFields.push('date');
    reasons.push('Dates are within 48 hours');
  } else if (daysDiff <= 7) {
    score += 7;
    matchedFields.push('date');
    reasons.push('Dates are within 1 week');
  }
  
  const tier = score >= 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW';
  return { score: Math.min(score, 100), tier, matchedFields, reasons };
}
```

---

## 4. Ownership Verification Protocol

1. **Information Segregation:**
   - Public fields: `title`, `category`, `brand`, `color`, `lost_date`, `city`, `approximate_location`, `image_url`.
   - Private fields (`private_identifying_details`): Stored with restricted database read permissions. Only the owner and designated moderators can view them.
2. **Claim Lifecycle State Machine:**
   - `PENDING`: Owner submits claim with unique questions answered.
   - `UNDER_REVIEW`: Finder or Moderator evaluates answers against the physical object.
   - `APPROVED`: Finder/Moderator verifies match. Contact coordination is unlocked.
   - `REJECTED`: Insufficient or incorrect proof. Item remains available.
   - `RESOLVED`: Item handed over in person.

---

## 5. Free-Tier Optimization Strategy

1. **Supabase Free Limits:**
   - 500 MB database storage (adequate for $>100,000$ text records).
   - 1 GB file storage (Image uploads are client-side resized to max 1280px WebP, ~80-150 KB per photo).
2. **OpenStreetMap with Leaflet:**
   - Free, zero API key requirement, open-source mapping.
   - Leaflet is dynamically imported on client side to avoid SSR build conflicts.
3. **Vercel Serverless Limits:**
   - Zero-cost edge middleware and server actions.

