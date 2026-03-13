import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio Forge",
  description: "AI website studio for richer, editable, shareable websites.",
};

const themeBootScript = `
  try {
    const theme = localStorage.getItem('studio-theme');
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
