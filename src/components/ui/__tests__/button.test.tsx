import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test-utils';
import { Button } from '../button';

describe('Button', () => {
  it('렌더링되어야 함', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
  });

  it('비활성화 상태가 적용되어야 함', () => {
    render(<Button disabled>비활성화</Button>);
    const button = screen.getByRole('button', { name: '비활성화' });
    expect(button).toBeDisabled();
  });

  it('variant prop이 적용되어야 함', () => {
    const { container } = render(<Button variant="destructive">삭제</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass(/destructive/);
  });

  it('onClick 이벤트가 작동해야 함', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    
    const button = screen.getByRole('button', { name: '클릭' });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

