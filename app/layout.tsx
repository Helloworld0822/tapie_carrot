import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "테이피 당근마켓",
  description: "가까운 이웃과 중고거래를 시작해 보세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
