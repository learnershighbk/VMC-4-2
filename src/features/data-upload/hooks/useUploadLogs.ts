"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";

export type UploadLog = {
  id: string;
  file_name: string;
  data_type: "kpi" | "publication" | "project" | "student";
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  uploaded_by: {
    id: string;
    username: string;
  };
  created_at: string;
};

type UploadLogsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: UploadLog[];
};

type UploadLogsParams = {
  page?: number;
  page_size?: number;
  data_type?: string;
};

const fetchUploadLogs = async (params: UploadLogsParams = {}): Promise<UploadLogsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params.page_size) {
      queryParams.append("page_size", params.page_size.toString());
    }
    if (params.data_type) {
      queryParams.append("data_type", params.data_type);
    }

    const url = `/api/data/upload-logs/${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const { data } = await apiClient.get<UploadLogsResponse>(url);
    return data;
  } catch (error) {
    const message = extractApiErrorMessage(error, "업로드 이력을 불러오는 데 실패했습니다.");
    throw new Error(message);
  }
};

export const useUploadLogs = (params: UploadLogsParams = {}) => {
  return useQuery({
    queryKey: ["upload-logs", params],
    queryFn: () => fetchUploadLogs(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

