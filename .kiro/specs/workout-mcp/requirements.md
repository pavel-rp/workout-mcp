# Requirements Document

## Introduction

This document outlines the requirements for a minimal viable TypeScript-based MCP server that provides basic workout data storage and retrieval functionality. The server focuses on data persistence and simple calculations, leaving all intelligent analysis to the consuming client. The system is designed as a single-user, local-storage solution using SQLite with Drizzle ORM and Zod validation.

## Requirements

### Requirement 1

**User Story:** As an LLM agent helping a fitness enthusiast, I want access to workout workflow instructions via MCP tools, so that I can guide the end user through proper workout procedures.

#### Acceptance Criteria

1. WHEN the agent calls get_workout_instructions THEN the system SHALL return structured guidance for conducting workouts
2. WHEN the agent calls get_exercise_instructions with exercise_name THEN the system SHALL return specific form cues and execution guidance
3. WHEN the agent calls get_session_flow_instructions THEN the system SHALL return step-by-step workflow for managing workout sessions
4. WHEN the agent calls get_rest_period_guidance with exercise_type THEN the system SHALL return recommended rest periods
5. WHEN the agent calls get_progression_guidance with exercise_name THEN the system SHALL return instructions for weight/rep progression

### Requirement 2

**User Story:** As an LLM agent helping a fitness enthusiast, I want access to contextual prompts and coaching cues via MCP tools, so that I can provide appropriate guidance at each stage of the workout.

#### Acceptance Criteria

1. WHEN the agent calls get_pre_workout_prompt THEN the system SHALL return instructions for workout preparation and warm-up
2. WHEN the agent calls get_during_set_prompt with exercise_name THEN the system SHALL return real-time coaching cues for that exercise
3. WHEN the agent calls get_between_sets_prompt THEN the system SHALL return guidance for rest periods and preparation for next set
4. WHEN the agent calls get_post_workout_prompt THEN the system SHALL return cool-down and session summary instructions
5. WHEN the agent calls get_exercise_selection_prompt with workout_context THEN the system SHALL return guidance for choosing appropriate exercises
6. WHEN prompts are not accessible as resources THEN the system SHALL expose all prompts as individual MCP tools as a fallback

### Requirement 3

**User Story:** As an LLM agent helping a fitness enthusiast, I want to start and end workout sessions via MCP tools, so that I can track training sessions for the end user.

#### Acceptance Criteria

1. WHEN the agent calls start_workout with an optional name THEN the system SHALL create a new workout record and return a workout_id
2. WHEN the agent calls end_workout with a workout_id and optional notes THEN the system SHALL update the workout record with end time and notes
3. WHEN the agent starts a workout without a name THEN the system SHALL generate a default name with current date and time
4. IF a workout_id does not exist WHEN the agent calls end_workout THEN the system SHALL return an error message

### Requirement 4

**User Story:** As an LLM agent helping a fitness enthusiast, I want to log individual exercise sets during workouts via MCP tools, so that I can track performance data for the end user.

#### Acceptance Criteria

1. WHEN the agent calls add_exercise_set with workout_id, exercise_name, weight_kg, reps, and optional notes THEN the system SHALL create a new set record and return a set_id
2. WHEN the agent adds a set with a new exercise_name THEN the system SHALL automatically create the exercise record if it doesn't exist
3. IF weight_kg is not a positive number WHEN the agent adds a set THEN the system SHALL return a validation error
4. IF reps is not a positive integer WHEN the agent adds a set THEN the system SHALL return a validation error
5. WHEN the agent adds multiple sets to a workout THEN the system SHALL maintain the order_in_workout sequence automatically

### Requirement 5

**User Story:** As an LLM agent helping a fitness enthusiast, I want to retrieve workout history via MCP tools, so that I can analyze and present past training data to the end user.

#### Acceptance Criteria

1. WHEN the agent calls get_workout with a workout_id THEN the system SHALL return complete workout data including all sets
2. WHEN the agent calls get_workouts with optional start_date and end_date THEN the system SHALL return a filtered list of workouts
3. WHEN the agent calls get_workouts without date filters THEN the system SHALL return all workouts ordered by date descending
4. IF a workout_id does not exist WHEN the agent calls get_workout THEN the system SHALL return an error message
5. WHEN the agent provides date filters THEN the system SHALL validate date format and return error for invalid dates

### Requirement 6

**User Story:** As an LLM agent helping a fitness enthusiast, I want to access exercise history and available exercises via MCP tools, so that I can analyze progress patterns for the end user.

#### Acceptance Criteria

1. WHEN the agent calls get_exercise_history with exercise_name and optional limit THEN the system SHALL return historical sets for that exercise
2. WHEN the agent calls get_exercises THEN the system SHALL return a list of all exercises performed by the end user
3. WHEN the agent requests exercise history with a limit THEN the system SHALL return the most recent sets up to that limit
4. IF an exercise_name does not exist WHEN the agent calls get_exercise_history THEN the system SHALL return an empty array
5. WHEN returning exercise history THEN the system SHALL include workout context (date, workout name) for each set

### Requirement 7

**User Story:** As an LLM agent helping a fitness enthusiast, I want to calculate basic workout metrics via MCP tools, so that I can provide data-driven insights to the end user.

#### Acceptance Criteria

1. WHEN the agent calls calculate_total_volume with optional filters THEN the system SHALL return the sum of weight_kg × reps for matching sets
2. WHEN the agent calls calculate_average_weight with exercise_name and optional date range THEN the system SHALL return the mean weight for that exercise
3. WHEN the agent calls count_sets with optional filters THEN the system SHALL return the total number of sets matching the criteria
4. WHEN calculation functions receive invalid parameters THEN the system SHALL return appropriate validation errors
5. WHEN no data matches the filter criteria THEN calculation functions SHALL return zero or null as appropriate

### Requirement 8

**User Story:** As an LLM agent helping a fitness enthusiast, I want the system to validate input data via MCP tools, so that I can ensure data integrity and receive clear error messages to relay to the end user.

#### Acceptance Criteria

1. WHEN the agent provides invalid weight values (negative, zero, or non-numeric) THEN the system SHALL return a clear validation error using Zod
2. WHEN the agent provides invalid rep values (negative, zero, or non-integer) THEN the system SHALL return a clear validation error using Zod
3. WHEN the agent provides invalid date formats THEN the system SHALL return a clear validation error
4. WHEN database constraints are violated THEN the system SHALL return user-friendly error messages
5. WHEN input sanitization detects malicious content THEN the system SHALL reject the input and log the attempt

### Requirement 9

**User Story:** As an LLM agent helping a fitness enthusiast, I want workout data stored locally and securely via the MCP server, so that the end user can maintain privacy and access data offline.

#### Acceptance Criteria

1. WHEN the MCP server starts THEN it SHALL create or connect to a local SQLite database
2. WHEN data is stored THEN the system SHALL enforce foreign key constraints using Drizzle ORM
3. WHEN the MCP server operates THEN it SHALL NOT make any external network calls
4. WHEN database operations fail THEN the system SHALL provide graceful error handling and recovery
5. WHEN the MCP server shuts down THEN it SHALL properly close database connections

### Requirement 10

**User Story:** As an LLM agent helping a fitness enthusiast, I want fast response times from MCP tools, so that I can provide real-time assistance to the end user without delays.

#### Acceptance Criteria

1. WHEN the agent logs a single set THEN the system SHALL respond within 50ms
2. WHEN the agent queries simple workout data THEN the system SHALL respond within 100ms
3. WHEN the agent performs basic calculations THEN the system SHALL respond within 200ms
4. WHEN the database grows large THEN query performance SHALL be maintained through proper indexing
5. WHEN the agent performs multiple operations concurrently THEN the system SHALL handle them without performance degradation