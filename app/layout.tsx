import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GPT for GPT",
  description: "ChatGPT-like interface with threads and generative UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
