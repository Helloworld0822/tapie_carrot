This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 중고거래 백엔드

Node.js 24와 SQLite를 사용합니다. 기본 DB는 `carrot.sqlite`이며 `DATABASE_PATH`로 변경할 수 있습니다. 서버 시작 시 기존 상품 데이터를 보존하면서 인증/채팅 테이블과 판매자 필드를 추가합니다.

- `POST /api/auth/register`: `{email,password,name}` (비밀번호 8~128자)
- `POST /api/auth/login`: `{email,password}`
- `GET /api/auth/me`, `POST /api/auth/logout`
- `GET /api/items?q=검색어`: 제목/동네/설명 검색, 최신 100개
- `GET /api/items/:id`, `POST /api/items`: `{title,price,location,description}` (등록은 로그인 필요)
- `GET /api/chats`, `POST /api/chats`: `{itemId}`
- `GET /api/chats/:id/messages?after=0`, `POST /api/chats/:id/messages`: `{text}`

비밀번호는 salt를 적용한 scrypt로 저장하고, 세션은 HttpOnly 쿠키와 DB의 토큰 해시로 관리합니다. 세션 유효기간은 7일이며 로그아웃 시 즉시 폐기합니다. 운영에서는 HTTPS가 필요합니다. 기존 예시 상품은 판매자가 없어 채팅할 수 없습니다. 새로 등록한 상품으로 거래를 시작하세요.

통합 검증: 격리된 `DATABASE_PATH`로 서버를 실행한 후 `TEST_BASE_URL=http://localhost:포트 node tests/api.mjs` 및 `TEST_BASE_URL=http://localhost:포트 node tests/websocket.mjs`.

현재 범위: 이메일/비밀번호 인증, 텍스트 채팅(WebSocket), 상품 등록/조회/검색. 이메일 인증·비밀번호 재설정·로그인 시도 제한·이미지 업로드·판매 상태 변경은 후속 구현 사항입니다. SQLite 파일은 영속 디스크에서 운영하고 백업해야 합니다.


채팅 연결은 `/ws/chat?chatId=번호`를 사용합니다. HttpOnly 세션 쿠키, Origin, 대화 참여 여부를 검증합니다. 연결 시 저장된 대화 이력을 보내고, `{text: "메시지"}`를 받으면 DB 저장 후 참여자에게 전송합니다. 화면의 메시지 폴링은 사용하지 않습니다. 채팅 목록은 3초마다 갱신합니다.

실행: `npm run dev`, 운영은 `npm run build` 후 `PORT=3000 npm start`. WebSocket 업그레이드를 처리하는 커스텀 Node 서버가 필요하며, 프록시는 `/ws/chat` 업그레이드를 전달해야 합니다. 현재 연결 배포는 단일 서버 기준이며 다중 인스턴스에는 공유 pub/sub가 필요합니다.

상품 사진: 판매글 폼에서 JPEG/PNG/WebP 1장(최대 5MB)을 선택할 수 있습니다. multipart/form-data의 `photo` 필드를 사용하며 사진 없는 기존 JSON 등록도 지원합니다. 서버가 디코딩·회전·최대 1800px 축소·WebP 변환 후 SQLite `item_photos`에 저장합니다. 사진은 `GET /api/items/:id/image`로 조회합니다. SQLite 백업에 사진이 포함됩니다. 검증: `TEST_BASE_URL=http://localhost:포트 node tests/photos.mjs`.
