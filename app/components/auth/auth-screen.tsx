"use client";
import Header from "../../header";
import { AuthForm } from "./auth-form";
import "./auth.css";
export function AuthScreen({ register = false }: { register?: boolean }) {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <a href="/" aria-label="당근 홈">
          <Header />
        </a>
        <a className="auth-home" href="/">
          중고거래 둘러보기 <span aria-hidden="true">↗</span>
        </a>
      </header>
      <main className="auth-main">
        <section className="auth-intro">
          <h1>{register ? "당근 회원가입" : "당근 로그인"}</h1>
          <p className="auth-description">
            {register
              ? "가까운 이웃과 함께하는 일상, 지금 시작해보세요."
              : "내 계정으로 로그인하고 이웃과 대화를 이어가세요."}
          </p>
          <div className="auth-instructions">
            <h2>
              {register
                ? "이웃과 만나는 첫걸음"
                : "이메일로 간편하게 로그인하기"}
            </h2>
            <ol>
              <li>
                {register
                  ? "이웃에게 보여줄 이름을 입력해요."
                  : "가입할 때 사용한 이메일을 입력해요."}
              </li>
              <li>
                {register
                  ? "이메일과 비밀번호로 계정을 만들어요."
                  : "비밀번호를 입력하고 로그인해요."}
              </li>
              <li>관심 있는 물건을 찾고 채팅으로 거래해요.</li>
            </ol>
            <h2>가까워서 더 편한 동네 거래</h2>
            <p>
              안 쓰는 물건은 필요한 이웃에게,
              <br />
              궁금한 내용은 채팅으로 물어보세요.
            </p>
          </div>
          <p className="auth-introNote">
            {register
              ? "이미 가입한 계정이 있다면 로그인해주세요."
              : "아직 계정이 없다면 회원가입 후 이용해주세요."}
          </p>
        </section>
        <section
          className="auth-authBox"
          aria-label={register ? "회원가입 입력" : "로그인 입력"}
        >
          <h2>{register ? "계정 만들기" : "이메일로 로그인"}</h2>
          <AuthForm
            register={register}
            onSuccess={() => {
              const next = new URLSearchParams(location.search).get("next");
              location.assign(
                next && /^(\/items\/\d+|\/sell)$/.test(next) ? next : "/chats",
              );
            }}
          />
          <div className="auth-note">
            <strong>내 계정으로 안전하게</strong>
            <p>
              판매글과 이웃과의 대화를 한곳에서 관리해요.
              <br />
              공용 기기에서는 이용 후 로그아웃해주세요.
            </p>
          </div>
        </section>
      </main>
      <footer className="auth-footer">
        <a href="/">당근 홈</a>
        <span>가까운 이웃과 함께하는 중고거래</span>
      </footer>
    </div>
  );
}
