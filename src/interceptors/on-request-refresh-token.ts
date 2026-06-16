import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { RefreshTokenInterceptorOptions } from '../types';
import { checkIsTokenExpired } from '../utils';

let refreshTokenRequest: Promise<string> | null;

/**
 * Creates a request interceptor that refreshes access token before sending protected requests.
 *
 * @param options - {@link RefreshTokenInterceptorOptions}
 * @returns Axios request interceptor.
 *
 * @example
 * const options: RefreshTokenInterceptorOptions = {
 *   configuration: configuration.auth,
 *   getIsAuthenticated: () => authSelectors.isAuthenticated(getState()),
 *   runTokenRefreshRequest: async () => {
 *     const { token } = await dispatch(authApi.endpoints.refreshToken.initiate()).unwrap();
 *     appStorageService.token.set(token);
 *
 *     return token;
 *   },
 *   onError: () => {
 *     return dispatch(authApi.endpoints.logout.initiate()).unwrap();
 *   },
 * };
 *
 * apiService.useInterceptors({
 *   request: [[onRequestRefreshTokenInterceptor(options)]],
 *   response: [[null, onResponseRefreshTokenInterceptor(options)]],
 * });
 */
export const onRequestRefreshTokenInterceptor =
  (options: RefreshTokenInterceptorOptions) => async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const isAuthenticated = options.getIsAuthenticated();

    const isTokenExpired = options.getIsTokenExpired
      ? options.getIsTokenExpired()
      : typeof config.headers.Authorization === 'string' &&
        checkIsTokenExpired(config.headers.Authorization.split(' ')[1]);

    if (
      isAuthenticated &&
      isTokenExpired &&
      ![
        ...options.configuration.unauthorizedRoutes,
        options.configuration.refreshTokenRoute,
        options.configuration.logoutRoute,
      ].includes(config.url ?? '')
    ) {
      if (!refreshTokenRequest) {
        try {
          refreshTokenRequest = options.runTokenRefreshRequest();
          const token = await refreshTokenRequest;

          refreshTokenRequest = null;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          return config;
        } catch (error) {
          refreshTokenRequest = null;
          await options.onError(error as AxiosError<{ error?: string | undefined }>);

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
