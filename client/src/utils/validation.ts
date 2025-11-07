import { z } from "zod";

/**
 * Validates form data against a Zod schema and returns formatted errors
 */
export function validateFormData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): {
  isValid: boolean;
  errors: Partial<Record<string, string>>;
} {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Partial<Record<string, string>> = {};
    result.error.errors.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0] as string] = err.message;
      }
    });
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

/**
 * Extracts validation errors from API error response
 */
export function extractValidationErrors(
  error: any
): Partial<Record<string, string>> {
  if (error.response?.data?.details) {
    const validationErrors: Partial<Record<string, string>> = {};
    error.response.data.details.forEach((err: any) => {
      if (err.path && err.path[0]) {
        validationErrors[err.path[0]] = err.message;
      }
    });
    return validationErrors;
  }
  return {};
}

/**
 * Gets a general error message from API error response
 */
export function getErrorMessage(
  error: any,
  defaultMessage: string
): string {
  return error.response?.data?.error || error.message || defaultMessage;
}

