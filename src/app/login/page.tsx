"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { LoadingState } from "@/components/ui/loading-state";

type LoginPageProps = {
  params: Promise<Record<string, never>>;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh, isAuthenticated } = useCurrentUser();
  const loginMutation = useLogin();
  const [formState, setFormState] = useState({ username: "", password: "" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectedFrom = searchParams.get("redirectedFrom") ?? "/";
      router.replace(redirectedFrom);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage(null);

      try {
        await loginMutation.mutateAsync({
          username: formState.username,
          password: formState.password,
        });

        await refresh();
        const redirectedFrom = searchParams.get("redirectedFrom") ?? "/";
        router.replace(redirectedFrom);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "로그인 처리 중 오류가 발생했습니다.";
        setErrorMessage(message);
      }
    },
    [formState.username, formState.password, loginMutation, refresh, router, searchParams]
  );

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">로그인</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          사용자명과 비밀번호로 로그인하고 보호된 페이지에 접근하세요.
        </p>
      </header>
      <div className="grid w-full gap-6 sm:gap-8 md:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6 shadow-sm"
        >
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            사용자명
            <input
              type="text"
              name="username"
              autoComplete="username"
              required
              value={formState.username}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            비밀번호
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={formState.password}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>
          {errorMessage ? (
            <p className="text-sm text-rose-500" role="alert" aria-live="polite">
              {errorMessage}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loginMutation.isPending ? "로그인 중" : "로그인"}
          </button>
          <p className="text-xs text-slate-500">
            계정이 필요하신가요?{" "}
            <Link
              href="/signup"
              className="font-medium text-slate-700 underline hover:text-slate-900"
            >
              회원가입하기
            </Link>
          </p>
        </form>
        <figure className="overflow-hidden rounded-xl border border-slate-200">
          <Image
            src="https://picsum.photos/seed/login/640/640"
            alt="로그인"
            width={640}
            height={640}
            className="h-full w-full object-cover"
            priority
          />
        </figure>
      </div>
    </div>
  );
}

export default function LoginPage({ params }: LoginPageProps) {
  void params;
  const { isAuthenticated, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
        <LoadingState variant="text" count={3} className="w-full max-w-md" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
          <LoadingState variant="text" count={3} className="w-full max-w-md" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
