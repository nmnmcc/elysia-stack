import { Header } from "@/components/Header";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { readonly children: ReactNode }) {
  return (
    <>
      <Header />
      <div className="mx-auto flex w-full max-w-4xl">
        <main className="min-w-0 flex-1 px-4 py-6">{children}</main>
      </div>
    </>
  );
}
