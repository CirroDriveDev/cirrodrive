import type React from "react";

interface LandingContainerProps {
  header: React.ReactNode;
  children: React.ReactNode;
}

export function LandingContainer({
  header,
  children,
}: LandingContainerProps): JSX.Element {
  return (
    <div className="grid min-h-screen grid-cols-[250px_1fr] grid-rows-[70px_minmax(200px,_1fr)]">
      <div className="col-span-2 row-start-1 row-end-2 flex">{header}</div>

      <div className="col-start-1 col-end-3 row-start-2 w-full p-4">
        <div className="grid grid-cols-[minmax(345px,1fr)_minmax(345px,1fr)] grid-rows-[repeat(2,minmax(600px,auto))]">
          {children}
        </div>
      </div>
    </div>
  );
}
