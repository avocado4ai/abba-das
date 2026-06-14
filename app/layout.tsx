import type { Metadata } from "next";
import { Heebo, Assistant } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "אבא-דס | סיפורים של רוני נעמן",
  description: "בלוג הסיפורים של רוני נעמן — זכרונות, מחשבות ורגעים קטנים מהחיים.",
  authors: [{ name: "רוני נעמן" }],
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
      <body className="min-h-full flex flex-col font-heebo">
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
