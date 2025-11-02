import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardOverview } from '../useDashboardOverview';
import { tokenStorage } from '@/lib/auth/token';

describe('useDashboardOverview - API 통합 테스트', () => {
  beforeEach(() => {
    tokenStorage.clearTokens();
  });

  it('인증 토큰 없이 요청 시 에러가 발생해야 함', async () => {
    const { result } = renderHook(() => useDashboardOverview());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 3000 });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('인증 토큰이 있을 때 대시보드 개요 데이터를 가져와야 함', async () => {
    tokenStorage.setAccessToken('mock-access-token');

    const { result } = renderHook(() => useDashboardOverview());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toMatchObject({
      performance: {
        label: '실적 달성률',
        value: 85.5,
        unit: '%',
        trend: 'up',
      },
      papers: {
        label: '논문 게재 수',
        value: 120,
        unit: '건',
        trend: 'up',
      },
      students: {
        label: '재학생 수',
        value: 350,
        unit: '명',
        trend: 'stable',
      },
      budget: {
        label: '예산 집행률',
        value: 72.3,
        unit: '%',
        trend: 'down',
      },
    });
  });

  it('데이터를 캐싱하여 두 번째 요청 시 즉시 반환해야 함', async () => {
    tokenStorage.setAccessToken('mock-access-token');

    const { result: firstResult } = renderHook(() => useDashboardOverview());

    await waitFor(() => {
      expect(firstResult.current.isSuccess).toBe(true);
    });

    const firstDataTimestamp = Date.now();

    const { result: secondResult } = renderHook(() => useDashboardOverview());

    await waitFor(() => {
      expect(secondResult.current.isSuccess).toBe(true);
    });

    const secondDataTimestamp = Date.now();
    const timeDiff = secondDataTimestamp - firstDataTimestamp;

    expect(timeDiff).toBeLessThan(100);
    expect(secondResult.current.data).toEqual(firstResult.current.data);
  });
});

