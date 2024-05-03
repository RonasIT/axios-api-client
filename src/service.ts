// NOTE: Rule below is disabled to match Axios typings
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  Axios,
  AxiosError,
  AxiosInstance,
  AxiosInterceptorManager,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  Method
} from 'axios';
import { formDataContentTypeInterceptor, formDataInterceptor } from './interceptors/form-data';
import { ApiCall } from './types';

export class ApiService {
  public readonly post: ApiCall;

  public readonly get: ApiCall;

  public readonly patch: ApiCall;

  public readonly put: ApiCall;

  public readonly delete: ApiCall;

  public readonly httpClient: AxiosInstance;

  constructor(baseURL?: string, baseConfig?: AxiosRequestConfig) {
    const config: AxiosRequestConfig = {
      baseURL,
      withCredentials: true,
      ...baseConfig
    };

    this.httpClient = axios.create(config);

    this.post = this.request('post');
    this.get = this.request('get');
    this.patch = this.request('patch');
    this.put = this.request('put');
    this.delete = this.request('delete');

    this.useInterceptors({
      request: [[formDataContentTypeInterceptor()]]
    });

    if (typeof window !== 'undefined') {
      this.httpClient.interceptors.request.use(formDataInterceptor);
    }
  }

  public static isAxiosError<T>(error: AxiosError | any): error is AxiosError<T> {
    return error && error.isAxiosError;
  }

  public useInterceptors(interceptors: {
    request?: Array<Parameters<AxiosInterceptorManager<InternalAxiosRequestConfig>['use']>>;
    response?: Array<Parameters<AxiosInterceptorManager<AxiosResponse>['use']>>;
  }): void {
    if (interceptors?.request?.length) {
      interceptors.request.forEach((interceptorPair) => {
        this.httpClient.interceptors.request.use(...interceptorPair);
      });
    }

    if (interceptors?.response?.length) {
      interceptors.response.forEach((interceptorPair) => {
        this.httpClient.interceptors.response.use(...interceptorPair);
      });
    }
  }

  private request(method: Method, httpClient: Axios = this.httpClient): ApiCall {
    async function apiCall<T = any>(
      endpoint: string,
      data?: any,
      options?: AxiosRequestConfig & { fullResponse?: false }
    ): Promise<T>;
    async function apiCall<T = any>(
      endpoint: string,
      data?: any,
      options?: AxiosRequestConfig & { fullResponse: true }
    ): Promise<AxiosResponse<T>>;
    async function apiCall<T = any>(
      endpoint: string,
      data?: any,
      options?: AxiosRequestConfig & { fullResponse?: boolean }
    ): Promise<T | AxiosResponse<T>> {
      const payload = ['get', 'delete'].includes(method) ? { params: data } : { data };

      const result = await httpClient.request({
        method,
        url: endpoint,
        ...options,
        ...payload
      });

      return options?.fullResponse ? result : result.data;
    }

    return apiCall;
  }
}
