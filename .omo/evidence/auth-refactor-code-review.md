# Auth redesign/refactor review

Status: WATCH — APPROVE

Scope: app/components/auth/*, app/components/chat/chat-panel.tsx, app/account.tsx, login/register routes. Read-only review. No ulw-loop plan exists, so fallback artifact path used.

## HIGH

None remaining. Original hydration/return-intent defect resolved: the login/register link now has identical SSR/client href and computes its validated product-return query at click time (`auth-form.tsx:13,21`). Direct success callback also reads and validates current return URL.

## MEDIUM

- `app/components/chat/chat-panel.tsx:23` and `auth-screen.tsx:6`: large nested one-line JSX retains the earlier maintenance problem despite the module split. Components now have separate ownership, but formatting and extracting the list/conversation portions would make lifecycle and rendering changes reviewable.
- Evidence is layout-only: screenshots do not demonstrate successful form submission, invalid credentials, password visibility, registration-switch return preservation, or post-refactor chat acknowledgement behavior. Existing API/WebSocket tests exercise server behavior, not these new client seams.

## LOW

- Chat panel retains unused `initialRegister` mode and a misleading exported function name `Account`, making the split less clear.

## CRITICAL

None.

## Visual evidence

Directly viewed auth-reference.png, auth-redesign-desktop.png, auth-redesign-mobile.png. No obvious horizontal overflow or orphaned Korean syllable in supplied captures. Desktop follows the reference's left guide/right auth block composition; QR has intentionally been replaced by functioning email form, so these are an adaptation, not pixel-identical cloning.

## Skill-perspective check

Loaded remove-ai-slops and programming skills. Existing API and WebSocket tests assert behavioral outcomes and are not deletion-only, tautological, or constant mirrors. No new test-specific slop found. Minified nested JSX conflicts with maintainability perspective, ; browser-dependent state initialization has now been removed. No needless schema abstraction was added; component split and dynamic import have concrete ownership/loading benefits.

## Verification limits

Inspected source and supplied screenshots. Did not independently run browser submissions or tests. Socket guard waits for a user and reconnects on active/user-id changes; draft clearing remains gated on a matching persisted echo. No additional definite socket regression identified by source review.

## Follow-up review
Re-read current auth-form.tsx. Blocking SSR/client mismatch is resolved. Parent reports invalid-login feedback and successful registration redirect were manually driven, and API/WebSocket tests passed; those runs were not independently repeated by reviewer. No new HIGH findings.
