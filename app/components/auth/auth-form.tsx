"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import "./auth.css";
import type { User } from "@/lib/types";
export function AuthForm({
  register = false,
  onSuccess,
}: {
  register?: boolean;
  onSuccess: (user: User) => void;
}) {
  const [error, setError] = useState(""),
    [pending, setPending] = useState(false),
    [visible, setVisible] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/auth/${register ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "입력 내용을 확인해주세요.");
        return;
      }
      onSuccess(result.user);
    } catch {
      setError("서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setPending(false);
    }
  }
  function destination() {
    const next = new URLSearchParams(window.location.search).get("next");
    return next && /^(\/items\/\d+|\/sell)$/.test(next)
      ? "?next=" + encodeURIComponent(next)
      : "";
  }
  return (
    <form className="auth-form" onSubmit={submit} aria-busy={pending}>
      {register && (
        <label className="auth-label" htmlFor="auth-name">
          이름
          <input
            id="auth-name"
            name="name"
            placeholder="이웃에게 보여줄 이름"
            required
            maxLength={30}
            autoComplete="nickname"
            disabled={pending}
          />
        </label>
      )}
      <label className="auth-label" htmlFor="auth-email">
        이메일
        <input
          id="auth-email"
          name="email"
          type="email"
          placeholder="이메일 주소를 입력해주세요"
          required
          maxLength={254}
          autoComplete="email"
          disabled={pending}
        />
      </label>
      <label className="auth-label" htmlFor="auth-password">
        비밀번호
      </label>
      <div className="auth-password">
        <input
          id="auth-password"
          name="password"
          type={visible ? "text" : "password"}
          placeholder="비밀번호를 입력해주세요"
          required
          minLength={8}
          maxLength={128}
          autoComplete={register ? "new-password" : "current-password"}
          aria-describedby="password-help"
          disabled={pending}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
        >
          {visible ? "숨기기" : "보기"}
        </button>
      </div>
      <p id="password-help" className="auth-help">
        영문, 숫자 등을 사용해 8자 이상 입력해주세요.
      </p>
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <button className="auth-submit" disabled={pending}>
        {pending
          ? "잠시만 기다려주세요…"
          : register
            ? "가입하고 시작하기"
            : "로그인"}
      </button>
      <p className="auth-switch">
        {register ? "이미 계정이 있나요?" : "당근이 처음인가요?"}{" "}
        <a
          href={register ? "/login" : "/register"}
          onClick={(event) => {
            event.preventDefault();
            location.assign(
              (register ? "/login" : "/register") + destination(),
            );
          }}
        >
          {register ? "로그인" : "회원가입"}
        </a>
      </p>
    </form>
  );
}
