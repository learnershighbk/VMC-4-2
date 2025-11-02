"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import { OverviewResponseSchema } from "@/features/dashboard/lib/dto";

const fetchDashboardOverview = async () => {
  try {
    const { data } = await apiClient.get("/api/dashboard/overview/");
    return OverviewResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      "Failed to fetch dashboard overview."
    );
    throw new Error(message);
  }
};

export const useDashboardOverview = () =>
  useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchDashboardOverview,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

