import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type AdminUserUpdateInputDTO,
  AdminUserUpdateInputDTOSchema,
} from "@cirrodrive/schemas/admin";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAdminUserUpdate } from "#services/useAdminUserUpdate.js";
import { useTRPC } from "#services/trpc.js";
import { Button } from "#shadcn/components/Button.js";
import { Input } from "#shadcn/components/Input.js";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "#shadcn/components/Form.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { LoadingButton } from "#components/shared/LoadingButton.js";

interface UserEditFormProps {
  id: string;
  onSubmitSuccess?: () => void;
}

export function AdminUserEditForm({
  id,
  onSubmitSuccess,
}: UserEditFormProps): JSX.Element {
  const trpc = useTRPC();

  const { updateUser, isPending, isError, error } = useAdminUserUpdate();

  const { data: user, isLoading: isUserLoading } = useQuery({
    ...trpc.protected.user.get.queryOptions({ id }),
    enabled: Boolean(id),
  });

  const form = useForm<AdminUserUpdateInputDTO>({
    resolver: zodResolver(AdminUserUpdateInputDTOSchema),
    defaultValues: {
      username: "",
      password: undefined,
      email: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset(user);
    }
  }, [user, form]);

  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  const onSubmit = (data: AdminUserUpdateInputDTO) => {
    updateUser(data, {
      onSuccess: onSubmitSuccess,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>사용자명</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호 (변경 시에만 입력)</FormLabel>
              <FormControl>
                <Input type="password" placeholder="새 비밀번호" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isError && error ?
          <div className="text-red-500 text-sm">
            {(error as { message?: string })?.message ??
              "사용자 수정 중 오류가 발생했습니다."}
          </div>
        : null}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onSubmitSuccess}
            disabled={Boolean(isPending)}
          >
            취소
          </Button>
          <LoadingButton
            type="submit"
            isLoading={isPending}
            loadingText="수정 중..."
          >
            수정
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
