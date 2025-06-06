import { toast } from "react-toastify";
import { Button } from "#shadcn/components/Button.js";

export function TestPage(): JSX.Element {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex bg-foreground">
        <Button onClick={() => toast("테스트용 토스트 메시지")}>기본</Button>
        <Button onClick={() => toast.success("테스트용 토스트 메시지")}>
          success
        </Button>
        <Button onClick={() => toast.info("테스트용 토스트 메시지")}>
          info
        </Button>
        <Button onClick={() => toast.warning("테스트용 토스트 메시지")}>
          warning
        </Button>
        <Button onClick={() => toast.error("테스트용 토스트 메시지")}>
          error
        </Button>
      </div>
    </div>
  );
}
