import React from "react";

export function Main({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <main className="flex w-full flex-grow flex-col justify-between px-8 py-16 lg:px-32 xl:px-64">
      {children}
    </main>
  );
}
