import Link from "next/link";
import SiteHeader from "@/app/components/layout/site-header";
export default function ChatsPage() {
  return (
    <>
      <SiteHeader initialChat />
      <main className="section">
        <p className="eyebrow">당신 근처의 이웃</p>
        <h1>거래 이야기를 이어가세요.</h1>
        <p>오른쪽 아래 채팅에서 이웃과 나눈 대화를 확인할 수 있어요.</p>
        <Link className="primary" href="/#market">
          동네 물건 둘러보기 →
        </Link>
      </main>
    </>
  );
}
