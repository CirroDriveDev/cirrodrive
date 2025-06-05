import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type AdminUserUpdateInputDTO,
  AdminUserUpdateInputDTOSchema,
} from "@cirrodrive/schemas/admin";
import { toast } from "react-toastify";
import { Input } from "#shadcn/components/Input.js";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "#shadcn/components/Form.js";
import { LoadingButton } from "#components/shared/LoadingButton.js";
import { useAdminUserUpdate } from "#services/useAdminUserUpdate.js";

interface AdminUserFormProps {
  defaultValues: AdminUserUpdateInputDTO;
  onSubmit: (data: AdminUserUpdateInputDTO) => void;
}

export function AdminUserEditForm({
  defaultValues,
  onSubmit,
}: AdminUserFormProps): JSX.Element {
  const { updateUser, isPending } = useAdminUserUpdate();

  const form = useForm<AdminUserUpdateInputDTO>({
    resolver: zodResolver(AdminUserUpdateInputDTOSchema),
    defaultValues,
  });

  const handleSubmit = (data: AdminUserUpdateInputDTO) => {
    updateUser(data, {
      onSuccess: () => {
        onSubmit(data);
        toast.success("사용자 정보가 성공적으로 업데이트되었습니다.");
      },
      onError: (err) => {
        toast.error(`사용자 정보 업데이트 실패: ${err.message}`);
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

        <div className="flex justify-end space-x-2">
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
