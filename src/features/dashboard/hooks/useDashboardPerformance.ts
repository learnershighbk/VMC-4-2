"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { PerformanceResponseSchema } from "@/features/dashboard/lib/dto";

type PerformanceFilters = {
  evaluation_year?: number;
  college?: string;
  department?: string;
};

const fetchDashboardPerformance = async (
  filters: PerformanceFilters = {}
) => {
  try {
    const params = new URLSearchParams();
    if (filters.evaluation_year) {
      params.append("evaluation_year", filters.evaluation_year.toString());
    }
    if (filters.college) {
      params.append("college", filters.college);
    }
    if (filters.department) {
      params.append("department", filters.department);
    }

    const url = `/api/dashboard/performance/${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const { data } = await apiClient.get(url);
    return PerformanceResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      "Failed to fetch dashboard performance."
    );
    throw new Error(message);
  }
};

export const useDashboardPerformance = (filters: PerformanceFilters = {}) =>
  useQuery({
    queryKey: ["dashboard", "performance", filters],
    queryFn: () => fetchDashboardPerformance(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

