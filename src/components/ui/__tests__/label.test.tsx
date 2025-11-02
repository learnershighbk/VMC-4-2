import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import { Label } from '../label';

describe('Label', () => {
  it('렌더링되어야 함', () => {
    render(<Label>레이블 텍스트</Label>);
    expect(screen.getByText('레이블 텍스트')).toBeInTheDocument();
  });

  it('htmlFor 속성이 적용되어야 함', () => {
    render(<Label htmlFor="test-input">테스트</Label>);
    const label = screen.getByText('테스트');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('className이 적용되어야 함', () => {
    const { container } = render(
      <Label className="custom-class">테스트</Label>
    );
    const label = container.querySelector('label');
    expect(label).toHaveClass('custom-class');
  });
});

