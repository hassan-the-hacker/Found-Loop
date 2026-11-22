import { LostItem, FoundItem, MatchScoreResult } from '@/types/app';

/**
 * Calculates string similarity using normalized token overlap and Dice coefficient.
 */
function calculateTokenOverlap(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const clean = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const tokens1 = new Set(clean(s1));
  const tokens2 = new Set(clean(s2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  tokens1.forEach((t) => {
    if (tokens2.has(t)) intersection++;
  });

  return (2 * intersection) / (tokens1.size + tokens2.size);
}

/**
 * Deterministic Multi-Factor Smart Matching Engine
 * No paid AI APIs, zero external fees, deterministic & transparent.
 */
export function calculateMatchScore(lost: LostItem, found: FoundItem): MatchScoreResult {
  // Category mismatch is an immediate disqualifier
  if (lost.category.toLowerCase() !== found.category.toLowerCase()) {
    return {
      score: 0,
      tier: 'LOW',
      matchedFields: [],
      reasons: ['Categories differ completely'],
    };
  }

  let score = 25; // Base category match weight
  const matchedFields: string[] = ['category'];
  const reasons: string[] = [`Category matched: ${lost.category}`];

  // 1. City / State Location Check (Up to 20% Weight)
  if (lost.city.toLowerCase() === found.city.toLowerCase()) {
    score += 20;
    matchedFields.push('city');
    reasons.push(`Same City: ${lost.city}`);
  } else if (lost.state && found.state && lost.state.toLowerCase() === found.state.toLowerCase()) {
    score += 10;
    matchedFields.push('state');
    reasons.push(`Same State / UT: ${lost.state}`);
  }

  // 2. Item Title & Keyword Similarity (20% Weight)
  const titleSimilarity = calculateTokenOverlap(lost.title, found.title);
  if (titleSimilarity > 0.3) {
    const pts = Math.min(20, Math.round(titleSimilarity * 20));
    score += pts;
    matchedFields.push('title');
    reasons.push(`Title keywords matched (${pts}% weight)`);
  }

  // 3. Brand Match (15% Weight)
  if (lost.brand && found.brand) {
    const b1 = lost.brand.trim().toLowerCase();
    const b2 = found.brand.trim().toLowerCase();
    if (b1 === b2 || b1.includes(b2) || b2.includes(b1)) {
      score += 15;
      matchedFields.push('brand');
      reasons.push(`Brand matched: ${lost.brand}`);
    }
  }

  // 4. Primary Color Match (10% Weight)
  if (lost.primary_color && found.primary_color) {
    const c1 = lost.primary_color.toLowerCase();
    const c2 = found.primary_color.toLowerCase();
    if (c1 === c2) {
      score += 10;
      matchedFields.push('color');
      reasons.push(`Primary color matched: ${lost.primary_color}`);
    } else if (
      (c1.includes('black') && c2.includes('grey')) ||
      (c1.includes('blue') && c2.includes('navy'))
    ) {
      score += 5;
      matchedFields.push('color');
      reasons.push(`Similar color tones: ${lost.primary_color} & ${found.primary_color}`);
    }
  }

  // 5. Date Difference Proximity (10% Weight)
  try {
    const lostDate = new Date(lost.lost_date).getTime();
    const foundDate = new Date(found.found_date).getTime();
    const diffDays = Math.abs(foundDate - lostDate) / (1000 * 3600 * 24);

    if (diffDays <= 2) {
      score += 10;
      matchedFields.push('date');
      reasons.push('Dates are within 48 hours');
    } else if (diffDays <= 7) {
      score += 7;
      matchedFields.push('date');
      reasons.push('Dates are within 1 week');
    } else if (diffDays <= 14) {
      score += 4;
      matchedFields.push('date');
      reasons.push('Dates are within 2 weeks');
    }
  } catch {
    // Ignore date parse issues
  }

  // 6. Description Keywords Overlap (Bonus up to 5%)
  if (lost.description && found.description) {
    const descOverlap = calculateTokenOverlap(lost.description, found.description);
    if (descOverlap > 0.25) {
      const bonus = Math.min(5, Math.round(descOverlap * 5));
      score += bonus;
      matchedFields.push('description');
      reasons.push('Description details overlap');
    }
  }

  const normalizedScore = Math.min(100, Math.max(0, score));
  const tier: 'HIGH' | 'MEDIUM' | 'LOW' =
    normalizedScore >= 75 ? 'HIGH' : normalizedScore >= 50 ? 'MEDIUM' : 'LOW';

  return {
    score: normalizedScore,
    tier,
    matchedFields,
    reasons,
  };
}

