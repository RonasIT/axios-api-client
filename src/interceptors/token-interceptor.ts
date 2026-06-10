import { InternalAxiosRequestConfig } from 'axios';

export interface TokenInterceptorOptions {
  getToken: () => string | Promise<string>;
}

export const tokenInterceptor =
  ({ getToken }: TokenInterceptorOptions) => async (request: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await getToken();

    if (request.headers && token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
  };
