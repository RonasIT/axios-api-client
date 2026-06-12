import { AxiosError, HttpStatusCode } from 'axios';

/**
 * Creates a response error interceptor that invokes `onError` for non-public `401` responses.
 *
 * @param {{ publicEndpoints: Array<string>; onError: (error?: AxiosError) => void }} options - Configuration object:
 *   - publicEndpoints: Array of endpoint URLs that skip error handler on 401
 *   - onError: Callback invoked when 401 received on non-public endpoint
 * @returns {(error: AxiosError<{ error?: string }>) => Promise<never>} Axios response error interceptor.
 *
 * @example
 * apiService.useInterceptors({
 *   response: [[
 *     undefined,
 *     unauthorizedInterceptor({
 *       publicEndpoints: ['/auth/login', '/auth/register'],
 *       onError: () => {
 *         return dispatch(authApi.endpoints.logout.initiate()).unwrap();
 *       },
 *     }),
 *   ]],
 * });
 */
export const unauthorizedInterceptor =
  (options: { publicEndpoints: Array<string>; onError: (error?: AxiosError) => void }) => (error: AxiosError<{ error?: string }>): Promise<never> => {
    if (
      error.response?.status === HttpStatusCode.Unauthorized &&
      !options.publicEndpoints.includes(error.response.config.url ?? '')
    ) {
      options.onError(error);
    }

    return Promise.reject(error);
  };
