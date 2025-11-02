"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDashboardPapers } from "@/features/dashboard/hooks/useDashboardPapers";
import { DashboardFilter } from "@/features/dashboard/components/dashboard-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type PapersPageProps = {
  params: Promise<Record<string, never>>;
};

const COLORS = {
  SCIE: "#ef4444",
  KCI: "#3b82f6",
  일반: "#94a3b8",
};

const FILTER_OPTIONS = [
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
  {
    key: "journal_grade",
    label: "저널 등급",
    options: [
      { value: "SCIE", label: "SCIE" },
      { value: "KCI", label: "KCI" },
      { value: "일반", label: "일반" },
    ],
  },
] as const;

export default function PapersPage({ params }: PapersPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<{
    college?: string;
    department?: string;
    journal_grade?: string;
    start_date?: string;
    end_date?: string;
  }>({
    college: searchParams.get("college") || undefined,
    department: searchParams.get("department") || undefined,
    journal_grade: searchParams.get("journal_grade") || undefined,
    start_date: searchParams.get("start_date") || undefined,
    end_date: searchParams.get("end_date") || undefined,
  });

  const filterParams = {
    college: filters.college,
    department: filters.department,
    journal_grade: filters.journal_grade as "SCIE" | "KCI" | "일반" | undefined,
    start_date: filters.start_date,
    end_date: filters.end_date,
  };

  const { data: papers, isLoading, error } = useDashboardPapers(filterParams);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.college) params.set("college", filters.college);
    if (filters.department) params.set("department", filters.department);
    if (filters.journal_grade) params.set("journal_grade", filters.journal_grade);
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
    papers &&
    (papers.journal_grade_distribution?.length > 0 ||
      papers.publication_by_department?.length > 0 ||
      papers.publication_trend?.length > 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">논문 대시보드</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          저널 등급별 논문 분포 및 학과별 논문 게재 현황을 확인하세요.
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
              : "논문 데이터를 불러오는 중 오류가 발생했습니다."
          }
          onRetry={() => window.location.reload()}
        />
      )}

      {!isLoading && !error && !hasData && (
        <EmptyState
          title="논문 데이터 없음"
          description="아직 논문 데이터가 없습니다. 데이터를 업로드해주세요."
          actionLabel="데이터 업로드"
          actionHref="/upload"
        />
      )}

      {!isLoading && !error && papers && hasData && (
        <div className="space-y-6">
          {/* 저널 등급별 분포 */}
          {papers.journal_grade_distribution?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>저널 등급별 논문 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
                  <PieChart>
                    <Pie
                      data={papers.journal_grade_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ journal_grade, count, percent }) =>
                        `${journal_grade}: ${count}건 (${(percent * 100).toFixed(1)}%)`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {papers.journal_grade_distribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.journal_grade]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 학과별 논문 게재 수 */}
          {papers.publication_by_department?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>학과별 논문 게재 수</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
                  <BarChart
                    data={papers.publication_by_department}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    className="text-xs sm:text-sm"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value}건`} />
                    <Legend />
                    <Bar
                      dataKey="paper_count"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 논문 게재 추이 */}
          {papers.publication_trend?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>월별 논문 게재 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
                  <LineChart
                    data={papers.publication_trend.map((item) => ({
                      ...item,
                      label: `${item.year}-${String(item.month).padStart(2, "0")}`,
                    }))}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    className="text-xs sm:text-sm"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value}건`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="논문 수"
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

