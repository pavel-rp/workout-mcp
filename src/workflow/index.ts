// Workout workflow system exports

export * from './types.js';
export * from './data.js';
export * from './engine.js';
export * from './tools.js';
export * from './resources.js';

// Re-export key functions for easy access
export {
  getWorkoutInstructions,
  getExerciseInstructions,
  getSessionFlowInstructions,
  getRestPeriodGuidance,
  getProgressionGuidance,
  getPreWorkoutPrompt,
  getDuringSetPrompt,
  getBetweenSetsPrompt,
  getPostWorkoutPrompt,
  getExerciseSelectionPrompt,
  getAvailableExercises,
  searchExercises
} from './engine.js';

export {
  WORKFLOW_TOOLS,
  handleWorkflowTool
} from './tools.js';

export {
  WORKFLOW_RESOURCES,
  handleWorkflowResource
} from './resources.js';