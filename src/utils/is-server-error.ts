/**
 * Checks whether HTTP status code belongs to server error range (`5xx`).
 *
 * @param {number | undefined} code - HTTP status code.
 * @returns {boolean} `true` for `5xx` codes.
 */
export const isServerError = (code?: number): boolean => {
  return String(code).startsWith('5');
};
