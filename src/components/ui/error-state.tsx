"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  className?: string;
  retryLabel?: string;
};

export const ErrorState = ({
  message = "데이터를 불러오는 중 오류가 발생했습니다.",
  onRetry,
  className,
  retryLabel = "재시도",
}: ErrorStateProps) => {
  return (
    <Card
      className={cn(
        "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <AlertCircle 
            className="h-6 w-6 shrink-0 text-red-600 dark:text-red-400" 
            aria-hidden="true"
          />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              오류 발생
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80">
              {message}
            </p>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="shrink-0 border-red-300 text-red-600 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
              aria-label={`${retryLabel} 버튼`}
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              {retryLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

