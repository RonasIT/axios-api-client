import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { RefreshTokenInterceptorOptions } from '../types';
import { checkIsTokenExpired } from '../utils';

let refreshTokenRequest: Promise<string> | null;

/**
 * Creates a request interceptor that refreshes access token before sending protected requests.
 *
 * @param {RefreshTokenInterceptorOptions} options - Configuration object:
 *   - configuration: AuthConfiguration with refresh token route and routes to skip
 *   - getIsAuthenticated: Returns boolean | null for current auth state
 *   - getIsTokenExpired: Optional callback to check if token expired. If not provided, extracted from Authorization header
 *   - runTokenRefreshRequest: Async function that performs token refresh and returns new token
 *   - onError: Error handler called when refresh fails
 * @returns {(config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>} Axios request interceptor.
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
