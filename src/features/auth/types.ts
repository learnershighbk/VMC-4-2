export type CurrentUser = {
  id: string;
  username?: string;
  email: string | null;
  isAdmin?: boolean;
  appMetadata: Record<string, unknown>;
  userMetadata: Record<string, unknown>;
};

export type CurrentUserSnapshot =
  | { status: "authenticated"; user: CurrentUser }
  | { status: "unauthenticated"; user: null }
  | { status: "loading"; user: CurrentUser | null };

export type CurrentUserContextValue = CurrentUserSnapshot & {
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
};
