import { describe, it, expect } from 'vitest';
import { render } from '@/test-utils';
import { LoadingState } from '../loading-state';

describe('LoadingState', () => {
  it('기본 card variant로 렌더링되어야 함', () => {
    const { container } = render(<LoadingState />);
    const cards = container.querySelectorAll('[class*="animate-pulse"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('count prop에 따라 여러 개의 스켈레톤을 표시해야 함', () => {
    const { container } = render(<LoadingState count={4} />);
    const cards = container.querySelectorAll('[class*="animate-pulse"]');
    expect(cards.length).toBe(4);
  });

  it('chart variant로 렌더링되어야 함', () => {
    const { container } = render(<LoadingState variant="chart" />);
    const chartPlaceholder = container.querySelector('div[class*="h-64"]');
    expect(chartPlaceholder).toBeInTheDocument();
  });

  it('text variant로 렌더링되어야 함', () => {
    const { container } = render(<LoadingState variant="text" />);
    const textPlaceholders = container.querySelectorAll('div[class*="h-4"]');
    expect(textPlaceholders.length).toBeGreaterThan(0);
  });

  it('className이 적용되어야 함', () => {
    const { container } = render(
      <LoadingState className="custom-class" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});

