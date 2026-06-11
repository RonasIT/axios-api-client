import { decode } from 'base-64';
import { jwtDecode } from 'jwt-decode';

if (typeof global === 'object') {
  global.atob = decode;
}

/**
 * Checks whether JWT token is expired based on its `exp` claim.
 *
 * @param {string} token - JWT access token.
 * @returns {boolean} `true` when token has no `exp` or expiration time is in the past.
 */
export const checkIsTokenExpired = (token: string): boolean => {
  const { exp } = jwtDecode(token);

  return !exp || exp * 1000 < Date.now();
};
