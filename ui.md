# FoundLoop – UI/UX Design System & Layout Specifications

## 1. Design Philosophy: Human-Centered & Purpose-Built
FoundLoop is designed to evoke calm, clarity, and trust in a moment that is inherently stressful for the user. When someone loses a laptop, wallet, or government ID card, they need an interface that feels steady, functional, and reliable—like a well-maintained civic service or a trusted community board.

### Anti-Patterns Strictly Avoided:
- ❌ **No AI SaaS Clichés:** No neon violet/pink gradients, no floating glassmorphic blurred panels, no gimmicky 3D isometric blob illustrations.
- ❌ **No Over-Rounded Borders:** Avoid `rounded-3xl` bubble cards; use crisp, structured `rounded-md` (6px) or `rounded-lg` (8px).
- ❌ **No Emoji Navigation:** Use standard, recognizable Lucide geometric icons with clear text labels.
- ❌ **No Artificial Inflation:** No fake testimonial quotes, no counter animations claiming *"100,000+ items recovered"*.

---

## 2. Color System & Typography

### Color Palette
```css
/* Background & Surfaces */
--bg-canvas: #FBFBF9;       /* Warm off-white, easy on the eyes */
--bg-surface: #FFFFFF;      /* Clean crisp white cards & dialogs */
--bg-surface-subtle: #F4F4F1;/* Table headers, subtle pill backgrounds */

/* Typography */
--text-primary: #1C1E21;    /* Deep charcoal (not pure black) */
--text-secondary: #5E636E;  /* Readable medium slate grey */
--text-muted: #8A909D;      /* Placeholders, hints, timestamps */

/* Borders & Dividers */
--border-subtle: #E8E8E4;   /* Soft warm grey borders */
--border-focus: #2563EB;    /* High-contrast focus state */

/* Primary Accent */
--accent-primary: #1E3A8A;  /* Deep trustworthy navy blue */
--accent-primary-hover: #1E40AF;
--accent-subtle: #EFF6FF;   /* Light blue wash for highlights */

/* Semantic Status Tones */
--status-lost: #DC2626;     /* Muted crimson red for LOST badge */
--status-lost-bg: #FEF2F2;
--status-found: #0284C7;    /* Slate cyan blue for FOUND badge */
--status-found-bg: #F0F9FF;
--status-success: #15803D;  /* Forest green for VERIFIED / RETURNED */
--status-success-bg: #F0FDF4;
--status-warning: #D97706;  /* Warm amber for UNDER REVIEW / MATCH */
--status-warning-bg: #FFFBEB;
```

### Typography Hierarchy (Inter / Modern Sans-Serif)
* **Hero Heading (H1):** 36px (2.25rem) / Line height 1.2 / Font weight: Semi-Bold (600).
* **Section Heading (H2):** 24px (1.5rem) / Line height 1.3 / Font weight: Semi-Bold (600).
* **Card Title / Subheading (H3):** 18px (1.125rem) / Line height 1.4 / Font weight: Medium (500).
* **Body Text:** 15px (0.9375rem) / Line height 1.6 / Font weight: Regular (400).
* **Captions, Metadata, Badges:** 12px (0.75rem) / Line height 1.4 / Font weight: Medium (500), tracking tight.

---

## 3. Component Design Rules

### A. Item Cards (Browse & Dashboard)
- White background with `border border-border-subtle` and subtle `shadow-sm` on hover.
- Aspect ratio 4:3 for item thumbnail with fallback category icon on neutral grey backdrop.
- Clean header badge: `[LOST]` in soft red or `[FOUND]` in soft blue.
- Prominent Title (16px semi-bold), Category pill, City & Date line (`Dadar, Mumbai · 2 days ago`).
- Action link: Simple, understated `View Details →` (no oversized neon buttons).

### B. Form Inputs (Report Lost / Found)
- Clean borders (`border-[#D1D5DB] focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]`).
- Explicit label with asterisk for required fields.
- Helper text placed *below* the input in 13px muted grey.
- **Private Information Callout Box:** Shaded in subtle warm amber with a lock icon:
  > *"Information entered in this section is private. Only you, the verified finder, and authorized moderators can see this to verify genuine ownership."*

### C. Matching Card Visualizer
- Shows Lost Item on the Left, Found Item on the Right.
- Center gauge: Clean circular or horizontal progress pill displaying `Match Score: 82% (High Similarity)`.
- Bulleted field breakdown with checkmarks:
  - ✓ **Category:** Wallets & Purses
  - ✓ **Brand:** WildHorn
  - ✓ **Color:** Dark Brown Leather
  - ✓ **Location:** Dadar Railway Station
  - ~ **Date Difference:** 1 day apart

### D. Recovery Timeline
A linear, vertical step-tracker with filled dots for completed steps, hollow ring for active step, and grey dashed lines for upcoming milestones:
1. `Report Submitted`
2. `Potential Match Found`
3. `Claim Submitted`
4. `Under Review`
5. `Ownership Verified`
6. `Ready for Collection`
7. `Successfully Returned`

---

## 4. Key Page Layouts

### 1. Landing Page (`/`)
- **Header:** FoundLoop brandmark (Loop icon + clean text), Nav links (Browse, How It Works, Safety, Login/Register).
- **Hero:**
  - Crisp H1: *"Lost Something? Let's Find It Together."*
  - Subtitle: *"A simple community platform to report lost items, share found belongings and reconnect people with what matters."*
  - Dual Primary Action: `[ I Lost Something ]` (Solid primary) & `[ I Found Something ]` (Outline with accent border).
- **3-Step Practical Guide:** Report $\rightarrow$ Smart Match $\rightarrow$ Safe Claim & Return.
- **Recent Reports Feed:** Two balanced columns (Recently Lost | Recently Found) with quick filter tabs.
- **Safety Charter:** 4 bulleted trust principles (No public phones, approximate landmarks, mandatory proof, community verified).
- **Footer:** Minimal civic links, community guidelines, privacy policy, and open-source credits.

### 2. Browse & Search (`/browse`)
- Two-column layout on desktop:
  - **Left Sidebar (280px):** Sticky filter panel (Status filter, Category checklist, City selector, Color multi-select, Date range picker).
  - **Right Main Stream:** Search input with live debouncing, active filter chips, total result count, grid of item cards, and pagination.
- Full responsive drawer sheet for filters on mobile screens.

### 3. Report Item Wizard (`/report/lost` and `/report/found`)
- Step-aware single-scroll form with clear section breaks:
  - Section 1: Item Basic Information (Title, Category, Brand, Color).
  - Section 2: Date & Location Details (Date, City, Landmark, Interactive Map Pinpoint).
  - Section 3: Visual Proof (Photo upload with drag-and-drop & live preview).
  - Section 4: Privacy & Ownership Verification Keys (Hidden from public view).

### 4. User Dashboard (`/dashboard`)
- Sidebar / Top Navigation:
  - `My Lost Reports`
  - `My Found Reports`
  - `Match Alerts`
  - `My Claims`
  - `Profile & Security`
- Table / Card view with real counts directly querying database records.

### 5. Admin & Moderator Console (`/admin`)
- Accessible strictly to users with `role = 'admin'` or `role = 'moderator'`.
- Top metrics row: Active Lost, Active Found, Pending Claims, Flagged Listings, Total Returned.
- Clean data tables with status dropdowns, quick triage review drawers, and suspension action modals.

