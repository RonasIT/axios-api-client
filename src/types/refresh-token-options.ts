import { AxiosError } from 'axios';
import { AuthConfiguration } from './auth-configuration';

export type RefreshTokenOptions = {
  configuration: AuthConfiguration;
  getIsAuthenticated: () => boolean | null;
  runTokenRefreshRequest: () => Promise<string>;
  onError: (error: AxiosError<{ error?: string }>) => Promise<void>;
};
