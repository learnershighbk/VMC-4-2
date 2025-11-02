"use client";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";
import { KPICard } from "@/features/dashboard/components/kpi-card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;
  const { user } = useCurrentUser();
  const { data: overview, isLoading, error } = useDashboardOverview();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">대시보드</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          {user?.email ?? "알 수 없는 사용자"} 님, 환영합니다.
        </p>
      </header>

      {isLoading && (
        <LoadingState
          variant="card"
          count={4}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        />
      )}

      {error && (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "대시보드 데이터를 불러오는 중 오류가 발생했습니다."
          }
          onRetry={() => window.location.reload()}
        />
      )}

      {!isLoading && !error && !overview && (
        <EmptyState
          title="대시보드 데이터 없음"
          description="아직 대시보드 데이터가 없습니다. 데이터를 업로드해주세요."
          actionLabel="데이터 업로드"
          actionHref="/upload"
        />
      )}

      {overview && (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <a href="/dashboard/performance" className="transition-transform hover:scale-105">
            <KPICard data={overview.performance} />
          </a>
          <a href="/dashboard/papers" className="transition-transform hover:scale-105">
            <KPICard data={overview.papers} />
          </a>
          <a href="/dashboard/students" className="transition-transform hover:scale-105">
            <KPICard data={overview.students} />
          </a>
          <a href="/dashboard/budget" className="transition-transform hover:scale-105">
            <KPICard data={overview.budget} />
          </a>
        </section>
      )}
    </div>
  );
}
