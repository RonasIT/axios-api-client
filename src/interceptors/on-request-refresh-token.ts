import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { DateTime } from 'luxon';
import { SessionExpiryRefreshInterceptorArgs } from '../interfaces';

let refreshTokenRequest: Promise<string> | null;

export const onRequestSessionExpiryRefreshInterceptor =
  ({
    configuration,
    getIsAuthenticated,
    getSessionExpiry,
    runTokenRefreshRequest,
    onError
  }: SessionExpiryRefreshInterceptorArgs) =>
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const isAuthenticated = getIsAuthenticated();
    // TODO: Fix sessionExpiry is retrieved before its set in authListenerMiddleware
    const sessionExpiry = getSessionExpiry();

    if (
      isAuthenticated &&
      (!sessionExpiry?.isValid || sessionExpiry < DateTime.local()) &&
      ![...configuration.unauthorizedRoutes, configuration.refreshTokenRoute, configuration.logoutRoute].includes(
        config.url ?? ''
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
