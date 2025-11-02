import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardStudents } from '../useDashboardStudents';
import { tokenStorage } from '@/lib/auth/token';

describe('useDashboardStudents - API 통합 테스트', () => {
  beforeEach(() => {
    tokenStorage.clearTokens();
  });

  it('인증 토큰 없이 요청 시 에러가 발생해야 함', async () => {
    const { result } = renderHook(() => useDashboardStudents());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 3000 });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('인증 토큰이 있을 때 학생 데이터를 가져와야 함', async () => {
    tokenStorage.setAccessToken('mock-access-token');

    const { result } = renderHook(() => useDashboardStudents());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toMatchObject({
      by_department: expect.arrayContaining([
        expect.objectContaining({
          department: expect.any(String),
          student_count: expect.any(Number),
        }),
      ]),
      by_program: expect.arrayContaining([
        expect.objectContaining({
          program: expect.any(String),
          student_count: expect.any(Number),
        }),
      ]),
      by_status: expect.arrayContaining([
        expect.objectContaining({
          status: expect.any(String),
          student_count: expect.any(Number),
        }),
      ]),
    });
  });
});

