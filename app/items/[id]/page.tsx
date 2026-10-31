"use client";
import Link from "next/link";
import { Suspense, use, useEffect, useState } from "react";
import SiteHeader from "@/app/components/layout/site-header";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Price from "@/app/components/items/price";
import type { Item } from "@/lib/types";
function ItemContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [item, setItem] = useState<Item | null>(null),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(`/api/items/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (live) setItem(d);
      })
      .catch((e) => {
        if (live)
          setError(
            e instanceof Error ? e.message : "상품을 불러오지 못했어요.",
          );
      });
    return () => {
      live = false;
    };
  }, [id]);
  async function chat() {
    if (!item) return;
    setPending(true);
    try {
      const r = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const d = await r.json();
      if (r.status === 401) {
        router.push("/login?next=" + encodeURIComponent(`/items/${item.id}`));
        return;
      }
      if (!r.ok) {
        setError(d.error);
        return;
      }
      window.dispatchEvent(new CustomEvent("open-chat", { detail: d.id }));
    } catch {
      setError("연결을 확인해주세요.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <SiteHeader />
      <main className="section product-page">
        <Link className="account-home" href="/#market">
          ← 중고거래 목록
        </Link>
        {error && <p role="alert">{error}</p>}
        {!item && !error && <p role="status">상품을 불러오는 중이에요.</p>}
        {item && (
          <>
            <div className="product-layout">
              <div>
                {item.has_photo ? (
                  <Image
                    width={900}
                    height={675}
                    sizes="(max-width: 800px) 100vw, 650px"
                    className="product-photo"
                    src={`/api/items/${item.id}/image`}
                    alt={item.title}
                  />
                ) : (
                  <div className="product-placeholder">
                    <span>물품 사진</span>
                    <p>판매자가 사진을 등록하지 않았어요.</p>
                  </div>
                )}
                <div className="detail-seller">
                  <span className="chat-avatar">
                    {(item.seller_name || "당근").slice(0, 1)}
                  </span>
                  <div>
                    <strong>{item.seller_name || "예시 상품"}</strong>
                    <p>{item.location}</p>
                  </div>
                </div>
                <h1>{item.title}</h1>
                <p className="detail-location">중고거래 · {item.location}</p>
                <p className="detail-description">
                  {item.description || "등록된 설명이 없어요."}
                </p>
              </div>
              <aside className="product-actions">
                <p className="eyebrow">가까운 이웃과 따뜻한 거래</p>
                <h2>{item.title}</h2>
                <Price value={item.price} />
                <p className="detail-location">거래 지역 · {item.location}</p>
                <button
                  className="primary submit"
                  disabled={pending || !item.seller_id}
                  onClick={chat}
                >
                  {pending
                    ? "연결 중…"
                    : item.seller_id
                      ? "채팅으로 거래하기"
                      : "판매자 정보 없는 예시 상품"}
                </button>
                <div className="trade-guide">
                  <strong>만나서 거래해요</strong>
                  <p>
                    물건 상태를 채팅으로 확인하고 거래 시간과 장소를 약속해요.
                  </p>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="section" role="status">
          상품을 불러오는 중이에요.
        </main>
      }
    >
      <ItemContent params={params} />
    </Suspense>
  );
}
