import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BNCT 안전서류 관리자",
  description: "BNCT 자산관리팀 안전서류 전자결재 관리자 페이지",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
