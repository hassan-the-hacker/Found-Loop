import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'local-db.json');

interface LocalDatabase {
  profiles: Array<Record<string, any>>;
  lost_items: Array<Record<string, any>>;
  found_items: Array<Record<string, any>>;
  potential_matches: Array<Record<string, any>>;
  ownership_claims: Array<Record<string, any>>;
  reports_and_flags: Array<Record<string, any>>;
  registered_users?: Array<Record<string, any>>;
}

const DEFAULT_DB: LocalDatabase = {
  profiles: [],
  lost_items: [],
  found_items: [],
  potential_matches: [],
  ownership_claims: [],
  reports_and_flags: [],
  registered_users: [],
};

export function getLocalDb(): LocalDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content) as LocalDatabase;
    }
  } catch (err) {
    console.error('Error reading local-db.json:', err);
  }
  return { ...DEFAULT_DB };
}

export function saveLocalDb(db: LocalDatabase): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local-db.json:', err);
  }
}

export function queryTable(table: string, filter?: (row: any) => boolean): any[] {
  const db = getLocalDb();
  const rows = (db as any)[table] || [];
  if (filter) {
    return rows.filter(filter);
  }
  return [...rows];
}

export function insertRow(table: string, row: Record<string, any>): Record<string, any> {
  const db = getLocalDb();
  if (!(db as any)[table]) {
    (db as any)[table] = [];
  }
  const newRow = {
    id: row.id || `${table.slice(0, 4)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: row.created_at || new Date().toISOString(),
    ...row,
  };
  (db as any)[table].unshift(newRow);
  saveLocalDb(db);
  return newRow;
}

export function updateRow(table: string, filter: (row: any) => boolean, updates: Record<string, any>): Record<string, any> | null {
  const db = getLocalDb();
  const rows = (db as any)[table] || [];
  const index = rows.findIndex(filter);
  if (index !== -1) {
    rows[index] = { ...rows[index], ...updates, updated_at: new Date().toISOString() };
    saveLocalDb(db);
    return rows[index];
  }
  return null;
}

export function upsertRow(table: string, row: Record<string, any>, conflictKeys: string[]): Record<string, any> {
  const db = getLocalDb();
  if (!(db as any)[table]) {
    (db as any)[table] = [];
  }
  const rows = (db as any)[table] as Array<Record<string, any>>;
  const existingIndex = rows.findIndex((r) => conflictKeys.every((k) => r[k] === row[k]));

  if (existingIndex !== -1) {
    rows[existingIndex] = { ...rows[existingIndex], ...row, updated_at: new Date().toISOString() };
    saveLocalDb(db);
    return rows[existingIndex];
  } else {
    return insertRow(table, row);
  }
}
