import React from "react";
import { Footer } from "@/widgets/layout/ui/Footer.tsx";
import { Header } from "@/widgets/layout/ui/Header.tsx";
import { Main } from "@/widgets/layout/ui/Main.tsx";

export function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex w-full flex-grow flex-col justify-between">
      <Header />
      <Main>{children}</Main>
      <Footer />
    </div>
  );
}
