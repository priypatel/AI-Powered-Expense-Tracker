# Project Structure — AI-Powered Expense Tracker

## Top-Level Layout

```
AI-Powered-Expense-Tracker-/
├── src/                          ← All application source code
├── public/                       ← Static assets (favicon, images)
├── .env.example                  ← Environment variable template (committed)
├── .env.local                    ← Actual secrets (gitignored)
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
├── Architecture.md               ← System design reference
├── PROMPTS.md                    ← AI prompt documentation
├── tasklist.md                   ← Feature checklist
├── testing.strategy.md           ← Test coverage reference
└── Project Structure.md          ← This file
```

---

## Source Tree (`src/`)

```
src/
├── app/                          ← Next.js 14 App Router
│   ├── layout.tsx                ← Root layout: <html>, fonts, global metadata
│   ├── page.tsx                  ← Root redirect (→ /dashboard or /login)
│   │
│   ├── (auth)/                   ← Auth route group (no sidebar/navbar)
│   │   ├── login/
│   │   │   └── page.tsx          ← Login page
│   │   └── register/
│   │       └── page.tsx          ← Register page
│   │
│   ├── (dashboard)/              ← Protected route group (with sidebar)
│   │   ├── layout.tsx            ← Auth guard + Sidebar + Navbar
│   │   ├── page.tsx              ← /dashboard → charts + stats
│   │   ├── expenses/
│   │   │   └── page.tsx          ← /expenses → list + filters + AI modal
│   │   └── budget/
│   │       └── page.tsx          ← /budget → budget limits + alerts
│   │
│   └── api/                      ← Next.js API Routes (serverless)
│       ├── auth/
│       │   ├── register/route.ts ← POST: create user
│       │   ├── login/route.ts    ← POST: issue JWT cookie
│       │   └── logout/route.ts   ← POST: clear cookie
│       ├── expenses/
│       │   ├── route.ts          ← GET: list (filtered) | POST: create
│       │   ├── [id]/route.ts     ← PUT: update | DELETE: remove
│       │   └── export/route.ts   ← GET: CSV download
│       ├── ai/
│       │   └── extract/route.ts  ← POST: text → structured expense fields
│       ├── budgets/
│       │   ├── route.ts          ← GET: list | POST: create/upsert
│       │   └── [id]/route.ts     ← PUT: update limit | DELETE: remove
│       └── dashboard/
│           └── stats/route.ts    ← GET: aggregated stats (all charts)
│
├── components/                   ← Reusable React components
│   │
│   ├── ui/                       ← Design system primitives
│   │   ├── Button.tsx            ← Variants: primary, secondary, danger, ghost
│   │   ├── Input.tsx             ← Controlled input with label + error state
│   │   ├── Modal.tsx             ← Focus-trapped overlay with backdrop
│   │   ├── Badge.tsx             ← Colored status pill (e.g., category, alert level)
│   │   ├── Card.tsx              ← Bordered content container
│   │   └── Spinner.tsx           ← Loading spinner
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx         ← Email + password form with submit
│   │   └── RegisterForm.tsx      ← Name + email + password form
│   │
│   ├── expenses/
│   │   ├── ExpenseForm.tsx       ← Add/edit: amount, category, date, note
│   │   ├── ExpenseList.tsx       ← Table/cards with edit + delete per row
│   │   ├── ExpenseFilters.tsx    ← Category dropdown + month/year picker
│   │   └── AIExtractModal.tsx    ← 2-step: paste text → review extracted fields
│   │
│   ├── dashboard/
│   │   ├── StatsCards.tsx        ← Total this month + expense count cards
│   │   ├── CategoryPieChart.tsx  ← Recharts PieChart + Legend
│   │   ├── MonthlyTrendChart.tsx ← Recharts BarChart (last 6 months)
│   │   └── BudgetAlertBanner.tsx ← Yellow/red alert per category
│   │
│   ├── budget/
│   │   ├── BudgetForm.tsx        ← Category + limit + month/year inputs
│   │   └── BudgetList.tsx        ← Progress bars with spent/limit display
│   │
│   └── layout/
│       ├── AuthProvider.tsx      ← React context: user, login(), logout()
│       ├── Sidebar.tsx           ← Nav links: Dashboard, Expenses, Budget
│       └── Navbar.tsx            ← Top bar: page title + user + logout
│
├── lib/                          ← Server-side utilities (not imported in Client Components)
│   ├── mongodb.ts                ← Mongoose connection singleton
│   │                               (prevents duplicate connections on hot reload)
│   ├── auth.ts                   ← hashPassword, comparePassword, signJWT, verifyJWT
│   ├── withAuth.ts               ← API middleware: reads cookie → verifies JWT
│   │                               → injects userId; returns 401 if invalid
│   └── gemini.ts                 ← GoogleGenerativeAI client + extractExpenseFromText()
│
├── models/                       ← Mongoose schemas
│   ├── User.ts                   ← Schema + indexes + pre-save hook for timestamps
│   ├── Expense.ts                ← Schema + compound indexes for efficient queries
│   └── Budget.ts                 ← Schema + compound unique index (userId+cat+month+year)
│
├── hooks/                        ← Client-side data fetching hooks
│   ├── useAuth.ts                ← Reads AuthProvider context
│   ├── useExpenses.ts            ← fetch list, create, update, delete + local state
│   ├── useBudgets.ts             ← fetch budgets, CRUD mutations
│   └── useDashboard.ts           ← fetch /api/dashboard/stats
│
└── types/
    └── index.ts                  ← Shared TypeScript types + CATEGORIES constant
```

---

## Key File Responsibilities

### `src/lib/mongodb.ts`
Exports a `connectDB()` function that creates a Mongoose connection once and reuses it.
Necessary because Next.js hot-reloads create new module instances — without the singleton,
each hot reload spawns a new connection and exhausts the Atlas connection pool.

### `src/lib/withAuth.ts`
Higher-order function wrapping Next.js route handlers. Extracts the JWT token from the
`token` httpOnly cookie, verifies it with `verifyJWT`, and injects `req.userId` into the
handler. Returns `{ error: "Unauthorized" }` with status 401 if token is missing or invalid.

Usage:
```typescript
export const GET = withAuth(async (req, { params }) => {
  // req.userId is guaranteed to be set here
});
```

### `src/types/index.ts`
Single source of truth for shared types. Defines:
- `CATEGORIES` — the canonical array used by both Mongoose enums and UI dropdowns
- `Category` — union type derived from `CATEGORIES`
- `Expense`, `Budget`, `User` interfaces for API responses
- `DashboardStats` interface for `/api/dashboard/stats` response shape

### `src/app/(dashboard)/layout.tsx`
Server Component that reads the `token` cookie from the incoming request headers.
If the token is absent or invalid, immediately redirects to `/login` using `redirect()`.
This is the primary auth gate for all dashboard pages.

### `src/app/api/dashboard/stats/route.ts`
The most complex route — runs three separate MongoDB aggregation pipelines in parallel
(`Promise.all`) to compute: total this month, category breakdown, monthly trend.
Then fetches budgets and joins with category totals to compute budget alert percentages.
All operations are scoped to the authenticated `userId`.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `ExpenseForm.tsx` |
| Hooks | camelCase with `use` prefix | `useExpenses.ts` |
| API routes | `route.ts` in Next.js convention | `app/api/expenses/route.ts` |
| Mongoose models | PascalCase, singular | `User.ts`, `Expense.ts` |
| Utility functions | camelCase | `hashPassword`, `verifyJWT` |
| Types/interfaces | PascalCase | `Expense`, `DashboardStats` |
| Constants | UPPER_SNAKE_CASE | `CATEGORIES` |
| CSS classes | Tailwind utility classes inline | `className="flex items-center gap-2"` |

---

## Import Alias
All imports use `@/` to resolve from `src/`:
```typescript
import { connectDB } from "@/lib/mongodb";
import { CATEGORIES } from "@/types";
import ExpenseForm from "@/components/expenses/ExpenseForm";
```
Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

## Environment Variables

| Variable | Used In | Required |
|---|---|---|
| `MONGODB_URI` | `src/lib/mongodb.ts` | Yes |
| `JWT_SECRET` | `src/lib/auth.ts` | Yes |
| `GEMINI_API_KEY` | `src/lib/gemini.ts` | Yes |
| `NEXT_PUBLIC_APP_URL` | Client-side fetch base URL | Yes (prod) |

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser bundle.
All others are server-only and never sent to the client.
