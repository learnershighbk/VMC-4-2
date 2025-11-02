"use client";

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test-utils";
import { PerformanceChart } from "../performance-chart";
import type { PerformanceResponse } from "../../lib/dto";

const mockPerformanceData: PerformanceResponse = {
  employment_rates: [
    {
      department: "컴퓨터공학과",
      college: "공과대학",
      employment_rate: 85.5,
      evaluation_year: 2024,
    },
    {
      department: "전기공학과",
      college: "공과대학",
      employment_rate: 80.0,
      evaluation_year: 2024,
    },
  ],
  tech_transfer_revenue: [
    {
      evaluation_year: 2024,
      department: "컴퓨터공학과",
      revenue: 5.2,
    },
    {
      evaluation_year: 2023,
      department: "컴퓨터공학과",
      revenue: 4.5,
    },
  ],
  faculty_status: [
    {
      department: "컴퓨터공학과",
      fulltime_count: 10,
      visiting_count: 2,
    },
  ],
  intl_conference_count: [
    {
      evaluation_year: 2024,
      department: "컴퓨터공학과",
      count: 3,
    },
  ],
};

describe("PerformanceChart", () => {
  it("렌더링 시 차트가 표시되어야 함", () => {
    render(<PerformanceChart performance={mockPerformanceData} />);

    // 차트 제목 확인
    expect(screen.getByText("학과별 취업률")).toBeInTheDocument();
    expect(screen.getByText("연도별 기술이전 수입 추이")).toBeInTheDocument();
  });

  it("취업률 데이터가 없을 때 차트가 표시되지 않아야 함", () => {
    const emptyData: PerformanceResponse = {
      employment_rates: [],
      tech_transfer_revenue: [],
      faculty_status: [],
      intl_conference_count: [],
    };

    render(<PerformanceChart performance={emptyData} />);

    // 취업률 차트가 표시되지 않아야 함
    expect(screen.queryByText("학과별 취업률")).not.toBeInTheDocument();
  });

  it("기술이전 수입 데이터가 없을 때 차트가 표시되지 않아야 함", () => {
    const partialData: PerformanceResponse = {
      employment_rates: mockPerformanceData.employment_rates,
      tech_transfer_revenue: [],
      faculty_status: [],
      intl_conference_count: [],
    };

    render(<PerformanceChart performance={partialData} />);

    // 취업률 차트는 표시되어야 함
    expect(screen.getByText("학과별 취업률")).toBeInTheDocument();
    // 기술이전 수입 차트는 표시되지 않아야 함
    expect(screen.queryByText("연도별 기술이전 수입 추이")).not.toBeInTheDocument();
  });

  it("모든 데이터가 있을 때 두 차트가 모두 표시되어야 함", () => {
    render(<PerformanceChart performance={mockPerformanceData} />);

    expect(screen.getByText("학과별 취업률")).toBeInTheDocument();
    expect(screen.getByText("연도별 기술이전 수입 추이")).toBeInTheDocument();
  });

  it("차트 컨테이너가 렌더링되어야 함", () => {
    const { container } = render(
      <PerformanceChart performance={mockPerformanceData} />
    );

    // Recharts는 SVG 요소를 생성함
    const svgElements = container.querySelectorAll("svg");
    expect(svgElements.length).toBeGreaterThan(0);
  });
});

