import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
});

const _clientEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

if (!_clientEnv.success) {
  console.error('환경 변수 검증 실패:', _clientEnv.error.flatten().fieldErrors);
  // 환경 변수는 optional이므로 에러를 throw하지 않습니다.
  // console.warn('일부 환경 변수가 설정되지 않았습니다.');
}

export const env: ClientEnv = _clientEnv.success ? _clientEnv.data : {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
};
