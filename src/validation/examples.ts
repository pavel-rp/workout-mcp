/**
 * Examples demonstrating how to use the validation layer
 * This file shows practical usage patterns for the validation schemas and utilities
 */

import {
  StartWorkoutSchema,
  AddExerciseSetSchema,
  DateRangeSchema,
  ExerciseHistorySchema,
  type StartWorkoutInput,
  type AddExerciseSetInput
} from './schemas.js';

import {
  validateInput,
  sanitizeExerciseName,
  normalizeExerciseName,
  isValidationSuccess
} from './validator.js';

import {
  mapApiFiltersToDb,
  normalizeToUtc,
  validateAndNormalizeDateTime
} from './dto-mappers.js';

// Example 1: Validating workout start input
export function exampleStartWorkout() {
  console.log('=== Example: Start Workout Validation ===');
  
  // Valid input
  const validInput = { name: 'Morning Push Day' };
  const result1 = validateInput(StartWorkoutSchema, validInput);
  
  if (isValidationSuccess(result1)) {
    console.log('✅ Valid workout start:', result1.data);
  }
  
  // Valid input without name (optional)
  const result2 = validateInput(StartWorkoutSchema, {});
  if (isValidationSuccess(result2)) {
    console.log('✅ Valid workout start (no name):', result2.data);
  }
  
  // Invalid input
  const invalidInput = { name: 123 };
  const result3 = validateInput(StartWorkoutSchema, invalidInput);
  if (!isValidationSuccess(result3)) {
    console.log('❌ Invalid workout start:', result3.error.message);
  }
}

// Example 2: Validating exercise set input
export function exampleAddExerciseSet() {
  console.log('\n=== Example: Add Exercise Set Validation ===');
  
  // Valid input
  const validSet: AddExerciseSetInput = {
    workoutId: 1,
    exerciseName: 'Bench Press',
    weightKg: 80.5,
    reps: 10,
    notes: 'Felt strong today'
  };
  
  const result1 = validateInput(AddExerciseSetSchema, validSet);
  if (isValidationSuccess(result1)) {
    console.log('✅ Valid exercise set:', result1.data);
  }
  
  // Invalid input - negative weight
  const invalidSet = {
    workoutId: 1,
    exerciseName: 'Bench Press',
    weightKg: -10,
    reps: 10
  };
  
  const result2 = validateInput(AddExerciseSetSchema, invalidSet);
  if (!isValidationSuccess(result2)) {
    console.log('❌ Invalid exercise set:', result2.error.message);
    console.log('   Field:', result2.error.details?.field);
  }
}

// Example 3: Date range validation
export function exampleDateRangeValidation() {
  console.log('\n=== Example: Date Range Validation ===');
  
  // Valid date range
  const validRange = {
    startDate: '2025-09-19T14:00:00Z',
    endDate: '2025-09-20T14:00:00Z'
  };
  
  const result1 = validateInput(DateRangeSchema, validRange);
  if (isValidationSuccess(result1)) {
    console.log('✅ Valid date range:', result1.data);
  }
  
  // Invalid date range (end before start)
  const invalidRange = {
    startDate: '2025-09-20T14:00:00Z',
    endDate: '2025-09-19T14:00:00Z'
  };
  
  const result2 = validateInput(DateRangeSchema, invalidRange);
  if (!isValidationSuccess(result2)) {
    console.log('❌ Invalid date range:', result2.error.message);
  }
}

// Example 4: Exercise name normalization
export function exampleExerciseNameNormalization() {
  console.log('\n=== Example: Exercise Name Normalization ===');
  
  const rawNames = [
    '  BENCH PRESS  ',
    'Squat',
    'Dead   Lift',
    'overhead-press'
  ];
  
  rawNames.forEach(name => {
    const sanitized = sanitizeExerciseName(name);
    const normalized = normalizeExerciseName(name);
    console.log(`Original: "${name}" -> Sanitized: "${sanitized}" -> Normalized: "${normalized}"`);
  });
}

// Example 5: DateTime handling
export function exampleDateTimeHandling() {
  console.log('\n=== Example: DateTime Handling ===');
  
  const dateTimeStrings = [
    '2025-09-19T14:00:00+05:30',
    '2025-09-19T14:00:00Z',
    '2025-09-19T14:00:00-08:00'
  ];
  
  dateTimeStrings.forEach(dateTime => {
    try {
      const normalized = normalizeToUtc(dateTime);
      const validated = validateAndNormalizeDateTime(dateTime);
      console.log(`Original: ${dateTime} -> UTC: ${normalized}`);
    } catch (error) {
      console.log(`❌ Invalid datetime: ${dateTime} - ${error}`);
    }
  });
}

// Example 6: Filter mapping
export function exampleFilterMapping() {
  console.log('\n=== Example: API to Database Filter Mapping ===');
  
  // API filters (camelCase)
  const apiFilters = {
    workoutId: 1,
    exerciseName: 'Bench Press',
    startDate: '2025-09-19T14:00:00+05:30',
    endDate: '2025-09-20T14:00:00Z',
    completed: true
  };
  
  // Convert to database filters (snake_case)
  const dbFilters = mapApiFiltersToDb(apiFilters);
  
  console.log('API Filters (camelCase):', apiFilters);
  console.log('DB Filters (snake_case):', dbFilters);
}

// Example 7: Exercise history validation
export function exampleExerciseHistoryValidation() {
  console.log('\n=== Example: Exercise History Validation ===');
  
  // Valid query
  const validQuery = {
    exerciseName: 'Bench Press',
    limit: 50
  };
  
  const result1 = validateInput(ExerciseHistorySchema, validQuery);
  if (isValidationSuccess(result1)) {
    console.log('✅ Valid exercise history query:', result1.data);
  }
  
  // Invalid query - limit too high
  const invalidQuery = {
    exerciseName: 'Bench Press',
    limit: 2000
  };
  
  const result2 = validateInput(ExerciseHistorySchema, invalidQuery);
  if (!isValidationSuccess(result2)) {
    console.log('❌ Invalid exercise history query:', result2.error.message);
  }
}

// Run all examples
export function runAllExamples() {
  console.log('🏋️ Workout MCP Validation Layer Examples\n');
  
  exampleStartWorkout();
  exampleAddExerciseSet();
  exampleDateRangeValidation();
  exampleExerciseNameNormalization();
  exampleDateTimeHandling();
  exampleFilterMapping();
  exampleExerciseHistoryValidation();
  
  console.log('\n✨ All examples completed!');
}

// Uncomment to run examples when this file is executed directly
// if (import.meta.url === `file://${process.argv[1]}`) {
//   runAllExamples();
// }