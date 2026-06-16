import { InternalAxiosRequestConfig } from 'axios';

export interface TokenInterceptorOptions {
  getToken: () => string | Promise<string>;
}

/**
 * Creates a request interceptor that sets `Authorization: Bearer <token>` header.
 *
 * @param {TokenInterceptorOptions} options - Configuration object:
 *   - getToken: Callback that returns current access token string
 * @returns {(request: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>} Axios request interceptor.
 *
 * @example
 * apiService.useInterceptors({
 *   request: [[
 *     tokenInterceptor({
 *       getToken: () => appStorageService.token.get() ?? '',
 *     }),
 *   ]],
 * });
 */
export const tokenInterceptor =
  ({ getToken }: TokenInterceptorOptions) => async (request: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await getToken();

    if (request.headers && token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
  };
