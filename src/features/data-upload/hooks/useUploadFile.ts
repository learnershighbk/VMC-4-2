"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";

export type DataType = "kpi" | "publication" | "project" | "student";

export type UploadResponse = {
  status: "success" | "partial";
  message: string;
  upload_id: string | null;
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  errors: Array<{
    row: number;
    reason: string;
  }>;
};

type UploadParams = {
  file: File;
  data_type: DataType;
  onProgress?: (progress: number) => void;
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, data_type, onProgress }: UploadParams): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("data_type", data_type);

      try {
        const response = await apiClient.post<UploadResponse>("/api/data/upload/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total !== undefined && onProgress) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        });

        return response.data;
      } catch (error) {
        const message = extractApiErrorMessage(error, "파일 업로드에 실패했습니다.");
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upload-logs"] });
    },
  });
};

