"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import ChatConversation from "./chat-conversation";
type Chat = {
  readonly id: number;
  readonly title: string;
  readonly partner_name: string;
  readonly last_message: string | null;
};
export default function ChatPanel({
  user,
  initialChat = null,
  onClose,
}: {
  user: User | null;
  initialChat?: number | null;
  onClose: () => void;
}) {
  const [chats, setChats] = useState<Chat[]>([]),
    [active, setActive] = useState<number | null>(initialChat),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    let running = false;
    async function load() {
      if (running) return;
      running = true;
      try {
        const response = await fetch("/api/chats", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("채팅 목록을 불러오지 못했어요.");
        const data = await response.json();
        if (!controller.signal.aborted) {
          setChats(data);
          setError("");
        }
      } catch {
        if (!controller.signal.aborted)
          setError("채팅 목록을 불러오지 못했어요.");
      } finally {
        running = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    const timer = setInterval(load, 3000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [user]);
  const selected = chats.find((chat) => chat.id === active);
  return (
    <section className="floating-chat" role="dialog" aria-label="내 채팅">
      <div className="modal account-panel chat-panel">
        <div className="modal-head">
          <h2>내 채팅</h2>
          <button aria-label="채팅 패널 닫기" onClick={onClose}>
            ×
          </button>
        </div>
        {!user ? (
          <p>
            로그인하고 이웃과 대화를 시작해보세요.{" "}
            <Link href="/login">로그인하기 →</Link>
          </p>
        ) : active === null ? (
          <>
            {error && <p role="alert">{error}</p>}
            <p role="status">
              {loading
                ? "대화를 불러오고 있어요."
                : chats.length
                  ? "대화를 선택해주세요."
                  : "아직 시작한 대화가 없어요. 상품에서 채팅을 시작해보세요."}
            </p>
            {chats.map((chat) => (
              <div className="chat-row" key={chat.id}>
                <button
                  className="chat-preview"
                  onClick={() => setActive(chat.id)}
                >
                  <span className="chat-avatar">
                    {chat.partner_name.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{chat.partner_name}</strong>
                    <span className="chat-product">{chat.title}</span>
                    <span className="chat-snippet">
                      {chat.last_message || "대화 시작하기"}
                    </span>
                  </span>
                </button>
              </div>
            ))}
          </>
        ) : (
          <>
            <button className="text-button" onClick={() => setActive(null)}>
              ← 대화 목록
            </button>
            <h3>{selected?.partner_name || "이웃과의 대화"}</h3>
            <p className="chat-product">{selected?.title}</p>
            <ChatConversation key={active} id={active} user={user} />
          </>
        )}
      </div>
    </section>
  );
}
