import { InternalAxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';

/**
 * Converts request payload to `FormData` when payload contains `File` values.
 *
 * @param {InternalAxiosRequestConfig} request - Axios request config.
 * @returns {InternalAxiosRequestConfig} Updated request config.
 */
export const formDataInterceptor = (request: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const hasFiles = Object.values(request.data ?? {}).some((value) => value instanceof File);

  if (hasFiles && request.method && ['post', 'put'].includes(request.method)) {
    const formData = convertToFormData(request.data);

    request.data = formData;
  }

  return request;
};

const convertToFormData = (data: object): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([objectKey, objectValue]) => {
    if (objectValue instanceof File) {
      formData.append(objectKey, objectValue, objectValue.name);
    } else if (typeof objectValue !== 'undefined') {
      formData.append(objectKey, objectValue as string);
    }
  });

  return formData;
};

/**
 * Creates request interceptor that sets `Content-Type` for `FormData` payloads.
 *
 * @returns {(config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig} Axios request interceptor.
 */
export const formDataContentTypeInterceptor =
  () => (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (config.data instanceof FormData && config.headers) {
      (config?.headers as RawAxiosRequestHeaders)['Content-Type'] = 'multipart/form-data';
    }

    return config;
  }; //TODO workaround https://github.com/axios/axios/issues/4823#issuecomment-1257921875
