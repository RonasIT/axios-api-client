import { InternalAxiosRequestConfig } from 'axios';
import { TokenInterceptorOptions } from '../interfaces';

export const tokenInterceptor =
  ({ getToken }: TokenInterceptorOptions) =>
  async (request: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = getToken();

    if (request.headers && token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
  };
