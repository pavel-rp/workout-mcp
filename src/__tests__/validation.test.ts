import { describe, it, expect } from '@jest/globals';
import {
  StartWorkoutSchema,
  EndWorkoutSchema,
  AddExerciseSetSchema,
  DateRangeSchema,
  ExerciseHistorySchema,
  WorkoutQuerySchema,
  GetWorkoutsSchema,
  VolumeCalculationSchema,
  AverageWeightSchema,
  CountSetsSchema,
  ISO8601DateTimeSchema,
  PositiveNumberSchema,
  PositiveIntegerSchema,
  NonEmptyStringSchema
} from '../validation/schemas.js';

import {
  validateInput,
  safeParseWithDetails,
  sanitizeString,
  sanitizeExerciseName,
  normalizeExerciseName,
  isValidationSuccess,
  isValidationError
} from '../validation/validator.js';

import {
  mapExerciseToDto,
  mapWorkoutToDto,
  mapSetToDto,
  mapNewExerciseDtoToDb,
  mapNewWorkoutDtoToDb,
  mapNewSetDtoToDb,
  normalizeToUtc,
  validateAndNormalizeDateTime,
  mapApiFiltersToDb
} from '../validation/dto-mappers.js';

describe('Base Validation Schemas', () => {
  describe('PositiveNumberSchema', () => {
    it('should accept positive numbers', () => {
      expect(PositiveNumberSchema.parse(1)).toBe(1);
      expect(PositiveNumberSchema.parse(0.1)).toBe(0.1);
      expect(PositiveNumberSchema.parse(999.99)).toBe(999.99);
    });

    it('should reject zero and negative numbers', () => {
      expect(() => PositiveNumberSchema.parse(0)).toThrow();
      expect(() => PositiveNumberSchema.parse(-1)).toThrow();
      expect(() => PositiveNumberSchema.parse(-0.1)).toThrow();
    });

    it('should reject non-numbers', () => {
      expect(() => PositiveNumberSchema.parse('1')).toThrow();
      expect(() => PositiveNumberSchema.parse(null)).toThrow();
      expect(() => PositiveNumberSchema.parse(undefined)).toThrow();
    });
  });

  describe('PositiveIntegerSchema', () => {
    it('should accept positive integers', () => {
      expect(PositiveIntegerSchema.parse(1)).toBe(1);
      expect(PositiveIntegerSchema.parse(100)).toBe(100);
    });

    it('should reject zero, negative numbers, and decimals', () => {
      expect(() => PositiveIntegerSchema.parse(0)).toThrow();
      expect(() => PositiveIntegerSchema.parse(-1)).toThrow();
      expect(() => PositiveIntegerSchema.parse(1.5)).toThrow();
    });
  });

  describe('NonEmptyStringSchema', () => {
    it('should accept non-empty strings', () => {
      expect(NonEmptyStringSchema.parse('test')).toBe('test');
      expect(NonEmptyStringSchema.parse(' ')).toBe(' ');
    });

    it('should reject empty strings', () => {
      expect(() => NonEmptyStringSchema.parse('')).toThrow();
    });

    it('should reject non-strings', () => {
      expect(() => NonEmptyStringSchema.parse(123)).toThrow();
      expect(() => NonEmptyStringSchema.parse(null)).toThrow();
    });
  });

  describe('ISO8601DateTimeSchema', () => {
    it('should accept valid ISO 8601 datetime strings with timezone', () => {
      expect(ISO8601DateTimeSchema.parse('2025-09-19T14:00:00Z')).toBe('2025-09-19T14:00:00Z');
      expect(ISO8601DateTimeSchema.parse('2025-09-19T14:00:00+05:30')).toBe('2025-09-19T14:00:00+05:30');
      expect(ISO8601DateTimeSchema.parse('2025-09-19T14:00:00-08:00')).toBe('2025-09-19T14:00:00-08:00');
    });

    it('should reject invalid datetime formats', () => {
      expect(() => ISO8601DateTimeSchema.parse('2025-09-19')).toThrow();
      expect(() => ISO8601DateTimeSchema.parse('2025-09-19T14:00:00')).toThrow(); // No timezone
      expect(() => ISO8601DateTimeSchema.parse('invalid-date')).toThrow();
      expect(() => ISO8601DateTimeSchema.parse('')).toThrow();
    });
  });
});

describe('Workout Validation Schemas', () => {
  describe('StartWorkoutSchema', () => {
    it('should accept valid workout start data', () => {
      expect(StartWorkoutSchema.parse({})).toEqual({});
      expect(StartWorkoutSchema.parse({ name: 'Morning Workout' })).toEqual({ name: 'Morning Workout' });
    });

    it('should reject invalid data', () => {
      expect(() => StartWorkoutSchema.parse({ name: 123 })).toThrow();
    });
  });

  describe('EndWorkoutSchema', () => {
    it('should accept valid workout end data', () => {
      const valid = { workoutId: 1 };
      expect(EndWorkoutSchema.parse(valid)).toEqual(valid);
      
      const validWithNotes = { workoutId: 1, notes: 'Great workout!' };
      expect(EndWorkoutSchema.parse(validWithNotes)).toEqual(validWithNotes);
    });

    it('should reject invalid workout IDs', () => {
      expect(() => EndWorkoutSchema.parse({ workoutId: 0 })).toThrow();
      expect(() => EndWorkoutSchema.parse({ workoutId: -1 })).toThrow();
      expect(() => EndWorkoutSchema.parse({ workoutId: 1.5 })).toThrow();
      expect(() => EndWorkoutSchema.parse({ workoutId: '1' })).toThrow();
    });

    it('should require workoutId', () => {
      expect(() => EndWorkoutSchema.parse({})).toThrow();
      expect(() => EndWorkoutSchema.parse({ notes: 'test' })).toThrow();
    });
  });

  describe('AddExerciseSetSchema', () => {
    const validSet = {
      workoutId: 1,
      exerciseName: 'Bench Press',
      weightKg: 80.5,
      reps: 10
    };

    it('should accept valid exercise set data', () => {
      expect(AddExerciseSetSchema.parse(validSet)).toEqual(validSet);
      
      const withNotes = { ...validSet, notes: 'Felt strong' };
      expect(AddExerciseSetSchema.parse(withNotes)).toEqual(withNotes);
    });

    it('should reject invalid workout IDs', () => {
      expect(() => AddExerciseSetSchema.parse({ ...validSet, workoutId: 0 })).toThrow();
      expect(() => AddExerciseSetSchema.parse({ ...validSet, workoutId: -1 })).toThrow();
    });

    it('should reject invalid exercise names', () => {
      expect(() => AddExerciseSetSchema.parse({ ...validSet, exerciseName: '' })).toThrow();
      expect(() => AddExerciseSetSchema.parse({ ...validSet, exerciseName: 'a'.repeat(101) })).toThrow();
    });

    it('should reject invalid weights', () => {
      expect(() => AddExerciseSetSchema.parse({ ...validSet, weightKg: 0 })).toThrow();
      expect(() => AddExerciseSetSchema.parse({ ...validSet, weightKg: -10 })).toThrow();
      expect(() => AddExerciseSetSchema.parse({ ...validSet, weightKg: 1001 })).toThrow();
    });

    it('should reject invalid reps', () => {
      expect(() => AddExerciseSetSchema.parse({ ...validSet, reps: 0 })).toThrow();
      expect(() => AddExerciseSetSchema.parse({ ...validSet, reps: -1 })).toThrow();
      expect(() => AddExerciseSetSchema.parse({ ...validSet, reps: 1001 })).toThrow();
      expect(() => AddExerciseSetSchema.parse({ ...validSet, reps: 10.5 })).toThrow();
    });

    it('should require all mandatory fields', () => {
      expect(() => AddExerciseSetSchema.parse({})).toThrow();
      expect(() => AddExerciseSetSchema.parse({ workoutId: 1 })).toThrow();
      expect(() => AddExerciseSetSchema.parse({ workoutId: 1, exerciseName: 'test' })).toThrow();
    });
  });
});

describe('Query Validation Schemas', () => {
  describe('DateRangeSchema', () => {
    it('should accept valid date ranges', () => {
      const validRange = {
        startDate: '2025-09-19T14:00:00Z',
        endDate: '2025-09-20T14:00:00Z'
      };
      expect(DateRangeSchema.parse(validRange)).toEqual(validRange);
    });

    it('should accept empty date range', () => {
      expect(DateRangeSchema.parse({})).toEqual({});
    });

    it('should accept single date boundaries', () => {
      expect(DateRangeSchema.parse({ startDate: '2025-09-19T14:00:00Z' })).toEqual({ startDate: '2025-09-19T14:00:00Z' });
      expect(DateRangeSchema.parse({ endDate: '2025-09-19T14:00:00Z' })).toEqual({ endDate: '2025-09-19T14:00:00Z' });
    });

    it('should reject invalid date order', () => {
      const invalidRange = {
        startDate: '2025-09-20T14:00:00Z',
        endDate: '2025-09-19T14:00:00Z'
      };
      expect(() => DateRangeSchema.parse(invalidRange)).toThrow();
    });

    it('should accept same start and end dates', () => {
      const sameDate = {
        startDate: '2025-09-19T14:00:00Z',
        endDate: '2025-09-19T14:00:00Z'
      };
      expect(DateRangeSchema.parse(sameDate)).toEqual(sameDate);
    });
  });

  describe('ExerciseHistorySchema', () => {
    it('should accept valid exercise history queries', () => {
      const valid = { exerciseName: 'Bench Press' };
      expect(ExerciseHistorySchema.parse(valid)).toEqual(valid);
      
      const withLimit = { exerciseName: 'Bench Press', limit: 50 };
      expect(ExerciseHistorySchema.parse(withLimit)).toEqual(withLimit);
    });

    it('should reject invalid exercise names', () => {
      expect(() => ExerciseHistorySchema.parse({ exerciseName: '' })).toThrow();
    });

    it('should reject invalid limits', () => {
      expect(() => ExerciseHistorySchema.parse({ exerciseName: 'test', limit: 0 })).toThrow();
      expect(() => ExerciseHistorySchema.parse({ exerciseName: 'test', limit: -1 })).toThrow();
      expect(() => ExerciseHistorySchema.parse({ exerciseName: 'test', limit: 1001 })).toThrow();
    });
  });

  describe('WorkoutQuerySchema', () => {
    it('should accept valid workout IDs', () => {
      expect(WorkoutQuerySchema.parse({ workoutId: 1 })).toEqual({ workoutId: 1 });
      expect(WorkoutQuerySchema.parse({ workoutId: 999 })).toEqual({ workoutId: 999 });
    });

    it('should reject invalid workout IDs', () => {
      expect(() => WorkoutQuerySchema.parse({ workoutId: 0 })).toThrow();
      expect(() => WorkoutQuerySchema.parse({ workoutId: -1 })).toThrow();
      expect(() => WorkoutQuerySchema.parse({ workoutId: 1.5 })).toThrow();
    });
  });
});

describe('Calculation Validation Schemas', () => {
  describe('VolumeCalculationSchema', () => {
    it('should accept valid volume calculation filters', () => {
      expect(VolumeCalculationSchema.parse({})).toEqual({});
      
      const withFilters = {
        exerciseName: 'Bench Press',
        startDate: '2025-09-19T14:00:00Z',
        workoutId: 1
      };
      expect(VolumeCalculationSchema.parse(withFilters)).toEqual(withFilters);
    });
  });

  describe('AverageWeightSchema', () => {
    it('should accept valid average weight queries', () => {
      const valid = { exerciseName: 'Bench Press' };
      expect(AverageWeightSchema.parse(valid)).toEqual(valid);
      
      const withDates = {
        exerciseName: 'Bench Press',
        startDate: '2025-09-19T14:00:00Z',
        endDate: '2025-09-20T14:00:00Z'
      };
      expect(AverageWeightSchema.parse(withDates)).toEqual(withDates);
    });

    it('should require exercise name', () => {
      expect(() => AverageWeightSchema.parse({})).toThrow();
    });
  });

  describe('CountSetsSchema', () => {
    it('should accept valid set counting filters', () => {
      expect(CountSetsSchema.parse({})).toEqual({});
      
      const withFilters = {
        exerciseName: 'Bench Press',
        workoutId: 1,
        completed: true
      };
      expect(CountSetsSchema.parse(withFilters)).toEqual(withFilters);
    });
  });
});

describe('Validation Utilities', () => {
  describe('validateInput', () => {
    it('should return success for valid input', () => {
      const result = validateInput(PositiveIntegerSchema, 5);
      expect(isValidationSuccess(result)).toBe(true);
      if (isValidationSuccess(result)) {
        expect(result.data).toBe(5);
      }
    });

    it('should return error for invalid input', () => {
      const result = validateInput(PositiveIntegerSchema, -1);
      expect(isValidationError(result)).toBe(true);
      if (isValidationError(result)) {
        expect(result.error.type).toBe('validation');
        expect(result.error.message).toContain('positive');
      }
    });
  });

  describe('safeParseWithDetails', () => {
    it('should provide detailed error information', () => {
      const result = safeParseWithDetails(AddExerciseSetSchema, {
        workoutId: -1,
        exerciseName: '',
        weightKg: 0,
        reps: 0
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorDetails).toBeDefined();
        expect(result.errorDetails!.length).toBeGreaterThan(0);
        expect(result.errorDetails![0]).toHaveProperty('field');
        expect(result.errorDetails![0]).toHaveProperty('message');
        expect(result.errorDetails![0]).toHaveProperty('code');
      }
    });
  });

  describe('sanitizeString', () => {
    it('should remove malicious content', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
      expect(sanitizeString('onclick=alert("xss")')).toBe('alert("xss")');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test');
    });

    it('should limit length', () => {
      const longString = 'a'.repeat(2000);
      expect(sanitizeString(longString)).toHaveLength(1000);
    });
  });

  describe('sanitizeExerciseName', () => {
    it('should normalize exercise names', () => {
      expect(sanitizeExerciseName('  BENCH PRESS  ')).toBe('bench press');
      expect(sanitizeExerciseName('Squat')).toBe('squat');
    });
  });

  describe('normalizeExerciseName', () => {
    it('should normalize whitespace and case', () => {
      expect(normalizeExerciseName('  Bench   Press  ')).toBe('bench press');
      expect(normalizeExerciseName('SQUAT')).toBe('squat');
    });
  });
});

describe('DTO Mappers', () => {
  describe('DateTime utilities', () => {
    describe('normalizeToUtc', () => {
      it('should convert datetime to UTC ISO string', () => {
        const result = normalizeToUtc('2025-09-19T14:00:00+05:30');
        expect(result).toBe('2025-09-19T08:30:00.000Z');
      });

      it('should handle UTC datetime', () => {
        const utcDate = '2025-09-19T14:00:00Z';
        const result = normalizeToUtc(utcDate);
        expect(result).toBe('2025-09-19T14:00:00.000Z');
      });
    });

    describe('validateAndNormalizeDateTime', () => {
      it('should validate and normalize valid datetime', () => {
        const result = validateAndNormalizeDateTime('2025-09-19T14:00:00+05:30');
        expect(result).toBe('2025-09-19T08:30:00.000Z');
      });

      it('should throw error for invalid datetime', () => {
        expect(() => validateAndNormalizeDateTime('invalid-date')).toThrow();
        expect(() => validateAndNormalizeDateTime('2025-13-45')).toThrow();
      });
    });
  });

  describe('Filter mapping', () => {
    describe('mapApiFiltersToDb', () => {
      it('should map camelCase API filters to snake_case DB filters', () => {
        const apiFilters = {
          workoutId: 1,
          exerciseName: 'Bench Press',
          startDate: '2025-09-19T14:00:00Z',
          endDate: '2025-09-20T14:00:00Z',
          completed: true
        };

        const dbFilters = mapApiFiltersToDb(apiFilters);
        
        expect(dbFilters).toEqual({
          workout_id: 1,
          exercise_name: 'Bench Press',
          start_date: '2025-09-19T14:00:00.000Z',
          end_date: '2025-09-20T14:00:00.000Z',
          completed: true
        });
      });

      it('should handle partial filters', () => {
        const apiFilters = { workoutId: 1 };
        const dbFilters = mapApiFiltersToDb(apiFilters);
        
        expect(dbFilters).toEqual({ workout_id: 1 });
      });

      it('should handle empty filters', () => {
        const dbFilters = mapApiFiltersToDb({});
        expect(dbFilters).toEqual({});
      });
    });
  });

  describe('Entity mapping', () => {
    it('should map database exercise to DTO', () => {
      const dbExercise = {
        id: 1,
        name: 'Bench Press',
        muscleGroups: ['chest', 'triceps'],
        createdAt: new Date('2025-09-19T14:00:00Z')
      };

      const dto = mapExerciseToDto(dbExercise);
      
      expect(dto).toEqual({
        id: 1,
        name: 'Bench Press',
        muscleGroups: ['chest', 'triceps'],
        createdAt: new Date('2025-09-19T14:00:00Z')
      });
    });

    it('should map new exercise DTO to database format', () => {
      const dto = {
        name: 'Squat',
        muscleGroups: ['legs', 'glutes']
      };

      const dbFormat = mapNewExerciseDtoToDb(dto);
      
      expect(dbFormat).toEqual({
        name: 'Squat',
        muscleGroups: ['legs', 'glutes']
      });
    });
  });
});

describe('Edge Cases and Error Scenarios', () => {
  it('should handle null and undefined values appropriately', () => {
    expect(() => StartWorkoutSchema.parse(null)).toThrow();
    expect(() => StartWorkoutSchema.parse(undefined)).toThrow();
  });

  it('should handle extremely large numbers', () => {
    expect(() => AddExerciseSetSchema.parse({
      workoutId: 1,
      exerciseName: 'test',
      weightKg: Number.MAX_SAFE_INTEGER,
      reps: 1
    })).toThrow();
  });

  it('should handle special characters in exercise names', () => {
    const validSet = {
      workoutId: 1,
      exerciseName: 'Dumbbell Fly (Incline)',
      weightKg: 25,
      reps: 12
    };
    expect(AddExerciseSetSchema.parse(validSet)).toEqual(validSet);
  });

  it('should handle timezone edge cases', () => {
    // Test various timezone formats
    const timezones = [
      '2025-09-19T14:00:00Z',
      '2025-09-19T14:00:00+00:00',
      '2025-09-19T14:00:00-08:00',
      '2025-09-19T14:00:00+05:30'
    ];

    timezones.forEach(tz => {
      expect(ISO8601DateTimeSchema.parse(tz)).toBe(tz);
    });
  });

  it('should handle boundary values for limits', () => {
    expect(ExerciseHistorySchema.parse({ exerciseName: 'test', limit: 1 })).toEqual({ exerciseName: 'test', limit: 1 });
    expect(ExerciseHistorySchema.parse({ exerciseName: 'test', limit: 1000 })).toEqual({ exerciseName: 'test', limit: 1000 });
    
    expect(() => ExerciseHistorySchema.parse({ exerciseName: 'test', limit: 1001 })).toThrow();
  });
});