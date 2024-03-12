export const isServerError = (code?: number): boolean => {
  return String(code).startsWith('5');
};
