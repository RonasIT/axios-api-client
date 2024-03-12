import { InternalAxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import { forOwn, some, values } from 'lodash';

export const formDataInterceptor = (request: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const hasFiles = some(values(request.data), (value) => value instanceof File);

  if (hasFiles && request.method && ['post', 'put'].includes(request.method)) {
    const formData = convertToFormData(request.data);

    request.data = formData;
  }

  return request;
};

const convertToFormData = (data: object): FormData => {
  const formData = new FormData();

  forOwn(data, (objectValue: unknown, objectKey) => {
    if (objectValue instanceof File) {
      formData.append(objectKey, objectValue, objectValue.name);
    } else if (typeof objectValue !== 'undefined') {
      formData.append(objectKey, objectValue as string);
    }
  });

  return formData;
};

export const formDataContentTypeInterceptor =
  () =>
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (config.data instanceof FormData && config.headers) {
      (config?.headers as RawAxiosRequestHeaders)['Content-Type'] = 'multipart/form-data';
    }

    return config;
  }; //TODO workaround https://github.com/axios/axios/issues/4823#issuecomment-1257921875
