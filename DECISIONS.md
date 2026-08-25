# Decisions

## Product and UX decisions

I designed this as a focused operations workbench for experienced reviewers. The main objective is to find important submissions, understand why they need attention, inspect their details, and record a safe decision without losing queue context.

Desktop uses a table because it supports fast comparison across applicants, employer groups, products, coverage, dates, review reasons, priorities, and statuses. The default sort is highest priority. Within the same priority, incomplete records appear first, but a lower-priority record never outranks a higher-priority one.

Selecting a submission opens a side sheet instead of navigating away. This preserves search, filters, sorting, pagination, and queue position. Review signals and missing information appear before the remaining enrollment fields. Missing values receive specific labels rather than appearing blank.

Mobile uses review cards instead of compressing the table or introducing horizontal page scrolling. Search remains available, filters become a compact action, and submission details use a full-screen sheet. Pagination is direction-aware: moving forward scrolls the new page to the top, while moving backward scrolls toward the bottom.

The required group and review-reason filters remain prominent. Less frequent filters appear in an overlay so the queue does not move when they open. Coverage receives minimum and maximum inputs plus a two-thumb slider. Product, priority, submitted-date availability, and completeness are also supported. A graduated coverage scale keeps normal benefit values usable despite a large fixture outlier.

## Technical approach

I chose React, TypeScript, and Vite instead of Next.js. This is a single-page client application backed by an existing API; it does not require server rendering, application routes, or backend endpoints. Vite keeps the setup small and development fast. TypeScript makes API contracts, nullable enrollment fields, filter values, decisions, and component responsibilities explicit.

TanStack Query manages remote state: list and detail requests, loading and errors, cancellation, mutations, caching, and invalidation. Zustand manages local workbench state: search, filters, sorting, pagination, and selection. Separating server state from user-interface state keeps both lifecycles understandable and prevents duplicated sources of truth.

The code is grouped by feature and responsibility. API functions, query hooks, query keys, domain types, Zustand state, queue components, details, decisions, and shared UI primitives have predictable locations. Reusable components were created only where they provide actual consistency rather than attempting a full design system.

The supplied mock API runs independently on port 4000. Browser requests use relative `/api` paths, and Vite proxies them to the configurable `API_PROXY_TARGET` during development. The extended filters add optional query parameters to the supplied mock server. This is a documented prototype extension; the assignment's original routes and required parameters remain intact.

## Reliability and edge cases

The UI accounts for latency, stale search requests, incomplete data, temporary failures, retries, and review conflicts. Search is debounced and requests can be cancelled. Decision controls are disabled while saving to prevent duplicates. Returns require a trimmed note of at most 500 characters and preserve it after failure. Failed approvals provide an explicit retry action. Successful decisions update open details and invalidate every queue query.

Top-level API responses are validated before use, while nullable nested values receive precise fallbacks. Exhaustive nested runtime schema validation was deliberately left out.

The automated suite includes 66 Vitest tests covering API validation, queue state and ordering, decisions, failures, conflicts, cache consistency, lifecycle states, details, filters, keyboard behavior, and pagination. Playwright verifies the highest-risk desktop and mobile flows with the real mock API. Formatting, linting, strict TypeScript, coverage thresholds, browser tests, and the production build form the quality gate.

## Accessibility

The interface uses semantic headings, tables, lists, buttons, labels, dialogs, alerts, and live regions. Queue rows support Enter and Space. Dialogs trap focus, close with Escape, and restore focus. Visible focus styles remain intact, animations respect reduced-motion preferences, and text or icons accompany every color-based status.

## AI usage

A substantial amount of implementation and test code was written with Codex. I owned the product direction, UX concepts, architectural choices, file boundaries, lifecycle behavior, and priorities. I directed where code belonged and reviewed the resulting changes, so I can locate, explain, revise, or replace them if something fails. Codex accelerated execution, refactoring, and verification; it did not determine the product idea. I verified its output through formatting, linting, type checking, automated tests, production builds, and real-browser testing.

## If I had another day

I would test the workbench with real operations reviewers and measure how quickly they can find, understand, and resolve a submission. Their feedback would guide improvements to information priority, filter defaults, decision wording, and the amount of detail visible before opening the sheet. I would also explore saved or shareable queue views and clearer indicators for records that are urgent, incomplete, or already being reviewed by someone else.

During implementation, I tried several more expressive interactions, including floating pagination pills, expanding hover states, and stronger motion. Those ideas were visually interesting but made the workbench feel less predictable. I ultimately chose a calmer interface because an operational dashboard should feel professional, trustworthy, and efficient rather than flashy. With another day, I would validate that judgment with users instead of adding animation for its own sake. After the product flow was confirmed, I would complete screen-reader and real-device testing and align the extended-filter behavior with a production API contract.
