import { AxiosError, HttpStatusCode } from 'axios';

/**
 * Creates a response error interceptor that invokes `onError` for non-public `401` responses.
 *
 * @param {{ publicEndpoints: Array<string>; onError: (error?: AxiosError) => void }} options - Unauthorized handler options.
 * @returns {(error: AxiosError<{ error?: string }>) => Promise<never>} Axios response error interceptor.
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
