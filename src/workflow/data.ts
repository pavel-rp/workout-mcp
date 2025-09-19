// Static workout instruction and prompt data

import { 
  WorkoutInstructions, 
  ExerciseInstructions, 
  SessionFlow, 
  RestPeriodGuidance, 
  ProgressionGuidance, 
  PromptTemplates,
  ExerciseType,
  WorkoutContext
} from './types.js';

export const WORKOUT_INSTRUCTIONS: WorkoutInstructions = {
  preparation: {
    warmup: [
      "Start with 5-10 minutes of light cardio to increase heart rate and blood flow",
      "Perform dynamic stretches targeting the muscle groups you'll be working",
      "Do activation exercises for key stabilizing muscles",
      "Practice movement patterns with bodyweight or very light weights",
      "Mentally review your workout plan and visualize successful execution"
    ],
    equipment_check: [
      "Ensure all equipment is available and in good working condition",
      "Check that weights are properly secured on barbells and machines",
      "Verify safety equipment like collars, spotting bars, and safety pins are in place",
      "Have water, towel, and any supplements readily available",
      "Set up your workout area to minimize transitions between exercises"
    ],
    mindset: [
      "Set clear intentions for the workout session",
      "Focus on quality of movement over quantity of weight",
      "Prepare mentally for challenging sets while maintaining safety awareness",
      "Establish mind-muscle connection before beginning work sets",
      "Commit to giving your best effort while listening to your body"
    ]
  },
  execution: {
    form_priorities: [
      "Maintain proper spinal alignment throughout all movements",
      "Control the eccentric (lowering) portion of each repetition",
      "Use full range of motion unless contraindicated",
      "Keep core engaged to provide stability and protect the spine",
      "Focus on the target muscle group and minimize compensation patterns"
    ],
    breathing: [
      "Exhale during the concentric (lifting) phase of the movement",
      "Inhale during the eccentric (lowering) phase",
      "For heavy lifts, use the Valsalva maneuver: inhale, hold, lift, exhale",
      "Never hold your breath for extended periods",
      "Maintain rhythmic breathing during lighter, higher-rep sets"
    ],
    tempo: [
      "Use a controlled tempo: 2-3 seconds down, 1-2 seconds up for most exercises",
      "Pause briefly at the bottom of the movement to eliminate momentum",
      "Accelerate through the concentric phase while maintaining control",
      "Adjust tempo based on training goals: slower for hypertrophy, explosive for power",
      "Maintain consistent tempo throughout the set"
    ]
  },
  progression: {
    weight_increases: [
      "Increase weight by 2.5-5% when you can complete all sets with perfect form",
      "For upper body exercises, increase by 2.5-5 lbs per week",
      "For lower body exercises, increase by 5-10 lbs per week",
      "Use microplates (0.5-1.25 lbs) for smaller, more precise progressions",
      "Progress conservatively to maintain form and prevent injury"
    ],
    rep_ranges: [
      "Strength: 1-5 reps at 85-95% 1RM",
      "Hypertrophy: 6-12 reps at 70-85% 1RM",
      "Endurance: 12+ reps at 50-70% 1RM",
      "When you can complete the upper end of the range, increase weight",
      "Drop to the lower end of the range with the new weight"
    ],
    deload_signals: [
      "Persistent fatigue lasting more than 2-3 days",
      "Inability to complete prescribed reps with usual weights",
      "Joint pain or persistent muscle soreness",
      "Decreased motivation or enjoyment in training",
      "Sleep disturbances or elevated resting heart rate"
    ]
  }
};

export const SESSION_FLOW: SessionFlow = {
  pre_workout: [
    "Review your planned exercises and weights for the session",
    "Complete a thorough warm-up routine",
    "Set up your first exercise and load the appropriate weight",
    "Take a moment to mentally prepare and set intentions",
    "Begin with your first working set"
  ],
  during_workout: [
    "Focus on one set at a time with complete attention",
    "Rest adequately between sets based on your training goals",
    "Record your performance immediately after each set",
    "Stay hydrated and maintain energy levels",
    "Adjust weights or reps based on how you're feeling"
  ],
  between_exercises: [
    "Clean up your current exercise area",
    "Set up equipment for the next exercise",
    "Take 2-3 minutes to transition and mentally prepare",
    "Review form cues for the upcoming exercise",
    "Ensure proper hydration and energy levels"
  ],
  post_workout: [
    "Complete a cool-down with light stretching",
    "Record your workout data and any notes",
    "Reflect on what went well and areas for improvement",
    "Plan your recovery activities (nutrition, hydration, sleep)",
    "Clean up your workout area and equipment"
  ]
};

export const REST_PERIOD_GUIDANCE: RestPeriodGuidance = {
  compound_movements: {
    strength: "3-5 minutes between sets to allow full recovery",
    hypertrophy: "2-3 minutes to balance recovery with metabolic stress",
    endurance: "1-2 minutes to maintain elevated heart rate"
  },
  isolation_movements: {
    strength: "2-3 minutes for adequate recovery",
    hypertrophy: "1-2 minutes to maintain muscle pump",
    endurance: "30-90 seconds for metabolic conditioning"
  },
  general: [
    "Listen to your body - rest longer if you're still breathing heavily",
    "Use rest time productively: hydrate, visualize next set, check form",
    "Longer rest periods are better for strength and power development",
    "Shorter rest periods increase metabolic stress and conditioning",
    "Quality of the next set is more important than strict rest timing"
  ]
};

export const PROGRESSION_GUIDANCE: ProgressionGuidance = {
  weight_progression: [
    "Increase weight only when you can complete all prescribed reps with perfect form",
    "Use the smallest weight increment available (usually 2.5-5 lbs)",
    "For bodyweight exercises, progress by adding reps, sets, or difficulty variations",
    "Track your lifts consistently to identify when progression is appropriate",
    "Don't rush progression - consistency over time yields the best results"
  ],
  rep_progression: [
    "Start at the lower end of your target rep range with a new weight",
    "Add 1-2 reps per week until you reach the upper end of the range",
    "Once you can complete the maximum reps, increase weight and drop back to minimum reps",
    "For strength training, focus on adding weight rather than reps",
    "For endurance training, emphasize rep increases over weight increases"
  ],
  deload_indicators: [
    "Consistent failure to complete prescribed reps for 2+ sessions",
    "Persistent fatigue that doesn't resolve with normal recovery",
    "Joint pain or unusual muscle soreness",
    "Decreased motivation or enjoyment in training",
    "Sleep disturbances or elevated stress levels"
  ],
  plateau_strategies: [
    "Deload by reducing weight by 10-20% for 1-2 weeks",
    "Change exercise variations to provide new stimulus",
    "Adjust rep ranges or training frequency",
    "Focus on technique refinement and mind-muscle connection",
    "Ensure adequate recovery through sleep, nutrition, and stress management"
  ]
};

// Exercise-specific instructions database
export const EXERCISE_INSTRUCTIONS: Record<string, ExerciseInstructions> = {
  "bench press": {
    setup: [
      "Lie flat on bench with eyes under the barbell",
      "Plant feet firmly on the ground, maintain arch in lower back",
      "Grip bar with hands slightly wider than shoulder-width",
      "Retract shoulder blades and maintain tight upper back",
      "Unrack bar and position directly over chest"
    ],
    execution: [
      "Lower bar to chest with control, touching lightly at nipple line",
      "Keep elbows at 45-degree angle to torso",
      "Drive feet into ground and press bar up explosively",
      "Maintain wrist alignment and bar path over chest",
      "Complete full range of motion on every rep"
    ],
    common_mistakes: [
      "Bouncing the bar off the chest",
      "Flaring elbows too wide (90 degrees)",
      "Lifting feet off the ground",
      "Pressing bar toward face or stomach",
      "Partial range of motion"
    ],
    form_cues: [
      "Chest up, shoulders back and down",
      "Drive through your heels",
      "Squeeze the bar tight",
      "Touch chest, press to ceiling",
      "Keep core tight throughout"
    ],
    safety_notes: [
      "Always use a spotter for heavy attempts",
      "Set safety bars at appropriate height",
      "Warm up thoroughly before heavy sets",
      "Don't train to failure without a spotter",
      "Stop if you feel shoulder or chest pain"
    ]
  },
  "squat": {
    setup: [
      "Position bar on upper traps (high bar) or rear delts (low bar)",
      "Step back from rack with feet shoulder-width apart",
      "Point toes slightly outward (15-30 degrees)",
      "Engage core and maintain neutral spine",
      "Keep chest up and eyes looking forward"
    ],
    execution: [
      "Initiate movement by pushing hips back",
      "Descend until hip crease is below knee cap",
      "Keep knees tracking over toes",
      "Drive through heels to return to starting position",
      "Maintain upright torso throughout movement"
    ],
    common_mistakes: [
      "Knees caving inward (valgus collapse)",
      "Forward lean or chest dropping",
      "Not reaching proper depth",
      "Rising on toes during ascent",
      "Uneven weight distribution"
    ],
    form_cues: [
      "Sit back like sitting in a chair",
      "Knees out, chest up",
      "Drive the floor away with your feet",
      "Hip hinge first, then knee bend",
      "Stand tall at the top"
    ],
    safety_notes: [
      "Use safety bars set just below your lowest squat position",
      "Warm up with bodyweight squats first",
      "Don't look up or down - maintain neutral neck",
      "If you feel knee pain, check your form or reduce weight",
      "Practice the movement pattern before adding weight"
    ]
  },
  "deadlift": {
    setup: [
      "Stand with feet hip-width apart, bar over mid-foot",
      "Bend at hips and knees to grip bar just outside legs",
      "Keep chest up and shoulders over the bar",
      "Engage lats by pulling shoulders down and back",
      "Take deep breath and brace core"
    ],
    execution: [
      "Drive through heels and extend hips and knees simultaneously",
      "Keep bar close to body throughout the lift",
      "Stand tall with shoulders back at the top",
      "Reverse the movement by pushing hips back first",
      "Lower bar with control to starting position"
    ],
    common_mistakes: [
      "Bar drifting away from body",
      "Rounding the back under load",
      "Hyperextending at the top",
      "Knees caving inward",
      "Looking up or down during the lift"
    ],
    form_cues: [
      "Chest up, shoulders over bar",
      "Drag the bar up your legs",
      "Push the floor away",
      "Hips through at the top",
      "Control the descent"
    ],
    safety_notes: [
      "Start with light weight to master the movement pattern",
      "Don't round your back - reduce weight if form breaks down",
      "Use mixed grip or straps for grip strength limitations",
      "Warm up thoroughly with dynamic movements",
      "Stop immediately if you feel lower back pain"
    ]
  },
  "overhead press": {
    setup: [
      "Stand with feet shoulder-width apart",
      "Grip bar with hands just outside shoulders",
      "Rest bar on front delts with elbows under wrists",
      "Engage core and maintain neutral spine",
      "Keep chest up and shoulders back"
    ],
    execution: [
      "Press bar straight up, moving head back slightly",
      "Drive through heels and squeeze glutes",
      "Press until arms are fully extended overhead",
      "Return bar to starting position with control",
      "Keep core tight throughout entire movement"
    ],
    common_mistakes: [
      "Pressing bar forward instead of straight up",
      "Excessive back arch",
      "Not moving head out of bar path",
      "Partial range of motion",
      "Losing core stability"
    ],
    form_cues: [
      "Press up and slightly back",
      "Drive through your heels",
      "Squeeze glutes tight",
      "Push your head through at the top",
      "Keep ribs down"
    ],
    safety_notes: [
      "Start with lighter weight to establish proper form",
      "Don't arch your back excessively",
      "Ensure adequate shoulder mobility before pressing overhead",
      "Use a spotter for heavy attempts",
      "Stop if you feel shoulder impingement"
    ]
  }
};

export const PROMPT_TEMPLATES: PromptTemplates = {
  pre_workout: `You're about to begin your workout session. Here's how to prepare for success:

🔥 **Mental Preparation**
- Set clear intentions for this session
- Visualize successful completion of your planned exercises
- Focus on quality movement over heavy weights

⚡ **Physical Preparation**
- Complete a thorough 5-10 minute warm-up
- Perform dynamic stretches for target muscle groups
- Practice movement patterns with light weights
- Ensure all equipment is ready and safe

💪 **Session Setup**
- Review your planned exercises and target weights
- Have water and towel readily available
- Set up your first exercise
- Take a deep breath and commit to giving your best effort

Remember: Every rep is an opportunity to improve. Focus on form, listen to your body, and enjoy the process!`,

  during_set: {
    "bench press": "🏋️ **Bench Press Focus**: Retract shoulder blades, lower with control to chest, drive through heels, press explosively. Keep elbows at 45° and maintain tight core. Quality over quantity!",
    "squat": "🏋️ **Squat Focus**: Chest up, sit back into the movement, knees track over toes. Descend until hip crease below knees, then drive through heels. Keep core braced throughout!",
    "deadlift": "🏋️ **Deadlift Focus**: Bar stays close to body, chest up, shoulders over bar. Drive through heels, extend hips and knees together. Stand tall at top, control the descent!",
    "overhead press": "🏋️ **Overhead Press Focus**: Core tight, press straight up, move head back slightly. Drive through heels, squeeze glutes. Full extension overhead, control the descent!",
    "default": "🏋️ **Exercise Focus**: Maintain proper form, control the weight, breathe rhythmically. Focus on the target muscle, use full range of motion. You've got this!"
  },

  between_sets: `⏱️ **Between Sets Recovery**

🫁 **Breathing & Recovery**
- Take deep breaths to normalize heart rate
- Hydrate as needed
- Use this time to mentally prepare for the next set

📝 **Performance Tracking**
- Record your reps and weight immediately
- Note how the set felt (RPE, form quality)
- Adjust weight for next set if needed

🎯 **Next Set Preparation**
- Visualize perfect execution
- Review key form cues
- Stay focused and present

Rest adequately based on your goals - strength needs more recovery, endurance less. Quality of the next set matters more than strict timing!`,

  post_workout: `🎉 **Workout Complete - Great Job!**

✅ **Immediate Post-Workout**
- Take a moment to appreciate your effort
- Begin cool-down with light stretching
- Hydrate and start thinking about nutrition

📊 **Session Review**
- Record any final notes about the workout
- Reflect on what went well
- Identify areas for improvement next time

🔄 **Recovery Planning**
- Plan your post-workout nutrition
- Consider your sleep and stress management
- Think about tomorrow's recovery activities

💪 **Mindset**
- Celebrate the consistency of showing up
- Focus on the process, not just the outcome
- You're building strength and discipline with every session

Remember: Recovery is where the magic happens. Take care of your body and it will take care of you!`,

  exercise_selection: {
    "strength": "💪 **Strength Focus**: Prioritize compound movements (squat, deadlift, bench, overhead press). Use 1-5 rep ranges with 85-95% 1RM. Rest 3-5 minutes between sets. Focus on progressive overload and perfect form.",
    "hypertrophy": "🔥 **Hypertrophy Focus**: Mix compound and isolation exercises. Use 6-12 rep ranges with 70-85% 1RM. Rest 2-3 minutes between sets. Focus on time under tension and mind-muscle connection.",
    "endurance": "⚡ **Endurance Focus**: Higher rep ranges (12+) with 50-70% 1RM. Shorter rest periods (1-2 minutes). Include circuit training and supersets. Focus on maintaining form as fatigue increases.",
    "general": "🎯 **General Fitness**: Balance of compound and isolation exercises. Vary rep ranges (6-15). Moderate rest periods (2-3 minutes). Focus on movement quality and consistency over intensity."
  }
};

// Helper function to get exercise type
export function getExerciseType(exerciseName: string): ExerciseType {
  const compoundExercises = [
    'squat', 'deadlift', 'bench press', 'overhead press', 'row', 'pull-up', 'chin-up',
    'dip', 'lunge', 'step-up', 'clean', 'snatch', 'thruster'
  ];
  
  const normalizedName = exerciseName.toLowerCase().trim();
  return compoundExercises.some(compound => normalizedName.includes(compound)) 
    ? 'compound' 
    : 'isolation';
}

// Helper function to normalize exercise names for lookup
export function normalizeExerciseName(exerciseName: string): string {
  return exerciseName.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}