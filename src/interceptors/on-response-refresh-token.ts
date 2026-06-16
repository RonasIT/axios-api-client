import axios, { AxiosError, InternalAxiosRequestConfig, HttpStatusCode } from 'axios';
import { RefreshTokenInterceptorOptions } from '../types';

let refreshTokenRequest: Promise<string> | null;

/**
 * Creates a response error interceptor that retries unauthorized requests after token refresh.
 *
 * @param options - {@link RefreshTokenInterceptorOptions}
 * @returns Axios response error interceptor.
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
export const onResponseRefreshTokenInterceptor =
  ({ configuration, getIsAuthenticated, runTokenRefreshRequest, onError }: RefreshTokenInterceptorOptions) => async (error: AxiosError<{ error?: string }>): Promise<unknown> => {
    if (
      error.response?.status === HttpStatusCode.Unauthorized &&
      getIsAuthenticated() &&
      error.response?.config?.url &&
      ![...configuration.unauthorizedRoutes, configuration.refreshTokenRoute, configuration.logoutRoute].includes(
        error.response.config.url,
      )
    ) {
      if (!refreshTokenRequest) {
        try {
          refreshTokenRequest = runTokenRefreshRequest();
          const token = await refreshTokenRequest;

          refreshTokenRequest = null;

          if (error.config) {
            error.config.headers.Authorization = `Bearer ${token}`;
          }

          return axios.request(error.config as InternalAxiosRequestConfig);
        } catch (e) {
          await onError(error);

          refreshTokenRequest = null;

          throw error;
        }
      } else {
        const token = await refreshTokenRequest;

        if (error.config) {
          error.config.headers.Authorization = `Bearer ${token}`;
        }

        return axios.request(error.config as InternalAxiosRequestConfig);
      }
    }

    return Promise.reject(error);
  };
