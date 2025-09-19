import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path - store in project root
const DB_PATH = path.join(__dirname, '../../workout.db');

// Initialize SQLite database with WAL mode configuration
export function initializeDatabase(): { db: BetterSQLite3Database; sqlite: Database.Database } {
  const sqlite = new Database(DB_PATH);
  
  // Configure SQLite with WAL mode and performance optimizations
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.pragma('busy_timeout = 5000');
  sqlite.pragma('foreign_keys = ON');
  
  // Initialize Drizzle ORM
  const db = drizzle(sqlite);
  
  return { db, sqlite };
}

export type DatabaseType = BetterSQLite3Database;