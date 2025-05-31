import { Link } from "react-router";
import { Logo } from "#components/layout/Logo.js";
import { SidebarHeader } from "#shadcn/components/Sidebar.js";

export function CommonSidebarHeader(): JSX.Element {
  return (
    <SidebarHeader className="h-16 flex items-center px-4 border-b bg-primary">
      <Link to="/" className="flex items-center space-x-2 flex-grow">
        <div className="flex items-center space-x-2 flex-grow">
          <Logo />
          <div className="font-orbitron text-2xl font-bold text-white w-full text-center">
            Cirrodrive
          </div>
        </div>
      </Link>
    </SidebarHeader>
  );
}
