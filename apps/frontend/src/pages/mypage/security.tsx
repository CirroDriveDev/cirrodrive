import { useState } from "react";
import {
  ShieldIcon,
  KeyIcon,
  SmartphoneIcon,
  MonitorIcon,
  LogOutIcon,
  AlertTriangleIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { trpc } from "#services/trpc.js";
import { Button } from "#shadcn/components/Button.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#shadcn/components/Card.js";
import { Input } from "#shadcn/components/Input.js";
import { Label } from "#shadcn/components/Label.js";
import { Badge } from "#shadcn/components/Badge.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#shadcn/components/Table.js";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "#shadcn/components/Alert.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#shadcn/components/Dialog.js";

export function SecurityPage(): JSX.Element {
  // 비밀번호 변경 상태
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // 계정 삭제 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // API 쿼리 및 뮤테이션
  const sessions = trpc.session.getSessions.useQuery();
  const changePasswordMutation = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      toast.success("비밀번호가 성공적으로 변경되었습니다.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "비밀번호 변경에 실패했습니다.");
    },
  });
  const logoutSessionMutation = trpc.session.logoutSession.useMutation({
    onSuccess: () => {
      toast.success("세션이 성공적으로 로그아웃되었습니다.");
      void sessions.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "세션 로그아웃에 실패했습니다.");
    },
  });
  const deleteAccountMutation = trpc.user.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("계정이 성공적으로 삭제되었습니다.");
      // 로그아웃 처리 또는 홈으로 리다이렉트
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(error.message || "계정 삭제에 실패했습니다.");
    },
  });

  // 세션 데이터 가져오기
  interface Session {
    id: string;
    deviceName: string;
    ipAddress: string;
    lastActivity: string;
    isCurrent: boolean;
  }
  const sessionData: Session[] = sessions.data ?? [];

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.includes("iPhone") || deviceName.includes("Android")) {
      return <SmartphoneIcon className="w-4 h-4" />;
    }
    return <MonitorIcon className="w-4 h-4" />;
  };

  // 핸들러 함수들
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };
  const handleLogoutSession = (sessionId: string) => {
    void logoutSessionMutation.mutate({ sessionId });
  };
  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "영구 삭제") {
      toast.error('확인을 위해 "영구 삭제"를 정확히 입력해주세요.');
      return;
    }

    if (!passwordForm.currentPassword) {
      toast.error("현재 비밀번호를 입력해주세요.");
      return;
    }

    deleteAccountMutation.mutate({
      password: passwordForm.currentPassword,
      confirmText: deleteConfirmText,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">보안 설정</h1>
        <ShieldIcon className="w-8 h-8 text-blue-500" />
      </div>

      {/* 비밀번호 변경 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <KeyIcon className="w-5 h-5 mr-2" />
            비밀번호 변경
          </CardTitle>
          <CardDescription>
            새 비밀번호는 8자 이상이어야 하며, 영문, 숫자, 특수문자를 포함하는
            것을 권장합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">현재 비밀번호</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords.current ? "text" : "password"}
                placeholder="현재 비밀번호를 입력하세요"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
              >
                {showPasswords.current ?
                  <EyeOffIcon className="w-4 h-4" />
                : <EyeIcon className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">새 비밀번호</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? "text" : "password"}
                placeholder="새 비밀번호를 입력하세요"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
              >
                {showPasswords.new ?
                  <EyeOffIcon className="w-4 h-4" />
                : <EyeIcon className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="새 비밀번호를 다시 입력하세요"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
              >
                {showPasswords.confirm ?
                  <EyeOffIcon className="w-4 h-4" />
                : <EyeIcon className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={handlePasswordChange} className="w-full sm:w-auto">
            비밀번호 변경
          </Button>
        </CardContent>
      </Card>

      {/* 세션 관리 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MonitorIcon className="w-5 h-5 mr-2" />
            기기 및 세션 관리
          </CardTitle>
          <CardDescription>
            로그인한 기기 목록과 최근 접속 정보를 확인하고, 원격으로 로그아웃할
            수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessionData.length > 0 ?
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>기기</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        IP 주소
                      </TableHead>
                      <TableHead>마지막 활동</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionData.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getDeviceIcon(session.deviceName)}
                            <div>
                              <p className="font-medium">
                                {session.deviceName}
                              </p>
                              <p className="text-sm text-gray-500 sm:hidden">
                                {session.ipAddress}
                              </p>
                            </div>
                            {session.isCurrent ?
                              <Badge variant="secondary" className="ml-2">
                                현재 세션
                              </Badge>
                            : null}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {session.ipAddress}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {session.lastActivity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {!session.isCurrent && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLogoutSession(session.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <LogOutIcon className="w-4 h-4 mr-1" />
                              로그아웃
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            : <div className="text-center py-8 text-gray-500">
                활성 세션이 없습니다.
              </div>
            }

            <div className="text-sm text-foreground bg-muted p-3 rounded-lg">
              💡 알지 못하는 기기나 위치에서의 로그인이 있다면 즉시
              해당 세션을 로그아웃하고 비밀번호를 변경하세요.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 계정 삭제 섹션 */}
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertTitle>위험 영역</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>
            계정을 삭제하면 모든 파일, 설정, 구독 정보가 영구적으로 삭제됩니다.
            이 작업은 되돌릴 수 없습니다.
          </p>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="mt-2">
                계정 삭제 요청
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-600">
                  <AlertTriangleIcon className="w-5 h-5 mr-2" />
                  계정 삭제 확인
                </DialogTitle>
                <DialogDescription className="space-y-3">
                  <p>정말로 계정을 삭제하시겠습니까?</p>
                  <p className="text-sm text-red-600 font-medium">
                    삭제되는 데이터:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>모든 업로드된 파일</li>
                    <li>공유 링크 및 설정</li>
                    <li>결제 정보 및 구독</li>
                    <li>계정 정보 및 설정</li>
                  </ul>
                  <p className="text-sm font-medium">
                    계속하려면 아래에 &ldquo;계정 삭제&rdquo;를 입력하세요:
                  </p>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="계정 삭제"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setDeleteConfirmText("");
                  }}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "계정 삭제"}
                >
                  영구 삭제
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </AlertDescription>
      </Alert>
    </div>
  );
}
