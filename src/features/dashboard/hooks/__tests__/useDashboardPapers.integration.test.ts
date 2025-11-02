import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardPapers } from '../useDashboardPapers';
import { tokenStorage } from '@/lib/auth/token';

describe('useDashboardPapers - API 통합 테스트', () => {
  beforeEach(() => {
    tokenStorage.clearTokens();
  });

  it('인증 토큰 없이 요청 시 에러가 발생해야 함', async () => {
    const { result } = renderHook(() => useDashboardPapers());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 3000 });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('인증 토큰이 있을 때 논문 데이터를 가져와야 함', async () => {
    tokenStorage.setAccessToken('mock-access-token');

    const { result } = renderHook(() => useDashboardPapers());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toMatchObject({
      journal_grade_distribution: expect.arrayContaining([
        expect.objectContaining({
          journal_grade: expect.stringMatching(/SCIE|KCI|일반/),
          count: expect.any(Number),
        }),
      ]),
      publication_by_department: expect.arrayContaining([
        expect.objectContaining({
          department: expect.any(String),
          paper_count: expect.any(Number),
        }),
      ]),
      publication_trend: expect.arrayContaining([
        expect.objectContaining({
          month: expect.any(String),
          paper_count: expect.any(Number),
        }),
      ]),
    });
  });
});

