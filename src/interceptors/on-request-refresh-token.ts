import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { RefreshTokenInterceptorOptions } from '../types';
import { checkIsTokenExpired } from '../utils';

let refreshTokenRequest: Promise<string> | null;

export const onRequestRefreshTokenInterceptor =
  ({
    configuration,
    getIsAuthenticated,
    getIsTokenExpired,
    runTokenRefreshRequest,
    onError,
  }: RefreshTokenInterceptorOptions) => async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const isAuthenticated = getIsAuthenticated();

    const isTokenExpired = getIsTokenExpired
      ? getIsTokenExpired()
      : typeof config.headers.Authorization === 'string' &&
        checkIsTokenExpired(config.headers.Authorization.split(' ')[1]);

    if (
      isAuthenticated &&
      isTokenExpired &&
      ![...configuration.unauthorizedRoutes, configuration.refreshTokenRoute, configuration.logoutRoute].includes(
        config.url ?? '',
      )
    ) {
      if (!refreshTokenRequest) {
        try {
          refreshTokenRequest = runTokenRefreshRequest();
          const token = await refreshTokenRequest;

          refreshTokenRequest = null;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          return config;
        } catch (error) {
          refreshTokenRequest = null;
          await onError(error as AxiosError<{ error?: string | undefined }>);

          throw error;
        }
      } else {
        const token = await refreshTokenRequest;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      }
    }

    return config;
  };
