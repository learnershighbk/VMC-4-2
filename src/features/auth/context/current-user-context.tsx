"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUserFromApi } from "../hooks/useCurrentUserFromApi";
import type {
  CurrentUserContextValue,
  CurrentUserSnapshot,
} from "../types";

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

type CurrentUserProviderProps = {
  children: ReactNode;
};

export const CurrentUserProvider = ({
  children,
}: CurrentUserProviderProps) => {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useCurrentUserFromApi();

  const snapshot: CurrentUserSnapshot = useMemo(() => {
    if (isLoading) {
      return { status: "loading", user: null };
    }

    return data ?? { status: "unauthenticated", user: null };
  }, [data, isLoading]);

  const refresh = useCallback(async () => {
    await refetch();
    const result = queryClient.getQueryData<CurrentUserSnapshot>([
      "currentUser",
    ]);
    return;
  }, [queryClient, refetch]);

  const value = useMemo<CurrentUserContextValue>(() => {
    return {
      ...snapshot,
      refresh,
      isAuthenticated: snapshot.status === "authenticated",
      isLoading: snapshot.status === "loading",
    };
  }, [refresh, snapshot]);

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUserContext = () => {
  const value = useContext(CurrentUserContext);

  if (!value) {
    throw new Error("CurrentUserProvider가 트리 상단에 필요합니다.");
  }

  return value;
};
