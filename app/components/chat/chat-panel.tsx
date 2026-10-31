"use client";
import { useEffect, useRef, useState } from "react";
import { AuthForm } from "../auth/auth-form";
type User = { id: number; name: string };
type Chat = {
  id: number;
  title: string;
  partner_name: string;
  last_message: string | null;
};
type Message = { id: number; sender_id: number; text: string };
export default function Account({
  standalone = false,
  initialRegister = false,
  initialChat = null,
  onClose,
  floating = false,
}: {
  standalone?: boolean;
  initialRegister?: boolean;
  initialChat?: number | null;
  onClose?: () => void;
  floating?: boolean;
}) {
  const socket = useRef<WebSocket | null>(null);
  const messageForm = useRef<HTMLFormElement | null>(null);
  const sending = useRef<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null),
    [open, setOpen] = useState(standalone || floating || initialChat !== null),
    [register] = useState(initialRegister),
    [error, setError] = useState(""),
    [chats, setChats] = useState<Chat[]>([]),
    [active, setActive] = useState<number | null>(initialChat),
    [messages, setMessages] = useState<Message[]>([]),
    [pending, setPending] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setError("로그인 상태를 확인하지 못했어요."));
  }, []);
  useEffect(() => {
    if (!open || !user) return;
    let disposed = false;
    async function poll() {
      try {
        const r = await fetch("/api/chats");
        if (!r.ok) throw new Error("채팅 목록을 불러오지 못했어요.");
        const data = await r.json();
        if (!disposed) setChats(data);
      } catch {
        if (!disposed) setError("채팅 목록을 불러오지 못했어요.");
      }
    }
    void poll();
    const timer = setInterval(poll, 3000);
    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [open, user]);
  useEffect(() => {
    if (active === null || !user) return;
    setMessages([]);
    setConnected(false);
    const ws = new WebSocket(
      `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/ws/chat?chatId=${active}`,
    );
    socket.current = ws;
    ws.onopen = () => {
      setConnected(true);
      setError("");
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "history") setMessages(data.messages);
      if (data.type === "message") {
        setMessages((old) =>
          old.some((m) => m.id === data.message.id)
            ? old
            : [...old, data.message],
        );
        if (
          data.message.sender_id === user?.id &&
          data.message.text === sending.current
        ) {
          messageForm.current?.reset();
          sending.current = null;
          setPending(false);
        }
      }
      if (data.type === "error") {
        setError(data.error);
        setPending(false);
      }
    };
    ws.onclose = () => {
      setConnected(false);
      setPending(false);
      setError("채팅 연결이 끊겼어요. 대화를 다시 열어주세요.");
    };
    ws.onerror = () => setError("채팅 서버에 연결하지 못했어요.");
    return () => {
      ws.onclose = null;
      ws.onerror = null;
      ws.close();
      socket.current = null;
    };
  }, [active, user?.id]);
  useEffect(() => {
    const start = (event: Event) => {
      if (event instanceof CustomEvent) {
        setActive(event.detail);
        setOpen(true);
      }
    };
    window.addEventListener("open-chat", start);
    return () => window.removeEventListener("open-chat", start);
  }, []);
  function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const text = new FormData(form).get("text");
    if (socket.current?.readyState !== WebSocket.OPEN) {
      setError("채팅 서버에 연결 중이에요.");
      return;
    }
    if (typeof text !== "string") return;
    sending.current = text.trim();
    setPending(true);
    socket.current.send(JSON.stringify({ text }));
    setError("");
  }

  return (
    <>
      {open && (
        <div className={standalone ? "account-layout" : "floating-chat"}>
          {standalone && (
            <aside className="account-intro">
              <span className="account-brand">당근</span>
              <p className="eyebrow">가까운 이웃과 함께하는 일상</p>
              <h1>
                반가운 거래의 시작,
                <br />
                당신 근처에서.
              </h1>
              <p>
                안 쓰는 물건은 필요한 이웃에게,
                <br />
                궁금한 이야기는 채팅으로 나눠보세요.
              </p>
              <img src="/assets/hero.webp" alt="이웃과 함께하는 동네 생활" />
            </aside>
          )}
          <div
            className={
              user ? "modal account-panel chat-panel" : "modal account-panel"
            }
            role={standalone ? undefined : "dialog"}
            aria-modal={undefined}
            aria-label={user ? "내 채팅" : "로그인"}
          >
            <div className="modal-head">
              <h2>{user ? "내 채팅" : register ? "회원가입" : "로그인"}</h2>
              {!standalone && (
                <button
                  aria-label="닫기"
                  onClick={() => {
                    setOpen(false);
                    setActive(null);
                    onClose?.();
                  }}
                >
                  ×
                </button>
              )}
            </div>
            {error && <p role="alert">{error}</p>}
            {!user ? (
              <AuthForm
                register={register}
                onSuccess={(account) => {
                  setUser(account);
                  setOpen(standalone);
                }}
              />
            ) : (
              <>
                {active === null ? (
                  <>
                    <p>
                      {chats.length
                        ? "대화를 선택해주세요."
                        : "아직 시작한 대화가 없어요. 상품에서 채팅을 시작해보세요."}
                    </p>
                    {chats.map((c) => (
                      <p className="chat-row" key={c.id}>
                        <button
                          className="chat-preview"
                          onClick={() => setActive(c.id)}
                        >
                          <span className="chat-avatar">
                            {c.partner_name.slice(0, 1)}
                          </span>
                          <span>
                            <strong>{c.partner_name}</strong>
                            <span className="chat-product">{c.title}</span>
                            <span className="chat-snippet">
                              {c.last_message || "대화 시작하기"}
                            </span>
                          </span>
                        </button>
                      </p>
                    ))}

                  </>
                ) : (
                  <>
                    <button
                      className="text-button"
                      onClick={() => {
                        setActive(null);
                        setPending(false);
                      }}
                    >
                      ← 대화 목록
                    </button>
                    <h3>
                      {chats.find((c) => c.id === active)?.partner_name ||
                        "이웃과의 대화"}
                    </h3>
                    <p className="chat-product">
                      {chats.find((c) => c.id === active)?.title}
                    </p>
                    <p className="connection-status" role="status">
                      {connected ? "● 실시간 연결됨" : "○ 연결 중"}
                    </p>
                    <div className="message-list" role="log" aria-live="polite">
                      {!messages.length && (
                        <p className="chat-empty">
                          거래 시간과 장소를 이야기해보세요.
                        </p>
                      )}
                      {messages.map((m) => (
                        <p
                          key={m.id}
                          className={
                            m.sender_id === user.id ? "message mine" : "message"
                          }
                        >
                          <small>
                            {m.sender_id === user.id ? "나" : "상대방"}
                          </small>
                          <span>{m.text}</span>
                        </p>
                      ))}
                    </div>
                    <form ref={messageForm} onSubmit={send}>
                      <label>
                        메시지
                        <input
                          name="text"
                          readOnly={pending}
                          required
                          maxLength={2000}
                          autoComplete="off"
                        />
                      </label>
                      <button
                        className="primary submit"
                        disabled={!connected || pending}
                      >
                        {pending
                          ? "전송 중…"
                          : connected
                            ? "보내기"
                            : "연결 중…"}
                      </button>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
