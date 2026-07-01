# Fans.tech Frontend

Web2 Next.js frontend (App Router) for Fans.tech, mirroring the `mvmnt-user-dashboard`
**feature-sliced architecture** — scalability first. **No web3 libs** (no Biconomy/MetaMask) for
now; an API/WS client layer is ready to wire to `fans-tech-backend`.

Built screens: **Home (dashboard)** + **Chat**. Other nav items render a "coming soon" stub.

## Stack

Next.js (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn-style UI (Radix + CVA) ·
TanStack Query · Zustand · axios · socket.io-client (chat).

## Run

```bash
cp .env.example .env.local        # NEXT_PUBLIC_USE_MOCKS=true → runs with no backend
npm install
npm run dev                       # http://localhost:3000  (set a different port if backend uses 3000)
```

With `NEXT_PUBLIC_USE_MOCKS=true` (default) every feature serves mock data, so the UI runs
standalone. Set it to `false` and point `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL` at the
backend to hit real endpoints.

## Architecture (scalable, feature-sliced)

```
src/
  app/                       App Router
    (app)/                   authenticated shell route group
      layout.tsx             AppShell (sidebar + topbar)
      page.tsx               Home → DashboardScreen
      chat/page.tsx          Chat → ChatScreen
      [...slug]/page.tsx     "coming soon" stub for unbuilt nav
    layout.tsx providers.tsx globals.css
  components/ui/             shared shadcn-style primitives (button, card, tabs, avatar, …)
  config/                    env.ts, nav.ts
  shared/                    cross-feature: api/ (axios client), lib/ (cn, format), components/ (shell, sidebar)
  features/
    dashboard/               Home feed — components/ api/ hooks/ types.ts mocks.ts index.ts
    chat/                    Chat — components/ api/ lib/socket.ts store.ts types.ts mocks.ts index.ts
```

**Conventions**
- Each feature owns its `types`, `mocks`, `api` (branches on `env.useMocks`), `hooks`, `components`, and a barrel `index.ts` exporting its screen.
- Server state via TanStack Query hooks; UI state via Zustand. Components stay presentational.
- API paths align with the backend docs (`/feed`, `/trending`, `/posts`, `/chat/rooms`, …).
- Add a feature: create `src/features/<name>/`, export a screen, add a route under `src/app/(app)/` and a nav entry in `src/config/nav.ts`.

## Wiring to the backend later

1. Set `NEXT_PUBLIC_USE_MOCKS=false` + the API/WS URLs in `.env.local`.
2. Each feature's `api/*.api.ts` already has the real `apiClient` calls behind the mock branch.
3. Chat's `lib/socket.ts` connects to the `/chat` Socket.io namespace only when mocks are off.
