import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLogin } from '../useLogin';
import { tokenStorage } from '@/lib/auth/token';

describe('useLogin - API 통합 테스트', () => {
  beforeEach(() => {
    tokenStorage.clearTokens();
  });

  it('올바른 자격증명으로 로그인 성공 시 토큰이 저장되어야 함', async () => {
    const { result } = renderHook(() => useLogin());

    await waitFor(() => {
      expect(result.current.isIdle).toBe(true);
    });

    result.current.mutate({
      username: 'testuser',
      password: 'testpass123',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
    });

    expect(tokenStorage.getAccessToken()).toBe('mock-access-token');
    expect(tokenStorage.getRefreshToken()).toBe('mock-refresh-token');
  });

  it('잘못된 자격증명으로 로그인 시 에러가 발생해야 함', async () => {
    const { result } = renderHook(() => useLogin());

    await waitFor(() => {
      expect(result.current.isIdle).toBe(true);
    });

    result.current.mutate({
      username: 'wronguser',
      password: 'wrongpass',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('로그인에 실패했습니다');
  });
});

