import { AxiosRequestConfig, AxiosResponse } from 'axios';

type DataOnly = <T = any>(
  endpoint: string,
  data?: any,
  options?: AxiosRequestConfig & { fullResponse?: false },
) => Promise<T>;

type FullResponse = <T = any>(
  endpoint: string,
  data?: any,
  options?: AxiosRequestConfig & { fullResponse: true },
) => Promise<AxiosResponse<T>>;

export type ApiCall = DataOnly & FullResponse;
