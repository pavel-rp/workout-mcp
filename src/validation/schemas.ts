import { ZodIssueCode, z } from 'zod';

// Base validation schemas for common types
export const PositiveNumberSchema = z.number().positive('Must be a positive number');
export const PositiveIntegerSchema = z.number().int().positive('Must be a positive integer');
export const NonEmptyStringSchema = z.string().min(1, 'Cannot be empty');

// ISO 8601 datetime validation with timezone support
export const ISO8601DateTimeSchema = z.string().datetime({ 
  offset: true,
  message: 'Must be a valid ISO 8601 datetime with timezone (e.g., 2025-09-19T14:00:00Z)'
});

// Workout validation schemas (camelCase for API)
export const StartWorkoutSchema = z.object({
  name: z.string().optional()
});

export const EndWorkoutSchema = z.object({
  workoutId: PositiveIntegerSchema,
  notes: z.string().optional()
});

// Exercise set validation schema (camelCase for API)
export const AddExerciseSetSchema = z.object({
  workoutId: PositiveIntegerSchema,
  exerciseName: NonEmptyStringSchema.max(100, 'Exercise name cannot exceed 100 characters'),
  weightKg: PositiveNumberSchema.max(1000, 'Weight cannot exceed 1000kg'),
  reps: PositiveIntegerSchema.max(1000, 'Reps cannot exceed 1000'),
  notes: z.string().optional()
});

type DateRangeLike = {
  startDate?: string;
  endDate?: string;
};

const BaseDateRangeObject = z.object({
  startDate: ISO8601DateTimeSchema.optional(),
  endDate: ISO8601DateTimeSchema.optional()
});

const withDateRangeOrderingCheck = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((data, ctx) => {
    const { startDate, endDate } = data as DateRangeLike;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: 'Start date must be before or equal to end date',
        path: ['endDate']
      });
    }
  });

// Query validation schemas
export const DateRangeSchema = withDateRangeOrderingCheck(BaseDateRangeObject);

export const ExerciseHistorySchema = z.object({
  exerciseName: NonEmptyStringSchema,
  limit: PositiveIntegerSchema.max(1000, 'Limit cannot exceed 1000').optional()
});

export const WorkoutQuerySchema = z.object({
  workoutId: PositiveIntegerSchema
});

export const GetWorkoutsSchema = DateRangeSchema;

// Calculation filter schemas
export const VolumeCalculationSchema = withDateRangeOrderingCheck(
  z.object({
    exerciseName: z.string().optional(),
    workoutId: PositiveIntegerSchema.optional()
  }).merge(BaseDateRangeObject)
);

export const AverageWeightSchema = withDateRangeOrderingCheck(
  z.object({
    exerciseName: NonEmptyStringSchema
  }).merge(BaseDateRangeObject)
);

export const CountSetsSchema = withDateRangeOrderingCheck(
  z.object({
    exerciseName: z.string().optional(),
    workoutId: PositiveIntegerSchema.optional(),
    completed: z.boolean().optional()
  }).merge(BaseDateRangeObject)
);

// Export type definitions for TypeScript
export type StartWorkoutInput = z.infer<typeof StartWorkoutSchema>;
export type EndWorkoutInput = z.infer<typeof EndWorkoutSchema>;
export type AddExerciseSetInput = z.infer<typeof AddExerciseSetSchema>;
export type DateRangeInput = z.infer<typeof DateRangeSchema>;
export type ExerciseHistoryInput = z.infer<typeof ExerciseHistorySchema>;
export type WorkoutQueryInput = z.infer<typeof WorkoutQuerySchema>;
export type GetWorkoutsInput = z.infer<typeof GetWorkoutsSchema>;
export type VolumeCalculationInput = z.infer<typeof VolumeCalculationSchema>;
export type AverageWeightInput = z.infer<typeof AverageWeightSchema>;
export type CountSetsInput = z.infer<typeof CountSetsSchema>;