import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoReport - AI & ML Club, DPCOE",
  description:
    "Generate official AI & ML Club activity reports in DOCX and PDF using Gemini.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
