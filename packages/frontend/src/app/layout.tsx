import { Providers } from "@/components/Providers";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata = {
  title: "elysia-stack",
  description: "Full-stack TypeScript with Elysia",
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
