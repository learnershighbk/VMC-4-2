import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardBudget } from '../useDashboardBudget';
import { tokenStorage } from '@/lib/auth/token';

describe('useDashboardBudget - API 통합 테스트', () => {
  beforeEach(() => {
    tokenStorage.clearTokens();
  });

  it('인증 토큰 없이 요청 시 에러가 발생해야 함', async () => {
    const { result } = renderHook(() => useDashboardBudget());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 3000 });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('인증 토큰이 있을 때 예산 데이터를 가져와야 함', async () => {
    tokenStorage.setAccessToken('mock-access-token');

    const { result } = renderHook(() => useDashboardBudget());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toMatchObject({
      execution_by_project: expect.arrayContaining([
        expect.objectContaining({
          project_id: expect.any(String),
          project_name: expect.any(String),
          total_budget: expect.any(Number),
          executed_budget: expect.any(Number),
          execution_rate: expect.any(Number),
        }),
      ]),
      by_institution: expect.arrayContaining([
        expect.objectContaining({
          institution: expect.any(String),
          budget_amount: expect.any(Number),
        }),
      ]),
      execution_trend: expect.arrayContaining([
        expect.objectContaining({
          month: expect.any(String),
          executed_amount: expect.any(Number),
        }),
      ]),
    });
  });
});

