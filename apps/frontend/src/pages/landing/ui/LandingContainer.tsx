import React from "react";

interface LandingContainerProps {
  children: React.ReactNode;
}

export function LandingContainer({
  children,
}: LandingContainerProps): JSX.Element {
  return (
    <div className="grid grid-cols-[minmax(345px,1fr)_minmax(345px,1fr)] grid-rows-[repeat(2,minmax(600px,auto))]">
      {children}
    </div>
  );
}
