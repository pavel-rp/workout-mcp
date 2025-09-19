// Workout workflow engine with retrieval functions

import {
  WORKOUT_INSTRUCTIONS,
  SESSION_FLOW,
  REST_PERIOD_GUIDANCE,
  PROGRESSION_GUIDANCE,
  EXERCISE_INSTRUCTIONS,
  PROMPT_TEMPLATES,
  getExerciseType,
  normalizeExerciseName
} from './data.js';

/**
 * Helper function for fuzzy matching exercise names
 */
function fuzzyFindKey(normalizedName: string, keys: string[]): string | undefined {
  return keys.find(key => 
    normalizedName.includes(key) || key.includes(normalizedName)
  );
}

import {
  WorkoutInstructions,
  ExerciseInstructions,
  SessionFlow,
  RestPeriodGuidance,
  ProgressionGuidance,
  WorkoutContext
} from './types.js';

/**
 * Get comprehensive workout instructions
 */
export function getWorkoutInstructions(): WorkoutInstructions {
  return WORKOUT_INSTRUCTIONS;
}

/**
 * Get exercise-specific instructions with form cues and safety notes
 */
export function getExerciseInstructions(exerciseName: string): ExerciseInstructions {
  const normalizedName = normalizeExerciseName(exerciseName);
  
  // Direct lookup first
  if (EXERCISE_INSTRUCTIONS[normalizedName]) {
    return EXERCISE_INSTRUCTIONS[normalizedName];
  }
  
  // Fuzzy matching for common variations
  const exerciseKeys = Object.keys(EXERCISE_INSTRUCTIONS);
  const matchedKey = fuzzyFindKey(normalizedName, exerciseKeys);
  
  if (matchedKey) {
    return EXERCISE_INSTRUCTIONS[matchedKey];
  }
  
  // Return generic instructions if no specific match found
  return {
    setup: [
      "Position yourself with proper alignment for the exercise",
      "Ensure equipment is set up correctly and safely",
      "Engage core and maintain neutral spine",
      "Check range of motion before adding weight"
    ],
    execution: [
      "Use controlled movement throughout the full range of motion",
      "Focus on the target muscle group",
      "Maintain proper breathing pattern",
      "Keep core engaged for stability"
    ],
    common_mistakes: [
      "Using momentum instead of controlled movement",
      "Partial range of motion",
      "Poor posture or alignment",
      "Holding breath during exertion"
    ],
    form_cues: [
      "Control the weight, don't let it control you",
      "Focus on quality over quantity",
      "Maintain tension in target muscles",
      "Keep movements smooth and deliberate"
    ],
    safety_notes: [
      "Start with lighter weight to master the movement pattern",
      "Stop immediately if you feel pain",
      "Ensure proper warm-up before heavy sets",
      "Use a spotter when appropriate"
    ]
  };
}

/**
 * Get session flow instructions for workout management
 */
export function getSessionFlowInstructions(): SessionFlow {
  return SESSION_FLOW;
}

/**
 * Get rest period guidance based on exercise type and training goal
 */
export function getRestPeriodGuidance(exerciseName?: string, context: WorkoutContext = 'general'): string {
  if (!exerciseName) {
    return REST_PERIOD_GUIDANCE.general.join('\n\n');
  }
  
  const exerciseType = getExerciseType(exerciseName);
  const guidance = REST_PERIOD_GUIDANCE[exerciseType === 'compound' ? 'compound_movements' : 'isolation_movements'];
  
  let specificGuidance = '';
  switch (context) {
    case 'strength':
      specificGuidance = guidance.strength;
      break;
    case 'hypertrophy':
      specificGuidance = guidance.hypertrophy;
      break;
    case 'endurance':
      specificGuidance = guidance.endurance;
      break;
    case 'general':
      specificGuidance = REST_PERIOD_GUIDANCE.general.join('\n\n');
      break;
    default:
      specificGuidance = guidance.hypertrophy; // Default to hypertrophy
  }
  
  const generalTips = REST_PERIOD_GUIDANCE.general.slice(0, 3).join('\n\n');
  return `**${exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)} Exercise - ${context.charAt(0).toUpperCase() + context.slice(1)} Training:**\n${specificGuidance}\n\n**General Guidelines:**\n${generalTips}`;
}

/**
 * Get progression guidance for an exercise
 */
export function getProgressionGuidance(): ProgressionGuidance {
  // For now, return general progression guidance
  // In the future, this could be customized per exercise
  return PROGRESSION_GUIDANCE;
}

/**
 * Get pre-workout prompt
 */
export function getPreWorkoutPrompt(): string {
  return PROMPT_TEMPLATES.pre_workout;
}

/**
 * Get during-set prompt for specific exercise
 */
export function getDuringSetPrompt(exerciseName: string): string {
  const normalizedName = normalizeExerciseName(exerciseName);
  
  // Check for exact match first
  if (PROMPT_TEMPLATES.during_set[normalizedName]) {
    return PROMPT_TEMPLATES.during_set[normalizedName];
  }
  
  // Check for partial matches
  const promptKeys = Object.keys(PROMPT_TEMPLATES.during_set).filter(key => key !== 'default');
  const matchedKey = fuzzyFindKey(normalizedName, promptKeys);
  
  if (matchedKey) {
    return PROMPT_TEMPLATES.during_set[matchedKey];
  }
  
  // Return default prompt
  return PROMPT_TEMPLATES.during_set.default;
}

/**
 * Get between-sets prompt
 */
export function getBetweenSetsPrompt(): string {
  return PROMPT_TEMPLATES.between_sets;
}

/**
 * Get post-workout prompt
 */
export function getPostWorkoutPrompt(): string {
  return PROMPT_TEMPLATES.post_workout;
}

/**
 * Get exercise selection prompt based on workout context
 */
export function getExerciseSelectionPrompt(context: WorkoutContext = 'general'): string {
  return PROMPT_TEMPLATES.exercise_selection[context] || PROMPT_TEMPLATES.exercise_selection.general;
}

/**
 * Get all available exercise names that have specific instructions
 */
export function getAvailableExercises(): string[] {
  return Object.keys(EXERCISE_INSTRUCTIONS);
}

/**
 * Search for exercises by name (fuzzy matching)
 */
export function searchExercises(query: string): string[] {
  const normalizedQuery = normalizeExerciseName(query);
  const exercises = getAvailableExercises();
  
  return exercises.filter(exercise => {
    const normalizedExercise = normalizeExerciseName(exercise);
    return normalizedExercise.includes(normalizedQuery) || normalizedQuery.includes(normalizedExercise);
  });
}