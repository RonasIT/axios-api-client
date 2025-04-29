import { AxiosError } from 'axios';
import { AuthConfiguration } from './auth-configuration';

export type RefreshTokenInterceptorOptions = {
  configuration: AuthConfiguration;
  getIsAuthenticated: () => boolean | null;
  getIsTokenExpired?: () => boolean | null;
  runTokenRefreshRequest: () => Promise<string>;
  onError: (error: AxiosError<{ error?: string }>) => Promise<void>;
};
