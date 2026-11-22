# FoundLoop – Community-Powered Lost & Found Platform

FoundLoop is a full-stack, community-first Lost & Found web application engineered for Indian universities, transit hubs (railway stations, metro concourses), corporate campuses, and public neighborhoods.

Rather than relying on informal WhatsApp groups or pinned social media notices, FoundLoop centralizes reporting with a **privacy-preserving architecture**, an **automated weighted smart-matching engine (zero paid AI APIs)**, and a **multi-stage ownership verification protocol**.

---

## 🚀 Key Features

* **Dual Structured Reporting:**
  * **Report Lost Item:** Public attributes (category, color, landmark) + **Confidential Security Lock** (private marks, serials, wallpaper descriptions hidden from public view).
  * **Report Found Belonging:** Physical custody tracking (Finder, Security Desk, Station Master, Police Station), photo upload with client-side compression.
* **Deterministic Smart Matching Engine (`lib/matching-engine.ts`):**
  * Weighted multi-factor score: Category (25%), City (20%), Title Keywords (20%), Brand (15%), Color (10%), Date Proximity (10%).
  * Generates similarity score (0–100%), classification tier (`HIGH`, `MEDIUM`, `LOW`), and transparent bulleted reasons.
  * Zero paid AI tokens or third-party API dependencies.
* **Two-Tier Ownership Verification:**
  * Potential owners submit private answers to prove ownership before any physical meeting occurs.
  * Finders or moderators compare claimant proof against the physical item in their custody.
* **Item Recovery Timeline:**
  * 7 milestone tracking: `Report Submitted` → `Potential Match Found` → `Claim Submitted` → `Under Review` → `Ownership Verified` → `Ready for Collection` → `Successfully Returned`.
* **Governance & Moderation:**
  * Admin console with real database metrics, claim dispute triage, and content flag resolution.
* **Civic Safety Charter:**
  * Zero public phone numbers or residential addresses.
  * Zero reward fee extortion tolerance.

---

## 🛠️ Technology Stack (100% Free-Tier Compatible)

* **Framework:** Next.js 14 (App Router, Server & Client Components)
* **Language:** TypeScript (Strict mode enabled)
* **Styling:** Tailwind CSS (Custom human-centered palette: `#FBFBF9` warm off-white, `#1C1E21` charcoal, `#1E3A8A` deep navy)
* **Icons:** Lucide React
* **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Triggers, Storage)
* **Auth:** Supabase Auth (Email & Password, SSR Cookie Handlers, Route Guard Middleware)
* **Storage:** Supabase Storage (`item-images` bucket with client-side WebP compression)
* **Hosting:** Vercel (Free Tier)
* **Source Control:** GitHub (`hassan-the-hacker`)

---

## 📁 Project Structure

```
foundloop/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Sign in with redirect memory
│   │   ├── register/page.tsx            # Account registration
│   │   └── forgot-password/page.tsx     # Recovery link dispatch
│   ├── (public)/
│   │   ├── page.tsx                     # Landing page with hero & live feed
│   │   ├── browse/page.tsx              # Search catalog & filter sidebar
│   │   ├── items/[id]/page.tsx          # Public item details & claim trigger
│   │   ├── how-it-works/page.tsx        # 5-step operational guide
│   │   └── safety/page.tsx              # Trust & privacy charter
│   ├── (protected)/
│   │   ├── dashboard/                   # User dashboard & metrics
│   │   ├── dashboard/matches/page.tsx   # Side-by-side smart match viewer
│   │   ├── report/lost/page.tsx         # Report lost item form
│   │   ├── report/found/page.tsx        # Report found belonging form
│   │   ├── items/[id]/claim/page.tsx    # Ownership claim submission form
│   │   └── claims/[id]/page.tsx         # Claim review & recovery timeline
│   ├── admin/page.tsx                   # Admin & Moderator governance console
│   ├── api/
│   │   ├── match/route.ts               # Background matching execution
│   │   ├── auth/callback/route.ts       # Auth exchange route
│   │   └── auth/signout/route.ts        # Signout route
│   ├── layout.tsx                       # Root layout with responsive Navbar & Footer
│   └── globals.css
├── components/
│   ├── forms/ImageUpload.tsx            # Client-side compressed photo uploader
│   ├── items/ItemCard.tsx               # Public item card with badges
│   ├── layout/Navbar.tsx                # Responsive navigation with auth states
│   ├── layout/Footer.tsx                # Civic footer with safety pledge
│   ├── matching/SimilarityGauge.tsx     # Visual progress bar with match reasons
│   └── matching/RecoveryTimeline.tsx    # 7-milestone lifecycle tracker
├── lib/
│   ├── matching-engine.ts               # Deterministic similarity algorithm
│   ├── constants.ts                     # Indian cities, categories, colors
│   ├── utils.ts                         # Formatting & badge helpers
│   └── supabase/                        # Browser, server, and middleware clients
├── types/
│   ├── database.ts                      # Supabase database types
│   └── app.ts                           # Domain interfaces
├── database-schema.md                   # Full PostgreSQL DDL & RLS policies
├── engineering.md                       # Architecture & design document
├── product.md                           # Product specifications
└── ui.md                                # UI/UX design rules
```

---

## ⚡ Quick Start & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials (found in **Supabase Dashboard > Project Settings > API**):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize Supabase Database & Storage
1. Open your **Supabase Dashboard > SQL Editor**.
2. Copy the complete SQL script from **`database-schema.md`** and run it.
3. In **Storage > New Bucket**, create a public bucket named **`item-images`**.

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Core User Flows

1. **User Registration & Login:**
   * Visit `/register` and create an account.
   * Sign out and log back in at `/login`.
2. **Report a Lost Item:**
   * Visit `/report/lost`.
   * Fill out the item name, category (e.g. *Wallets*), city (*Mumbai*), and landmark (*Dadar Station*).
   * Fill the **Confidential Security Lock** (e.g. *"Red bus pass inside with student ID"*).
   * Submit and verify redirection to `/dashboard`.
3. **Report a Found Item:**
   * Visit `/report/found`.
   * Report a matching item in the same category and city (*Wallets, Mumbai*).
   * Upload an item photo.
4. **Smart Match Calculation:**
   * Visit `/dashboard/matches`.
   * View the calculated similarity percentage, classification tier, and matching reason breakdown.
5. **Ownership Claim & Verification:**
   * Click **Claim This Item** from the match or browse catalog (`/browse`).
   * Answer the private proof questions.
   * Open `/claims/[id]` to review the claim and advance the status to `Ownership Verified` and `Successfully Returned`.
6. **Admin Console:**
   * Navigate to `/admin` to inspect real-time database KPIs and review pending moderation queues.

---

## 🚢 Deploying to Vercel (Free Tier)

1. Push your code to your GitHub repository under `hassan-the-hacker`.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. In **Environment Variables**, add:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_APP_URL`
4. Click **Deploy**. Vercel will build and deploy the application worldwide on the free edge tier.

---

## 📄 License
Open source civic technology project built with community trust.
