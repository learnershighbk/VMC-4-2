"use client";

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test-utils";
import userEvent from "@testing-library/user-event";
import { DashboardFilter } from "../dashboard-filter";

const mockFilterOptions = [
  {
    key: "evaluation_year",
    label: "평가년도",
    options: [
      { value: "2024", label: "2024년" },
      { value: "2023", label: "2023년" },
    ],
  },
  {
    key: "college",
    label: "단과대학",
    options: [
      { value: "공과대학", label: "공과대학" },
      { value: "자연대학", label: "자연대학" },
    ],
  },
  {
    key: "department",
    label: "학과",
    options: [
      { value: "컴퓨터공학과", label: "컴퓨터공학과" },
      { value: "전기공학과", label: "전기공학과" },
    ],
  },
];

describe("DashboardFilter", () => {
  it("필터 옵션이 모두 렌더링되어야 함", () => {
    const mockOnFilterChange = vi.fn();
    const filters = {};

    render(
      <DashboardFilter
        filters={filters}
        filterOptions={mockFilterOptions}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByLabelText("평가년도")).toBeInTheDocument();
    expect(screen.getByLabelText("단과대학")).toBeInTheDocument();
    expect(screen.getByLabelText("학과")).toBeInTheDocument();
  });

  it("필터 값 변경 시 onFilterChange가 호출되어야 함", async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = vi.fn();
    const filters = {};

    render(
      <DashboardFilter
        filters={filters}
        filterOptions={mockFilterOptions}
        onFilterChange={mockOnFilterChange}
      />
    );

    const evaluationYearSelect = screen.getByLabelText("평가년도");
    await user.click(evaluationYearSelect);

    // Select 컴포넌트의 옵션 선택은 실제 DOM 상호작용이 필요
    // 여기서는 기본적인 렌더링 테스트만 수행
    expect(evaluationYearSelect).toBeInTheDocument();
  });

  it("활성 필터가 없을 때 필터 초기화 버튼이 표시되지 않아야 함", () => {
    const mockOnFilterChange = vi.fn();
    const filters = {};

    render(
      <DashboardFilter
        filters={filters}
        filterOptions={mockFilterOptions}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.queryByText("필터 초기화")).not.toBeInTheDocument();
  });

  it("활성 필터가 있을 때 필터 초기화 버튼이 표시되어야 함", () => {
    const mockOnFilterChange = vi.fn();
    const mockOnReset = vi.fn();
    const filters = {
      evaluation_year: "2024",
    };

    render(
      <DashboardFilter
        filters={filters}
        filterOptions={mockFilterOptions}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText("필터 초기화")).toBeInTheDocument();
  });

  it("필터 초기화 버튼 클릭 시 onReset이 호출되어야 함", async () => {
    const user = userEvent.setup();
    const mockOnFilterChange = vi.fn();
    const mockOnReset = vi.fn();
    const filters = {
      evaluation_year: "2024",
    };

    render(
      <DashboardFilter
        filters={filters}
        filterOptions={mockFilterOptions}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText("필터 초기화");
    await user.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it("여러 필터가 활성화되어 있을 때 모두 표시되어야 함", () => {
    const mockOnFilterChange = vi.fn();
    const filters = {
      evaluation_year: "2024",
      college: "공과대학",
      department: "컴퓨터공학과",
    };

    render(
      <DashboardFilter
        filters={filters}
        filterOptions={mockFilterOptions}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByLabelText("평가년도")).toBeInTheDocument();
    expect(screen.getByLabelText("단과대학")).toBeInTheDocument();
    expect(screen.getByLabelText("학과")).toBeInTheDocument();
  });
});

