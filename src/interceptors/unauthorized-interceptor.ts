import { AxiosError, HttpStatusCode } from 'axios';

export interface UnauthorizedInterceptorOptions {
  /** Endpoint URLs that skip the error handler on 401. */
  publicEndpoints: Array<string>;
  /** Callback invoked when a 401 is received on a non-public endpoint. */
  onError: (error?: AxiosError) => void;
}

/**
 * Creates a response error interceptor that invokes `onError` for non-public `401` responses.
 *
 * @param options - {@link UnauthorizedInterceptorOptions}
 * @returns Axios response error interceptor.
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
  (options: UnauthorizedInterceptorOptions) => (error: AxiosError<{ error?: string }>): Promise<never> => {
    if (
      error.response?.status === HttpStatusCode.Unauthorized &&
      !options.publicEndpoints.includes(error.response.config.url ?? '')
    ) {
      options.onError(error);
    }

    return Promise.reject(error);
  };
