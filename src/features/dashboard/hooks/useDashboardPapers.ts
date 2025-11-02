"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { PapersResponseSchema } from "@/features/dashboard/lib/dto";

type PapersFilters = {
  college?: string;
  department?: string;
  journal_grade?: "SCIE" | "KCI" | "일반";
  start_date?: string;
  end_date?: string;
};

const fetchDashboardPapers = async (filters: PapersFilters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.college) {
      params.append("college", filters.college);
    }
    if (filters.department) {
      params.append("department", filters.department);
    }
    if (filters.journal_grade) {
      params.append("journal_grade", filters.journal_grade);
    }
    if (filters.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters.end_date) {
      params.append("end_date", filters.end_date);
    }

    const url = `/api/dashboard/papers${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const { data } = await apiClient.get(url);
    return PapersResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      "Failed to fetch dashboard papers."
    );
    throw new Error(message);
  }
};

export const useDashboardPapers = (filters: PapersFilters = {}) => {
  return useQuery({
    queryKey: ["dashboard", "papers", filters],
    queryFn: () => fetchDashboardPapers(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

