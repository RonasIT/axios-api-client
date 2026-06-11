import { InternalAxiosRequestConfig } from 'axios';

export interface TokenInterceptorOptions {
  getToken: () => string;
}

/**
 * Creates a request interceptor that sets `Authorization: Bearer <token>` header.
 *
 * @param {TokenInterceptorOptions} options - Interceptor options.
 * @returns {(request: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>} Axios request interceptor.
 */
export const tokenInterceptor =
  ({ getToken }: TokenInterceptorOptions) => async (request: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = getToken();

    if (request.headers && token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
  };
