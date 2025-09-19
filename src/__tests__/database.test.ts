import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { initializeDatabase, getDatabaseConnection } from '../database/config.js';
import { initializeSchema, validateSchema } from '../database/init.js';
import { exercises, workouts, sets } from '../database/schema.js';
import fs from 'fs';
import path from 'path';

// Test database path
const TEST_DB_PATH = './test-workout.db';

interface TableInfo {
  name: string;
  type: string;
  pk: number;
  notnull: number;
}

interface QueryPlanStep {
  detail?: string;
}

describe('Database Schema and Initialization', () => {
  let testDb: Database.Database;
  let db: ReturnType<typeof drizzle>;

  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    
    // Create fresh test database
    testDb = new Database(TEST_DB_PATH);
    db = drizzle(testDb);
  });

  afterEach(() => {
    // Clean up test database
    testDb.close();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('Schema Creation', () => {
    it('should create all required tables', () => {
      // Initialize schema
      initializeSchema(db, testDb);

      // Check that all tables exist
      const tables = testDb.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('exercises', 'workouts', 'sets')
        ORDER BY name
      `).all() as { name: string }[];

      expect(tables).toHaveLength(3);
      expect(tables.map(t => t.name)).toEqual(['exercises', 'sets', 'workouts']);
    });

    it('should create all required indexes', () => {
      // Initialize schema
      initializeSchema(db, testDb);

      // Check that all indexes exist
      const indexes = testDb.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='index' AND name LIKE 'idx_%'
        ORDER BY name
      `).all() as { name: string }[];

      const expectedIndexes = [
        'idx_exercises_name',
        'idx_sets_exercise_id',
        'idx_sets_workout_id',
        'idx_sets_workout_order',
        'idx_workouts_date'
      ];

      expect(indexes).toHaveLength(expectedIndexes.length);
      expect(indexes.map(i => i.name)).toEqual(expectedIndexes);
    });

    it('should enable foreign key constraints', () => {
      // Initialize schema
      initializeSchema(db, testDb);

      // Check foreign keys are enabled
      const fkEnabled = testDb.pragma('foreign_keys', { simple: true });
      expect(fkEnabled).toBe(1);
    });

    it('should configure runtime PRAGMAs correctly', () => {
      // This test verifies that PRAGMAs can be set correctly
      // The actual PRAGMA configuration is done in the config.ts file
      testDb.pragma('journal_mode = WAL');
      testDb.pragma('synchronous = NORMAL');
      testDb.pragma('busy_timeout = 5000');
      testDb.pragma('foreign_keys = ON');

      // Check WAL mode
      const journalMode = testDb.pragma('journal_mode', { simple: true });
      expect(journalMode).toBe('wal');

      // Check synchronous mode
      const synchronous = testDb.pragma('synchronous', { simple: true });
      expect(synchronous).toBe(1); // NORMAL = 1

      // Check busy timeout
      const busyTimeout = testDb.pragma('busy_timeout', { simple: true });
      expect(busyTimeout).toBe(5000);
      
      // Check foreign keys
      const fkEnabled = testDb.pragma('foreign_keys', { simple: true });
      expect(fkEnabled).toBe(1);
    });
  });

  describe('Schema Validation', () => {
    it('should validate complete schema successfully', () => {
      // Initialize schema
      initializeSchema(db, testDb);

      // Validate schema
      const isValid = validateSchema(testDb);
      expect(isValid).toBe(true);
    });

    it('should fail validation when tables are missing', () => {
      // Don't initialize schema, just check validation
      const isValid = validateSchema(testDb);
      expect(isValid).toBe(false);
    });

    it('should fail validation when indexes are missing', () => {
      // Create tables but not indexes
      testDb.exec(`
        CREATE TABLE exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          muscle_groups TEXT,
          created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      testDb.exec(`
        CREATE TABLE workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          date TEXT NOT NULL,
          duration_minutes INTEGER,
          notes TEXT,
          created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      testDb.exec(`
        CREATE TABLE sets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_id INTEGER NOT NULL,
          exercise_id INTEGER NOT NULL,
          weight_kg REAL NOT NULL,
          reps INTEGER NOT NULL,
          rest_seconds INTEGER,
          completed INTEGER NOT NULL DEFAULT 1,
          order_in_workout INTEGER NOT NULL,
          notes TEXT
        )
      `);

      const isValid = validateSchema(testDb);
      expect(isValid).toBe(false);
    });

    it('should fail validation when foreign keys are disabled', () => {
      // Initialize schema to ensure tables and indexes exist
      initializeSchema(db, testDb);

      // Temporarily disable foreign keys for validation
      testDb.pragma('foreign_keys = OFF');

      const isValid = validateSchema(testDb);
      expect(isValid).toBe(false);

      // Re-enable foreign keys to avoid affecting other tests
      testDb.pragma('foreign_keys = ON');
    });
  });

  describe('Table Structure', () => {
    beforeEach(() => {
      initializeSchema(db, testDb);
    });

    it('should have correct exercises table structure', () => {
      const tableInfo = testDb.pragma('table_info(exercises)') as TableInfo[];
      
      const expectedColumns = [
        { name: 'id', type: 'INTEGER', pk: 1, notnull: 0 },
        { name: 'name', type: 'TEXT', pk: 0, notnull: 1 },
        { name: 'muscle_groups', type: 'TEXT', pk: 0, notnull: 0 },
        { name: 'created_at', type: 'INTEGER', pk: 0, notnull: 1 }
      ];

      expectedColumns.forEach(expected => {
        const column = tableInfo.find((col: TableInfo) => col.name === expected.name);
        expect(column).toBeDefined();
        expect(column!.type).toBe(expected.type);
        expect(column!.pk).toBe(expected.pk);
        expect(column!.notnull).toBe(expected.notnull);
      });
    });

    it('should have correct workouts table structure', () => {
      const tableInfo = testDb.pragma('table_info(workouts)') as TableInfo[];
      
      const expectedColumns = [
        { name: 'id', type: 'INTEGER', pk: 1, notnull: 0 },
        { name: 'name', type: 'TEXT', pk: 0, notnull: 1 },
        { name: 'date', type: 'TEXT', pk: 0, notnull: 1 },
        { name: 'duration_minutes', type: 'INTEGER', pk: 0, notnull: 0 },
        { name: 'notes', type: 'TEXT', pk: 0, notnull: 0 },
        { name: 'created_at', type: 'INTEGER', pk: 0, notnull: 1 }
      ];

      expectedColumns.forEach(expected => {
        const column = tableInfo.find((col: TableInfo) => col.name === expected.name);
        expect(column).toBeDefined();
        expect(column!.type).toBe(expected.type);
        expect(column!.pk).toBe(expected.pk);
        expect(column!.notnull).toBe(expected.notnull);
      });
    });

    it('should have correct sets table structure', () => {
      const tableInfo = testDb.pragma('table_info(sets)') as TableInfo[];
      
      const expectedColumns = [
        { name: 'id', type: 'INTEGER', pk: 1, notnull: 0 },
        { name: 'workout_id', type: 'INTEGER', pk: 0, notnull: 1 },
        { name: 'exercise_id', type: 'INTEGER', pk: 0, notnull: 1 },
        { name: 'weight_kg', type: 'REAL', pk: 0, notnull: 1 },
        { name: 'reps', type: 'INTEGER', pk: 0, notnull: 1 },
        { name: 'rest_seconds', type: 'INTEGER', pk: 0, notnull: 0 },
        { name: 'completed', type: 'INTEGER', pk: 0, notnull: 1 },
        { name: 'order_in_workout', type: 'INTEGER', pk: 0, notnull: 1 },
        { name: 'notes', type: 'TEXT', pk: 0, notnull: 0 }
      ];

      expectedColumns.forEach(expected => {
        const column = tableInfo.find((col: TableInfo) => col.name === expected.name);
        expect(column).toBeDefined();
        expect(column!.type).toBe(expected.type);
        expect(column!.pk).toBe(expected.pk);
        expect(column!.notnull).toBe(expected.notnull);
      });
    });
  });

  describe('Foreign Key Constraints', () => {
    beforeEach(() => {
      initializeSchema(db, testDb);
    });

    it('should enforce foreign key constraints on sets table', () => {
      // Try to insert a set with non-existent workout_id
      expect(() => {
        testDb.prepare(`
          INSERT INTO sets (workout_id, exercise_id, weight_kg, reps, order_in_workout)
          VALUES (999, 1, 100, 10, 1)
        `).run();
      }).toThrow();

      // Try to insert a set with non-existent exercise_id
      expect(() => {
        testDb.prepare(`
          INSERT INTO sets (workout_id, exercise_id, weight_kg, reps, order_in_workout)
          VALUES (1, 999, 100, 10, 1)
        `).run();
      }).toThrow();
    });
  });

  describe('Index Performance', () => {
    beforeEach(() => {
      initializeSchema(db, testDb);
    });

    it('should use idx_sets_workout_order for workout-based queries', () => {
      // Insert test data
      testDb.prepare('INSERT INTO exercises (name) VALUES (?)').run('Bench Press');
      testDb.prepare('INSERT INTO workouts (name, date) VALUES (?, ?)').run('Test Workout', '2025-01-01T10:00:00Z');
      
      // Check query plan uses the composite index
      const queryPlan = testDb.prepare(`
        EXPLAIN QUERY PLAN 
        SELECT * FROM sets 
        WHERE workout_id = 1 
        ORDER BY order_in_workout
      `).all() as QueryPlanStep[];

      // Should use the idx_sets_workout_order index
      const usesIndex = queryPlan.some((step: QueryPlanStep) => 
        step.detail && step.detail.includes('idx_sets_workout_order')
      );
      expect(usesIndex).toBe(true);
    });
  });
});

describe('Database Configuration Integration', () => {
  const INTEGRATION_TEST_DB = './integration-test.db';
  
  afterEach(() => {
    // Clean up any test databases
    try {
      if (fs.existsSync(INTEGRATION_TEST_DB)) {
        fs.unlinkSync(INTEGRATION_TEST_DB);
      }
      if (fs.existsSync('./workout.db')) {
        fs.unlinkSync('./workout.db');
      }
    } catch (error) {
      // Ignore cleanup errors in tests
    }
  });

  it('should initialize database with complete setup', () => {
    // Use a different database path for this test
    const originalDbPath = process.env.DB_PATH;
    process.env.DB_PATH = INTEGRATION_TEST_DB;
    
    const { db, sqlite } = initializeDatabase();
    
    // Verify schema is valid
    expect(validateSchema(sqlite)).toBe(true);
    
    // Verify PRAGMAs are set correctly
    expect(sqlite.pragma('journal_mode', { simple: true })).toBe('wal');
    expect(sqlite.pragma('synchronous', { simple: true })).toBe(1);
    expect(sqlite.pragma('busy_timeout', { simple: true })).toBe(5000);
    expect(sqlite.pragma('foreign_keys', { simple: true })).toBe(1);
    
    sqlite.close();
    
    // Restore original DB path
    if (originalDbPath) {
      process.env.DB_PATH = originalDbPath;
    } else {
      delete process.env.DB_PATH;
    }
  });

  it('should handle database initialization correctly', () => {
    // Test that multiple initializations work correctly
    const { sqlite: sqlite1 } = initializeDatabase();
    sqlite1.close();
    
    const { sqlite: sqlite2 } = initializeDatabase();
    expect(validateSchema(sqlite2)).toBe(true);
    sqlite2.close();
  });
});