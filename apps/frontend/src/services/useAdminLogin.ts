import { useState } from "react"; // React 상태 관리 훅
import type {
  AppRouter,
  RouterInput,
  RouterOutput,
} from "@cirrodrive/backend/app-router"; // 백엔드 라우터 타입 정의
import type { UseTRPCMutationOptions } from "@trpc/react-query/shared"; // tRPC Mutation 옵션 타입
import type { TRPCClientErrorLike } from "@trpc/client"; // tRPC 클라이언트 오류 타입
import { z, type ZodFormattedError } from "zod"; // Zod를 사용한 유효성 검사 라이브러리
import { trpc } from "#services/trpc.js"; // tRPC 클라이언트 인스턴스
import { useBoundStore } from "#store/useBoundStore.js"; // 상태 관리 스토어

// 폼 유효성 검사 스키마 정의
const formSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요."), // 이메일 형식 검사
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."), // 비밀번호 길이 검사
});

type FormSchema = z.infer<typeof formSchema>; // 폼 스키마 타입 추출

type UseAdminLoginOptions = UseTRPCMutationOptions<
  RouterInput["protected"]["session"]["login"], // 로그인 요청 입력 타입
  TRPCClientErrorLike<AppRouter>, // tRPC 오류 타입
  RouterOutput["protected"]["session"]["login"] // 로그인 요청 출력 타입
>;

interface UseAdminLogin {
  input: RouterInput["protected"]["session"]["login"]; // 폼 입력값 상태
  validationError: ZodFormattedError<FormSchema> | undefined; // 유효성 검사 오류 상태
  submissionError: string | undefined; // 서버 요청 오류 상태
  mutation: ReturnType<typeof trpc.protected.session.login.useMutation>; // tRPC Mutation 객체
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // 입력값 변경 핸들러
  handleFormSubmit: (e: React.FormEvent) => void; // 폼 제출 핸들러
}

export const useAdminLogin = (opts?: UseAdminLoginOptions): UseAdminLogin => {
  const { setUser } = useBoundStore(); // 상태 관리 스토어에서 사용자 설정 함수 가져오기

  const [input, setInput] = useState<
    RouterInput["protected"]["session"]["login"]
  >({
    email: "", // 초기 이메일 값
    password: "", // 초기 비밀번호 값
  });

  const [validationError, setValidationError] =
    useState<ZodFormattedError<FormSchema>>(); // 유효성 검사 오류 상태 초기화

  const [submissionError, setSubmissionError] = useState<string>(); // 서버 요청 오류 상태 초기화

  const mutation = trpc.protected.session.login.useMutation({
    ...opts, // tRPC Mutation 옵션 전달
    onSuccess: (data: RouterOutput["protected"]["session"]["login"]) => {
      // 로그인 성공 시 호출
      const transformedData = {
        ...data,
        username: data.name ?? "", // name을 username으로 매핑
        currentPlanId: "", // 다 기본값 설정
        usedStorage: 0,
        profileImageUrl: null,
        updatedAt: new Date(),
        rootFolderId: "",
        trashFolderId: "",
      };

      setUser(transformedData); // 변환된 데이터를 상태 관리 스토어에 저장
      setSubmissionError(undefined); // 서버 요청 오류 상태 초기화
    },
    onError: (error) => {
      // 로그인 실패 시 호출
      setSubmissionError(error.message || "로그인에 실패했습니다."); // 오류 메시지 설정
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target; // 입력 필드 이름과 값 추출
    setInput({
      ...input, // 기존 입력값 유지
      [name]: value, // 변경된 입력값 업데이트
    });
  };

  const handleFormSubmit = (e: React.FormEvent): void => {
    e.preventDefault(); // 기본 폼 제출 동작 방지
    const result = formSchema.safeParse(input); // 입력값 유효성 검사

    if (result.success) {
      setValidationError(undefined); // 유효성 검사 오류 상태 초기화
      mutation.mutate(result.data); // tRPC Mutation 실행
    } else {
      setValidationError(result.error.format()); // 유효성 검사 오류 상태 업데이트
      setSubmissionError(undefined); // 서버 요청 오류 상태 초기화
    }
  };

  return {
    input, // 폼 입력값 상태 반환
    validationError, // 유효성 검사 오류 상태 반환
    submissionError, // 서버 요청 오류 상태 반환
    mutation, // tRPC Mutation 객체 반환
    handleInputChange, // 입력값 변경 핸들러 반환
    handleFormSubmit, // 폼 제출 핸들러 반환
  };
};
