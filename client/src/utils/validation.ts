import { z } from "zod";

// Validate form data with Zod schema
export function validateFormData(schema: z.ZodTypeAny, data: unknown) {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  // Collect all validation errors
  const errors: Record<string, string> = {};
  for (const err of result.error.errors) {
    const field = err.path[0];
    if (field) {
      errors[field as string] = err.message;
    }
  }
  
  return { isValid: false, errors };
}

// Get validation errors from API response
export function extractValidationErrors(error: any) {
  const errors: Record<string, string> = {};
  const apiErrors = error.response?.data?.details;
  
  if (apiErrors) {
    for (const err of apiErrors) {
      const field = err.path?.[0];
      if (field) {
        errors[field] = err.message;
      }
    }
  }
  
  return errors;
}

// Get error message from API or use default
export function getErrorMessage(error: any, defaultMessage: string) {
  return error.response?.data?.error || error.message || defaultMessage;
}

