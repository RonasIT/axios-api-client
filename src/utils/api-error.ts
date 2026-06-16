function isErrorResponse(error: unknown): boolean {
  return typeof error === 'object' && error != null && 'data' in error && typeof (error as any).data === 'object';
}

/**
 * Checks whether API error payload contains field-level validation errors.
 *
 * @param {unknown} error - Unknown error payload.
 * @returns {error is { message: string; data: { errors: { [k: string]: Array<string> } } }} Type predicate for error object with `data.errors` map.
 */
export function isErrorWithValidationErrors(
  error: unknown,
): error is { message: string; data: { errors: { [k: string]: Array<string> } } } {
  return isErrorResponse(error) && 'errors' in (error as any).data;
}
