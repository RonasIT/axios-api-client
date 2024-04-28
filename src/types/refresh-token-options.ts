import { AxiosError } from 'axios';
import { AuthConfiguration } from './auth-configuration';

export type SessionExpiryRefreshInterceptorArgs = {
  configuration: AuthConfiguration;
  getIsAuthenticated: () => boolean | null;
  runTokenRefreshRequest: () => Promise<string>;
  onError: (error: AxiosError<{ error?: string }>) => Promise<void>;
};
