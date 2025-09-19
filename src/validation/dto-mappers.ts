import type { Exercise, Workout, Set, NewExercise, NewWorkout, NewSet } from '../database/schema.js';

// API types (camelCase)
export interface ExerciseDto {
  id: number;
  name: string;
  muscleGroups: string[] | null;
  createdAt: Date;
}

export interface WorkoutDto {
  id: number;
  name: string;
  date: string;
  durationMinutes?: number | null;
  notes?: string | null;
  createdAt: Date;
}

export interface SetDto {
  id: number;
  workoutId: number;
  exerciseId: number;
  weightKg: number;
  reps: number;
  restSeconds?: number | null;
  completed: boolean;
  orderInWorkout: number;
  notes?: string | null;
}

export interface WorkoutWithSetsDto extends WorkoutDto {
  sets: (SetDto & { exerciseName: string })[];
}

export interface ExerciseHistoryDto {
  exerciseName: string;
  sets: (SetDto & { workoutDate: string; workoutName: string })[];
}

// New entity types for creation (camelCase)
export interface NewExerciseDto {
  name: string;
  muscleGroups?: string[] | null;
}

export interface NewWorkoutDto {
  name: string;
  date: string;
  durationMinutes?: number | null;
  notes?: string | null;
}

export interface NewSetDto {
  workoutId: number;
  exerciseId: number;
  weightKg: number;
  reps: number;
  restSeconds?: number | null;
  completed?: boolean;
  orderInWorkout: number;
  notes?: string | null;
}

// Mappers: Database (snake_case) -> API (camelCase)
export function mapExerciseToDto(exercise: Exercise): ExerciseDto {
  return {
    id: exercise.id,
    name: exercise.name,
    muscleGroups: exercise.muscleGroups,
    createdAt: exercise.createdAt
  };
}

export function mapWorkoutToDto(workout: Workout): WorkoutDto {
  return {
    id: workout.id,
    name: workout.name,
    date: workout.date,
    durationMinutes: workout.durationMinutes,
    notes: workout.notes,
    createdAt: workout.createdAt
  };
}

export function mapSetToDto(set: Set): SetDto {
  return {
    id: set.id,
    workoutId: set.workoutId,
    exerciseId: set.exerciseId,
    weightKg: set.weightKg,
    reps: set.reps,
    restSeconds: set.restSeconds,
    completed: set.completed,
    orderInWorkout: set.orderInWorkout,
    notes: set.notes
  };
}

// Mappers: API (camelCase) -> Database (snake_case)
export function mapNewExerciseDtoToDb(dto: NewExerciseDto): NewExercise {
  return {
    name: dto.name,
    muscleGroups: dto.muscleGroups
  };
}

export function mapNewWorkoutDtoToDb(dto: NewWorkoutDto): NewWorkout {
  return {
    name: dto.name,
    date: dto.date,
    durationMinutes: dto.durationMinutes,
    notes: dto.notes
  };
}

export function mapNewSetDtoToDb(dto: NewSetDto): NewSet {
  return {
    workoutId: dto.workoutId,
    exerciseId: dto.exerciseId,
    weightKg: dto.weightKg,
    reps: dto.reps,
    restSeconds: dto.restSeconds,
    completed: dto.completed ?? true,
    orderInWorkout: dto.orderInWorkout,
    notes: dto.notes
  };
}

// Utility functions for datetime handling
export function normalizeToUtc(dateTimeString: string): string {
  // Convert any ISO 8601 datetime to UTC
  const date = new Date(dateTimeString);
  return date.toISOString();
}

export function validateAndNormalizeDateTime(dateTimeString: string): string {
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date.toISOString();
  } catch (error) {
    throw new Error(`Invalid datetime format: ${dateTimeString}. Expected ISO 8601 format with timezone.`);
  }
}

// Filter mapping utilities
export interface DatabaseFilters {
  workout_id?: number;
  exercise_name?: string;
  start_date?: string;
  end_date?: string;
  completed?: boolean;
}

export function mapApiFiltersToDb(filters: {
  workoutId?: number;
  exerciseName?: string;
  startDate?: string;
  endDate?: string;
  completed?: boolean;
}): DatabaseFilters {
  const dbFilters: DatabaseFilters = {};
  
  if (filters.workoutId !== undefined) {
    dbFilters.workout_id = filters.workoutId;
  }
  
  if (filters.exerciseName !== undefined) {
    dbFilters.exercise_name = filters.exerciseName;
  }
  
  if (filters.startDate !== undefined) {
    dbFilters.start_date = normalizeToUtc(filters.startDate);
  }
  
  if (filters.endDate !== undefined) {
    dbFilters.end_date = normalizeToUtc(filters.endDate);
  }
  
  if (filters.completed !== undefined) {
    dbFilters.completed = filters.completed;
  }
  
  return dbFilters;
}