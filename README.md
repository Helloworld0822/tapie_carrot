# Tapie Carrot

동네 중고거래 웹 앱입니다. 이메일 계정, 상품 검색·등록·사진, 판매자와의 WebSocket 채팅을 제공합니다.

## 실행

Node.js 24 이상이 필요합니다.

```bash
npm ci
npm run dev
```

운영 실행은 `npm run build` 후 `npm start`입니다. 기본 포트는 3000이며 `PORT`로 변경할 수 있습니다. WebSocket을 처리하는 `server.mjs`로 실행해야 합니다.

## 검증

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

`npm test`는 빌드된 앱을 임시 포트와 격리된 SQLite DB로 실행합니다. 인증/상품, 사진 검증, 102개 상품의 검색·필터·정렬, WebSocket 권한·송수신·잘못된 요청을 검사하고 종료 시 테스트 DB를 제거합니다. 기존 서버를 검사하려면 `TEST_BASE_URL=http://localhost:포트 node tests/api.mjs`처럼 개별 파일을 실행하세요.

## 코드 구조

| 위치                                  | 역할                                     |
| ------------------------------------- | ---------------------------------------- |
| `app/components/layout`               | 로고, 공통 헤더                          |
| `app/components/account`, `auth`      | 계정 메뉴와 인증 화면                    |
| `app/components/marketplace`, `items` | 필터, 상품 카드, 판매글 입력             |
| `app/components/chat`                 | 대화 목록과 WebSocket 대화               |
| `app/styles`                          | 기본 토큰, 탐색, 상품, 채팅 스타일       |
| `app/api`                             | HTTP API                                 |
| `lib/database.ts`                     | SQLite 테이블, 마이그레이션, 인덱스      |
| `lib/server.ts`, `item-photo.ts`      | 인증/검증과 사진 처리                    |
| `server.mjs`                          | Next.js HTTP 서버와 WebSocket 업그레이드 |

## 데이터와 운영

기본 DB는 `carrot.sqlite`이며 `DATABASE_PATH`로 변경할 수 있습니다. 기존 데이터를 보존하며 테이블과 필드를 추가합니다. DB에는 사용자·세션·상품·사진·대화가 포함되므로 영속 디스크에 저장하고 백업하세요.

비밀번호는 salt를 적용한 scrypt, 세션은 7일 유효한 HttpOnly 쿠키와 DB 토큰 해시로 관리합니다. 운영 환경은 HTTPS가 필요합니다. 채팅은 참여자만 접근할 수 있습니다. 프록시는 `/ws/chat`의 WebSocket 업그레이드를 전달해야 합니다. 현재 실시간 전달은 단일 서버 기준이며 여러 인스턴스에는 공유 pub/sub가 필요합니다.

사진은 JPEG/PNG/WebP 1장, 최대 5MB입니다. 실제 이미지를 디코딩해 최대 1800px WebP로 변환하고 DB에 저장합니다. 목록 이미지는 화면 크기에 맞춰 제공합니다. 기존 예시 상품은 판매자가 없어 채팅할 수 없습니다.

## API

- `POST /api/auth/register`: `{email,password,name}`
- `POST /api/auth/login`: `{email,password}`
- `GET /api/auth/me`, `POST /api/auth/logout`
- `GET /api/items?q=&region=&price=all|free|under&sort=latest|low|high`: 필터와 정렬 후 최대 100개
- `GET /api/items/regions`, `GET /api/items/:id`, `GET /api/items/:id/image`
- `POST /api/items`: `{title,price,location,description}` JSON 또는 `photo`가 포함된 multipart/form-data (로그인 필요)
- `GET /api/chats`, `POST /api/chats`: `{itemId}`
- `GET /api/chats/:id/messages?after=0`, `POST /api/chats/:id/messages`: `{text}`
- `/ws/chat?chatId=번호`: 로그인 쿠키·Origin·참여자 검증 후 이력과 새 메시지 전달

현재 이메일 인증·비밀번호 재설정·로그인 시도 제한·프로필 사진 업로드·판매 상태 변경은 제공하지 않습니다.
