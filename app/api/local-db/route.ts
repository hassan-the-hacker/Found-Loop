import { NextRequest, NextResponse } from 'next/server';
import { getLocalDb, insertRow, updateRow, upsertRow, queryTable, saveLocalDb } from '@/lib/local-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'signup') {
      const { email, password, full_name } = body;
      const db = getLocalDb();
      if (!db.registered_users) db.registered_users = [];

      let user = db.registered_users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          email,
          password,
          user_metadata: { full_name: full_name || email.split('@')[0] },
          role: email.toLowerCase().includes('admin') ? 'admin' : 'authenticated',
          created_at: new Date().toISOString(),
        };
        db.registered_users.push(user);
        saveLocalDb(db);

        // Also create profile
        upsertRow(
          'profiles',
          {
            id: user.id,
            email: user.email,
            full_name: full_name || email.split('@')[0],
            role: user.role === 'admin' ? 'admin' : 'user',
            created_at: new Date().toISOString(),
          },
          ['id']
        );
      }

      const response = NextResponse.json({
        data: {
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
            role: user.role,
          },
          session: {
            access_token: 'local-demo-token',
            user: {
              id: user.id,
              email: user.email,
              user_metadata: user.user_metadata,
              role: user.role,
            },
          },
        },
        error: null,
      });

      // Set cookie for Next.js middleware and SSR
      const sessionUser = {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        role: user.role,
      };

      response.cookies.set('foundloop_session', JSON.stringify(sessionUser), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      });

      return response;
    }

    if (action === 'signin') {
      const { email, password } = body;
      const db = getLocalDb();
      if (!db.registered_users) db.registered_users = [];

      let user = db.registered_users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      // If user doesn't exist yet, auto-provision in local demo mode so login never fails
      if (!user) {
        user = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          email,
          password: password || '123456',
          user_metadata: { full_name: email.split('@')[0] },
          role: email.toLowerCase().includes('admin') ? 'admin' : 'authenticated',
          created_at: new Date().toISOString(),
        };
        db.registered_users.push(user);
        saveLocalDb(db);

        upsertRow(
          'profiles',
          {
            id: user.id,
            email: user.email,
            full_name: email.split('@')[0],
            role: user.role === 'admin' ? 'admin' : 'user',
            created_at: new Date().toISOString(),
          },
          ['id']
        );
      }

      const response = NextResponse.json({
        data: {
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
            role: user.role,
          },
          session: {
            access_token: 'local-demo-token',
            user: {
              id: user.id,
              email: user.email,
              user_metadata: user.user_metadata,
              role: user.role,
            },
          },
        },
        error: null,
      });

      const sessionUser = {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        role: user.role,
      };

      response.cookies.set('foundloop_session', JSON.stringify(sessionUser), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });

      return response;
    }

    if (action === 'signout') {
      const response = NextResponse.json({ error: null });
      response.cookies.set('foundloop_session', '', {
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    if (action === 'query') {
      const { table, eq, order, limit } = body;
      let rows = queryTable(table);

      if (eq && Array.isArray(eq)) {
        const [col, val] = eq;
        rows = rows.filter((r) => String(r[col]) === String(val));
      }

      if (order && Array.isArray(order)) {
        const [col, dir] = order;
        rows.sort((a, b) => {
          if (dir === 'asc') return a[col] > b[col] ? 1 : -1;
          return a[col] < b[col] ? 1 : -1;
        });
      }

      if (limit && typeof limit === 'number') {
        rows = rows.slice(0, limit);
      }

      return NextResponse.json({ data: rows, count: rows.length, error: null });
    }

    if (action === 'insert') {
      const { table, data } = body;
      const created = insertRow(table, data);
      return NextResponse.json({ data: created, error: null });
    }

    if (action === 'update') {
      const { table, filter, data } = body;
      const updated = updateRow(table, (r) => String(r[filter.col]) === String(filter.val), data);
      return NextResponse.json({ data: updated, error: null });
    }

    if (action === 'upsert') {
      const { table, data, onConflict } = body;
      const conflictKeys = onConflict ? onConflict.split(',').map((s: string) => s.trim()) : ['id'];
      const result = upsertRow(table, data, conflictKeys);
      return NextResponse.json({ data: result, error: null });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Local DB error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
