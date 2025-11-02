import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test-utils';
import { EmptyState } from '../empty-state';

describe('EmptyState', () => {
  it('기본 타이틀과 설명이 표시되어야 함', () => {
    render(<EmptyState />);
    expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
    expect(
      screen.getByText('아직 데이터가 없습니다. 데이터를 업로드해주세요.')
    ).toBeInTheDocument();
  });

  it('커스텀 타이틀과 설명이 표시되어야 함', () => {
    render(
      <EmptyState
        title="커스텀 타이틀"
        description="커스텀 설명입니다."
      />
    );
    expect(screen.getByText('커스텀 타이틀')).toBeInTheDocument();
    expect(screen.getByText('커스텀 설명입니다.')).toBeInTheDocument();
  });

  it('actionHref가 제공될 때 링크 버튼이 표시되어야 함', () => {
    render(
      <EmptyState
        actionLabel="데이터 업로드"
        actionHref="/upload"
      />
    );
    const link = screen.getByRole('link', { name: /데이터 업로드/ });
    expect(link).toHaveAttribute('href', '/upload');
  });

  it('onAction이 제공될 때 버튼이 클릭 가능해야 함', async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();
    render(
      <EmptyState
        actionLabel="액션"
        onAction={handleAction}
      />
    );
    const button = screen.getByRole('button', { name: /액션/ });
    await user.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('actionLabel이 없을 때 버튼이 표시되지 않아야 함', () => {
    render(<EmptyState />);
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });
});

