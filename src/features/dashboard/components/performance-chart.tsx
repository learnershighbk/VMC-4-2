"use client";

import { memo } from "react";
import {
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PerformanceResponse } from "../lib/dto";

type PerformanceChartProps = {
  performance: PerformanceResponse;
};

const EmploymentRateChart = memo(({ data }: { data: PerformanceResponse["employment_rates"] }) => (
  <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
    <BarChart
      data={data}
      layout="vertical"
      margin={{ top: 5, right: 10, left: 60, bottom: 5 }}
      className="text-xs sm:text-sm"
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" domain={[0, 100]} />
      <YAxis
        dataKey="department"
        type="category"
        width={80}
        className="text-xs"
      />
      <Tooltip formatter={(value: number) => `${value}%`} />
      <Bar dataKey="employment_rate" fill="#10b981" radius={[0, 4, 4, 0]} />
    </BarChart>
  </ResponsiveContainer>
));

EmploymentRateChart.displayName = "EmploymentRateChart";

const TechTransferRevenueChart = memo(
  ({ data }: { data: Array<{ evaluation_year: number; revenue: number; year: number }> }) => (
    <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        className="text-xs sm:text-sm"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="evaluation_year"
          type="number"
          scale="linear"
          domain={["auto", "auto"]}
          label={{ value: "연도", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          label={{ value: "수입액 (억원)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          formatter={(value: number) => `${value}억원`}
          labelFormatter={(label) => `${label}년`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={2}
          name="수입액"
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
);

TechTransferRevenueChart.displayName = "TechTransferRevenueChart";

const FacultyStatusChart = memo(
  ({ data }: { data: PerformanceResponse["faculty_status"] }) => (
    <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        className="text-xs sm:text-sm"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="department" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="fulltime_count" fill="#3b82f6" name="전임교원" radius={[4, 4, 0, 0]} />
        <Bar dataKey="visiting_count" fill="#f59e0b" name="초빙교원" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
);

FacultyStatusChart.displayName = "FacultyStatusChart";

const IntlConferenceCountChart = memo(
  ({ data }: { data: PerformanceResponse["intl_conference_count"] }) => (
    <ResponsiveContainer width="100%" height={400} className="min-h-[300px]">
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        className="text-xs sm:text-sm"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="evaluation_year" />
        <YAxis />
        <Tooltip formatter={(value: number) => `${value}회`} />
        <Legend />
        <Bar dataKey="count" fill="#8b5cf6" name="개최 횟수" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
);

IntlConferenceCountChart.displayName = "IntlConferenceCountChart";

export const PerformanceChart = memo(({ performance }: PerformanceChartProps) => {
  const techTransferRevenueData = performance.tech_transfer_revenue.map((item) => ({
    ...item,
    year: item.evaluation_year,
  }));

  return (
    <div className="space-y-6">
      {performance.employment_rates?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>학과별 취업률</CardTitle>
          </CardHeader>
          <CardContent>
            <EmploymentRateChart data={performance.employment_rates} />
          </CardContent>
        </Card>
      )}

      {performance.tech_transfer_revenue?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>연도별 기술이전 수입 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <TechTransferRevenueChart data={techTransferRevenueData} />
          </CardContent>
        </Card>
      )}

      {performance.faculty_status?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>학과별 교원 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <FacultyStatusChart data={performance.faculty_status} />
          </CardContent>
        </Card>
      )}

      {performance.intl_conference_count?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>연도별 국제학술대회 개최 횟수</CardTitle>
          </CardHeader>
          <CardContent>
            <IntlConferenceCountChart data={performance.intl_conference_count} />
          </CardContent>
        </Card>
      )}
    </div>
  );
});

PerformanceChart.displayName = "PerformanceChart";

