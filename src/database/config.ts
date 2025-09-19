import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { initializeSchema, validateSchema } from './init.js';

import path from 'path';

// Database file path - use path relative to project root for consistency
// In production, consider setting DB_PATH environment variable explicitly
const DB_PATH = process.env.DB_PATH || path.resolve('./workout.db');

/**
 * Configure SQLite runtime PRAGMAs for optimal performance and safety
 */
function configurePragmas(sqlite: Database.Database): void {
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.pragma('busy_timeout = 5000');
  sqlite.pragma('foreign_keys = ON');
}

/**
 * Initialize SQLite database with WAL mode configuration and schema setup
 * Configures runtime PRAGMAs and ensures schema exists
 */
export function initializeDatabase(): { db: BetterSQLite3Database; sqlite: Database.Database } {
  const sqlite = new Database(DB_PATH);
  
  // Configure runtime PRAGMAs as specified in requirements
  configurePragmas(sqlite);
  
  // Initialize Drizzle ORM
  const db = drizzle(sqlite);
  
  // Initialize schema and indexes if they don't exist
  initializeSchema(db, sqlite);
  
  // Validate schema was created successfully
  if (!validateSchema(sqlite)) {
    throw new Error('Database schema validation failed after initialization');
  }
  
  return { db, sqlite };
}

/**
 * Get database connection without reinitializing schema
 * Useful for testing scenarios where schema is already set up
 */
export function getDatabaseConnection(): { db: BetterSQLite3Database; sqlite: Database.Database } {
  const sqlite = new Database(DB_PATH);
  
  // Configure runtime PRAGMAs
  configurePragmas(sqlite);
  
  const db = drizzle(sqlite);
  
  return { db, sqlite };
}

export type DatabaseType = BetterSQLite3Database;