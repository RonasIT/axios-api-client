import axios, { AxiosError, InternalAxiosRequestConfig, HttpStatusCode } from 'axios';
import { RefreshTokenOptions } from '../types';

let refreshTokenRequest: Promise<string> | null;

export const onResponseRefreshToken =
  ({ configuration, getIsAuthenticated, runTokenRefreshRequest, onError }: RefreshTokenOptions) =>
  async (error: AxiosError<{ error?: string }>): Promise<unknown> => {
    if (
      error.response?.status === HttpStatusCode.Unauthorized &&
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
