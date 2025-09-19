// Mock better-sqlite3
const mockDatabase = {
  pragma: jest.fn(),
  exec: jest.fn(),
  prepare: jest.fn(),
  close: jest.fn()
};

const mockStatement = {
  all: jest.fn(),
  run: jest.fn()
};

// Mock drizzle
const mockDrizzle = jest.fn();

jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => mockDatabase);
});

jest.mock('drizzle-orm/better-sqlite3', () => ({
  drizzle: mockDrizzle
}));

import { initializeDatabase, getDatabaseConnection } from '../database/config.js';
import { initializeSchema, validateSchema } from '../database/init.js';

describe('Database Schema and Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.pragma.mockReturnValue(1);
    mockDatabase.prepare.mockReturnValue(mockStatement);
    mockDrizzle.mockReturnValue({});
  });

  describe('Schema Creation', () => {
    it('should create all required tables', () => {
      // Initialize schema
      initializeSchema({} as any, mockDatabase as any);

      // Verify exec was called to create tables
      expect(mockDatabase.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS exercises'));
      expect(mockDatabase.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS workouts'));
      expect(mockDatabase.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS sets'));
    });

    it('should create all required indexes', () => {
      // Initialize schema
      initializeSchema({} as any, mockDatabase as any);

      // Verify indexes were created
      expect(mockDatabase.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_sets_workout_id'));
      expect(mockDatabase.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_sets_exercise_id'));
      expect(mockDatabase.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_sets_workout_order'));
      expect(mockDatabase.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_workouts_date'));
      expect(mockDatabase.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_exercises_name'));
    });

    it('should enable foreign key constraints', () => {
      // Initialize schema
      initializeSchema({} as any, mockDatabase as any);

      // Verify foreign keys pragma was called
      expect(mockDatabase.pragma).toHaveBeenCalledWith('foreign_keys = ON');
    });

    it('should configure runtime PRAGMAs correctly', () => {
      // Mock successful validation
      mockStatement.all
        .mockReturnValueOnce([
          { name: 'exercises' },
          { name: 'workouts' },
          { name: 'sets' }
        ])
        .mockReturnValueOnce([
          { name: 'idx_sets_workout_id' },
          { name: 'idx_sets_exercise_id' },
          { name: 'idx_sets_workout_order' },
          { name: 'idx_workouts_date' },
          { name: 'idx_exercises_name' }
        ]);

      // Initialize database (which sets PRAGMAs)
      initializeDatabase();

      // Verify PRAGMAs were set
      expect(mockDatabase.pragma).toHaveBeenCalledWith('journal_mode = WAL');
      expect(mockDatabase.pragma).toHaveBeenCalledWith('synchronous = NORMAL');
      expect(mockDatabase.pragma).toHaveBeenCalledWith('busy_timeout = 5000');
      expect(mockDatabase.pragma).toHaveBeenCalledWith('foreign_keys = ON');
    });
  });

  describe('Schema Validation', () => {
    it('should validate complete schema successfully', () => {
      // Mock successful validation responses
      mockStatement.all
        .mockReturnValueOnce([
          { name: 'exercises' },
          { name: 'workouts' },
          { name: 'sets' }
        ])
        .mockReturnValueOnce([
          { name: 'idx_sets_workout_id' },
          { name: 'idx_sets_exercise_id' },
          { name: 'idx_sets_workout_order' },
          { name: 'idx_workouts_date' },
          { name: 'idx_exercises_name' }
        ]);
      
      mockDatabase.pragma.mockReturnValue(1); // foreign_keys enabled

      const isValid = validateSchema(mockDatabase as any);
      expect(isValid).toBe(true);
    });

    it('should fail validation when tables are missing', () => {
      // Mock missing tables
      mockStatement.all.mockReturnValueOnce([
        { name: 'exercises' },
        { name: 'workouts' }
        // missing 'sets' table
      ]);

      const isValid = validateSchema(mockDatabase as any);
      expect(isValid).toBe(false);
    });

    it('should fail validation when indexes are missing', () => {
      // Mock all tables present but missing indexes
      mockStatement.all
        .mockReturnValueOnce([
          { name: 'exercises' },
          { name: 'workouts' },
          { name: 'sets' }
        ])
        .mockReturnValueOnce([
          { name: 'idx_sets_workout_id' },
          { name: 'idx_sets_exercise_id' }
          // missing other indexes
        ]);

      const isValid = validateSchema(mockDatabase as any);
      expect(isValid).toBe(false);
    });

    it('should fail validation when foreign keys are disabled', () => {
      // Mock all tables and indexes present but foreign keys disabled
      mockStatement.all
        .mockReturnValueOnce([
          { name: 'exercises' },
          { name: 'workouts' },
          { name: 'sets' }
        ])
        .mockReturnValueOnce([
          { name: 'idx_sets_workout_id' },
          { name: 'idx_sets_exercise_id' },
          { name: 'idx_sets_workout_order' },
          { name: 'idx_workouts_date' },
          { name: 'idx_exercises_name' }
        ]);
      
      mockDatabase.pragma.mockReturnValue(0); // foreign_keys disabled

      const isValid = validateSchema(mockDatabase as any);
      expect(isValid).toBe(false);
    });
  });

  describe('Database Configuration', () => {
    it('should initialize database with complete setup', () => {
      // Mock successful validation
      mockStatement.all
        .mockReturnValueOnce([
          { name: 'exercises' },
          { name: 'workouts' },
          { name: 'sets' }
        ])
        .mockReturnValueOnce([
          { name: 'idx_sets_workout_id' },
          { name: 'idx_sets_exercise_id' },
          { name: 'idx_sets_workout_order' },
          { name: 'idx_workouts_date' },
          { name: 'idx_exercises_name' }
        ]);

      const result = initializeDatabase();
      
      expect(result).toHaveProperty('db');
      expect(result).toHaveProperty('sqlite');
      expect(mockDrizzle).toHaveBeenCalled();
    });

    it('should throw error if schema validation fails', () => {
      // Mock validation failure
      mockStatement.all.mockReturnValueOnce([]); // no tables

      expect(() => {
        initializeDatabase();
      }).toThrow('Database schema validation failed after initialization');
    });

    it('should get database connection without reinitializing schema', () => {
      const result = getDatabaseConnection();
      
      expect(result).toHaveProperty('db');
      expect(result).toHaveProperty('sqlite');
      expect(mockDrizzle).toHaveBeenCalled();
      
      // Should set PRAGMAs but not initialize schema
      expect(mockDatabase.pragma).toHaveBeenCalledWith('journal_mode = WAL');
      expect(mockDatabase.pragma).toHaveBeenCalledWith('synchronous = NORMAL');
      expect(mockDatabase.pragma).toHaveBeenCalledWith('busy_timeout = 5000');
      expect(mockDatabase.pragma).toHaveBeenCalledWith('foreign_keys = ON');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', () => {
      // Mock database error
      mockDatabase.prepare.mockImplementation(() => {
        throw new Error('Database error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const isValid = validateSchema(mockDatabase as any);
      expect(isValid).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Schema validation failed:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Schema Structure', () => {
    it('should create exercises table with correct structure', () => {
      initializeSchema({} as any, mockDatabase as any);

      const createTableCall = mockDatabase.exec.mock.calls.find(call => 
        call[0].includes('CREATE TABLE IF NOT EXISTS exercises')
      );
      
      expect(createTableCall).toBeDefined();
      expect(createTableCall[0]).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
      expect(createTableCall[0]).toContain('name TEXT NOT NULL UNIQUE');
      expect(createTableCall[0]).toContain('muscle_groups TEXT');
      expect(createTableCall[0]).toContain('created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP');
    });

    it('should create workouts table with correct structure', () => {
      initializeSchema({} as any, mockDatabase as any);

      const createTableCall = mockDatabase.exec.mock.calls.find(call => 
        call[0].includes('CREATE TABLE IF NOT EXISTS workouts')
      );
      
      expect(createTableCall).toBeDefined();
      expect(createTableCall[0]).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
      expect(createTableCall[0]).toContain('name TEXT NOT NULL');
      expect(createTableCall[0]).toContain('date TEXT NOT NULL');
      expect(createTableCall[0]).toContain('duration_minutes INTEGER');
      expect(createTableCall[0]).toContain('notes TEXT');
    });

    it('should create sets table with foreign key constraints', () => {
      initializeSchema({} as any, mockDatabase as any);

      const createTableCall = mockDatabase.exec.mock.calls.find(call => 
        call[0].includes('CREATE TABLE IF NOT EXISTS sets')
      );
      
      expect(createTableCall).toBeDefined();
      expect(createTableCall[0]).toContain('FOREIGN KEY (workout_id) REFERENCES workouts(id)');
      expect(createTableCall[0]).toContain('FOREIGN KEY (exercise_id) REFERENCES exercises(id)');
      expect(createTableCall[0]).toContain('weight_kg REAL NOT NULL');
      expect(createTableCall[0]).toContain('reps INTEGER NOT NULL');
      expect(createTableCall[0]).toContain('order_in_workout INTEGER NOT NULL');
    });
  });
});