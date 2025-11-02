"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  className?: string;
  count?: number;
  variant?: "card" | "text" | "chart";
};

export const LoadingState = ({
  className,
  count = 1,
  variant = "card",
}: LoadingStateProps) => {
  const ariaLabel = variant === "card" 
    ? "카드 데이터 로딩 중" 
    : variant === "chart" 
    ? "차트 데이터 로딩 중" 
    : "텍스트 로딩 중";
  if (variant === "text") {
    return (
      <div 
        className={cn("space-y-2", className)} 
        role="status" 
        aria-label={ariaLabel}
        aria-live="polite"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" aria-hidden="true" />
            <div className="h-4 bg-gray-200 rounded w-1/2" aria-hidden="true" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div 
        className={cn("space-y-6", className)} 
        role="status" 
        aria-label={ariaLabel}
        aria-live="polite"
      >
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 w-full bg-gray-200 rounded" aria-hidden="true" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div 
      className={cn("space-y-4", className)} 
      role="status" 
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 w-24 bg-gray-200 rounded mb-4" aria-hidden="true" />
            <div className="h-8 w-32 bg-gray-200 rounded" aria-hidden="true" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

