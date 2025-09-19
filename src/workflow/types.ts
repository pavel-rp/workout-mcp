// Workflow and prompt type definitions

export interface WorkoutInstructions {
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

export interface ExerciseInstructions {
  setup: string[];
  execution: string[];
  common_mistakes: string[];
  form_cues: string[];
  safety_notes: string[];
}

export interface SessionFlow {
  pre_workout: string[];
  during_workout: string[];
  between_exercises: string[];
  post_workout: string[];
}

export interface RestPeriodGuidance {
  compound_movements: {
    strength: string;
    hypertrophy: string;
    endurance: string;
  };
  isolation_movements: {
    strength: string;
    hypertrophy: string;
    endurance: string;
  };
  general: string[];
}

export interface ProgressionGuidance {
  weight_progression: string[];
  rep_progression: string[];
  deload_indicators: string[];
  plateau_strategies: string[];
}

export interface PromptTemplates {
  pre_workout: string;
  during_set: Record<string, string>; // exercise_name -> prompt
  between_sets: string;
  post_workout: string;
  exercise_selection: Record<string, string>; // context -> prompt
}

export type ExerciseType = 'compound' | 'isolation';
export type WorkoutContext = 'strength' | 'hypertrophy' | 'endurance' | 'general';