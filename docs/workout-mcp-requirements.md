# Workout Tracking MCP Server - Requirements Document (MVP)

## Executive Summary

This document outlines requirements for a minimal viable TypeScript-based MCP server that provides basic workout data storage and retrieval functionality. The server focuses on data persistence and simple calculations, leaving all intelligent analysis to the consuming client.

## Project Overview

**Objective**: Create a Model Context Protocol server that provides workout data storage, retrieval, and basic calculations for a single user.

**Core Philosophy**: Simple, reliable data layer that stores workout information and provides basic metrics. All reasoning and intelligent analysis handled by the consuming client.

**Technology Stack**: TypeScript, MCP SDK, SQLite for local storage, Drizzle ORM for database access, Zod for validation.

## MVP Scope

### Core Functionality

- Store workout sessions and exercise sets
- Retrieve historical workout data
- Provide basic calculations (totals, averages)
- Single-user system with local SQLite storage

### Out of Scope (Client Responsibility)

- Exercise recommendations and planning
- Form analysis and coaching
- Progressive overload calculations
- Workout balance analysis
- All AI-driven features and reasoning

## Core MCP Server Capabilities

### 1. Workout Data Storage & Management

#### Database Schema (SQLite)

**Exercises Table**

- `id` (PK), `name`, `muscle_groups` (JSON), `created_at`

**Workouts Table**

- `id` (PK), `name`, `date`, `duration_minutes`, `notes`, `created_at`

**Sets Table**

- `id` (PK), `workout_id` (FK), `exercise_id` (FK), `weight_kg`, `reps`, `rest_seconds`, `completed`, `order_in_workout`, `notes`

#### Data Integrity Features

- Foreign key constraints
- Data validation for weights (kg), reps, dates
- Basic input sanitization

### 2. Basic Calculation Functions

#### Simple Metrics (Pure Functions)

- **Total Volume**: Calculate weight_kg × reps for sets/workouts
- **Average Weight**: Calculate mean weight for an exercise over time
- **Set Count**: Count total sets for exercises/workouts
- **Workout Duration**: Sum duration across date ranges

### 3. MCP Server Architecture

#### Core Tools

```typescript
// Workout session management
start_workout(name?: string): workout_id
end_workout(workout_id: string, notes?: string): void
add_exercise_set(workout_id: string, exercise_name: string, weight_kg: number, reps: number, notes?: string): set_id

// Data retrieval
get_workout(workout_id: string): workout_data
get_workouts(start_date?: string, end_date?: string): workout_list
get_exercise_history(exercise_name: string, limit?: number): set_history
get_exercises(): exercise_list

// Basic calculations
calculate_total_volume(workout_id?: string, exercise_name?: string, start_date?: string, end_date?: string): number
calculate_average_weight(exercise_name: string, start_date?: string, end_date?: string): number
count_sets(workout_id?: string, exercise_name?: string, start_date?: string, end_date?: string): number

// Workflow guidance tools
get_workout_instructions(): workout_guidance
get_exercise_instructions(exercise_name: string): exercise_guidance
get_session_flow_instructions(): session_workflow
get_rest_period_guidance(exercise_type: string): rest_guidance
get_progression_guidance(exercise_name: string): progression_guidance

// Contextual prompt tools
get_pre_workout_prompt(): prompt_text
get_during_set_prompt(exercise_name: string): prompt_text
get_between_sets_prompt(): prompt_text
get_post_workout_prompt(): prompt_text
get_exercise_selection_prompt(workout_context: object): prompt_text
```

#### Resources

- **workouts**: Workout session data with filtering
- **exercises**: Exercise definitions and history
- **sets**: Individual set data with filtering

#### Error Handling & Validation

- Input sanitization and type checking
- Database constraint enforcement
- Graceful error responses with clear messages

## Client Integration Notes

### Intelligent Features (Client Side)

The MCP server provides raw data and basic calculations. The consuming client should implement:

- Exercise recommendations and workout planning
- Progressive overload calculations and suggestions
- Workout balance analysis (push/pull ratios, etc.)
- Form coaching and technique guidance
- Periodization and program design
- Recovery analysis and deload recommendations

### Data Flow

1. Client requests workout data via MCP tools
2. Server returns raw data and basic calculations
3. Client performs analysis and reasoning
4. Client presents insights and recommendations to user

## Implementation Roadmap (MVP)

### Phase 1: Core Infrastructure (Week 1)

- [ ] SQLite database setup with simplified schema
- [ ] Basic MCP server structure using TypeScript SDK
- [ ] Core workout and set logging tools
- [ ] Data validation and error handling

### Phase 2: Data Retrieval (Week 2)

- [ ] Workout and exercise history retrieval tools
- [ ] Basic filtering and querying capabilities
- [ ] Exercise management (add/list exercises)

### Phase 3: Basic Calculations (Week 3)

- [ ] Volume calculation functions
- [ ] Average weight calculations
- [ ] Set counting utilities
- [ ] Duration summaries

### Phase 4: Polish & Testing (Week 4)

- [ ] Comprehensive error handling
- [ ] Input validation improvements
- [ ] Performance optimization
- [ ] Documentation and examples

## Technical Specifications

### MCP Server Requirements

- **Framework**: Model Context Protocol TypeScript SDK
- **Runtime**: Node.js 18+
- **Database**: SQLite for local storage
- **ORM**: Drizzle for type-safe database access
- **Validation**: Zod for input validation and type safety
- **Testing**: Jest for unit tests
- **Units**: All weights in kilograms (kg), time in seconds/minutes

### Performance Targets

- Tool response time < 100ms for simple queries
- Workout logging < 50ms per set entry
- Basic calculations < 200ms
- Database queries with proper indexing

### Security & Privacy

- Local SQLite database only
- No external network calls
- Single-user system

## Success Metrics

### Technical Metrics

- Database query performance benchmarks
- API response time consistency
- Error rate < 1% for normal operations
- Data integrity maintenance 100%

## Conclusion

This MVP MCP server provides a simple, reliable data layer for workout tracking. By focusing on data storage and basic calculations, it serves as a solid foundation that can be extended with intelligent features implemented on the client side.

The single-user, local-storage approach ensures privacy and simplicity while providing all the essential functionality needed for workout logging and basic analysis.
