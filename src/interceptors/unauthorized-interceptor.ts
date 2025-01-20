import { AxiosError, HttpStatusCode } from 'axios';

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
