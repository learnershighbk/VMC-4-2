import { http, HttpResponse } from 'msw';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const handlers = [
  // 인증 API
  http.post(`${API_BASE_URL}/api/auth/token/`, async ({ request }) => {
    const body = await request.json() as { username: string; password: string };

    if (body.username === 'testuser' && body.password === 'testpass123') {
      return HttpResponse.json({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      });
    }

    return HttpResponse.json(
      { detail: 'No active account found with the given credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/api/auth/token/refresh/`, async ({ request }) => {
    const body = await request.json() as { refresh: string };

    if (body.refresh === 'mock-refresh-token') {
      return HttpResponse.json({
        access: 'new-mock-access-token',
      });
    }

    return HttpResponse.json(
      { detail: 'Token is invalid or expired' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/api/auth/register/`, async ({ request }) => {
    const body = await request.json() as { 
      username: string; 
      email: string; 
      password: string; 
      password_confirm: string;
    };

    if (!body.username || !body.email || !body.password) {
      return HttpResponse.json(
        { success: false, detail: '입력 데이터 검증 실패', errors: { username: ['이 필드는 필수입니다.'] } },
        { status: 400 }
      );
    }

    if (body.password !== body.password_confirm) {
      return HttpResponse.json(
        { success: false, detail: '입력 데이터 검증 실패', errors: { password: ['비밀번호가 일치하지 않습니다.'] } },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: 'mock-user-id',
          username: body.username,
          email: body.email,
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    }, { status: 201 });
  }),

  // 대시보드 Overview API
  http.get(`${API_BASE_URL}/api/dashboard/overview/`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Authentication credentials were not provided.' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      performance: {
        label: '실적 달성률',
        value: 85.5,
        unit: '%',
        trend: 'up' as const,
      },
      papers: {
        label: '논문 게재 수',
        value: 120,
        unit: '건',
        trend: 'up' as const,
      },
      students: {
        label: '재학생 수',
        value: 350,
        unit: '명',
        trend: 'stable' as const,
      },
      budget: {
        label: '예산 집행률',
        value: 72.3,
        unit: '%',
        trend: 'down' as const,
      },
    });
  }),

  // 대시보드 Performance API
  http.get(`${API_BASE_URL}/api/dashboard/performance/:params*`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Authentication credentials were not provided.' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const evaluationYear = url.searchParams.get('evaluation_year');
    const college = url.searchParams.get('college');
    const department = url.searchParams.get('department');

    const mockData = {
      employment_rates: [
        {
          department: '컴퓨터공학과',
          college: '공과대학',
          employment_rate: 92.5,
          evaluation_year: evaluationYear ? Number(evaluationYear) : 2024,
        },
        {
          department: '전기전자공학과',
          college: '공과대학',
          employment_rate: 88.3,
          evaluation_year: evaluationYear ? Number(evaluationYear) : 2024,
        },
      ],
      tech_transfer_revenue: [
        {
          evaluation_year: 2024,
          department: '컴퓨터공학과',
          revenue: 15.5,
        },
        {
          evaluation_year: 2023,
          department: '컴퓨터공학과',
          revenue: 12.3,
        },
      ],
    };

    if (college || department) {
      mockData.employment_rates = mockData.employment_rates.filter(
        (item) =>
          (!college || item.college === college) &&
          (!department || item.department === department)
      );
    }

    return HttpResponse.json(mockData);
  }),

  // 대시보드 Papers API
  http.get(`${API_BASE_URL}/api/dashboard/papers/`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Authentication credentials were not provided.' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      journal_grade_distribution: [
        { journal_grade: 'SCIE', count: 45 },
        { journal_grade: 'KCI', count: 60 },
        { journal_grade: '일반', count: 15 },
      ],
      publication_by_department: [
        { department: '컴퓨터공학과', paper_count: 35 },
        { department: '전기전자공학과', paper_count: 28 },
        { department: '기계공학과', paper_count: 22 },
      ],
      publication_trend: [
        { month: '2024-01', paper_count: 12 },
        { month: '2024-02', paper_count: 15 },
        { month: '2024-03', paper_count: 18 },
      ],
    });
  }),

  // 대시보드 Students API
  http.get(`${API_BASE_URL}/api/dashboard/students/`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Authentication credentials were not provided.' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      by_department: [
        { department: '컴퓨터공학과', student_count: 120 },
        { department: '전기전자공학과', student_count: 95 },
        { department: '기계공학과', student_count: 80 },
      ],
      by_program: [
        { program: '학사', student_count: 200 },
        { program: '석사', student_count: 100 },
        { program: '박사', student_count: 50 },
      ],
      by_status: [
        { status: '재학', student_count: 280 },
        { status: '휴학', student_count: 50 },
        { status: '졸업', student_count: 20 },
      ],
    });
  }),

  // 대시보드 Budget API
  http.get(`${API_BASE_URL}/api/dashboard/budget/`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Authentication credentials were not provided.' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      execution_by_project: [
        {
          project_id: 'P001',
          project_name: 'AI 연구 프로젝트',
          total_budget: 500000000,
          executed_budget: 375000000,
          execution_rate: 75.0,
        },
        {
          project_id: 'P002',
          project_name: '소프트웨어 개발 프로젝트',
          total_budget: 300000000,
          executed_budget: 240000000,
          execution_rate: 80.0,
        },
      ],
      by_institution: [
        { institution: '과학기술정보통신부', budget_amount: 400000000 },
        { institution: '교육부', budget_amount: 275000000 },
      ],
      execution_trend: [
        { month: '2024-01', executed_amount: 50000000 },
        { month: '2024-02', executed_amount: 75000000 },
        { month: '2024-03', executed_amount: 90000000 },
      ],
    });
  }),

  // 데이터 업로드 API
  http.post(`${API_BASE_URL}/api/data/upload/`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Authentication credentials were not provided.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return HttpResponse.json(
        { detail: 'File is required' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      message: 'File uploaded successfully',
      rows_processed: 100,
      rows_failed: 0,
    });
  }),
];

