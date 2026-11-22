import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';
import { sanitizeSupabaseUrl, sanitizeSupabaseKey, isPlaceholder, safeParseUser } from './config';
export { safeParseUser, sanitizeSupabaseUrl, sanitizeSupabaseKey, isPlaceholder };

function parseCookieUser(): any {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)foundloop_session=([^;]+)/);
  if (match) {
    const parsed = safeParseUser(match[1]);
    if (parsed) return parsed;
  }
  try {
    const local = localStorage.getItem('foundloop_session');
    if (local) return safeParseUser(local);
  } catch { }
  return null;
}

class LocalQueryBuilder {
  private table: string;
  private eqFilters: Array<[string, any]> = [];
  private orderConfig?: [string, 'asc' | 'desc'];
  private limitCount?: number;
  private pendingAction?: { type: 'insert' | 'update' | 'upsert'; data: any; options?: any };

  constructor(table: string) {
    this.table = table;
  }

  select(_columns?: string, _options?: { count?: string }) {
    return this;
  }

  eq(column: string, value: any) {
    this.eqFilters.push([column, value]);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderConfig = [column, options?.ascending ? 'asc' : 'desc'];
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  insert(data: any) {
    this.pendingAction = { type: 'insert', data };
    return this;
  }

  update(data: any) {
    this.pendingAction = { type: 'update', data };
    return this;
  }

  upsert(data: any, options?: any) {
    this.pendingAction = { type: 'upsert', data, options };
    return this;
  }

  delete() {
    return this;
  }

  async single() {
    const res = await this.execute();
    const rows = res.data;
    const item = Array.isArray(rows) ? (rows[0] ?? null) : (rows ?? null);
    return { data: item, error: null };
  }

  async maybeSingle() {
    return this.single();
  }

  private async execute(): Promise<{ data: any; count: number | null; error: any }> {
    try {
      if (this.pendingAction) {
        if (this.pendingAction.type === 'insert') {
          const res = await fetch('/api/local-db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'insert', table: this.table, data: this.pendingAction.data }),
          });
          const json = await res.json();
          return { data: json.data, count: 1, error: json.error };
        }

        if (this.pendingAction.type === 'update') {
          const filter = this.eqFilters[0] ? { col: this.eqFilters[0][0], val: this.eqFilters[0][1] } : { col: 'id', val: '' };
          const res = await fetch('/api/local-db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', table: this.table, filter, data: this.pendingAction.data }),
          });
          const json = await res.json();
          return { data: json.data, count: 1, error: json.error };
        }

        if (this.pendingAction.type === 'upsert') {
          const res = await fetch('/api/local-db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'upsert',
              table: this.table,
              data: this.pendingAction.data,
              onConflict: this.pendingAction.options?.onConflict,
            }),
          });
          const json = await res.json();
          return { data: json.data, count: 1, error: json.error };
        }
      }

      // Default: query
      const res = await fetch('/api/local-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'query',
          table: this.table,
          eq: this.eqFilters[0] || null,
          order: this.orderConfig || null,
          limit: this.limitCount || null,
        }),
      });
      const json = await res.json();
      return { data: json.data || [], count: json.count || 0, error: json.error || null };
    } catch (err: any) {
      return { data: [], count: 0, error: err.message };
    }
  }

  // Make query awaitable (thenable)
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; count: number | null; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

function createLocalClient(): any {
  return {
    auth: {
      async signUp({ email, password, options }: any) {
        try {
          const res = await fetch('/api/local-db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'signup',
              email,
              password,
              full_name: options?.data?.full_name,
            }),
          });
          const json = await res.json();
          if (json.data?.user && typeof document !== 'undefined') {
            const userStr = JSON.stringify(json.data.user);
            document.cookie = `foundloop_session=${encodeURIComponent(userStr)}; path=/; max-age=604800; SameSite=Lax`;
            try {
              localStorage.setItem('foundloop_session', userStr);
            } catch { }
          }
          return json;
        } catch (err: any) {
          return {
            data: { user: null, session: null },
            error: { message: err?.message || 'Registration request failed' },
          };
        }
      },
      async signInWithPassword({ email, password }: any) {
        try {
          const res = await fetch('/api/local-db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'signin',
              email,
              password,
            }),
          });
          const json = await res.json();
          if (json.data?.user && typeof document !== 'undefined') {
            const userStr = JSON.stringify(json.data.user);
            document.cookie = `foundloop_session=${encodeURIComponent(userStr)}; path=/; max-age=604800; SameSite=Lax`;
            try {
              localStorage.setItem('foundloop_session', userStr);
            } catch { }
          }
          return json;
        } catch (err: any) {
          return {
            data: { user: null, session: null },
            error: { message: err?.message || 'Sign in request failed' },
          };
        }
      },
      async getUser() {
        const user = parseCookieUser();
        return { data: { user }, error: null };
      },
      async signOut() {
        if (typeof document !== 'undefined') {
          document.cookie = 'foundloop_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
          try {
            localStorage.removeItem('foundloop_session');
          } catch { }
        }
        try {
          await fetch('/api/local-db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'signout' }),
          }).catch(() => { });
        } catch { }
        return { error: null };
      },
      onAuthStateChange(callback: (event: string, session: any) => void) {
        const user = parseCookieUser();
        if (user) {
          callback('SIGNED_IN', { user, access_token: 'local-token' });
        } else {
          callback('SIGNED_OUT', null);
        }
        return {
          data: {
            subscription: {
              unsubscribe: () => { },
            },
          },
        };
      },
      async resetPasswordForEmail(_email: string, _options?: any) {
        return { data: {}, error: null };
      },
    },
    from(table: string) {
      return new LocalQueryBuilder(table);
    },
    storage: {
      from(_bucket: string) {
        return {
          async upload(path: string, _file: any) {
            return { data: { path }, error: null };
          },
          getPublicUrl(path: string) {
            return { data: { publicUrl: path } };
          },
        };
      },
    },
  };
}

let localClientSingleton: any = null;

export function createClient() {
  const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = sanitizeSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (isPlaceholder(supabaseUrl) || !supabaseKey || supabaseKey.includes('placeholder')) {
    if (!localClientSingleton) {
      localClientSingleton = createLocalClient();
    }
    return localClientSingleton;
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
