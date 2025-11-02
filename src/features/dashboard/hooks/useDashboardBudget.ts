"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { BudgetResponseSchema } from "@/features/dashboard/lib/dto";

type BudgetFilters = {
  department?: string;
  funding_agency?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
};

const fetchDashboardBudget = async (filters: BudgetFilters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.department) {
      params.append("department", filters.department);
    }
    if (filters.funding_agency) {
      params.append("funding_agency", filters.funding_agency);
    }
    if (filters.status) {
      params.append("status", filters.status);
    }
    if (filters.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters.end_date) {
      params.append("end_date", filters.end_date);
    }

    const url = `/api/dashboard/budget${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const { data } = await apiClient.get(url);
    return BudgetResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      "Failed to fetch dashboard budget."
    );
    throw new Error(message);
  }
};

export const useDashboardBudget = (filters: BudgetFilters = {}) => {
  return useQuery({
    queryKey: ["dashboard", "budget", filters],
    queryFn: () => fetchDashboardBudget(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

