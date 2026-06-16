import { InternalAxiosRequestConfig } from 'axios';

export interface TokenInterceptorOptions {
  /** Callback that returns the current access token string. */
  getToken: () => string | Promise<string>;
}

/**
 * Creates a request interceptor that sets `Authorization: Bearer <token>` header.
 *
 * @param options - {@link TokenInterceptorOptions}
 * @returns Axios request interceptor.
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
