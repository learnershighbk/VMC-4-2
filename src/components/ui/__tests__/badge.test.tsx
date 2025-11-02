import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import { Badge } from '../badge';

describe('Badge', () => {
  it('렌더링되어야 함', () => {
    render(<Badge>뱃지 텍스트</Badge>);
    expect(screen.getByText('뱃지 텍스트')).toBeInTheDocument();
  });

  it('default variant가 적용되어야 함', () => {
    const { container } = render(<Badge>테스트</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-primary');
  });

  it('secondary variant가 적용되어야 함', () => {
    const { container } = render(<Badge variant="secondary">테스트</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-secondary');
  });

  it('destructive variant가 적용되어야 함', () => {
    const { container } = render(<Badge variant="destructive">테스트</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-destructive');
  });

  it('outline variant가 적용되어야 함', () => {
    const { container } = render(<Badge variant="outline">테스트</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-foreground');
  });

  it('className이 적용되어야 함', () => {
    const { container } = render(<Badge className="custom-class">테스트</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('custom-class');
  });
});

