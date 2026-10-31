# Internal pages review

codeQualityStatus: BLOCK
recommendation: REQUEST_CHANGES

Scope: app/account.tsx, app/login/page.tsx, app/register/page.tsx, app/items/[id]/page.tsx, app/globals.css. Source and the four supplied captures inspected directly. No implementation edited. No loop plan exists, so fallback evidence path used.

Skill perspectives: consulted remove-ai-slops and programming. Current API/WebSocket tests exercise actual behavior and are not deletion-only, tautological, prose-pinning, or constant-mirroring tests. They do not verify the new UI journeys. Compressed, monolithic JSX and unchecked JSON response/event data make state handling difficult to audit; no speculative abstraction or needless data extraction found.

## CRITICAL
None found in this bounded review.

## HIGH
- app/account.tsx:19: send clears the user's draft immediately after socket.send, with no server acknowledgement. The server can respond with an error, or the connection can fail after send but before persistence; the draft is then lost and the message is absent from the log. Preserve the draft until its persisted message is acknowledged and show retryable pending/error state. This is especially relevant to the requested reinforced chat UI.

## MEDIUM
- app/items/[id]/page.tsx:9 and app/account.tsx:18: starting a trade while signed out sends the user to /login without a return target; successful login displays the chat list on /login. The selected item and trade-start intent are lost. Preserve a validated local return target and restore the selected item after successful authentication.
- app/account.tsx:21 / globals.css: modal dialog still has no focus placement, focus containment, Escape handling, or focus return. Keyboard users can navigate into the background while aria-modal says it is unavailable. Apply modal focus behavior or use a native dialog.
- Logged-in chat-list, live conversation, error/reconnect, successful login/register, and form submission states have no browser evidence. The supplied screenshots are only logged-out login/register, and an example item without seller. Do not mark end-to-end UI verification complete.

## LOW
- app/account.tsx:21: active conversation header says only '내 채팅' and messages identify the partner only as '상대방'; product and recipient identity are lost after opening a conversation. Show selected chat product and partner name.
- app/globals.css:16-18: existing and appended one-line rules repeat breakpoints and component overrides. New account/chat JSX is also compressed into one huge line, increasing future change risk. Format touched components and consolidate local overrides when editing them next.

## Visual evidence
- artifacts/qa/login-desktop.png: login form readable, aligned, no visible clipping at 948px capture width. This is not a 1440px desktop capture.
- artifacts/qa/login-mobile.png: 390px layout readable and controls contained; footer extends below viewport normally.
- artifacts/qa/register-mobile.png: 390px fields contained; submit near bottom. Next dev issue badge present, cause not established by screenshot.
- artifacts/qa/item-mobile.png: 390px example product readable and contained; action card lower portion below viewport. No full-page/end-scroll proof of action area.

Blockers: preserve unsent chat drafts; complete actual browser login/register and seller-backed product/chat journeys before claiming UI validation complete. Supplied evidence does not establish visual fidelity to the real current Daangn internal screens.
