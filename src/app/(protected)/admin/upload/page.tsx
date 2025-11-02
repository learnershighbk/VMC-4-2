"use client";

import { useState, useCallback } from "react";
import { useUploadFile, type DataType } from "@/features/data-upload/hooks/useUploadFile";
import { useUploadLogs } from "@/features/data-upload/hooks/useUploadLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/ui/loading-state";
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type UploadPageProps = {
  params: Promise<Record<string, never>>;
};

const DATA_TYPE_OPTIONS: { value: DataType; label: string }[] = [
  { value: "kpi", label: "KPI (실적)" },
  { value: "publication", label: "논문" },
  { value: "project", label: "연구과제" },
  { value: "student", label: "학생" },
];

export default function UploadPage({ params }: UploadPageProps) {
  void params;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<DataType | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useUploadFile();
  const { data: uploadLogs, isLoading: logsLoading } = useUploadLogs({
    page: 1,
    page_size: 20,
  });

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".csv")) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".csv")) {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !dataType) {
      return;
    }

    try {
      setUploadProgress(0);
      await uploadMutation.mutateAsync({
        file: selectedFile,
        data_type: dataType,
        onProgress: setUploadProgress,
      });

      setSelectedFile(null);
      setUploadProgress(0);
      setDataType(null);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const canUpload = selectedFile && dataType && !uploadMutation.isPending;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">데이터 업로드</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          CSV 파일을 업로드하여 대시보드 데이터를 업데이트하세요.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>파일 업로드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data-type">데이터 유형</Label>
              <Select
                value={dataType || ""}
                onValueChange={(value) => setDataType(value as DataType)}
              >
                <SelectTrigger id="data-type">
                  <SelectValue placeholder="데이터 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className={`relative flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-slate-300 bg-slate-50 hover:border-slate-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="CSV 파일 선택"
              />
              <Upload className="mb-4 h-12 w-12 text-slate-400" />
              <p className="mb-2 text-sm font-medium text-slate-700">
                파일을 드래그하여 여기에 놓거나 클릭하여 선택
              </p>
              <p className="text-xs text-slate-500">CSV 파일만 업로드 가능합니다</p>
              {selectedFile && (
                <div className="mt-4 flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{selectedFile.name}</span>
                  <span className="text-xs text-slate-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>

            {uploadMutation.isPending && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>업로드 중...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {uploadMutation.isSuccess && (
              <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">업로드 완료</span>
                </div>
                <p className="text-sm text-green-600">
                  {uploadMutation.data.success_rows}개 행이 성공적으로 처리되었습니다.
                </p>
                {uploadMutation.data.failed_rows > 0 && (
                  <p className="text-sm text-amber-600">
                    {uploadMutation.data.failed_rows}개 행 처리 실패
                  </p>
                )}
              </div>
            )}

            {uploadMutation.isError && (
              <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">업로드 실패</span>
                </div>
                <p className="text-sm text-red-600">
                  {uploadMutation.error instanceof Error
                    ? uploadMutation.error.message
                    : "알 수 없는 오류가 발생했습니다."}
                </p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!canUpload}
              className="w-full"
              size="lg"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                "업로드"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>업로드 이력</CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <LoadingState variant="text" count={5} />
            ) : uploadLogs && uploadLogs.results.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>파일명</TableHead>
                      <TableHead>데이터 유형</TableHead>
                      <TableHead>성공/실패</TableHead>
                      <TableHead>업로드일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadLogs.results.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.file_name}</TableCell>
                        <TableCell>
                          {DATA_TYPE_OPTIONS.find((opt) => opt.value === log.data_type)?.label ||
                            log.data_type}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">{log.success_rows}</span>
                            <span className="text-slate-400">/</span>
                            <span className="text-red-600">{log.failed_rows}</span>
                            <span className="text-slate-400">
                              ({log.total_rows})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(log.created_at), "yyyy-MM-dd HH:mm", {
                            locale: ko,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                업로드 이력이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

