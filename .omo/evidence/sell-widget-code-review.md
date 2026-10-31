# Sell / floating-chat review

codeQualityStatus: WATCH
recommendation: APPROVE
blockers: []

## Evidence inspected
- app/components/items/sell-form.tsx, sell.css, photo-input.tsx
- app/account.tsx, app/components/chat/chat-panel.tsx, app/chats/page.tsx, app/page.tsx
- artifacts/qa/sell-mobile.png and sell-desktop.png (desktop capture predates custom photo-picker refresh)
- tests/photos.mjs source; no live browser mutation or independent integration run performed
- ulw-loop status reported ULW_LOOP_PLAN_MISSING, so fallback evidence location used

## CRITICAL
None.

## HIGH
None found in the requested UI change.

## MEDIUM — nonblocking follow-ups
- app/components/items/sell-form.tsx:164-169: an unauthenticated writer only discovers authentication is required after completing/submitting the form. Following the login link leaves the local-only draft behind, although beforeunload warns. Prefer authenticate-before-editing or persist a recoverable draft. This is a UX limitation, not a claim that the existing failed-submit retention is broken.
- app/components/chat/chat-panel.tsx:217-235 and app/account.tsx:26-47: logout inside the chat panel changes only the child session state. The header can still show the old name until reload. The new profile-menu logout correctly updates parent state. Consolidate account session ownership or propagate child logout.

## LOW
- sell.css keeps superseded native file-input/photo-preview and sticky-footer rules before later overrides. photo-input.tsx and appended CSS remain dense. This adds maintenance friction but no demonstrated regression in the reviewed flow.

## Skill-perspective check
Consulted remove-ai-slops and programming skills. Existing photo integration tests exercise actual upload/validation behavior; no deletion-only, prose, tautological, or implementation-only tests found. No new unnecessary parsing or extraction was added by this UI change. Broad UI network catches follow the existing boundary pattern; dense JSX/CSS and duplicate session state are maintainability debt rather than blocking defects here.

## Scope and verification limits
Mobile screenshot shows readable labels and fixed submit action with launcher raised clear of the footer. Desktop screenshot shows two-column form/help layout without obvious overflow. Floating conversation, registration-with-photo, free-toggle submission, close/reopen cleanup, and keyboard journey were traced in source but were not independently driven in a live browser. Do not treat this report as complete browser QA approval.
