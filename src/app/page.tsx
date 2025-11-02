"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, CheckCircle2, Boxes, Database, LogOut, Server } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { tokenStorage } from "@/lib/auth/token";

type SetupCommand = {
  id: string;
  label: string;
  command: string;
};

const setupCommands: SetupCommand[] = [
  { id: "install", label: "의존성 설치", command: "npm install" },
  { id: "lint", label: "정적 점검", command: "npm run lint" },
  { id: "dev", label: "로컬 개발 서버", command: "npm run dev" },
];

const envVariables = [
  {
    key: "NEXT_PUBLIC_API_BASE_URL",
    description: "Django 백엔드 API URL (예: http://localhost:8000)",
  },
];

const directorySummary = [
  {
    title: "앱 라우터",
    description: "Next.js App Router 엔트리포인트와 레이아웃 정의",
    path: "src/app",
  },
  {
    title: "API 클라이언트",
    description: "Django 백엔드 API 호출을 위한 HTTP 클라이언트",
    path: "src/lib/remote",
  },
  {
    title: "백엔드 서비스",
    description: "Django REST Framework 백엔드 (별도 서비스)",
    path: "backend",
  },
  {
    title: "기능 모듈",
    description: "각 기능별 컴포넌트, React Query 훅, DTO 정의",
    path: "src/features/[feature]",
  },
];

const backendBuildingBlocks = [
  {
    icon: <Server className="w-4 h-4" />,
    title: "Django REST Framework",
    description:
      "Django ORM과 DRF Serializer를 통해 안정적인 API를 제공하며, JWT 기반 인증을 지원합니다.",
  },
  {
    icon: <Database className="w-4 h-4" />,
    title: "PostgreSQL 데이터베이스",
    description:
      "Django ORM을 통해 PostgreSQL 데이터베이스에 접근하며, Railway에서 자동 프로비저닝됩니다.",
  },
  {
    icon: <Boxes className="w-4 h-4" />,
    title: "React Query 연동",
    description:
      "모든 클라이언트 데이터 패칭은 React Query 훅을 통해 수행하며, `@/lib/remote/api-client`를 통해 Django API를 호출합니다.",
  },
];

export default function Home() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading, refresh } = useCurrentUser();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    tokenStorage.clearTokens();
    await refresh();
    router.replace("/");
  }, [refresh, router]);

  const authActions = useMemo(() => {
    if (isLoading) {
      return (
        <span className="text-sm text-slate-300">세션 확인 중...</span>
      );
    }

    if (isAuthenticated && user) {
      return (
        <div className="flex items-center gap-3 text-sm text-slate-200">
          <span className="truncate">{user.username ?? user.email ?? "알 수 없는 사용자"}</span>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-md border border-slate-600 px-3 py-1 transition hover:border-slate-400 hover:bg-slate-800"
            >
              대시보드
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1 text-slate-900 transition hover:bg-white"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>
      );
    }

    return (
        <div className="flex items-center gap-3 text-sm">
        <Link
          href="/login"
          className="rounded-md border border-slate-600 px-3 py-1 text-slate-200 transition hover:border-slate-400 hover:bg-slate-800"
        >
          로그인
        </Link>
      </div>
    );
  }, [handleSignOut, isAuthenticated, isLoading, user]);

  const handleCopy = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    window.setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
        <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-4">
          <div className="text-sm font-medium text-slate-300">
            Next.js + Django REST Framework 풀스택 프로젝트
          </div>
          {authActions}
        </div>
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            프로젝트 설정 & 구조 안내서
          </h1>
          <p className="max-w-3xl text-base text-slate-300 md:text-lg">
            Next.js 프론트엔드와 Django REST Framework 백엔드로 구성된 풀스택 프로젝트입니다.
            <br /> 모든 컴포넌트는 Client Component로 작성하며, React Query를 사용합니다.
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          <SetupChecklist copiedCommand={copiedCommand} onCopy={handleCopy} />
          <EnvironmentGuide />
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <DirectoryOverview />
          <BackendOverview />
        </section>

        <footer className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-slate-100">
            시작하기
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            백엔드 서버는 `backend/` 디렉토리에서 `python manage.py runserver`로 실행하고,
            프론트엔드는 프로젝트 루트에서 `npm run dev`로 실행하세요. Django 데이터베이스 마이그레이션은
            `python manage.py migrate`로 실행합니다. 자세한 내용은 `README.md`를 참고하세요.
          </p>
        </footer>
      </div>
    </main>
  );
}

function SetupChecklist({
  copiedCommand,
  onCopy,
}: {
  copiedCommand: string | null;
  onCopy: (command: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-slate-100">
        설치 체크리스트
      </h2>
      <ul className="space-y-3">
        {setupCommands.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-400" />
              <div>
                <p className="font-medium text-slate-100">{item.label}</p>
                <code className="text-sm text-slate-300">{item.command}</code>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onCopy(item.command)}
              className="flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              <Copy className="h-3.5 w-3.5" />
              {copiedCommand === item.command ? "복사됨" : "복사"}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-400">
        프론트엔드 개발 서버는 React Query Provider가 설정된 `src/app/providers.tsx`를
        통과하여 실행됩니다. 백엔드는 별도로 `backend/` 디렉토리에서 실행해야 합니다.
      </p>
    </div>
  );
}

function EnvironmentGuide() {
  return (
    <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-slate-100">환경 변수</h2>
      <p className="text-sm text-slate-300">
        `.env.local` 파일에 아래 값을 추가하세요. Django 백엔드는 별도의 환경 변수가 필요합니다.
      </p>
      <ul className="space-y-3">
        {envVariables.map((item) => (
          <li
            key={item.key}
            className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"
          >
            <p className="font-medium text-slate-100">{item.key}</p>
            <p className="text-xs text-slate-300">{item.description}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-400">
        프론트엔드 환경 변수는 `src/constants/env.ts`에서 zod로 검증되며, 백엔드 환경 변수는
        `backend/config/settings.py`에서 관리됩니다.
      </p>
    </div>
  );
}

function DirectoryOverview() {
  return (
    <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-slate-100">
        주요 디렉터리
      </h2>
      <ul className="space-y-3">
        {directorySummary.map((item) => (
          <li
            key={item.path}
            className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"
          >
            <p className="text-sm font-semibold text-slate-100">{item.path}</p>
            <p className="text-xs text-slate-300">{item.description}</p>
            <p className="text-xs text-slate-400">{item.title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BackendOverview() {
  return (
    <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-slate-100">
        백엔드 아키텍처
      </h2>
      <ul className="space-y-3">
        {backendBuildingBlocks.map((item, index) => (
          <li
            key={item.title + index}
            className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3"
          >
            <div className="mt-0.5 text-indigo-300">{item.icon}</div>
            <div>
              <p className="font-medium text-slate-100">{item.title}</p>
              <p className="text-xs text-slate-300">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-400">
        Django 백엔드는 `backend/apps/` 디렉토리에서 각 기능별 앱으로 구성되며,
        프론트엔드는 `src/features/[feature]/hooks/`에서 React Query 훅을 통해
        API를 호출합니다. 자세한 내용은 `README.md`와 `backend/README.md`를 참고하세요.
      </p>
    </div>
  );
}
