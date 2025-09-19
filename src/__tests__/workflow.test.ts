// Unit tests for workout workflow engine and prompt system

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
  searchExercises,
  handleWorkflowTool,
  handleWorkflowResource,
  getExerciseType,
  normalizeExerciseName
} from '../workflow/index.js';

describe('Workout Instructions', () => {
  test('getWorkoutInstructions returns complete instruction structure', () => {
    const instructions = getWorkoutInstructions();
    
    expect(instructions).toHaveProperty('preparation');
    expect(instructions).toHaveProperty('execution');
    expect(instructions).toHaveProperty('progression');
    
    expect(instructions.preparation).toHaveProperty('warmup');
    expect(instructions.preparation).toHaveProperty('equipment_check');
    expect(instructions.preparation).toHaveProperty('mindset');
    
    expect(Array.isArray(instructions.preparation.warmup)).toBe(true);
    expect(instructions.preparation.warmup.length).toBeGreaterThan(0);
  });

  test('getSessionFlowInstructions returns session flow structure', () => {
    const flow = getSessionFlowInstructions();
    
    expect(flow).toHaveProperty('pre_workout');
    expect(flow).toHaveProperty('during_workout');
    expect(flow).toHaveProperty('between_exercises');
    expect(flow).toHaveProperty('post_workout');
    
    expect(Array.isArray(flow.pre_workout)).toBe(true);
    expect(flow.pre_workout.length).toBeGreaterThan(0);
  });
});

describe('Exercise Instructions', () => {
  test('getExerciseInstructions returns instructions for known exercises', () => {
    const benchInstructions = getExerciseInstructions('bench press');
    
    expect(benchInstructions).not.toBeNull();
    expect(benchInstructions).toHaveProperty('setup');
    expect(benchInstructions).toHaveProperty('execution');
    expect(benchInstructions).toHaveProperty('common_mistakes');
    expect(benchInstructions).toHaveProperty('form_cues');
    expect(benchInstructions).toHaveProperty('safety_notes');
    
    expect(Array.isArray(benchInstructions!.setup)).toBe(true);
    expect(benchInstructions!.setup.length).toBeGreaterThan(0);
  });

  test('getExerciseInstructions handles case insensitive matching', () => {
    const instructions1 = getExerciseInstructions('BENCH PRESS');
    const instructions2 = getExerciseInstructions('bench press');
    const instructions3 = getExerciseInstructions('Bench Press');
    
    expect(instructions1).toEqual(instructions2);
    expect(instructions2).toEqual(instructions3);
  });

  test('getExerciseInstructions returns generic instructions for unknown exercises', () => {
    const unknownInstructions = getExerciseInstructions('unknown exercise');
    
    expect(unknownInstructions).not.toBeNull();
    expect(unknownInstructions).toHaveProperty('setup');
    expect(unknownInstructions).toHaveProperty('execution');
    expect(unknownInstructions).toHaveProperty('common_mistakes');
    expect(unknownInstructions).toHaveProperty('form_cues');
    expect(unknownInstructions).toHaveProperty('safety_notes');
  });

  test('getExerciseInstructions handles fuzzy matching', () => {
    const instructions = getExerciseInstructions('bench');
    expect(instructions).not.toBeNull();
    
    const instructions2 = getExerciseInstructions('press');
    expect(instructions2).not.toBeNull();
  });

  test('getAvailableExercises returns array of exercise names', () => {
    const exercises = getAvailableExercises();
    
    expect(Array.isArray(exercises)).toBe(true);
    expect(exercises.length).toBeGreaterThan(0);
    expect(exercises).toContain('bench press');
    expect(exercises).toContain('squat');
    expect(exercises).toContain('deadlift');
  });

  test('searchExercises finds matching exercises', () => {
    const results = searchExercises('press');
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(exercise => exercise.includes('press'))).toBe(true);
  });

  test('searchExercises handles case insensitive search', () => {
    const results1 = searchExercises('PRESS');
    const results2 = searchExercises('press');
    
    expect(results1).toEqual(results2);
  });
});

describe('Rest Period Guidance', () => {
  test('getRestPeriodGuidance returns guidance for compound exercises', () => {
    const guidance = getRestPeriodGuidance('bench press', 'strength');
    
    expect(typeof guidance).toBe('string');
    expect(guidance.length).toBeGreaterThan(0);
    expect(guidance.toLowerCase()).toContain('compound');
    expect(guidance.toLowerCase()).toContain('strength');
  });

  test('getRestPeriodGuidance returns guidance for isolation exercises', () => {
    const guidance = getRestPeriodGuidance('bicep curl', 'hypertrophy');
    
    expect(typeof guidance).toBe('string');
    expect(guidance.length).toBeGreaterThan(0);
    expect(guidance.toLowerCase()).toContain('isolation');
  });

  test('getRestPeriodGuidance returns general guidance when no exercise specified', () => {
    const guidance = getRestPeriodGuidance();
    
    expect(typeof guidance).toBe('string');
    expect(guidance.length).toBeGreaterThan(0);
  });

  test('getRestPeriodGuidance handles different training contexts', () => {
    const strengthGuidance = getRestPeriodGuidance('squat', 'strength');
    const hypertrophyGuidance = getRestPeriodGuidance('squat', 'hypertrophy');
    const enduranceGuidance = getRestPeriodGuidance('squat', 'endurance');
    
    expect(strengthGuidance).not.toEqual(hypertrophyGuidance);
    expect(hypertrophyGuidance).not.toEqual(enduranceGuidance);
  });
});

describe('Progression Guidance', () => {
  test('getProgressionGuidance returns progression structure', () => {
    const guidance = getProgressionGuidance();
    
    expect(guidance).toHaveProperty('weight_progression');
    expect(guidance).toHaveProperty('rep_progression');
    expect(guidance).toHaveProperty('deload_indicators');
    expect(guidance).toHaveProperty('plateau_strategies');
    
    expect(Array.isArray(guidance.weight_progression)).toBe(true);
    expect(guidance.weight_progression.length).toBeGreaterThan(0);
  });

  test('getProgressionGuidance returns general guidance', () => {
    const guidance = getProgressionGuidance();
    
    expect(guidance).toHaveProperty('weight_progression');
    expect(guidance).toHaveProperty('rep_progression');
  });
});

describe('Prompt System', () => {
  test('getPreWorkoutPrompt returns formatted prompt', () => {
    const prompt = getPreWorkoutPrompt();
    
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt).toContain('workout');
  });

  test('getDuringSetPrompt returns exercise-specific prompts', () => {
    const benchPrompt = getDuringSetPrompt('bench press');
    const squatPrompt = getDuringSetPrompt('squat');
    
    expect(typeof benchPrompt).toBe('string');
    expect(typeof squatPrompt).toBe('string');
    expect(benchPrompt).not.toEqual(squatPrompt);
  });

  test('getDuringSetPrompt returns default prompt for unknown exercises', () => {
    const unknownPrompt = getDuringSetPrompt('unknown exercise');
    
    expect(typeof unknownPrompt).toBe('string');
    expect(unknownPrompt.length).toBeGreaterThan(0);
  });

  test('getBetweenSetsPrompt returns formatted prompt', () => {
    const prompt = getBetweenSetsPrompt();
    
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt.toLowerCase()).toContain('sets');
  });

  test('getPostWorkoutPrompt returns formatted prompt', () => {
    const prompt = getPostWorkoutPrompt();
    
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt.toLowerCase()).toContain('workout');
  });

  test('getExerciseSelectionPrompt returns context-specific prompts', () => {
    const strengthPrompt = getExerciseSelectionPrompt('strength');
    const hypertrophyPrompt = getExerciseSelectionPrompt('hypertrophy');
    const endurancePrompt = getExerciseSelectionPrompt('endurance');
    const generalPrompt = getExerciseSelectionPrompt('general');
    
    expect(typeof strengthPrompt).toBe('string');
    expect(typeof hypertrophyPrompt).toBe('string');
    expect(typeof endurancePrompt).toBe('string');
    expect(typeof generalPrompt).toBe('string');
    
    expect(strengthPrompt).not.toEqual(hypertrophyPrompt);
    expect(hypertrophyPrompt).not.toEqual(endurancePrompt);
  });
});

describe('Helper Functions', () => {
  test('getExerciseType correctly identifies compound exercises', () => {
    expect(getExerciseType('bench press')).toBe('compound');
    expect(getExerciseType('squat')).toBe('compound');
    expect(getExerciseType('deadlift')).toBe('compound');
    expect(getExerciseType('overhead press')).toBe('compound');
  });

  test('getExerciseType correctly identifies isolation exercises', () => {
    expect(getExerciseType('bicep curl')).toBe('isolation');
    expect(getExerciseType('tricep extension')).toBe('isolation');
    expect(getExerciseType('lateral raise')).toBe('isolation');
  });

  test('normalizeExerciseName handles various inputs', () => {
    expect(normalizeExerciseName('Bench Press')).toBe('bench press');
    expect(normalizeExerciseName('SQUAT')).toBe('squat');
    expect(normalizeExerciseName('Dead-Lift!')).toBe('deadlift');
    expect(normalizeExerciseName('  Overhead Press  ')).toBe('overhead press');
  });
});

describe('MCP Tool Handlers', () => {
  test('handleWorkflowTool handles get_workout_instructions', async () => {
    const result = await handleWorkflowTool('get_workout_instructions', {});
    
    expect(result.ok).toBe(true);
    expect(result.data).toHaveProperty('preparation');
    expect(result.data).toHaveProperty('execution');
    expect(result.data).toHaveProperty('progression');
  });

  test('handleWorkflowTool handles get_exercise_instructions', async () => {
    const result = await handleWorkflowTool('get_exercise_instructions', { exercise_name: 'bench press' });
    
    expect(result.ok).toBe(true);
    expect(result.data).toHaveProperty('exercise_name');
    expect(result.data).toHaveProperty('instructions');
    expect(result.data.instructions).toHaveProperty('setup');
  });

  test('handleWorkflowTool handles get_session_flow_instructions', async () => {
    const result = await handleWorkflowTool('get_session_flow_instructions', {});
    
    expect(result.ok).toBe(true);
    expect(result.data).toHaveProperty('pre_workout');
    expect(result.data).toHaveProperty('during_workout');
  });

  test('handleWorkflowTool handles get_rest_period_guidance', async () => {
    const result = await handleWorkflowTool('get_rest_period_guidance', { 
      exercise_name: 'bench press', 
      context: 'strength' 
    });
    
    expect(result.ok).toBe(true);
    expect(result.data).toHaveProperty('exercise_name');
    expect(result.data).toHaveProperty('context');
    expect(result.data).toHaveProperty('guidance');
  });

  test('handleWorkflowTool handles get_progression_guidance', async () => {
    const result = await handleWorkflowTool('get_progression_guidance', { exercise_name: 'squat' });
    
    expect(result.ok).toBe(true);
    expect(result.data).toHaveProperty('exercise_name');
    expect(result.data).toHaveProperty('guidance');
    expect(result.data.guidance).toHaveProperty('weight_progression');
  });

  test('handleWorkflowTool handles prompt tools', async () => {
    const preResult = await handleWorkflowTool('get_pre_workout_prompt', {});
    const duringResult = await handleWorkflowTool('get_during_set_prompt', { exercise_name: 'squat' });
    const betweenResult = await handleWorkflowTool('get_between_sets_prompt', {});
    const postResult = await handleWorkflowTool('get_post_workout_prompt', {});
    
    expect(preResult.ok).toBe(true);
    expect(duringResult.ok).toBe(true);
    expect(betweenResult.ok).toBe(true);
    expect(postResult.ok).toBe(true);
    
    expect(preResult.data).toHaveProperty('prompt');
    expect(duringResult.data).toHaveProperty('prompt');
    expect(betweenResult.data).toHaveProperty('prompt');
    expect(postResult.data).toHaveProperty('prompt');
  });

  test('handleWorkflowTool handles get_exercise_selection_prompt', async () => {
    const result = await handleWorkflowTool('get_exercise_selection_prompt', { workout_context: 'strength' });
    
    expect(result.ok).toBe(true);
    expect(result.data).toHaveProperty('context');
    expect(result.data).toHaveProperty('prompt');
  });

  test('handleWorkflowTool handles search_exercises', async () => {
    const result = await handleWorkflowTool('search_exercises', { query: 'press' });
    
    expect(result.ok).toBe(true);
    expect(result.data).toHaveProperty('query');
    expect(result.data).toHaveProperty('results');
    expect(result.data).toHaveProperty('total_found');
    expect(result.data).toHaveProperty('available_exercises');
    expect(Array.isArray(result.data.results)).toBe(true);
  });

  test('handleWorkflowTool returns error for unknown tool', async () => {
    const result = await handleWorkflowTool('unknown_tool', {});
    
    expect(result.ok).toBe(false);
    expect(result.error).toHaveProperty('type');
    expect(result.error).toHaveProperty('message');
    expect(result.error.type).toBe('not_found');
  });
});

describe('MCP Resource Handlers', () => {
  test('handleWorkflowResource handles workout instructions', async () => {
    const result = await handleWorkflowResource('workout://instructions/general');
    
    expect(result).toHaveProperty('contents');
    expect(Array.isArray(result.contents)).toBe(true);
    expect(result.contents[0]).toHaveProperty('uri');
    expect(result.contents[0]).toHaveProperty('mimeType');
    expect(result.contents[0]).toHaveProperty('text');
    expect(result.contents[0].mimeType).toBe('application/json');
  });

  test('handleWorkflowResource handles session flow', async () => {
    const result = await handleWorkflowResource('workout://instructions/session-flow');
    
    expect(result).toHaveProperty('contents');
    expect(result.contents[0].mimeType).toBe('application/json');
    
    const data = JSON.parse(result.contents[0].text);
    expect(data).toHaveProperty('pre_workout');
    expect(data).toHaveProperty('during_workout');
  });

  test('handleWorkflowResource handles exercise library', async () => {
    const result = await handleWorkflowResource('workout://exercises/library');
    
    expect(result).toHaveProperty('contents');
    expect(result.contents[0].mimeType).toBe('application/json');
    
    const data = JSON.parse(result.contents[0].text);
    expect(data).toHaveProperty('available_exercises');
    expect(data).toHaveProperty('exercise_instructions');
    expect(data).toHaveProperty('total_exercises');
  });

  test('handleWorkflowResource handles prompt resources', async () => {
    const preResult = await handleWorkflowResource('workout://prompts/pre-workout');
    const betweenResult = await handleWorkflowResource('workout://prompts/between-sets');
    const postResult = await handleWorkflowResource('workout://prompts/post-workout');
    
    expect(preResult.contents[0].mimeType).toBe('text/plain');
    expect(betweenResult.contents[0].mimeType).toBe('text/plain');
    expect(postResult.contents[0].mimeType).toBe('text/plain');
    
    expect(typeof preResult.contents[0].text).toBe('string');
    expect(typeof betweenResult.contents[0].text).toBe('string');
    expect(typeof postResult.contents[0].text).toBe('string');
  });

  test('handleWorkflowResource handles exercise selection prompts', async () => {
    const result = await handleWorkflowResource('workout://prompts/exercise-selection');
    
    expect(result).toHaveProperty('contents');
    expect(result.contents[0].mimeType).toBe('application/json');
    
    const data = JSON.parse(result.contents[0].text);
    expect(data).toHaveProperty('strength');
    expect(data).toHaveProperty('hypertrophy');
    expect(data).toHaveProperty('endurance');
    expect(data).toHaveProperty('general');
  });

  test('handleWorkflowResource handles during set prompts', async () => {
    const result = await handleWorkflowResource('workout://prompts/during-set');
    
    expect(result).toHaveProperty('contents');
    expect(result.contents[0].mimeType).toBe('application/json');
    
    const data = JSON.parse(result.contents[0].text);
    expect(data).toHaveProperty('bench press');
    expect(data).toHaveProperty('squat');
    expect(data).toHaveProperty('default');
  });

  test('handleWorkflowResource throws error for unknown URI', async () => {
    await expect(handleWorkflowResource('workout://unknown/resource')).rejects.toThrow('Unknown resource URI');
  });
});