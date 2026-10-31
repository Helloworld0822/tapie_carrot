import Link from "next/link";
import type { ReactNode } from "react";
import BrandLogo from "./brand-logo";
import AccountMenu from "../account/account-menu";
export default function SiteHeader({
  children,
  initialChat = false,
}: {
  children?: ReactNode;
  initialChat?: boolean;
}) {
  return (
    <header className="top">
      <div className="nav">
        <Link href="/" aria-label="당근 홈">
          <BrandLogo />
        </Link>
        <nav aria-label="주 메뉴">
          <Link href="/#market">중고거래</Link>
          <Link href="/chats">채팅</Link>
        </nav>
        {children}
        <a className="outline" href="/sell">
          글쓰기
        </a>
        <AccountMenu
          key={initialChat ? "chat" : "default"}
          initialOpen={initialChat}
        />
      </div>
    </header>
  );
}
