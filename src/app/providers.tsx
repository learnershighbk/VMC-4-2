// In Next.js, this file would be called: app/providers.tsx
"use client";

// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import {
  isServer,
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { extractApiErrorMessage } from "@/lib/remote/api-client";
import { toast } from "@/hooks/use-toast";

function makeQueryClient() {
  const queryCache = new QueryCache({
    onError: (error) => {
      const message = extractApiErrorMessage(error, "데이터를 불러오는 중 오류가 발생했습니다.");
      toast({
        title: "오류 발생",
        description: message,
        variant: "destructive",
      });
    },
  });

  const mutationCache = new MutationCache({
    onError: (error) => {
      const message = extractApiErrorMessage(error, "요청 처리 중 오류가 발생했습니다.");
      toast({
        title: "오류 발생",
        description: message,
        variant: "destructive",
      });
    },
  });

  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          const axiosError = error as { response?: { status?: number } };
          const status = axiosError?.response?.status;

          if (status === 401 || status === 403) {
            return false;
          }

          if (status === 404) {
            return false;
          }

          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      forcedTheme="light"
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
