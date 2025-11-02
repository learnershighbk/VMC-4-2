"use client";

import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { useDashboardOverview } from "../useDashboardOverview";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const mockOverviewResponse = {
  data: {
    performance: {
      label: "실적",
      value: 85.5,
      unit: "%",
      trend: "up",
    },
    papers: {
      label: "논문",
      value: 125,
      unit: "건",
      trend: "up",
    },
    students: {
      label: "학생",
      value: 1400,
      unit: "명",
      trend: "stable",
    },
    budget: {
      label: "예산",
      value: 85.2,
      unit: "%",
      trend: "up",
    },
  },
};

const server = setupServer(
  http.get(`${API_BASE_URL}/api/dashboard/overview/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { detail: "Authentication credentials were not provided." },
        { status: 401 }
      );
    }

    return HttpResponse.json(mockOverviewResponse.data);
  })
);

beforeEach(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';

  return Wrapper;
};

describe("useDashboardOverview", () => {
  it("성공적으로 데이터를 가져와야 함", async () => {
    // Mock API client
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    vi.spyOn(require("@/lib/remote/api-client"), "apiClient").mockImplementation(() => ({
      get: async (url: string) => {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          headers: {
            Authorization: "Bearer mock-token",
          },
        });
        return { data: await response.json() };
      },
    }));

    const { result } = renderHook(() => useDashboardOverview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.performance).toBeDefined();
    expect(result.current.data?.papers).toBeDefined();
    expect(result.current.data?.students).toBeDefined();
    expect(result.current.data?.budget).toBeDefined();
  });

  it("에러 발생 시 에러 상태를 반환해야 함", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/dashboard/overview/`, () => {
        return HttpResponse.json({ detail: "Internal Server Error" }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useDashboardOverview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it("인증 실패 시 에러를 반환해야 함", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/dashboard/overview/`, () => {
        return HttpResponse.json(
          { detail: "Authentication credentials were not provided." },
          { status: 401 }
        );
      })
    );

    const { result } = renderHook(() => useDashboardOverview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
