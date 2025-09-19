# Implementation Plan

- [x] 1. Set up project structure and core dependencies

  - Initialize TypeScript project with MCP SDK, Drizzle ORM, and Zod
  - Configure build system and development environment with Jest for testing
  - Set up SQLite database with WAL mode configuration
  - Add VS Code launch configuration for debugging with unique port (e.g., 9230)
  - Configure npm scripts including "start:stdio" with --inspect flag for debugging
  - _Requirements: 9.1, 9.2_

- [x] 2. Implement database schema and migrations

  - Create Drizzle schema definitions for exercises, workouts, and sets tables
  - Implement database initialization with proper indexes including composite idx_sets_workout_order
  - Add startup schema validation that creates tables and indexes if they don't exist
  - Configure runtime PRAGMAs (journal_mode=WAL, synchronous=NORMAL, busy_timeout=5000)
  - Write unit tests for database initialization and schema creation
  - _Requirements: 9.1, 9.2, 9.4, 10.4_

- [x] 3. Create validation layer with Zod schemas

  - Implement input validation schemas for all MCP tool parameters using numeric IDs; enforce camelCase in API, snake_case in DB
  - Add ISO 8601 datetime validation with timezone support for date fields
  - Create DTO mapping functions between camelCase API and snake_case database
  - Write comprehensive unit tests for all validation schemas with edge cases
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 4. Implement workout workflow and prompt system

  - Create static workout instruction data structures and retrieval functions
  - Implement exercise-specific instruction lookup with form cues and safety notes
  - Build contextual prompt system for pre/during/post workout guidance
  - Expose all prompts as both resources and individual MCP tools as fallback
  - Write unit tests for workflow engine and prompt retrieval functions
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 5. Build core session management tools

  - Implement start_workout tool returning { workoutId: number } in success envelope
  - Create end_workout tool with proper validation and error handling
  - Build add_exercise_set tool with case-insensitive exercise name matching and auto-creation
  - Ensure add_exercise_set returns complete set data with resolved exerciseId and orderInWorkout
  - Write unit tests for all session management tools and edge cases
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6. Implement data retrieval tools with proper ordering

  - Create get_workout tool for complete workout data with sets
  - Build get_workouts tool with date filtering and descending date order
  - Implement get_exercise_history with proper ordering (date desc, then order_in_workout asc)
  - Add get_exercises tool for exercise listing
  - Write unit tests for all data retrieval tools and ordering guarantees
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7. Create calculation engine with pure functions

  - Implement calculate_total_volume function for volume metrics
  - Build calculate_average_weight function with date range filtering
  - Create count_sets function with comprehensive filtering options
  - Add proper validation and null handling for edge cases
  - Write comprehensive unit tests for all calculation functions with various input scenarios
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8. Implement comprehensive error handling and response envelopes

  - Create consistent SuccessResponse and ErrorResponse envelope types
  - Add proper error categorization (validation, database, not_found, business_logic)
  - Implement graceful error handling with user-friendly messages
  - Add input sanitization and malicious content detection
  - Write unit tests for error handling scenarios and response envelope consistency
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.4_

- [ ] 9. Set up MCP server integration and resource exposure

  - Configure MCP server with all tools and resources
  - Implement proper tool registration and parameter validation
  - Set up resource endpoints for workout data, exercises, and prompts
  - Add comprehensive logging for debugging and monitoring
  - Write integration tests for MCP server setup and tool registration
  - _Requirements: 9.3, 9.5_

- [ ] 10. Finalize test coverage and documentation

  - Ensure all unit tests pass and achieve comprehensive coverage
  - Add missing test cases identified during development
  - Create usage examples and API documentation
  - Verify all requirements are covered by tests
  - _Requirements: All requirements validation_

- [ ] 11. Performance optimization and final polish
  - Optimize database queries and ensure proper index usage
  - Implement caching strategy for static workflow data
  - Verify response time targets (50ms logging, 100ms queries, 200ms calculations)
  - Add comprehensive documentation and usage examples
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
