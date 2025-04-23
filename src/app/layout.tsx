import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tardle",
  description: "A Wordle-like game with custom words",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white dark:bg-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
