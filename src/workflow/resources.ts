// MCP resources for workout workflow and prompt system

import { Resource } from '@modelcontextprotocol/sdk/types.js';
import {
  getWorkoutInstructions,
  getSessionFlowInstructions,
  getPreWorkoutPrompt,
  getBetweenSetsPrompt,
  getPostWorkoutPrompt,
  getExerciseSelectionPrompt,
  getAvailableExercises
} from './engine.js';
import { EXERCISE_INSTRUCTIONS, PROMPT_TEMPLATES } from './data.js';

// Resource definitions for MCP server
export const WORKFLOW_RESOURCES: Resource[] = [
  {
    uri: 'workout://instructions/general',
    name: 'General Workout Instructions',
    description: 'Comprehensive workout guidance including preparation, execution, and progression',
    mimeType: 'application/json'
  },
  {
    uri: 'workout://instructions/session-flow',
    name: 'Session Flow Instructions',
    description: 'Step-by-step workflow for managing workout sessions',
    mimeType: 'application/json'
  },
  {
    uri: 'workout://exercises/library',
    name: 'Exercise Library',
    description: 'Database of exercises with detailed instructions, form cues, and safety notes',
    mimeType: 'application/json'
  },
  {
    uri: 'workout://prompts/pre-workout',
    name: 'Pre-Workout Prompt',
    description: 'Motivational and instructional content for workout preparation',
    mimeType: 'text/plain'
  },
  {
    uri: 'workout://prompts/between-sets',
    name: 'Between Sets Prompt',
    description: 'Guidance for rest periods and preparation between sets',
    mimeType: 'text/plain'
  },
  {
    uri: 'workout://prompts/post-workout',
    name: 'Post-Workout Prompt',
    description: 'Cool-down instructions and session summary guidance',
    mimeType: 'text/plain'
  },
  {
    uri: 'workout://prompts/exercise-selection',
    name: 'Exercise Selection Prompts',
    description: 'Context-specific guidance for choosing appropriate exercises',
    mimeType: 'application/json'
  },
  {
    uri: 'workout://prompts/during-set',
    name: 'During Set Prompts',
    description: 'Exercise-specific coaching cues and real-time motivation',
    mimeType: 'application/json'
  }
];

// Resource handler function
export async function handleWorkflowResource(uri: string): Promise<any> {
  switch (uri) {
    case 'workout://instructions/general':
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(getWorkoutInstructions(), null, 2)
        }]
      };

    case 'workout://instructions/session-flow':
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(getSessionFlowInstructions(), null, 2)
        }]
      };

    case 'workout://exercises/library':
      const exerciseLibrary = {
        available_exercises: getAvailableExercises(),
        exercise_instructions: EXERCISE_INSTRUCTIONS,
        total_exercises: Object.keys(EXERCISE_INSTRUCTIONS).length
      };
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(exerciseLibrary, null, 2)
        }]
      };

    case 'workout://prompts/pre-workout':
      return {
        contents: [{
          uri,
          mimeType: 'text/plain',
          text: getPreWorkoutPrompt()
        }]
      };

    case 'workout://prompts/between-sets':
      return {
        contents: [{
          uri,
          mimeType: 'text/plain',
          text: getBetweenSetsPrompt()
        }]
      };

    case 'workout://prompts/post-workout':
      return {
        contents: [{
          uri,
          mimeType: 'text/plain',
          text: getPostWorkoutPrompt()
        }]
      };

    case 'workout://prompts/exercise-selection':
      const selectionPrompts = {
        strength: getExerciseSelectionPrompt('strength'),
        hypertrophy: getExerciseSelectionPrompt('hypertrophy'),
        endurance: getExerciseSelectionPrompt('endurance'),
        general: getExerciseSelectionPrompt('general')
      };
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(selectionPrompts, null, 2)
        }]
      };

    case 'workout://prompts/during-set':
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(PROMPT_TEMPLATES.during_set, null, 2)
        }]
      };

    default:
      throw new Error(`Unknown resource URI: ${uri}`);
  }
}