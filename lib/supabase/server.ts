import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { queryTable, insertRow, updateRow, upsertRow } from '@/lib/local-db';
import { sanitizeSupabaseUrl, sanitizeSupabaseKey, isPlaceholder } from './config';

class ServerLocalQueryBuilder {
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
          const created = insertRow(this.table, this.pendingAction.data);
          return { data: created, count: 1, error: null };
        }
        if (this.pendingAction.type === 'update') {
          const filter = this.eqFilters[0];
          const updated = filter
            ? updateRow(this.table, (r) => String(r[filter[0]]) === String(filter[1]), this.pendingAction.data)
            : null;
          return { data: updated, count: 1, error: null };
        }
        if (this.pendingAction.type === 'upsert') {
          const conflictKeys = this.pendingAction.options?.onConflict
            ? this.pendingAction.options.onConflict.split(',').map((s: string) => s.trim())
            : ['id'];
          const upserted = upsertRow(this.table, this.pendingAction.data, conflictKeys);
          return { data: upserted, count: 1, error: null };
        }
      }

      let rows = queryTable(this.table);

      if (this.eqFilters.length > 0) {
        for (const [col, val] of this.eqFilters) {
          rows = rows.filter((r) => String(r[col]) === String(val));
        }
      }

      if (this.orderConfig) {
        const [col, dir] = this.orderConfig;
        rows.sort((a, b) => {
          if (dir === 'asc') return a[col] > b[col] ? 1 : -1;
          return a[col] < b[col] ? 1 : -1;
        });
      }

      const totalCount = rows.length;

      if (this.limitCount) {
        rows = rows.slice(0, this.limitCount);
      }

      return { data: rows, count: totalCount, error: null };
    } catch (err: any) {
      return { data: [], count: 0, error: err.message };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; count: number | null; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
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

function createLocalServerClient(): any {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('foundloop_session')?.value;
  const currentUser = safeParseUser(sessionCookie);

  return {
    auth: {
      async getUser() {
        return { data: { user: currentUser }, error: null };
      },
      async signOut() {
        try {
          cookieStore.delete('foundloop_session');
        } catch { }
        return { error: null };
      },
      async resetPasswordForEmail(_email: string) {
        return { data: {}, error: null };
      },
    },
    from(table: string) {
      return new ServerLocalQueryBuilder(table);
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

export function createClient() {
  const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = sanitizeSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (isPlaceholder(supabaseUrl) || !supabaseKey || supabaseKey.includes('placeholder')) {
    return createLocalServerClient();
  }

  const cookieStore = cookies();
  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          } catch { }
        },
      },
    }
  );
}
