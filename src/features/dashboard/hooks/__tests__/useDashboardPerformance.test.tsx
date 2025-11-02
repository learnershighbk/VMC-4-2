"use client";

import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { useDashboardPerformance } from "../useDashboardPerformance";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const mockPerformanceResponse = {
  data: {
    employment_rates: [
      {
        department: "컴퓨터공학과",
        college: "공과대학",
        employment_rate: 85.5,
        evaluation_year: 2024,
      },
      {
        department: "전기공학과",
        college: "공과대학",
        employment_rate: 80.0,
        evaluation_year: 2024,
      },
    ],
    tech_transfer_revenue: [
      {
        evaluation_year: 2024,
        department: "컴퓨터공학과",
        revenue: 5.2,
      },
    ],
    faculty_status: [
      {
        department: "컴퓨터공학과",
        fulltime_count: 10,
        visiting_count: 2,
      },
    ],
    intl_conference_count: [
      {
        evaluation_year: 2024,
        department: "컴퓨터공학과",
        count: 3,
      },
    ],
  },
};

const server = setupServer(
  http.get(`${API_BASE_URL}/api/dashboard/performance/`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { detail: "Authentication credentials were not provided." },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const evaluationYear = url.searchParams.get("evaluation_year");
    const college = url.searchParams.get("college");
    const department = url.searchParams.get("department");

    return HttpResponse.json(mockPerformanceResponse.data);
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

describe("useDashboardPerformance", () => {
  it("성공적으로 데이터를 가져와야 함", async () => {
    // Mock API client to set auth header
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

    const { result } = renderHook(
      () => useDashboardPerformance({ evaluation_year: 2024 }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.employment_rates).toHaveLength(2);
  });

  it("필터가 변경되면 쿼리 키가 업데이트되어야 함", async () => {
    const { result, rerender } = renderHook(
      ({ filters }: { filters: { evaluation_year?: number } }) =>
        useDashboardPerformance(filters),
      {
        wrapper: createWrapper(),
        initialProps: { filters: { evaluation_year: 2024 } },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    rerender({ filters: { evaluation_year: 2023 } });

    // 쿼리 키가 변경되어 새로운 요청이 발생해야 함
    await waitFor(() => {
      expect(result.current.isFetching).toBe(true);
    });
  });

  it("에러 발생 시 에러 상태를 반환해야 함", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/dashboard/performance/`, () => {
        return HttpResponse.json({ detail: "Internal Server Error" }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useDashboardPerformance(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
