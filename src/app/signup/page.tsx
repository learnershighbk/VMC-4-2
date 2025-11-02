"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { LoadingState } from "@/components/ui/loading-state";

const defaultFormState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

type SignupPageProps = {
  params: Promise<Record<string, never>>;
};

export default function SignupPage({ params }: SignupPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, refresh, isLoading } = useCurrentUser();
  const registerMutation = useRegister();
  const [formState, setFormState] = useState(defaultFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectedFrom = searchParams.get("redirectedFrom") ?? "/";
      router.replace(redirectedFrom);
    }
  }, [isAuthenticated, router, searchParams]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
        <LoadingState variant="text" count={3} className="w-full max-w-md" />
      </div>
    );
  }

  const isSubmitDisabled = useMemo(
    () =>
      !formState.username.trim() ||
      !formState.email.trim() ||
      !formState.password.trim() ||
      formState.password !== formState.confirmPassword,
    [
      formState.confirmPassword,
      formState.email,
      formState.password,
      formState.username,
    ]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setFormState((previous) => ({ ...previous, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage(null);

      if (formState.password !== formState.confirmPassword) {
        setErrorMessage("비밀번호가 일치하지 않습니다.");
        return;
      }

      try {
        await registerMutation.mutateAsync({
          username: formState.username,
          email: formState.email,
          password: formState.password,
          password_confirm: formState.confirmPassword,
        });

        await refresh();
        const redirectedFrom = searchParams.get("redirectedFrom") ?? "/";
        router.replace(redirectedFrom);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "회원가입 처리 중 오류가 발생했습니다.";
        setErrorMessage(message);
      }
    },
    [
      formState.confirmPassword,
      formState.email,
      formState.password,
      formState.username,
      registerMutation,
      refresh,
      router,
      searchParams,
    ]
  );

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">회원가입</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          사용자명과 이메일로 계정을 생성하고 프로젝트를 시작하세요.
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
            이메일
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={formState.email}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            비밀번호
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required
              value={formState.password}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            비밀번호 확인
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={formState.confirmPassword}
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
            disabled={registerMutation.isPending || isSubmitDisabled}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {registerMutation.isPending ? "등록 중" : "회원가입"}
          </button>
          <p className="text-xs text-slate-500">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-slate-700 underline hover:text-slate-900"
            >
              로그인으로 이동
            </Link>
          </p>
        </form>
        <figure className="overflow-hidden rounded-xl border border-slate-200">
          <Image
            src="https://picsum.photos/seed/signup/640/640"
            alt="회원가입"
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
