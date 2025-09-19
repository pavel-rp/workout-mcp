import { z, type ZodIssue } from 'zod';

// Validation result types
export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationError {
  success: false;
  error: {
    type: 'validation';
    message: string;
    details?: Record<string, any>;
  };
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

// Generic validation function
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): ValidationResult<T> {
  const result = schema.safeParse(input);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  } else {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: {
        type: 'validation',
        message: firstError.message,
        details: {
          field: firstError.path.join('.'),
          code: firstError.code,
          received: 'received' in firstError ? firstError.received : undefined,
          expected: 'expected' in firstError ? firstError.expected : undefined,
          allErrors: result.error.issues
        }
      }
    };
  }
}

// Safe parsing with detailed error information
export function safeParseWithDetails<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): (z.ZodSafeParseSuccess<T> | z.ZodSafeParseError<unknown>) & { 
  errorDetails?: { 
    field: string; 
    message: string; 
    code: string; 
  }[] 
} {
  const result = schema.safeParse(input);
  
  if (!result.success) {
    return {
      ...result,
      errorDetails: result.error.issues.map((err: ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    };
  }
  
  return result;
}

// Input sanitization utilities
export function sanitizeString(input: string): string {
  // Remove potentially malicious content
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

export function sanitizeExerciseName(name: string): string {
  return sanitizeString(name)
    .toLowerCase()
    .trim();
}

// Validation helper for exercise name normalization
export function normalizeExerciseName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// Type guards for validation results
export function isValidationSuccess<T>(
  result: ValidationResult<T>
): result is ValidationSuccess<T> {
  return result.success === true;
}

export function isValidationError<T>(
  result: ValidationResult<T>
): result is ValidationError {
  return result.success === false;
}