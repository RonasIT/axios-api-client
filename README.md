# axios-api-client

Wrapper utilities for interaction with REST APIs using [Axios](https://axios-http.com/).

## Getting started

1. Install the package:

```
npm i @ronas-it/axios-api-client
```

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
} from '@ronas-it/axios-api-client';

const configuration: AuthConfiguration = {
  apiURL: 'https://api.your-app.dev',
  auth: {
    refreshTokenRoute: '/auth/refresh',
    unauthorizedRoutes: ['/auth/forgot-password', '/auth/restore-password'],
    logoutRoute: '/logout',
  },
};

const apiService = new ApiService(configuration.apiURL);

const options: RefreshTokenOptions = {
  configuration: configuration.auth,
  getIsAuthenticated: () => {
    /* get isAuthenticated state here */
  },
  runTokenRefreshRequest: async () => {
    const { token, ttl } = await apiService.get('/refresh');
    /* do something with token and ttl */

    return token;
  },
  onError: () => apiService.post('/logout'),
};

apiService.useInterceptors({
  request: [
    [
      tokenInterceptor({
        getToken: () => {
          /* get token here */
        },
      }),
    ],
  ],
});

apiService.useInterceptors({
  request: [[onRequestRefreshToken(options)]],
  response: [
    [null, onResponseRefreshToken(options)],
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
