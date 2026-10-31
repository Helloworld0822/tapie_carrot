# Photo upload code review

Recommendation: APPROVE
Code quality: WATCH

## Scope and evidence
Read lib/item-photo.ts, lib/server.ts, app/api/items/route.ts, app/api/items/[id]/image/route.ts, app/components/items/photo-input.tsx, list/detail image wiring, and tests/photos.mjs. Inspected /tmp/photo-build-final.log and /tmp/photo-server-final.log. Parent-reported integration execution was not independently repeated. No ulw-loop plan exists, so this report uses the fallback path.

## Skill-perspective checks
Consulted remove-ai-slops and programming skills. The test is a behavioral HTTP integration check, including adversarial input and returned-image decoding; it is not deletion-only, prompt-text matching, or a mirror of implementation constants. Server decoding/normalization is justified at the image trust boundary. No needless production abstraction or untyped escape-hatch blocker was found.

## Findings
CRITICAL: none.
HIGH: none.
MEDIUM: none.
LOW: lib/item-photo.ts:3-18 and photo-input.tsx:5-7 remain compressed into dense single-line logic. Formatting would improve reviewability without changing behavior.

## Correctness
Multipart body is bounded before parsing; file bytes are decoded by sharp with a pixel limit; permitted formats are checked from decoded metadata; output is normalized to WebP. Authentication and origin checks happen before decoding. Item and photo insertions share one synchronous transaction. List/detail expose only the photo marker and retrieve bytes from a dedicated endpoint. Missing photos retain fallback UI. The preview revokes object URLs on replacement/unmount.

## Limits
This review approves the code boundary and wiring, not a complete browser upload/registration journey. No blocker found in the reviewed scope.
