"use client";

import { useState } from "react";
import { useDashboardPerformance } from "@/features/dashboard/hooks/useDashboardPerformance";
import { DashboardFilter } from "@/features/dashboard/components/dashboard-filter";
import { PerformanceChart } from "@/features/dashboard/components/performance-chart";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

const FILTER_OPTIONS = [
  {
    key: "evaluation_year",
    label: "평가년도",
    options: [
      { value: "2024", label: "2024년" },
      { value: "2023", label: "2023년" },
      { value: "2022", label: "2022년" },
      { value: "2021", label: "2021년" },
    ],
  },
  {
    key: "college",
    label: "단과대학",
    options: [
      { value: "공과대학", label: "공과대학" },
      { value: "인문대학", label: "인문대학" },
      { value: "자연과학대학", label: "자연과학대학" },
    ],
  },
  {
    key: "department",
    label: "학과",
    options: [
      { value: "컴퓨터공학과", label: "컴퓨터공학과" },
      { value: "전기전자공학과", label: "전기전자공학과" },
      { value: "기계공학과", label: "기계공학과" },
    ],
  },
] as const;

type PerformancePageProps = {
  params: Promise<Record<string, never>>;
};

export default function PerformancePage({ params }: PerformancePageProps) {
  void params;
  const [filters, setFilters] = useState<{
    evaluation_year?: string;
    college?: string;
    department?: string;
  }>({});

  const filterParams = {
    evaluation_year: filters.evaluation_year
      ? Number(filters.evaluation_year)
      : undefined,
    college: filters.college,
    department: filters.department,
  };

  const { data: performance, isLoading, error } = useDashboardPerformance(filterParams);

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">실적 대시보드</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          학과별 연도별 주요 성과 지표를 확인하세요.
        </p>
      </header>

      <DashboardFilter
        filters={filters}
        filterOptions={FILTER_OPTIONS}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {isLoading && <LoadingState variant="chart" count={2} />}

      {error && (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "실적 데이터를 불러오는 중 오류가 발생했습니다."
          }
          onRetry={() => window.location.reload()}
        />
      )}

      {!isLoading &&
        !error &&
        performance &&
        performance.employment_rates?.length === 0 &&
        performance.tech_transfer_revenue?.length === 0 && (
          <EmptyState
            title="실적 데이터 없음"
            description="아직 실적 데이터가 없습니다. 데이터를 업로드해주세요."
            actionLabel="데이터 업로드"
            actionHref="/upload"
          />
        )}

      {!isLoading &&
        !error &&
        performance &&
        (performance.employment_rates?.length > 0 ||
          performance.tech_transfer_revenue?.length > 0) && (
        <PerformanceChart performance={performance} />
      )}
    </div>
  );
}

