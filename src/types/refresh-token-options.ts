import { AxiosError } from 'axios';
import { AuthConfiguration } from './auth-configuration';

export type RefreshTokenInterceptorOptions = {
  /** Auth route configuration. */
  configuration: AuthConfiguration;
  /** Returns the current authentication state. */
  getIsAuthenticated: () => boolean | null;
  /** Optional callback to check if the token is expired. If omitted, expiry is read from the Authorization header. */
  getIsTokenExpired?: () => boolean | null;
  /** Refreshes the access token and returns the new token string. */
  runTokenRefreshRequest: () => Promise<string>;
  /** Called when token refresh fails. */
  onError: (error: AxiosError<{ error?: string }>) => Promise<void>;
};
