# UniBlox Enrollment Review Workbench

A responsive React and TypeScript workbench for finding enrollment submissions that need human review, inspecting their details, and safely recording approval or return decisions.

## Requirements

- Node.js 20 or newer
- [Bun](https://bun.sh/) 1.3 or newer

Verify both tools before continuing:

```bash
node --version
bun --version
```

## Local setup

### 1. Get the project

```bash
git clone https://github.com/jeetvani/uniblox-assignment.git
cd uniblox-assignment
```

If the project is already available locally, open a terminal in its root directory instead.

### 2. Install dependencies

```bash
bun install
```

The committed `bun.lock` provides repeatable dependency versions.

### 3. Configure the environment

The default local setup works without a custom environment file. To make the configuration explicit or change an API location, copy the example:

```bash
cp .env.example .env.local
```

```env
API_PROXY_TARGET=http://localhost:4000
```

- Keep `API_PROXY_TARGET` at `http://localhost:4000` when using the included mock API.
- Environment files ending in `.local` are ignored by Git and should not contain committed secrets.

Restart Vite after changing an environment variable.

### 4. Start the mock API

Start the supplied mock API in one terminal:

```bash
bun run dev:api
```

The API runs at `http://localhost:4000` and keeps decision state in memory. Restart it or send `POST /api/reset` to restore the fixture.

The `mock/` directory is intentionally committed because it is the API and fixture supplied with the assignment. A fresh clone therefore runs without relying on an external service.

### 5. Start the frontend

Start the frontend in another terminal:

```bash
bun run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Environment variables

| Variable           | Purpose                                  | Default                 |
| ------------------ | ---------------------------------------- | ----------------------- |
| `API_PROXY_TARGET` | Vite development proxy target for `/api` | `http://localhost:4000` |

`API_PROXY_TARGET` is read only by the local Vite server configuration. Browser requests always use relative `/api` paths and contain no environment-specific domain.

## Quality commands

```bash
bun run format:check   # Verify Prettier formatting
bun run lint           # Run ESLint across application and tests
bun run typecheck      # Run strict TypeScript checking
bun run test           # Run Vitest unit/component/integration tests
bun run test:coverage  # Run tests with enforced coverage thresholds
bun run build          # Create the production build
bun run check          # Run the standard submission quality gate
```

The automated suite uses Vitest, React Testing Library, user-event, jest-dom, and MSW. It covers queue ordering and state, API validation, decision safety, retries and conflicts, cache consistency, lifecycle states, extended filters, details, keyboard behavior, and pagination scrolling.

### Browser tests

Install the Chromium runtime once:

```bash
bunx playwright install chromium
```

Then run the desktop and mobile browser checks:

```bash
bun run test:e2e
```

Playwright starts both services automatically, resets the stateful mock API between tests, and verifies desktop overflow, the extended-filter overlay, mobile cards and filters, keyboard sheet behavior, focus restoration, and a successful approval flow.

Run every check, including Playwright, with:

```bash
bun run check:all
```

## Architecture

- TanStack Query owns remote list/detail data, request lifecycles, mutations, cache updates, and invalidation.
- Zustand owns local search, filter, sort, pagination, and selection state.
- Feature code lives under `src/features/submissions`; shared UI primitives live under `src/components/ui`.
- Vite proxies local `/api` traffic to the independently running mock service.

The extended coverage, product, priority, date, and completeness filters add optional query parameters to the supplied mock server. The assignment's documented routes and required query parameters remain unchanged.

See [DECISIONS.md](./DECISIONS.md) for product reasoning, technical trade-offs, accessibility choices, and AI usage.
