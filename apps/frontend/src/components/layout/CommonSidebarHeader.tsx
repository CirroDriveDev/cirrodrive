import { Link } from "react-router";
import { Logo } from "#components/layout/Logo.js";
import { SidebarHeader } from "#shadcn/components/Sidebar.js";

export function CommonSidebarHeader(): JSX.Element {
  return (
    <SidebarHeader className="flex h-16 items-center border-b bg-primary px-4">
      <Link to="/" className="flex flex-grow items-center space-x-2">
        <div className="flex flex-grow items-center space-x-2">
          <Logo />
          <div className="w-full text-center font-orbitron text-2xl font-bold text-white">
            Cirrodrive
          </div>
        </div>
      </Link>
    </SidebarHeader>
  );
}
