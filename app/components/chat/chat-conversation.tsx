"use client";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { User } from "@/lib/types";
type Message = {
  readonly id: number;
  readonly sender_id: number;
  readonly text: string;
};
export default function ChatConversation({
  id,
  user,
}: {
  id: number;
  user: User;
}) {
  const socket = useRef<WebSocket | null>(null),
    form = useRef<HTMLFormElement>(null),
    end = useRef<HTMLDivElement>(null),
    sending = useRef<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]),
    [connected, setConnected] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const ws = new WebSocket(
      `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/ws/chat?chatId=${id}`,
    );
    socket.current = ws;
    let live = true;
    ws.onopen = () => {
      if (live) {
        setConnected(true);
        setError("");
      }
    };
    ws.onmessage = (event) => {
      if (!live) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === "history") setMessages(data.messages);
        if (data.type === "message") {
          setMessages((old) =>
            old.some((m) => m.id === data.message.id)
              ? old
              : [...old, data.message],
          );
          if (
            data.message.sender_id === user.id &&
            data.message.text === sending.current
          ) {
            form.current?.reset();
            sending.current = null;
            setPending(false);
          }
        }
        if (data.type === "error") {
          setError(data.error);
          setPending(false);
        }
      } catch {
        setError("메시지를 읽지 못했어요. 다시 연결해주세요.");
        setPending(false);
      }
    };
    ws.onclose = () => {
      if (live) {
        setConnected(false);
        setPending(false);
        setError("연결이 끊겼어요. 작성한 메시지는 유지했어요.");
      }
    };
    ws.onerror = () => {
      if (live) setError("채팅 서버에 연결하지 못했어요.");
    };
    return () => {
      live = false;
      socket.current = null;
      ws.close();
    };
  }, [id, user.id, attempt]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const text = new FormData(event.currentTarget).get("text");
    if (typeof text !== "string" || !text.trim()) return;
    if (socket.current?.readyState !== WebSocket.OPEN) {
      setError("연결 상태를 확인해주세요.");
      return;
    }
    sending.current = text.trim();
    setPending(true);
    try {
      socket.current.send(JSON.stringify({ text }));
    } catch {
      setPending(false);
      setError("전송하지 못했어요. 다시 시도해주세요.");
    }
  }
  return (
    <>
      <p className="connection-status" role="status">
        {connected ? "● 실시간 연결됨" : "○ 연결 대기 중"}
      </p>
      {error && (
        <p role="alert">
          {error}{" "}
          {!connected && (
            <button
              className="text-button"
              onClick={() => setAttempt((n) => n + 1)}
            >
              다시 연결
            </button>
          )}
        </p>
      )}
      <div className="message-list" role="log" aria-live="polite">
        {messages.length === 0 && (
          <p className="chat-empty">거래 시간과 장소를 이야기해보세요.</p>
        )}
        {messages.map((message) => (
          <p
            className={
              message.sender_id === user.id ? "message mine" : "message"
            }
            key={message.id}
          >
            <small>{message.sender_id === user.id ? "나" : "상대방"}</small>
            <span>{message.text}</span>
          </p>
        ))}
        <div ref={end} />
      </div>
      <form ref={form} onSubmit={send}>
        <label htmlFor="chat-message">
          메시지
          <input
            id="chat-message"
            name="text"
            required
            maxLength={2000}
            readOnly={pending}
            autoComplete="off"
          />
        </label>
        <button className="primary submit" disabled={!connected || pending}>
          {pending ? "전송 중…" : "보내기"}
        </button>
      </form>
    </>
  );
}
