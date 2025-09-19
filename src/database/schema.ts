import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Exercises table - stores exercise definitions
export const exercises = sqliteTable('exercises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  muscleGroups: text('muscle_groups', { mode: 'json' }).$type<string[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Workouts table - stores workout sessions
export const workouts = sqliteTable('workouts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  date: text('date').notNull(), // ISO 8601 datetime string (application layer ensures UTC normalization)
  durationMinutes: integer('duration_minutes'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Sets table - stores individual exercise sets within workouts
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

// Export type definitions for TypeScript
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;