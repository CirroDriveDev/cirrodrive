import React from "react";

export function Main({ children }: { children: React.ReactNode }): JSX.Element {
  return <main className="flex flex-grow">{children}</main>;
}
