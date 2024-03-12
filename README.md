# axios-api-client

Wrapper utilities for interaction with REST APIs using [Axios](https://axios-http.com/).

## Getting started

1. Install the package:

```
@ronas-it/axios-api-client
```

2. Set the defaults for your API in the root layout (`your-app/app/_layout.tsx` for example):

```ts
import 'reflect-metadata';

import { apiService } from '@ronas-it/axios-api-client';
import { store } from '@your-app/mobile/shared/data-access/store';
import { Stack } from 'expo-router';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';

export { ErrorBoundary } from 'expo-router';

apiService.httpClient.defaults.baseURL = 'https://api.your-app.com';

export default function RootLayout(): ReactElement | null {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        <Stack.Screen name='(main)' options={{ headerShown: false }} />
        {/* Your app screens */}
      </Stack>
    </Provider>
  );
}
```

## Usage

You can use this library to create your custom API:

```ts
import { axiosBaseQuery, createAppApi } from '@ronas-it/axios-api-client';

export const authApi = createAppApi({
  reducerPath: 'auth',
  baseQuery: axiosBaseQuery,
  endpoints: (builder) => ({
    // Add your endpoints here
  })
});
```

Use `onResponseSessionExpiryRefreshInterceptor` and `onRequestSessionExpiryRefreshInterceptor` to add token refreshing flow to your app:

```ts
import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  apiService,
  SessionExpiryRefreshInterceptorArgs,
  onResponseSessionExpiryRefreshInterceptor,
  onRequestSessionExpiryRefreshInterceptor
} from '@ronas-it/axios-api-client';
import { authApi } from '@your-app/mobile/shared/data-access/api';
import { configuration } from '@your-app/mobile/shared/data-access/api-client';
import { authActions, authSelectors } from './slice';
import type { AppState } from '@your-app/mobile/shared/data-access/store';

export const authListenerMiddleware = createListenerMiddleware<AppState>();

authListenerMiddleware.startListening({
  matcher: authApi.internalActions.middlewareRegistered.match,
  effect: async (_, { dispatch, getState }) => {
    const options: SessionExpiryRefreshInterceptorArgs = {
      configuration: configuration.auth,
      getIsAuthenticated: () => authSelectors.isAuthenticated(getState()),
      getSessionExpiry: () => authSelectors.tokenExpires(getState()),
      runTokenRefreshRequest: async () => {
        const { token, ttl } = await dispatch(authApi.endpoints.refreshToken.initiate()).unwrap();
        dispatch(authActions.saveToken({ token, ttl }));

        return token;
      },
      onError: () => {
        return dispatch(authApi.endpoints.logout.initiate()).unwrap();
      }
    };

    apiService.useInterceptors({
      request: [[onRequestSessionExpiryRefreshInterceptor(options)]],
      response: [[null, onResponseSessionExpiryRefreshInterceptor(options)]]
    });
  }
});
```

## TODOs

1. Extend Readme
2. Add code documentation and examples
3. Remove `@reduxjs/toolkit` and `@ronas-it/rtkq-entity-api` from devDependencies
