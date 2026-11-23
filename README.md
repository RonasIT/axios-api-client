# axios-api-client

Wrapper utilities for interaction with REST APIs using [Axios](https://axios-http.com/).

## Getting started

1. Install the package:

```
npm i @ronas-it/axios-api-client
```

The package requires `axios` `^1.20.0` (1.20.0 or later 1.x) as a peer dependency.

2. Create API service instance:

```ts
import { ApiService } from '@ronas-it/axios-api-client';
import { configuration } from './configuration';

export const apiService = new ApiService(configuration.apiURL);
```

## Usage

```ts
import {
  ApiService,
  AuthConfiguration,
  RefreshTokenInterceptorOptions,
  tokenInterceptor,
  onResponseRefreshTokenInterceptor,
  onRequestRefreshTokenInterceptor,
  unauthorizedInterceptor,
} from '@ronas-it/axios-api-client';

const configuration: { apiURL: string; auth: AuthConfiguration } = {
  apiURL: 'https://api.your-app.dev',
  auth: {
    refreshTokenRoute: '/auth/refresh',
    unauthorizedRoutes: ['/auth/forgot-password', '/auth/restore-password'],
    logoutRoute: '/logout',
  },
};

const apiService = new ApiService(configuration.apiURL);

const options: RefreshTokenInterceptorOptions = {
  configuration: configuration.auth,
  getIsAuthenticated: () => {
    /* get isAuthenticated state here */
    return false;
  },
  runTokenRefreshRequest: async () => {
    // The refresh request must go to exactly `refreshTokenRoute`, otherwise protected requests hang forever.
    const { token, ttl } = await apiService.get(configuration.auth.refreshTokenRoute);
    /* do something with token and ttl */

    return token;
  },
  onError: () => apiService.post('/logout'),
};

apiService.useInterceptors({
  request: [
    [onRequestRefreshTokenInterceptor(options)],
    [
      tokenInterceptor({
        getToken: () => {
          /* get token here */
          return '';
        },
      }),
    ],
  ],
  response: [
    [null, onResponseRefreshTokenInterceptor(options)],
    [
      null,
      unauthorizedInterceptor({
        publicEndpoints: configuration.auth.unauthorizedRoutes,
        onError: () => apiService.post('/logout'),
      }),
    ],
  ],
});
```
