"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { StudentsResponseSchema } from "@/features/dashboard/lib/dto";

type StudentsFilters = {
  college?: string;
  department?: string;
  program_type?: string;
  academic_status?: string;
};

const fetchDashboardStudents = async (filters: StudentsFilters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.college) {
      params.append("college", filters.college);
    }
    if (filters.department) {
      params.append("department", filters.department);
    }
    if (filters.program_type) {
      params.append("program_type", filters.program_type);
    }
    if (filters.academic_status) {
      params.append("academic_status", filters.academic_status);
    }

    const url = `/api/dashboard/students${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const { data } = await apiClient.get(url);
    return StudentsResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      "Failed to fetch dashboard students."
    );
    throw new Error(message);
  }
};

export const useDashboardStudents = (filters: StudentsFilters = {}) => {
  return useQuery({
    queryKey: ["dashboard", "students", filters],
    queryFn: () => fetchDashboardStudents(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

