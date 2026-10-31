"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { User } from "./components/auth/auth-form";
import Icon from "./components/ui-icon";
const ChatPanel = dynamic(() => import("./components/chat/chat-panel"), {
  ssr: false,
  loading: () => (
    <div className="floating-chat" role="status">
      채팅을 불러오는 중이에요.
    </div>
  ),
});
export default function Account({
  standalone = false,
  initialOpen = false,
}: {
  standalone?: boolean;
  initialOpen?: boolean;
}) {
  const [user, setUser] = useState<User | null>(null),
    [chatId, setChatId] = useState<number | null>(null),
    [opened, setOpened] = useState(initialOpen),
    [profile, setProfile] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (live) setUser(d.user);
      })
      .catch(() => {
        if (live) setUser(null);
      });
    const open = (event: Event) => {
      if (event instanceof CustomEvent && Number.isSafeInteger(event.detail)) {
        setChatId(event.detail);
        setOpened(true);
      }
    };
    window.addEventListener("open-chat", open);
    return () => {
      live = false;
      window.removeEventListener("open-chat", open);
    };
  }, []);
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpened(false);setProfile(false);}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);
  if (standalone) return <ChatPanel standalone />;
  return (
    <>
      <div className="profile-control">
        {user ? (
          <>
            <button
              className="profile-button"
              aria-expanded={profile}
              onClick={() => setProfile(!profile)}
            >
              <span className="profile-avatar" aria-hidden="true">
                {user.name.slice(0, 1)}
              </span>
              <span>{user.name}님</span>
            </button>
            {profile && (
              <div className="profile-menu">
                <strong>{user.name}님</strong>
                <a href="/sell">내 물건 판매하기</a>
                <button
                  onClick={async () => {
                    try {
                      const r = await fetch("/api/auth/logout", {
                        method: "POST",
                      });
                      if (!r.ok) throw new Error();
                      setUser(null);
                      setOpened(false);
                      setProfile(false);
                    } catch {
                      setError("로그아웃하지 못했어요.");
                    }
                  }}
                >
                  로그아웃
                </button>
                {error && <p role="alert">{error}</p>}
              </div>
            )}
          </>
        ) : (
          <a className="outline" href="/login">
            로그인
          </a>
        )}
      </div>
      {opened && (
        <ChatPanel
          key={chatId ?? "list"}
          initialChat={chatId}
          floating
          onClose={() => setOpened(false)}
        />
      )}
      <button
        className="chat-launcher"
        aria-label={opened ? "채팅 닫기" : "채팅 열기"}
        aria-expanded={opened}
        onClick={() => {
          if (!user) {
            location.assign("/login");
            return;
          }
          setOpened(!opened);
          setChatId(null);
        }}
      >
        <Icon name="chat" />
        <span>{opened ? "닫기" : "채팅"}</span>
      </button>
    </>
  );
}
