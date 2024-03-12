import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { SessionExpiryRefreshInterceptorArgs } from '../interfaces';

let refreshTokenRequest: Promise<string> | null;

export const onResponseSessionExpiryRefreshInterceptor =
  ({ configuration, getIsAuthenticated, runTokenRefreshRequest, onError }: SessionExpiryRefreshInterceptorArgs) =>
  async (error: AxiosError<{ error?: string }>): Promise<unknown> => {
    if (
      error.response?.status === StatusCodes.UNAUTHORIZED &&
      getIsAuthenticated() &&
      error.response?.config?.url &&
      ![...configuration.unauthorizedRoutes, configuration.refreshTokenRoute, configuration.logoutRoute].includes(
        error.response.config.url
      )
    ) {
      if (!refreshTokenRequest) {
        try {
          refreshTokenRequest = runTokenRefreshRequest();
          const token = await refreshTokenRequest;

          refreshTokenRequest = null;

          if (error.config) {
            error.config.headers.Authorization = `Bearer ${token}`;
          }

          return axios.request(error.config as InternalAxiosRequestConfig);
        } catch (e) {
          await onError(error);

          refreshTokenRequest = null;

          throw error;
        }
      } else {
        const token = await refreshTokenRequest;

        if (error.config) {
          error.config.headers.Authorization = `Bearer ${token}`;
        }

        return axios.request(error.config as InternalAxiosRequestConfig);
      }
    }

    return Promise.reject(error);
  };
