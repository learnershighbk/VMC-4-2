import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test-utils';
import { Input } from '../input';

describe('Input', () => {
  it('렌더링되어야 함', () => {
    render(<Input placeholder="입력하세요" />);
    expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument();
  });

  it('값을 입력할 수 있어야 함', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="입력하세요" />);
    const input = screen.getByPlaceholderText('입력하세요') as HTMLInputElement;
    await user.type(input, '테스트 값');
    expect(input.value).toBe('테스트 값');
  });

  it('onChange 이벤트가 작동해야 함', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} placeholder="입력하세요" />);
    const input = screen.getByPlaceholderText('입력하세요');
    await user.type(input, '테스트');
    expect(handleChange).toHaveBeenCalled();
  });

  it('disabled 상태가 적용되어야 함', () => {
    render(<Input disabled placeholder="입력하세요" />);
    const input = screen.getByPlaceholderText('입력하세요');
    expect(input).toBeDisabled();
  });

  it('type prop이 적용되어야 함', () => {
    render(<Input type="password" placeholder="비밀번호" />);
    const input = screen.getByPlaceholderText('비밀번호');
    expect(input).toHaveAttribute('type', 'password');
  });
});

