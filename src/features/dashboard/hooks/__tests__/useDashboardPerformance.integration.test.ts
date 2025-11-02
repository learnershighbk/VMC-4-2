import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardPerformance } from '../useDashboardPerformance';
import { tokenStorage } from '@/lib/auth/token';

describe('useDashboardPerformance - API 통합 테스트', () => {
  beforeEach(() => {
    tokenStorage.clearTokens();
  });

  it('인증 토큰 없이 요청 시 에러가 발생해야 함', async () => {
    const { result } = renderHook(() => useDashboardPerformance());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 3000 });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('기본 필터로 실적 데이터를 가져와야 함', async () => {
    tokenStorage.setAccessToken('mock-access-token');

    const { result } = renderHook(() => useDashboardPerformance());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toMatchObject({
      employment_rates: expect.arrayContaining([
        expect.objectContaining({
          department: expect.any(String),
          college: expect.any(String),
          employment_rate: expect.any(Number),
          evaluation_year: expect.any(Number),
        }),
      ]),
      tech_transfer_revenue: expect.arrayContaining([
        expect.objectContaining({
          evaluation_year: expect.any(Number),
          department: expect.any(String),
          revenue: expect.any(Number),
        }),
      ]),
    });
  });

  it('evaluation_year 필터로 데이터를 필터링할 수 있어야 함', async () => {
    tokenStorage.setAccessToken('mock-access-token');

    const { result } = renderHook(() =>
      useDashboardPerformance({ evaluation_year: 2024 })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.employment_rates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          evaluation_year: 2024,
        }),
      ])
    );
  });

  it('college 필터로 데이터를 필터링할 수 있어야 함', async () => {
    tokenStorage.setAccessToken('mock-access-token');

    const { result } = renderHook(() =>
      useDashboardPerformance({ college: '공과대학' })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.employment_rates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          college: '공과대학',
        }),
      ])
    );

    expect(result.current.data?.employment_rates).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          college: expect.not.stringContaining('인문대학'),
        }),
      ])
    );
  });

  it('다중 필터를 조합하여 데이터를 필터링할 수 있어야 함', async () => {
    tokenStorage.setAccessToken('mock-access-token');

    const { result } = renderHook(() =>
      useDashboardPerformance({
        evaluation_year: 2024,
        college: '공과대학',
        department: '컴퓨터공학과',
      })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.employment_rates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          evaluation_year: 2024,
          college: '공과대학',
          department: '컴퓨터공학과',
        }),
      ])
    );
  });
});

