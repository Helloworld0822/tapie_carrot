"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import SiteHeader from "@/app/components/layout/site-header";
import PhotoInput from "./photo-input";
import Icon from "../ui-icon";
import "./sell.css";
export default function SellForm() {
  const router = useRouter();
  const [auth, setAuth] = useState<
    "checking" | "ready" | "required" | "failed"
  >("checking");
  useEffect(() => {
    let live = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (live) setAuth(data.user ? "ready" : "required");
      })
      .catch(() => {
        if (live) setAuth("failed");
      });
    return () => {
      live = false;
    };
  }, []);
  const dirty = useRef(false);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const leave = (event: MouseEvent) => {
      const link =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        !dirty.current ||
        !link ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      if (!window.confirm("작성 중인 내용이 있어요. 이 페이지를 나갈까요?")) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        dirty.current = false;
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", leave, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", leave, true);
    };
  }, []);
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [free, setFree] = useState(false),
    [title, setTitle] = useState(""),
    [description, setDescription] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    if (free) data.set("price", "0");
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "등록하지 못했어요.");
        return;
      }
      dirty.current = false;
      router.push(`/items/${result.id}`);
    } catch {
      setError("연결을 확인해주세요. 입력 내용은 그대로 유지했어요.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <SiteHeader />
      <main className="sell-page">
        <Link className="sell-back" href="/#market">
          ← 중고거래 목록
        </Link>
        <div className="sell-heading">
          <p className="eyebrow">우리 동네 이웃에게</p>
          <h1>내 물건에 새로운 일상을.</h1>
          <p>물건의 이야기를 들려주세요. 좋은 이웃을 만날 수 있을 거예요.</p>
        </div>
        <div className="sell-layout">
          <form
            id="sell-form"
            className="sell-form"
            onChange={() => {
              dirty.current = true;
            }}
            onSubmit={submit}
          >
            {auth !== "ready" && (
              <div className="sell-auth" role="status">
                {auth === "checking" ? (
                  "로그인 상태를 확인하고 있어요."
                ) : auth === "required" ? (
                  <>
                    판매글을 작성하려면 먼저 로그인해주세요.{" "}
                    <Link href="/login?next=/sell">로그인하기 →</Link>
                  </>
                ) : (
                  <>
                    로그인 상태를 확인하지 못했어요.{" "}
                    <button type="button" onClick={() => location.reload()}>
                      다시 확인
                    </button>
                  </>
                )}
              </div>
            )}
            <fieldset disabled={pending || auth !== "ready"}>
              <section className="sell-section">
                <h2>
                  <span>01</span> 물건을 보여주세요
                </h2>
                <PhotoInput />
              </section>
              <section className="sell-section">
                <h2>
                  <span>02</span> 어떤 물건인가요?
                </h2>
                <label htmlFor="sell-title">
                  제목 <small>필수</small>
                </label>
                <input
                  id="sell-title"
                  name="title"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 깨끗하게 사용한 원목 테이블"
                />
                <p className="sell-count">{title.length}/100</p>
                <label htmlFor="sell-price">
                  가격 <small>필수</small>
                </label>
                <div className="sell-price">
                  <input
                    id="sell-price"
                    name="price"
                    type="number"
                    required={!free}
                    disabled={free || pending}
                    min="0"
                    step="1"
                    placeholder={
                      free
                        ? "이웃에게 무료로 나눠요"
                        : "판매할 가격을 입력해주세요"
                    }
                  />
                  <span>원</span>
                </div>
                <label className="sell-free">
                  <input
                    type="checkbox"
                    checked={free}
                    onChange={(e) => setFree(e.target.checked)}
                  />{" "}
                  이웃에게 나눔할게요
                </label>
                <label htmlFor="sell-description">자세한 설명</label>
                <textarea
                  id="sell-description"
                  name="description"
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    "물건의 상태, 사용 기간, 거래 시 참고할 내용을 알려주세요.\n솔직하고 자세한 설명이 좋은 거래로 이어져요."
                  }
                />
                <p className="sell-count">{description.length}/2000</p>
              </section>
              <section className="sell-section">
                <h2>
                  <span>03</span> 어디에서 거래할까요?
                </h2>
                <label htmlFor="sell-location">
                  거래 동네 <small>필수</small>
                </label>
                <input
                  id="sell-location"
                  name="location"
                  required
                  maxLength={50}
                  placeholder="예: 서초동"
                />
                <p className="sell-help">
                  상세 주소는 공개하지 말고, 채팅으로 장소를 정해주세요.
                </p>
              </section>
            </fieldset>
            {error && (
              <div className="sell-error" role="alert">
                {error}
                {error.includes("로그인") && (
                  <Link href="/login?next=/sell"> 로그인하기 →</Link>
                )}
              </div>
            )}
            <div className="sell-actions">
              <p>등록한 글은 동네 이웃들이 볼 수 있어요.</p>
              <button
                className="primary"
                disabled={pending || auth !== "ready"}
              >
                {pending ? "사진과 판매글 등록 중…" : "판매글 등록하기"}
              </button>
            </div>
          </form>
          <aside className="sell-tips">
            <Icon name="market" />
            <h2>좋은 거래의 시작</h2>
            <ul>
              <li>
                <strong>사진은 밝고 선명하게</strong>
                <p>물건 전체가 보이도록 찍어주세요.</p>
              </li>
              <li>
                <strong>상태는 솔직하게</strong>
                <p>사용감이나 흠집도 미리 알려주세요.</p>
              </li>
              <li>
                <strong>거래는 가까운 곳에서</strong>
                <p>서로 편한 시간과 장소를 약속해요.</p>
              </li>
            </ul>
            <Link href="/#market">다른 이웃의 물건 둘러보기 →</Link>
          </aside>
        </div>
      </main>
    </>
  );
}
