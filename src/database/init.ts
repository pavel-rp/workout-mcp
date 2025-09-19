import Database from 'better-sqlite3';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { exercises, workouts, sets } from './schema.js';

/**
 * Initialize database schema and indexes
 * Creates tables and indexes if they don't exist
 */
export function initializeSchema(db: BetterSQLite3Database<any>, sqlite: Database.Database): void {
  // Enable foreign key constraints
  sqlite.pragma('foreign_keys = ON');
  
  // Create tables manually for initial setup
  // TODO: Consider migrating to Drizzle Kit migrations for production use
  
  // Create exercises table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      muscle_groups TEXT,
      created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create workouts table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      duration_minutes INTEGER,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create sets table with foreign key constraints
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      weight_kg REAL NOT NULL,
      reps INTEGER NOT NULL,
      rest_seconds INTEGER,
      completed INTEGER NOT NULL DEFAULT 1,
      order_in_workout INTEGER NOT NULL,
      notes TEXT,
      FOREIGN KEY (workout_id) REFERENCES workouts(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    )
  `);
  
  // Create indexes for performance optimization
  createIndexes(sqlite);
}

/**
 * Create database indexes for optimal query performance
 */
function createIndexes(sqlite: Database.Database): void {
  // Index for sets by workout_id (frequent lookup)
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_sets_workout_id ON sets(workout_id)
  `);
  
  // Index for sets by exercise_id (exercise history queries)
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_sets_exercise_id ON sets(exercise_id)
  `);
  
  // Composite index for sets by workout and order (requirement: idx_sets_workout_order)
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_sets_workout_order ON sets(workout_id, order_in_workout)
  `);
  
  // Index for workouts by date (frequent filtering and ordering)
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date)
  `);
  
  // Index for exercises by name (case-insensitive lookups)
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name)
  `);
}

/**
 * Validate that all required tables and indexes exist
 * Returns true if schema is valid, false otherwise
 */
export function validateSchema(sqlite: Database.Database): boolean {
  try {
    // Check that all required tables exist
    const tables = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('exercises', 'workouts', 'sets')
    `).all();
    
    if (tables.length !== 3) {
      return false;
    }
    
    // Check that all required indexes exist
    const indexes = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name IN (
        'idx_sets_workout_id',
        'idx_sets_exercise_id', 
        'idx_sets_workout_order',
        'idx_workouts_date',
        'idx_exercises_name'
      )
    `).all();
    
    if (indexes.length !== 5) {
      return false;
    }
    
    // Verify foreign key constraints are enabled
    const fkEnabled = sqlite.pragma('foreign_keys', { simple: true });
    if (fkEnabled !== 1) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Schema validation failed:', error);
    return false;
  }
}