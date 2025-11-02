"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDashboardBudget } from "@/features/dashboard/hooks/useDashboardBudget";
import { DashboardFilter } from "@/features/dashboard/components/dashboard-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type BudgetPageProps = {
  params: Promise<Record<string, never>>;
};

const INSTITUTION_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const FILTER_OPTIONS = [
  {
    key: "department",
    label: "학과",
    options: [
      { value: "컴퓨터공학과", label: "컴퓨터공학과" },
      { value: "전기전자공학과", label: "전기전자공학과" },
      { value: "기계공학과", label: "기계공학과" },
    ],
  },
  {
    key: "funding_agency",
    label: "지원기관",
    options: [
      { value: "과학기술정보통신부", label: "과학기술정보통신부" },
      { value: "교육부", label: "교육부" },
      { value: "산업통상자원부", label: "산업통상자원부" },
    ],
  },
] as const;

export default function BudgetPage({ params }: BudgetPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<{
    department?: string;
    funding_agency?: string;
    start_date?: string;
    end_date?: string;
  }>({
    department: searchParams.get("department") || undefined,
    funding_agency: searchParams.get("funding_agency") || undefined,
    start_date: searchParams.get("start_date") || undefined,
    end_date: searchParams.get("end_date") || undefined,
  });

  const filterParams = {
    department: filters.department,
    funding_agency: filters.funding_agency,
    start_date: filters.start_date,
    end_date: filters.end_date,
  };

  const { data: budget, isLoading, error } = useDashboardBudget(filterParams);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.department) params.set("department", filters.department);
    if (filters.funding_agency) params.set("funding_agency", filters.funding_agency);
    if (filters.start_date) params.set("start_date", filters.start_date);
    if (filters.end_date) params.set("end_date", filters.end_date);
    
    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({});
  };

  const hasData =
    budget &&
    (budget.project_execution_rates?.length > 0 ||
      budget.funding_agency_distribution?.length > 0 ||
      budget.research_budget_execution?.length > 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">예산 대시보드</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          연구과제별 예산 집행 현황 및 지원기관별 분포를 확인하세요.
        </p>
      </header>

      <DashboardFilter
        filters={filters}
        filterOptions={FILTER_OPTIONS}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {isLoading && <LoadingState variant="chart" count={3} />}

      {error && (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "예산 데이터를 불러오는 중 오류가 발생했습니다."
          }
          onRetry={() => window.location.reload()}
        />
      )}

      {!isLoading && !error && !hasData && (
        <EmptyState
          title="예산 데이터 없음"
          description="아직 예산 데이터가 없습니다. 데이터를 업로드해주세요."
          actionLabel="데이터 업로드"
          actionHref="/upload"
        />
      )}

      {!isLoading && !error && budget && hasData && (
        <div className="space-y-6">
          {/* 과제별 예산 집행률 */}
          {budget.project_execution_rates?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>과제별 예산 집행률</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
                  <BarChart
                    data={budget.project_execution_rates}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 100, bottom: 5 }}
                    className="text-xs sm:text-sm"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis
                      dataKey="project_name"
                      type="category"
                      width={120}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: number) => `${value}%`}
                      labelFormatter={(label) => `과제: ${label}`}
                    />
                    <Bar
                      dataKey="execution_rate"
                      fill="#10b981"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 지원기관별 분포 */}
          {budget.funding_agency_distribution?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>지원기관별 예산 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
                  <PieChart>
                    <Pie
                      data={budget.funding_agency_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ funding_agency, total_budget, percent }) =>
                        `${funding_agency}: ${total_budget.toLocaleString()}원 (${(Number(percent) * 100).toFixed(1)}%)`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="total_budget"
                    >
                      {budget.funding_agency_distribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={INSTITUTION_COLORS[index % INSTITUTION_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 집행 추이 */}
          {budget.research_budget_execution?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>일별 예산 집행 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
                  <LineChart
                    data={budget.research_budget_execution}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    className="text-xs sm:text-sm"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="execution_date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="executed_amount"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="집행액"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

