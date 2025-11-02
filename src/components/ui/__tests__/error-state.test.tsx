import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test-utils';
import { ErrorState } from '../error-state';

describe('ErrorState', () => {
  it('기본 메시지가 표시되어야 함', () => {
    render(<ErrorState />);
    expect(
      screen.getByText('데이터를 불러오는 중 오류가 발생했습니다.')
    ).toBeInTheDocument();
  });

  it('커스텀 메시지가 표시되어야 함', () => {
    render(<ErrorState message="커스텀 오류 메시지" />);
    expect(screen.getByText('커스텀 오류 메시지')).toBeInTheDocument();
  });

  it('재시도 버튼이 onRetry가 제공될 때 표시되어야 함', () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);
    const retryButton = screen.getByRole('button', { name: /재시도/ });
    expect(retryButton).toBeInTheDocument();
  });

  it('재시도 버튼 클릭 시 onRetry가 호출되어야 함', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);
    const retryButton = screen.getByRole('button', { name: /재시도/ });
    await user.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('onRetry가 없을 때 재시도 버튼이 표시되지 않아야 함', () => {
    render(<ErrorState />);
    const retryButton = screen.queryByRole('button', { name: /재시도/ });
    expect(retryButton).not.toBeInTheDocument();
  });

  it('커스텀 retryLabel이 적용되어야 함', () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} retryLabel="다시 시도" />);
    expect(screen.getByRole('button', { name: /다시 시도/ })).toBeInTheDocument();
  });
});

