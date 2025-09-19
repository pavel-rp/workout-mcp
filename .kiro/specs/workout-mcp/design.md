# Design Document

## Overview

This document outlines the technical design for a TypeScript-based MCP server that provides workout data storage, retrieval, and workflow guidance. The system prioritizes workout workflow instructions and contextual prompts while maintaining a simple, reliable data layer for single-user fitness tracking.

### Non-Functional Requirements

- **ID Format**: All database primary keys (exercises, workouts, sets) are numeric integers, not UUIDs
- **Timezone Handling**: All datetime inputs are converted to UTC at the API boundary and stored as ISO 8601 strings with timezone (e.g., 2025-09-19T14:00:00Z)
- **Ordering Guarantees**: 
  - `get_workouts()` returns results ordered by date descending (newest first)
  - `get_exercise_history()` returns results ordered by workout.date descending, then order_in_workout ascending

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LLM Agent     │◄──►│   MCP Server    │◄──►│  SQLite DB      │
│   (Consumer)    │    │   (Workout)     │    │  (Local)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Workflow &     │
                       │  Prompt Data    │
                       │  (Static)       │
                       └─────────────────┘
```

### Core Components

1. **MCP Server Layer**: Handles tool calls and resource requests
2. **Workflow Engine**: Provides structured workout guidance and prompts
3. **Data Access Layer**: Drizzle ORM with SQLite database
4. **Validation Layer**: Zod schemas for input validation
5. **Calculation Engine**: Pure functions for workout metrics

## Components and Interfaces

### 1. MCP Server Interface

**Data Format Note**: External MCP inputs/outputs use camelCase, while SQL columns use snake_case. The server performs consistent DTO mapping between these formats.

#### Tool Categories

**Workflow & Guidance Tools** (Priority 1)
- `get_workout_instructions()`: Returns structured workout guidance
- `get_exercise_instructions(exercise_name)`: Exercise-specific form cues
- `get_session_flow_instructions()`: Step-by-step session management
- `get_rest_period_guidance(exercise_type)`: Rest period recommendations
- `get_progression_guidance(exercise_name)`: Weight/rep progression rules

**Contextual Prompt Tools** (Priority 1)
- `get_pre_workout_prompt()`: Pre-workout preparation instructions
- `get_during_set_prompt(exercise_name)`: Real-time coaching cues
- `get_between_sets_prompt()`: Inter-set guidance
- `get_post_workout_prompt()`: Cool-down and summary instructions
- `get_exercise_selection_prompt(workout_context)`: Exercise selection guidance

**Session Management Tools**
- `start_workout(name?)`: Creates workout session, returns `{ workoutId: number }`
- `end_workout(workoutId, notes?)`: Closes workout session
- `add_exercise_set(workoutId, exerciseName, weightKg, reps, notes?)`: Logs exercise set, returns inserted set with resolved exerciseId and orderInWorkout. Exercise name matching is case-insensitive and normalized to prevent duplicates.

**Data Retrieval Tools**
- `get_workout(workoutId)`: Retrieves complete workout data
- `get_workouts(startDate?, endDate?)`: Retrieves workout history (ordered by date desc)
- `get_exercise_history(exerciseName, limit?)`: Exercise-specific history (ordered by workout date desc, then order_in_workout asc)
- `get_exercises()`: Lists all exercises

**Calculation Tools**
- `calculate_total_volume(filters?)`: Computes volume metrics
- `calculate_average_weight(exerciseName, dateRange?)`: Weight averages
- `count_sets(filters?)`: Set counting with filters

#### Resource Categories

**Workflow Resources**
- `workout-instructions`: Structured workout guidance
- `exercise-library`: Exercise database with instructions
- `session-flows`: Workout session workflows

**Prompt Resources** (Fallback if tools fail)
- `pre-workout-prompt`: Pre-workout preparation text
- `during-set-prompts`: Exercise-specific coaching cues
- `between-sets-prompt`: Inter-set guidance text
- `post-workout-prompt`: Cool-down instructions
- `exercise-selection-prompts`: Exercise selection guidance

**Data Resources**
- `workouts`: Workout session data with filtering
- `exercises`: Exercise definitions and history
- `sets`: Individual set data with filtering

### 2. Database Schema (Drizzle + SQLite)

#### Tables

```typescript
// exercises table
export const exercises = sqliteTable('exercises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  muscleGroups: text('muscle_groups', { mode: 'json' }).$type<string[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

// workouts table
export const workouts = sqliteTable('workouts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  date: text('date').notNull(), // ISO 8601 datetime with timezone, normalized to UTC at boundary
  durationMinutes: integer('duration_minutes'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

// sets table
export const sets = sqliteTable('sets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workoutId: integer('workout_id').notNull().references(() => workouts.id),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
  weightKg: real('weight_kg').notNull(),
  reps: integer('reps').notNull(),
  restSeconds: integer('rest_seconds'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(true),
  orderInWorkout: integer('order_in_workout').notNull(),
  notes: text('notes')
});
```

#### Indexes

```sql
CREATE INDEX idx_sets_workout_id ON sets(workout_id);
CREATE INDEX idx_sets_exercise_id ON sets(exercise_id);
CREATE INDEX idx_sets_workout_order ON sets(workout_id, order_in_workout);
CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_exercises_name ON exercises(name);
```

### 3. Validation Layer (Zod)

#### Input Schemas

```typescript
// Workout validation
export const StartWorkoutSchema = z.object({
  name: z.string().optional()
});

export const EndWorkoutSchema = z.object({
  workout_id: z.number().int().positive(),
  notes: z.string().optional()
});

// Exercise set validation
export const AddExerciseSetSchema = z.object({
  workout_id: z.number().int().positive(),
  exercise_name: z.string().min(1).max(100),
  weight_kg: z.number().positive().max(1000),
  reps: z.number().int().positive().max(1000),
  notes: z.string().optional()
});

// Query validation
export const DateRangeSchema = z.object({
  start_date: z.string().datetime({ offset: true }).optional(), // ISO 8601 with timezone
  end_date: z.string().datetime({ offset: true }).optional()    // ISO 8601 with timezone
});

export const ExerciseHistorySchema = z.object({
  exercise_name: z.string().min(1),
  limit: z.number().int().positive().max(1000).optional()
});
```

### 4. Workflow Engine

#### Workflow Data Structure

```typescript
interface WorkoutInstructions {
  preparation: {
    warmup: string[];
    equipment_check: string[];
    mindset: string[];
  };
  execution: {
    form_priorities: string[];
    breathing: string[];
    tempo: string[];
  };
  progression: {
    weight_increases: string[];
    rep_ranges: string[];
    deload_signals: string[];
  };
}

interface ExerciseInstructions {
  setup: string[];
  execution: string[];
  common_mistakes: string[];
  form_cues: string[];
  safety_notes: string[];
}

interface SessionFlow {
  pre_workout: string[];
  during_workout: string[];
  between_exercises: string[];
  post_workout: string[];
}
```

#### Prompt Templates

```typescript
interface PromptTemplates {
  pre_workout: string;
  during_set: Record<string, string>; // exercise_name -> prompt
  between_sets: string;
  post_workout: string;
  exercise_selection: Record<string, string>; // context -> prompt
}
```

### 5. Calculation Engine

#### Pure Calculation Functions

```typescript
// Volume calculations
export function calculateTotalVolume(sets: SetData[]): number {
  return sets.reduce((total, set) => total + (set.weight_kg * set.reps), 0);
}

// Average calculations
export function calculateAverageWeight(sets: SetData[]): number {
  if (sets.length === 0) return 0;
  const totalWeight = sets.reduce((sum, set) => sum + set.weight_kg, 0);
  return totalWeight / sets.length;
}

// Set counting
export function countSets(sets: SetData[], filters?: SetFilters): number {
  return applyFilters(sets, filters).length;
}

// Duration calculations
export function calculateWorkoutDuration(workouts: WorkoutData[]): number {
  return workouts.reduce((total, workout) => total + (workout.duration_minutes || 0), 0);
}
```

## Data Models

### Core Data Types

```typescript
// Database entities
export interface Exercise {
  id: number;
  name: string;
  muscle_groups: string[];
  created_at: Date;
}

export interface Workout {
  id: number;
  name: string;
  date: string;
  duration_minutes?: number;
  notes?: string;
  created_at: Date;
}

export interface Set {
  id: number;
  workout_id: number;
  exercise_id: number;
  weight_kg: number;
  reps: number;
  rest_seconds?: number;
  completed: boolean;
  order_in_workout: number;
  notes?: string;
}

// API response types
export interface WorkoutWithSets extends Workout {
  sets: (Set & { exercise_name: string })[];
}

export interface ExerciseHistory {
  exercise_name: string;
  sets: (Set & { workout_date: string; workout_name: string })[];
}
```

### Filter Types

```typescript
export interface SetFilters {
  workout_id?: number;
  exercise_name?: string;
  start_date?: string; // ISO 8601 with timezone
  end_date?: string;   // ISO 8601 with timezone
  completed?: boolean;
}

export interface WorkoutFilters {
  start_date?: string; // ISO 8601 with timezone
  end_date?: string;   // ISO 8601 with timezone
  name_contains?: string;
}
```

## Error Handling

### Error Categories

1. **Validation Errors**: Zod schema validation failures
2. **Database Errors**: SQLite constraint violations, connection issues
3. **Not Found Errors**: Missing workout/exercise/set records
4. **Business Logic Errors**: Invalid state transitions

### Response Format

```typescript
interface SuccessResponse<T> {
  ok: true;
  data: T;
}

interface ErrorResponse {
  ok: false;
  error: {
    type: 'validation' | 'database' | 'not_found' | 'business_logic';
    message: string;
    details?: Record<string, any>;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

#### Example Responses

```typescript
// start_workout success
{ ok: true, data: { workoutId: 123 } }

// add_exercise_set success
{ 
  ok: true, 
  data: { 
    id: 456, 
    workoutId: 123, 
    exerciseId: 789, 
    exerciseName: "Bench Press",
    weightKg: 80, 
    reps: 10, 
    orderInWorkout: 1,
    notes: null
  } 
}

// Error response
{ ok: false, error: { type: 'validation', message: 'Weight must be positive' } }
```

### Error Handling Strategy

- Input validation using Zod with detailed error messages
- Database constraint enforcement with user-friendly error translation
- Graceful degradation for non-critical failures
- Comprehensive logging for debugging

## Testing Strategy

### Unit Testing

- **Validation Layer**: Test all Zod schemas with valid/invalid inputs
- **Calculation Engine**: Test pure functions with edge cases
- **Database Layer**: Test CRUD operations and constraints
- **Workflow Engine**: Test prompt and instruction retrieval

## Security Considerations

### Data Privacy

- Local SQLite database only (no external network calls)
- No user authentication required (single-user system)
- Input sanitization to prevent SQL injection
- File system permissions for database access

### Input Validation

- Strict Zod validation for all inputs
- SQL parameterization via Drizzle ORM
- Reasonable limits on input sizes and ranges
- Malicious input detection and logging

## Performance Optimization

### Database Optimization

- Proper indexing on frequently queried columns
- WAL mode with single-writer strategy for concurrent operations
- Query optimization for complex joins

#### Runtime PRAGMAs

```sql
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA busy_timeout=5000;
```

### Caching Strategy

- In-memory caching for static workflow data
- Query result caching for expensive calculations
- Cache invalidation on data updates

### Response Time Targets

- Tool calls: < 50ms for simple operations
- Data queries: < 100ms for typical datasets
- Calculations: < 200ms for complex metrics
- Database operations: < 25ms for single record operations