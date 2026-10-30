import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "당근 | 당신 근처의 동네 생활",
  description: "가까운 이웃과 중고거래를 시작해 보세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
