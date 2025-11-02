import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from '../useLogin';
import { apiClient } from '@/lib/remote/api-client';
import { tokenStorage } from '@/lib/auth/token';

vi.mock('@/lib/remote/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
  extractApiErrorMessage: vi.fn((error, fallback) => {
    if (error instanceof Error) return error.message;
    return fallback;
  }),
}));

vi.mock('@/lib/auth/token', () => ({
  tokenStorage: {
    setTokens: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';

  return Wrapper;
};

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공적으로 로그인해야 함', async () => {
    const mockTokens = {
      access: 'access-token',
      refresh: 'refresh-token',
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: mockTokens,
    });

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      username: 'testuser',
      password: 'password123',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTokens);
    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/token/', {
      username: 'testuser',
      password: 'password123',
    });
    expect(tokenStorage.setTokens).toHaveBeenCalledWith(mockTokens);
  });

  it('에러 발생 시 에러를 처리해야 함', async () => {
    const mockError = new Error('로그인 실패');
    vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      username: 'testuser',
      password: 'wrongpassword',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('pending 상태가 올바르게 관리되어야 함', async () => {
    vi.mocked(apiClient.post).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      username: 'testuser',
      password: 'password123',
    });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isPending).toBe(false));
  });
});

