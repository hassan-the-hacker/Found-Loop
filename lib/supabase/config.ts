/**
 * Supabase configuration and sanitization utilities
 * Ensures malformed URLs (e.g. copied REST URLs with /rest/v1 or trailing slashes)
 * are cleanly sanitized before being passed to @supabase/ssr.
 */

export function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let clean = rawUrl.trim();
  // Strip surrounding single or double quotes
  clean = clean.replace(/^["']|["']$/g, '');
  // Strip accidental /rest/v1 or /auth/v1 endpoints (common copy-paste error from Supabase dashboard)
  clean = clean.replace(/\/rest\/v1\/?$/i, '');
  clean = clean.replace(/\/auth\/v1\/?$/i, '');
  // Strip trailing slashes
  clean = clean.replace(/\/+$/, '');
  return clean;
}

export function sanitizeSupabaseKey(rawKey?: string): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

export function isPlaceholder(url?: string): boolean {
  if (!url) return true;
  const lower = url.toLowerCase().trim();
  return (
    lower === '' ||
    lower.includes('placeholder') ||
    lower.includes('example.com') ||
    lower.includes('your-project') ||
    lower.includes('localhost')
  );
}

export function safeParseUser(raw?: string): any {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);
    return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
  } catch {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    } catch {
      return null;
    }
  }
}

