export type AuthConfiguration = {
  /** API route that performs access token refresh. */
  refreshTokenRoute: string;
  /** Public routes that skip token refresh and retry logic. */
  unauthorizedRoutes: Array<string>;
  /** Logout route excluded from token refresh logic. */
  logoutRoute: string;
};
