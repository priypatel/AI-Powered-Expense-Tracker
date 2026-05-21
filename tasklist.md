# Task List — AI-Powered Expense Tracker

> Living checklist. Update status as you work. Format: `- [x]` done, `- [ ]` open.

---

## Phase 0 — Project Bootstrap & Documentation

- [ ] `npx create-next-app@14` with TypeScript, Tailwind, App Router, `src/` dir
- [ ] Install runtime deps: `mongoose bcryptjs jsonwebtoken @google/generative-ai recharts clsx`
- [ ] Install dev deps: `@types/bcryptjs @types/jsonwebtoken`
- [ ] Create `.env.example` with all required keys
- [ ] Create `.env.local` (gitignored) with actual values
- [ ] Update `.gitignore` — add `.env.local`, `*.env`
- [ ] Create `src/types/index.ts` — shared interfaces + CATEGORIES constant
- [ ] Create `src/lib/mongodb.ts` — connection singleton
- [ ] Create `Architecture.md`
- [ ] Create `PROMPTS.md`
- [ ] Create `tasklist.md` (this file)
- [ ] Create `testing.strategy.md`
- [ ] Create `Project Structure.md`
- [ ] Commit: `chore: bootstrap Next.js 14 project with dependencies`

---

## Phase 1 — Authentication

- [ ] `src/models/User.ts` — Mongoose schema
- [ ] `src/lib/auth.ts` — hashPassword, comparePassword, signJWT, verifyJWT
- [ ] `src/lib/withAuth.ts` — API middleware
- [ ] `POST /api/auth/register` route
- [ ] `POST /api/auth/login` route
- [ ] `POST /api/auth/logout` route
- [ ] `src/components/layout/AuthProvider.tsx` — React context
- [ ] `src/components/auth/LoginForm.tsx`
- [ ] `src/components/auth/RegisterForm.tsx`
- [ ] `src/app/(auth)/login/page.tsx`
- [ ] `src/app/(auth)/register/page.tsx`
- [ ] `src/app/(dashboard)/layout.tsx` — server-side auth guard + redirect
- [ ] `src/app/page.tsx` — root redirect
- [ ] Commit: `feat(auth): JWT register/login with httpOnly cookie and protected routes`

---

## Phase 2 — Expense CRUD

- [ ] `src/models/Expense.ts` — Mongoose schema with indexes
- [ ] `GET /api/expenses` — filtered + paginated list
- [ ] `POST /api/expenses` — create with validation
- [ ] `PUT /api/expenses/[id]` — update with ownership check
- [ ] `DELETE /api/expenses/[id]` — delete with ownership check
- [ ] `src/hooks/useExpenses.ts` — data fetching + mutations
- [ ] `src/components/expenses/ExpenseForm.tsx` — add/edit form
- [ ] `src/components/expenses/ExpenseList.tsx` — table with edit/delete
- [ ] `src/components/expenses/ExpenseFilters.tsx` — category + month/year picker
- [ ] `src/app/(dashboard)/expenses/page.tsx`
- [ ] Commit: `feat(expenses): full CRUD with category and month filters`

---

## Phase 3 — AI Auto-Fill

- [ ] `src/lib/gemini.ts` — Gemini client + `extractExpenseFromText()`
- [ ] `POST /api/ai/extract` route with error handling
- [ ] `src/components/expenses/AIExtractModal.tsx` — 2-step modal
- [ ] Wire AI extract button into expenses page
- [ ] Update `PROMPTS.md` with final prompt + examples
- [ ] Commit: `feat(ai): Gemini auto-fill with graceful fallback`

---

## Phase 4 — Dashboard

- [ ] `GET /api/dashboard/stats` — MongoDB aggregation pipeline
- [ ] `src/hooks/useDashboard.ts`
- [ ] `src/components/dashboard/StatsCards.tsx`
- [ ] `src/components/dashboard/CategoryPieChart.tsx` — Recharts PieChart
- [ ] `src/components/dashboard/MonthlyTrendChart.tsx` — Recharts BarChart
- [ ] `src/components/dashboard/BudgetAlertBanner.tsx`
- [ ] `src/app/(dashboard)/page.tsx`
- [ ] Commit: `feat(dashboard): stats, pie chart, monthly trend chart`

---

## Phase 5 — Budget Alerts

- [ ] `src/models/Budget.ts` — Mongoose schema + compound unique index
- [ ] `GET /api/budgets` route
- [ ] `POST /api/budgets` route (upsert)
- [ ] `PUT /api/budgets/[id]` route
- [ ] `DELETE /api/budgets/[id]` route
- [ ] `src/hooks/useBudgets.ts`
- [ ] `src/components/budget/BudgetForm.tsx`
- [ ] `src/components/budget/BudgetList.tsx` — progress bars
- [ ] Budget alert computation in `/api/dashboard/stats`
- [ ] Yellow alert at ≥80%, red alert at ≥100%
- [ ] `src/app/(dashboard)/budget/page.tsx`
- [ ] Commit: `feat(budget): monthly budget limits with 80%/100% visual alerts`

---

## Phase 6 — CSV Export

- [ ] `GET /api/expenses/export` — CSV streaming with Content-Disposition header
- [ ] Export button on expenses page
- [ ] Month filter passed to export URL
- [ ] All-time export option
- [ ] Commit: `feat(export): CSV export with month filter`

---

## Phase 7 — Polish & UX

- [ ] Loading skeletons on all data-fetching components
- [ ] Empty state: no expenses
- [ ] Empty state: no budgets
- [ ] Empty state: no dashboard data
- [ ] Toast notifications (success/error) — custom hook
- [ ] Inline form validation error messages
- [ ] Mobile-responsive sidebar (hamburger on small screens)
- [ ] Focus trap in modals
- [ ] `<title>` and `<meta>` per page
- [ ] Favicon in `public/`
- [ ] Commit: `feat(ux): loading states, empty states, responsive layout, toasts`

---

## Phase 8 — Documentation

- [ ] `README.md` — overview, stack, setup steps, env vars table, live URL, screenshots
- [ ] `.env.example` — all keys with comments
- [ ] Finalize `Architecture.md`
- [ ] Finalize `PROMPTS.md`
- [ ] Finalize `tasklist.md`
- [ ] Finalize `testing.strategy.md`
- [ ] Finalize `Project Structure.md`
- [ ] Audit: no `console.log` in production, no hardcoded secrets
- [ ] ESLint passes with 0 errors
- [ ] TypeScript `tsc --noEmit` passes
- [ ] Commit: `docs: README, env example, architecture and project docs`

---

## Phase 9 — Deployment

- [ ] MongoDB Atlas: create M0 cluster, create DB user, whitelist `0.0.0.0/0`
- [ ] Push repo to GitHub (public)
- [ ] Connect Vercel to GitHub repo
- [ ] Add env vars in Vercel dashboard
- [ ] Trigger deploy → verify build passes
- [ ] Smoke test all features on production URL
- [ ] Update `README.md` with live URL
- [ ] Commit: `chore: update README with production URL`

---

## Bugs / Known Issues

> Add bugs here as you find them. Remove when fixed.

| # | Description | Status |
|---|---|---|
| — | None yet | — |

---

## Nice-to-Have (Post-MVP)

- [ ] Dark mode toggle
- [ ] Recurring expense templates
- [ ] Multi-currency support
- [ ] Email notifications for budget alerts
- [ ] PDF export
