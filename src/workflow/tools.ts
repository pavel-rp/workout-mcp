// MCP tools for workout workflow and prompt system

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
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
import { WorkoutContext } from './types.js';

// Tool definitions for MCP server
export const WORKFLOW_TOOLS: Tool[] = [
  {
    name: 'get_workout_instructions',
    description: 'Get comprehensive workout instructions including preparation, execution, and progression guidance',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_exercise_instructions',
    description: 'Get exercise-specific instructions including setup, execution, form cues, and safety notes',
    inputSchema: {
      type: 'object',
      properties: {
        exercise_name: {
          type: 'string',
          description: 'Name of the exercise (e.g., "bench press", "squat", "deadlift")'
        }
      },
      required: ['exercise_name']
    }
  },
  {
    name: 'get_session_flow_instructions',
    description: 'Get step-by-step workflow instructions for managing workout sessions',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_rest_period_guidance',
    description: 'Get recommended rest periods based on exercise type and training context',
    inputSchema: {
      type: 'object',
      properties: {
        exercise_name: {
          type: 'string',
          description: 'Name of the exercise (optional)'
        },
        context: {
          type: 'string',
          enum: ['strength', 'hypertrophy', 'endurance', 'general'],
          description: 'Training context to determine appropriate rest periods'
        }
      },
      required: []
    }
  },
  {
    name: 'get_progression_guidance',
    description: 'Get guidance for weight and rep progression strategies',
    inputSchema: {
      type: 'object',
      properties: {
        exercise_name: {
          type: 'string',
          description: 'Name of the exercise (optional, for exercise-specific guidance)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_pre_workout_prompt',
    description: 'Get motivational and instructional prompt for pre-workout preparation',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_during_set_prompt',
    description: 'Get real-time coaching cues and motivation for during exercise execution',
    inputSchema: {
      type: 'object',
      properties: {
        exercise_name: {
          type: 'string',
          description: 'Name of the exercise being performed'
        }
      },
      required: ['exercise_name']
    }
  },
  {
    name: 'get_between_sets_prompt',
    description: 'Get guidance and motivation for rest periods between sets',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_post_workout_prompt',
    description: 'Get cool-down instructions and session summary guidance',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_exercise_selection_prompt',
    description: 'Get guidance for choosing appropriate exercises based on training context',
    inputSchema: {
      type: 'object',
      properties: {
        workout_context: {
          type: 'string',
          enum: ['strength', 'hypertrophy', 'endurance', 'general'],
          description: 'Training context to guide exercise selection'
        }
      },
      required: []
    }
  },
  {
    name: 'search_exercises',
    description: 'Search for available exercises with specific instructions',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for exercise names'
        }
      },
      required: ['query']
    }
  }
];

// Tool handler function
export async function handleWorkflowTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'get_workout_instructions':
      return {
        ok: true,
        data: getWorkoutInstructions()
      };

    case 'get_exercise_instructions':
      const exerciseInstructions = getExerciseInstructions(args.exercise_name);
      if (!exerciseInstructions) {
        return {
          ok: false,
          error: {
            type: 'not_found',
            message: `No specific instructions found for exercise: ${args.exercise_name}. Generic instructions provided.`
          }
        };
      }
      return {
        ok: true,
        data: {
          exercise_name: args.exercise_name,
          instructions: exerciseInstructions
        }
      };

    case 'get_session_flow_instructions':
      return {
        ok: true,
        data: getSessionFlowInstructions()
      };

    case 'get_rest_period_guidance':
      const restGuidance = getRestPeriodGuidance(
        args.exercise_name, 
        args.context as WorkoutContext
      );
      return {
        ok: true,
        data: {
          exercise_name: args.exercise_name || 'general',
          context: args.context || 'general',
          guidance: restGuidance
        }
      };

    case 'get_progression_guidance':
      return {
        ok: true,
        data: {
          exercise_name: args.exercise_name || 'general',
          guidance: getProgressionGuidance(args.exercise_name)
        }
      };

    case 'get_pre_workout_prompt':
      return {
        ok: true,
        data: {
          prompt: getPreWorkoutPrompt()
        }
      };

    case 'get_during_set_prompt':
      return {
        ok: true,
        data: {
          exercise_name: args.exercise_name,
          prompt: getDuringSetPrompt(args.exercise_name)
        }
      };

    case 'get_between_sets_prompt':
      return {
        ok: true,
        data: {
          prompt: getBetweenSetsPrompt()
        }
      };

    case 'get_post_workout_prompt':
      return {
        ok: true,
        data: {
          prompt: getPostWorkoutPrompt()
        }
      };

    case 'get_exercise_selection_prompt':
      return {
        ok: true,
        data: {
          context: args.workout_context || 'general',
          prompt: getExerciseSelectionPrompt(args.workout_context as WorkoutContext)
        }
      };

    case 'search_exercises':
      const results = searchExercises(args.query);
      return {
        ok: true,
        data: {
          query: args.query,
          results: results,
          total_found: results.length,
          available_exercises: getAvailableExercises()
        }
      };

    default:
      return {
        ok: false,
        error: {
          type: 'not_found',
          message: `Unknown workflow tool: ${name}`
        }
      };
  }
}