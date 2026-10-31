# Cleanup/refactor code review

- codeQualityStatus: WATCH
- recommendation: APPROVE
- Scope: shared header/card/filter/type extraction, CSS split, chat list/conversation extraction, DB initialization/index extraction, test runner and WebSocket malformed-input hardening.
- Skill perspective: consulted remove-ai-slops and programming skills. New WebSocket tests exercise hostile network input and process survival; no deletion-only, prompt-text, constant-mirroring, or tautological tests found. Module extraction is aligned with the requested cleanup; no needless production normalization added.

## CRITICAL
None.

## HIGH
None remaining. The sell draft navigation finding is resolved: all current `/sell` entry links in shared header, home shortcuts/CTA, and account menu are native anchors, and auth success uses full-document navigation. Back from the sell entry document therefore reaches the existing `beforeunload` guard. Other SPA exits still use the capture-phase click confirmation. Source verified by searching all `/sell` navigation sites; browser Back/Forward confirmation was not independently exercised in this review.

## MEDIUM
None beyond the blocking navigation gap.

## LOW
- `scripts/test.mjs:46-49`: shutdown waits without a deadline after SIGTERM. A hung server can hang `npm test` cleanup indefinitely. Consider a bounded kill escalation.

## Evidence inspected
- Current production files and `git diff --stat` / WebSocket diff.
- `/tmp/carrot-clean-desktop.png`, `/tmp/carrot-clean-mobile.png`: directly viewed; no obvious horizontal overflow in captured home states. These do not prove sell history navigation or active chat reconnection.
- Existing API/photo/filter tests and expanded WebSocket test source: behavioral coverage; source reviewed, not independently rerun in this review.
- No ulw-loop plan exists; fallback report location used.

## Good, retain
- Server filtering/sorting remains before LIMIT and UI no longer filters a limited result set again.
- Separate draft/applied search query fixes misleading summary labels.
- Keyed conversation component owns socket cleanup; pending input remains until server acknowledgement.
- Malformed Origin is caught before upgrade and null message rejected without throwing outside the handler.
- DB indexes match chat/session access paths; data migration remains additive.
