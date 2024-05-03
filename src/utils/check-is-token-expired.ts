import { decode } from 'base-64';
import { jwtDecode } from 'jwt-decode';

global.atob = decode;

export const checkIsTokenExpired = (token: string): boolean => {
  const { exp } = jwtDecode(token);

  return !exp || exp * 1000 < Date.now();
};
