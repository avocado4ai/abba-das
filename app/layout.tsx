import type { Metadata } from "next";
import { Heebo, Assistant } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "Abba-Das | אבא-דס",
  description: "בלוג הסיפורים של אבא",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${assistant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-heebo">{children}</body>
    </html>
  );
}
