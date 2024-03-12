import { AxiosError } from 'axios';
import { DateTime } from 'luxon';
import { AuthConfiguration } from './auth-configuration';

export interface SessionExpiryRefreshInterceptorArgs {
  configuration: AuthConfiguration;
  getIsAuthenticated: () => boolean | null;
  getSessionExpiry: () => DateTime | null;
  runTokenRefreshRequest: () => Promise<string>;
  onError: (error: AxiosError<{ error?: string }>) => Promise<void>;
}
