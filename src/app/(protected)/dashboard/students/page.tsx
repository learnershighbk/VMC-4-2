"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDashboardStudents } from "@/features/dashboard/hooks/useDashboardStudents";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type StudentsPageProps = {
  params: Promise<Record<string, never>>;
};

const STATUS_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

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
    key: "program_type",
    label: "과정구분",
    options: [
      { value: "학사", label: "학사" },
      { value: "석사", label: "석사" },
      { value: "박사", label: "박사" },
    ],
  },
  {
    key: "academic_status",
    label: "학적상태",
    options: [
      { value: "재학", label: "재학" },
      { value: "휴학", label: "휴학" },
      { value: "졸업", label: "졸업" },
      { value: "제적", label: "제적" },
    ],
  },
] as const;

export default function StudentsPage({ params }: StudentsPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<{
    college?: string;
    department?: string;
    program_type?: string;
    academic_status?: string;
  }>({
    college: searchParams.get("college") || undefined,
    department: searchParams.get("department") || undefined,
    program_type: searchParams.get("program_type") || undefined,
    academic_status: searchParams.get("academic_status") || undefined,
  });

  const { data: students, isLoading, error } = useDashboardStudents(filters);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.college) params.set("college", filters.college);
    if (filters.department) params.set("department", filters.department);
    if (filters.program_type) params.set("program_type", filters.program_type);
    if (filters.academic_status) params.set("academic_status", filters.academic_status);
    
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
    students &&
    (students.students_by_department?.length > 0 ||
      students.students_by_program?.length > 0 ||
      students.academic_status_statistics?.length > 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">학생 대시보드</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          학과별, 과정별, 학적상태별 학생 현황을 확인하세요.
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
              : "학생 데이터를 불러오는 중 오류가 발생했습니다."
          }
          onRetry={() => window.location.reload()}
        />
      )}

      {!isLoading && !error && !hasData && (
        <EmptyState
          title="학생 데이터 없음"
          description="아직 학생 데이터가 없습니다. 데이터를 업로드해주세요."
          actionLabel="데이터 업로드"
          actionHref="/upload"
        />
      )}

      {!isLoading && !error && students && hasData && (
        <div className="space-y-6">
          {/* 학과별 학생 수 */}
          {students.students_by_department?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>학과별 학생 수</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
                  <BarChart
                    data={students.students_by_department}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    className="text-xs sm:text-sm"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value}명`} />
                    <Legend />
                    <Bar
                      dataKey="student_count"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 과정별 학생 분포 */}
          {students.students_by_program?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>과정별 학생 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
                  <PieChart>
                    <Pie
                      data={students.students_by_program}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ program_type, student_count, percent }) => {
                        const percentValue = typeof percent === 'number' ? percent : 0;
                        return `${program_type}: ${student_count}명 (${(percentValue * 100).toFixed(1)}%)`;
                      }}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="student_count"
                    >
                      {students.students_by_program.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}명`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 학적상태별 통계 */}
          {students.academic_status_statistics?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>학적상태별 학생 수</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
                  <BarChart
                    data={students.academic_status_statistics}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    className="text-xs sm:text-sm"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="academic_status" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value}명`} />
                    <Legend />
                    <Bar
                      dataKey="student_count"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

