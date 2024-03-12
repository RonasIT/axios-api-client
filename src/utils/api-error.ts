function isErrorResponse(error: unknown): boolean {
  return typeof error === 'object' && error != null && 'data' in error && typeof (error as any).data === 'object';
}

export function isErrorWithValidationErrors(
  error: unknown
): error is { message: string; data: { errors: { [k: string]: Array<string> } } } {
  return isErrorResponse(error) && 'errors' in (error as any).data;
}
