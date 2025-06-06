import { ModeToggle } from "#shadcn/components/ModeToggle.js";
import { UserAvatar } from "#components/layout/user/UserAvatar.js";
import { HeaderSeparator } from "#components/layout/HeaderSeparator.js";

export function MyPageHeader(): JSX.Element {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-primary px-4">
      <div className="flex-grow" />
      <ModeToggle />
      <HeaderSeparator />
      <UserAvatar />
    </header>
  );
}
