"use client";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import Icon from "./components/ui-icon";

import type { Item, MarketFilters } from "@/lib/types";
import ItemCard from "./components/marketplace/item-card";
import Filters from "./components/marketplace/market-filters";
import SiteHeader from "./components/layout/site-header";
export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [region, setRegion] = useState(""),
    [price, setPrice] = useState("all"),
    [sort, setSort] = useState("latest"),
    [loading, setLoading] = useState(true);
  const requestVersion = useRef(0);
  const [regions, setRegions] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/items/regions")
      .then((r) => r.json())
      .then(setRegions)
      .catch(() => setError("지역 목록을 불러오지 못했어요."));
  }, []);
  const [appliedQuery, setAppliedQuery] = useState("");
  function reset() {
    setRegion("");
    setPrice("all");
    setSort("latest");
    setQuery("");
    void load("", { region: "", price: "all", sort: "latest" });
  }
  async function load(q: string, filters: MarketFilters) {
    const version = ++requestVersion.current;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "/api/items?" + new URLSearchParams({ q, ...filters }),
      );
      if (!res.ok) throw new Error("목록을 불러오지 못했어요.");
      const data = await res.json();
      if (version === requestVersion.current) {
        setItems(data);
        setAppliedQuery(q);
      }
    } catch {
      if (version === requestVersion.current)
        setError("목록을 불러오지 못했어요. 다시 시도해주세요.");
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }
  const loadInitial = useEffectEvent(() => {
    void load("", { region: "", price: "all", sort: "latest" });
  });
  useEffect(() => {
    loadInitial();
  }, []);
  return (
    <>
      <SiteHeader>
        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            load(query, { region, price, sort });
            document.getElementById("market")?.scrollIntoView();
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="물품이나 동네를 검색해보세요"
            aria-label="검색어"
          />
          <button aria-label="검색">
            <Icon name="search" />
          </button>
        </form>
      </SiteHeader>
      <main>
        <section className="discover">
          <div className="discover-inner">
            <p className="eyebrow">당신 근처의 중고거래</p>
            <h1>찾던 물건, 가까운 이웃에게.</h1>
            <p>우리 동네에서 필요한 물건을 찾아보세요.</p>
            <form
              className="discover-search"
              onSubmit={(e) => {
                e.preventDefault();
                void load(query, { region, price, sort });
                document.getElementById("market")?.scrollIntoView();
              }}
            >
              <input
                aria-label="동네 물건 검색"
                placeholder="어떤 물건을 찾고 있나요?"
                maxLength={100}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit">검색</button>
            </form>
            <div className="suggested">
              <span>추천 검색어</span>
              {["자전거", "책", "테이블", "니트", "화분"].map((word) => (
                <button
                  key={word}
                  onClick={() => {
                    setQuery(word);
                    void load(word, { region, price, sort });
                    document.getElementById("market")?.scrollIntoView();
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
            <div className="service-shortcuts">
              <Link href="#market">
                <span>
                  <Icon name="market" />
                </span>
                <strong>중고거래</strong>
                <small>동네 물건 둘러보기</small>
              </Link>
              <Link href="/chats">
                <span>
                  <Icon name="chat" />
                </span>
                <strong>채팅</strong>
                <small>이웃과 거래 이야기</small>
              </Link>
              <a href="/sell">
                <span>
                  <Icon name="plus" />
                </span>
                <strong>판매하기</strong>
                <small>내 물건 등록하기</small>
              </a>
              <Link href="/login">
                <span>
                  <Icon name="user" />
                </span>
                <strong>나의 계정</strong>
                <small>로그인하고 시작해요</small>
              </Link>
            </div>
          </div>
        </section>
        <section className="market section" id="market">
          <div className="section-heading">
            <div>
              <p className="eyebrow">우리 동네 중고거래</p>
              <h2>가까운 이웃과 함께해요</h2>
              <p>동네에서 찾은 반가운 물건들을 만나보세요.</p>
            </div>
            <a className="text-button" href="/sell">
              내 물건 판매하기 →
            </a>
          </div>
          <Filters
            value={{ region, price, sort }}
            regions={regions}
            onChange={(filters) => {
              setRegion(filters.region);
              setPrice(filters.price);
              setSort(filters.sort);
              void load(appliedQuery, filters);
            }}
            onReset={reset}
          />
          <div className="results-summary" aria-live="polite">
            {loading
              ? "동네 물건을 찾고 있어요…"
              : `${appliedQuery ? "“" + appliedQuery + "” 검색 결과 · " : ""}${items.length}개의 물건`}
          </div>
          {error && (
            <p role="alert">
              {error}{" "}
              <button onClick={() => void load(query, { region, price, sort })}>
                다시 시도
              </button>
            </p>
          )}
          <div className="grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          {!loading && !error && items.length === 0 && (
            <div className="empty-state">
              <strong>조건에 맞는 물건이 없어요</strong>
              <p>검색어나 지역·가격 조건을 바꿔보세요.</p>
              <button className="outline" onClick={reset}>
                전체 물건 보기
              </button>
            </div>
          )}
        </section>
      </main>
      <footer>
        <div className="section footer-grid">
          <div>
            <strong>당근</strong>
            <p>당신 근처의 따뜻한 동네 거래</p>
          </div>
          <div>
            <h3>둘러보기</h3>
            <Link href="/#market">중고거래</Link>
            <Link href="/chats">내 채팅</Link>
          </div>
          <div>
            <h3>내 계정</h3>
            <Link href="/login">로그인</Link>
            <Link href="/register">회원가입</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
