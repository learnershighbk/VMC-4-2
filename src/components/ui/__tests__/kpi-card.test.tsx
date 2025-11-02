import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import { KPICard } from '@/features/dashboard/components/kpi-card';

describe('KPICard', () => {
  it('렌더링되어야 함', () => {
    const mockData = {
      label: '실적',
      value: 87.5,
      unit: '%',
      trend: 'up' as const,
    };
    render(<KPICard data={mockData} />);
    expect(screen.getByText('실적')).toBeInTheDocument();
    expect(screen.getByText('87.5')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('trend가 up일 때 상승 아이콘이 표시되어야 함', () => {
    const mockData = {
      label: '테스트',
      value: 100,
      unit: '건',
      trend: 'up' as const,
    };
    const { container } = render(<KPICard data={mockData} />);
    const icon = container.querySelector('[data-lucide="arrow-up"]');
    expect(icon).toBeInTheDocument();
  });

  it('trend가 down일 때 하락 아이콘이 표시되어야 함', () => {
    const mockData = {
      label: '테스트',
      value: 50,
      unit: '%',
      trend: 'down' as const,
    };
    const { container } = render(<KPICard data={mockData} />);
    const icon = container.querySelector('[data-lucide="arrow-down"]');
    expect(icon).toBeInTheDocument();
  });

  it('trend가 stable일 때 안정 아이콘이 표시되어야 함', () => {
    const mockData = {
      label: '테스트',
      value: 75,
      unit: '%',
      trend: 'stable' as const,
    };
    const { container } = render(<KPICard data={mockData} />);
    const icon = container.querySelector('[data-lucide="minus"]');
    expect(icon).toBeInTheDocument();
  });

  it('큰 숫자값이 천 단위로 포맷되어야 함', () => {
    const mockData = {
      label: '학생',
      value: 1400,
      unit: '명',
      trend: 'stable' as const,
    };
    render(<KPICard data={mockData} />);
    expect(screen.getByText('1,400')).toBeInTheDocument();
  });
});

