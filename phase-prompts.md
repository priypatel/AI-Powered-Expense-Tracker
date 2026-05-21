# Phase-Wise Claude Prompts
# AI-Powered Expense Tracker

> Paste each prompt into Claude Code at the start of that phase.
> Complete the phase fully — including writing and running tests — then verify, commit, and move on.

---

## UNIVERSAL RULES (apply to every phase)

These rules must be followed in every single file written across all phases:

**Code Quality**
- TypeScript strict mode — no `any`, no implicit types, all functions have explicit return types
- No `console.log` anywhere in production code paths (use proper error returns)
- No hardcoded values — all config via env vars or constants from `src/types/index.ts`
- No commented-out code blocks — delete unused code, don't comment it out
- No TODO comments left in committed code
- Named exports preferred over default exports for utilities; default exports for React components
- Every async function has proper try/catch with typed errors

**File & Import Standards**
- All imports use `@/` alias (e.g. `@/lib/mongodb`, `@/components/ui/Button`)
- One component per file, filename matches component name (PascalCase)
- Hooks in `src/hooks/`, lib utilities in `src/lib/`, models in `src/models/`

**API Standards**
- Every API route: 200/201 on success, 400 for validation errors, 401 for unauth, 403 for forbidden, 404 for not found, 500 for unexpected server errors
- All 500 responses return `{ error: "Internal server error" }` — never expose stack traces
- Every protected route wrapped with `withAuth` middleware
- Ownership checked before any update or delete

**Security**
- Passwords hashed with bcrypt cost 12 — never stored plain
- JWT in httpOnly + Secure + SameSite=Strict cookie — never in localStorage
- Input validation server-side before every DB write
- MongoDB queries always scoped to `userId` — never return data across users

**Quality Gates**
- Run `npm run type-check` — zero TypeScript errors before committing
- Run `npm run lint` — zero ESLint errors before committing

---

## PHASE 0 — Project Bootstrap & Documentation Setup

```
I'm building a production-ready AI-Powered Expense Tracker.
Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, MongoDB + Mongoose,
JWT auth (httpOnly cookie), Google Gemini 1.5 Flash, Recharts.
Project path: /Users/priypatel/Vault/Development/AI-Powered-Expense-Tracker-
Currently an empty git repo. Start from scratch.

═══════════════════════════════════════════
UNIVERSAL CODE RULES — follow in every file
═══════════════════════════════════════════
- TypeScript strict mode, no `any`, explicit return types on all functions
- No console.log in production code
- No hardcoded secrets or config values
- All imports use @/ alias
- Every async function has proper try/catch
- API routes: 200/201 success, 400 validation, 401 unauth, 403 forbidden, 500 server error
- 500 responses return { error: "Internal server error" } — never expose stack traces
═══════════════════════════════════════════

STEP 1 — Scaffold project
Run:
  npx create-next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*" --eslint
Accept all defaults. Do NOT use the --no-* flags.

STEP 2 — Install dependencies
Runtime: mongoose bcryptjs jsonwebtoken @google/generative-ai recharts clsx
Dev: @types/bcryptjs @types/jsonwebtoken jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom

STEP 3 — TypeScript config
In tsconfig.json set:
  "strict": true
  "noImplicitAny": true
  "strictNullChecks": true

STEP 4 — Jest config
Create jest.config.ts at project root:
  - preset: ts-jest
  - testEnvironment: node (for unit/integration), jsdom (for component tests)
  - moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" }
  - setupFilesAfterFramework: ["@testing-library/jest-dom"]
Add to package.json scripts:
  "test": "jest"
  "test:watch": "jest --watch"
  "type-check": "tsc --noEmit"

STEP 5 — Create src/types/index.ts
Define:
  export const CATEGORIES = ["Food","Transport","Shopping","Entertainment","Health",
    "Utilities","Housing","Education","Travel","Other"] as const;
  export type Category = typeof CATEGORIES[number];
  
  export interface IUser { _id: string; name: string; email: string; createdAt: string; }
  export interface IExpense {
    _id: string; userId: string; amount: number; category: Category;
    date: string; note?: string; createdAt: string; updatedAt: string;
  }
  export interface IBudget {
    _id: string; userId: string; category: Category;
    monthlyLimit: number; month: number; year: number; createdAt: string;
  }
  export interface DashboardStats {
    totalThisMonth: number; expenseCount: number;
    categoryBreakdown: { category: string; total: number }[];
    monthlyTrend: { label: string; total: number }[];
    budgetAlerts: { category: string; spent: number; limit: number; pct: number }[];
  }
  export interface ApiError { error: string; }
  export interface PaginatedExpenses {
    expenses: IExpense[]; total: number; page: number; totalPages: number;
  }

STEP 6 — Create src/lib/mongodb.ts
Mongoose connection singleton using Node.js global cache:
  declare global { var mongoose: { conn: typeof import("mongoose") | null; promise: Promise<typeof import("mongoose")> | null } }
  Caches connection in global.mongoose to survive Next.js hot reload.
  Export: export default async function connectDB(): Promise<typeof import("mongoose")>
  Throw a clear error if MONGODB_URI env var is missing.

STEP 7 — Create .env.example
  MONGODB_URI=              # MongoDB Atlas connection string (mongodb+srv://...)
  JWT_SECRET=               # Min 64-char random string. Generate: openssl rand -base64 48
  GEMINI_API_KEY=           # Google AI Studio API key (aistudio.google.com)
  NEXT_PUBLIC_APP_URL=      # https://your-app.vercel.app (or http://localhost:3000 for dev)

STEP 8 — Update .gitignore
Ensure these are present: .env.local, .env, *.env, node_modules/

STEP 9 — Create required folder structure
Create these empty directories with .gitkeep:
  src/__tests__/unit/
  src/__tests__/integration/
  src/models/
  src/lib/
  src/hooks/
  src/components/ui/
  src/components/auth/
  src/components/expenses/
  src/components/dashboard/
  src/components/budget/
  src/components/layout/

STEP 10 — Write and run tests

Create src/__tests__/unit/types.test.ts:
  test("CATEGORIES has exactly 10 items", () => { expect(CATEGORIES).toHaveLength(10) })
  test("CATEGORIES contains required values", () => {
    expect(CATEGORIES).toContain("Food")
    expect(CATEGORIES).toContain("Transport")
    expect(CATEGORIES).toContain("Other")
  })
  test("all CATEGORIES are non-empty strings", () => {
    CATEGORIES.forEach(c => { expect(typeof c).toBe("string"); expect(c.length).toBeGreaterThan(0) })
  })

Run: npm test — all tests pass
Run: npm run type-check — zero errors
Run: npm run lint — zero errors
Run: npm run build — must complete without errors
Run: npm run dev — server starts on localhost:3000

STEP 11 — Verify folder structure matches exactly:
  src/app/           ← Next.js App Router
  src/components/    ← React components
  src/lib/           ← Server-only utilities
  src/hooks/         ← Client-side hooks
  src/models/        ← Mongoose schemas
  src/types/         ← Shared TypeScript types
  src/__tests__/     ← All tests

STEP 12 — Commit
  git add -A
  git commit -m "chore: bootstrap Next.js 14 project with dependencies and test setup"
```

---

## PHASE 1 — Authentication System

```
I'm building an AI-Powered Expense Tracker. Phase 0 is complete.
Stack: Next.js 14 App Router, TypeScript strict, Tailwind CSS, MongoDB/Mongoose, JWT.
Project: /Users/priypatel/Vault/Development/AI-Powered-Expense-Tracker-

═══════════════════════════════════════════
UNIVERSAL CODE RULES — follow in every file
═══════════════════════════════════════════
- TypeScript strict mode, no `any`, explicit return types on all functions
- No console.log in production code
- No hardcoded secrets or config values — use process.env only
- All imports use @/ alias
- Every async function has proper try/catch
- API routes: 200/201 success, 400 validation, 401 unauth, 403 forbidden, 500 server error
- 500 responses return { error: "Internal server error" } — never expose stack traces
- Passwords: bcrypt cost factor 12 — never stored plain
- JWT: httpOnly + Secure + SameSite=Strict cookie — never localStorage
- Input validation server-side before every DB write
═══════════════════════════════════════════

STEP 1 — src/models/User.ts
Mongoose schema:
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 }
  email: { type: String, required: true, unique: true, lowercase: true, trim: true }
  passwordHash: { type: String, required: true }
  createdAt: { type: Date, default: Date.now }
Index: { email: 1 } unique: true
Export: IUserDocument extending mongoose.Document
Schema name: "User"

STEP 2 — src/lib/auth.ts
Export these typed functions (no default export):
  hashPassword(plain: string): Promise<string>       — bcrypt.hash, saltRounds: 12
  comparePassword(plain: string, hash: string): Promise<boolean>
  signJWT(payload: { userId: string; email: string }): string
    — jwt.sign, secret: process.env.JWT_SECRET!, expiresIn: "7d"
    — throw clear error if JWT_SECRET is not set
  verifyJWT(token: string): { userId: string; email: string }
    — jwt.verify, throw on invalid/expired

STEP 3 — src/lib/withAuth.ts
Type: AuthenticatedRequest extends NextRequest with userId: string
Export withAuth(handler: (req: AuthenticatedRequest, ctx: RouteContext) => Promise<Response>)
Logic:
  1. Read cookie: req.cookies.get("token")?.value
  2. If missing → return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  3. verifyJWT(token) — if throws → return 401
  4. Attach userId to request context and call handler
  5. Catch unexpected errors → return 500 { error: "Internal server error" }

STEP 4 — Helper: setCookie and clearCookie functions in src/lib/auth.ts
  function setCookie(response: NextResponse, token: string): void
    — sets name="token", httpOnly: true, secure: process.env.NODE_ENV === "production",
       sameSite: "strict", maxAge: 7 * 24 * 60 * 60, path: "/"
  function clearCookie(response: NextResponse): void
    — sets same cookie with maxAge: 0

STEP 5 — API Routes

POST /api/auth/register (src/app/api/auth/register/route.ts):
  Validate: name (2-50 chars), email (valid format), password (min 8 chars)
  Check: if email exists → 400 { error: "Email already in use" }
  Hash password → save user → sign JWT → setCookie → return 201 { user: { _id, name, email } }
  Catch duplicate key error (code 11000) → return 400 { error: "Email already in use" }
  Catch all others → return 500 { error: "Internal server error" }

POST /api/auth/login (src/app/api/auth/login/route.ts):
  Validate: email and password present → 400 if missing
  Find user by email → if not found → 401 { error: "Invalid credentials" }
  comparePassword → if false → 401 { error: "Invalid credentials" }
  Sign JWT → setCookie → return 200 { user: { _id, name, email } }

POST /api/auth/logout (src/app/api/auth/logout/route.ts):
  clearCookie → return 200 { message: "Logged out" }

STEP 6 — src/components/layout/AuthProvider.tsx
'use client' — React context:
  interface AuthContextType {
    user: { _id: string; name: string; email: string } | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
  }
  On mount: call GET /api/auth/me (see below) to restore session
  login() → POST /api/auth/login → setUser → throw on error
  logout() → POST /api/auth/logout → setUser(null) → router.push("/login")

GET /api/auth/me (src/app/api/auth/me/route.ts):
  Uses withAuth middleware
  Returns 200 { user: { _id, name, email } } or 401

STEP 7 — src/components/auth/LoginForm.tsx
'use client' component:
  Controlled inputs: email, password
  On submit: calls authContext.login(), shows inline error on failure
  "Don't have an account? Register" link
  Submit button shows spinner while loading
  Input validation: email format, password non-empty (client-side, before submit)

src/components/auth/RegisterForm.tsx
'use client' component:
  Controlled inputs: name, email, password, confirmPassword
  Validate: confirmPassword matches, password >= 8 chars
  On submit: POST /api/auth/register directly, then authContext.login()
  Inline error display per field
  "Already have an account? Login" link

STEP 8 — Pages
src/app/(auth)/login/page.tsx — centered card, LoginForm, link to /register
src/app/(auth)/register/page.tsx — centered card, RegisterForm, link to /login
Both pages: export const metadata with title + description

STEP 9 — Protected layout
src/app/(dashboard)/layout.tsx — Server Component:
  import { cookies } from "next/headers"
  import { redirect } from "next/navigation"
  Read cookies().get("token")?.value
  Call verifyJWT — if throws or token missing → redirect("/login")
  Render: <AuthProvider><Sidebar /><Navbar /><main>{children}</main></AuthProvider>

src/app/page.tsx:
  import { redirect } from "next/navigation"
  import { cookies } from "next/headers"
  Check token cookie → if present redirect("/dashboard") else redirect("/login")

STEP 10 — Layout components
src/components/layout/Sidebar.tsx 'use client':
  Nav links: Dashboard (href="/"), Expenses (href="/expenses"), Budget (href="/budget")
  usePathname() to highlight active link
  Fixed sidebar on desktop, hidden on mobile (controlled by state)

src/components/layout/Navbar.tsx 'use client':
  Shows user.name from AuthContext
  Logout button → calls authContext.logout()
  Hamburger menu button (visible on mobile) — toggles sidebar state
  Pass sidebar open/close state down via props or context

STEP 11 — UI primitives (used by auth forms)
src/components/ui/Button.tsx:
  Props: variant ("primary" | "secondary" | "danger" | "ghost"), size ("sm" | "md" | "lg"),
         loading?: boolean, disabled?: boolean + all button HTML props
  When loading: show spinner, disable button, prevent double-submit

src/components/ui/Input.tsx:
  Props: label: string, error?: string, ...InputHTMLAttributes
  Shows label above, red border + error message below if error prop set
  Forward ref for form libraries

STEP 12 — Write and run tests

src/__tests__/unit/auth.test.ts:
  describe("hashPassword"):
    test("returns bcrypt hash string starting with $2b$")
    test("same input produces different hashes each call")
    test("resulting hash has expected length (>50 chars)")

  describe("comparePassword"):
    test("returns true for correct password")
    test("returns false for wrong password")
    test("returns false for empty string against valid hash")

  describe("signJWT"):
    test("returns a non-empty string")
    test("returned string has 3 dot-separated parts (JWT format)")
    beforeEach: set process.env.JWT_SECRET = "test-secret-at-least-64-chars-long-for-testing-only"

  describe("verifyJWT"):
    test("returns payload with userId and email for valid token")
    test("throws JsonWebTokenError for tampered token")
    test("throws TokenExpiredError for expired token")
    test("throws for empty string input")

src/__tests__/integration/auth-routes.test.ts:
  Use node-mocks-http or direct NextRequest construction to test route handlers.
  Use mongodb-memory-server for DB isolation.

  beforeAll: start in-memory MongoDB, connect mongoose
  afterEach: clear Users collection
  afterAll: disconnect mongoose, stop in-memory server

  describe("POST /api/auth/register"):
    test("201 with valid data → response has user object, no passwordHash")
    test("400 with duplicate email")
    test("400 with missing name")
    test("400 with missing email")
    test("400 with password shorter than 8 chars")
    test("400 with invalid email format")
    test("response body never contains passwordHash field")

  describe("POST /api/auth/login"):
    test("200 with correct credentials")
    test("401 with wrong password")
    test("401 with non-existent email")
    test("400 with empty body")

  describe("GET /api/auth/me"):
    test("200 with valid JWT cookie → returns user data")
    test("401 with no cookie")
    test("401 with tampered token")

Run: npm test — ALL tests pass
Run: npm run type-check — zero errors
Run: npm run lint — zero errors

STEP 13 — Manual verification
- Register new user → redirected to /dashboard
- Login with wrong password → error message shown inline (not alert())
- Visit /dashboard in incognito (no cookie) → redirected to /login
- Check browser DevTools → cookie is httpOnly (not readable by JS)
- Check DB via MongoDB Compass → passwordHash starts with $2b$, not plain text

STEP 14 — Commit
  git add -A
  git commit -m "feat(auth): JWT register/login with httpOnly cookie and protected routes"
```

---

## PHASE 2 — Expense CRUD

```
I'm building an AI-Powered Expense Tracker. Phases 0–1 are complete (bootstrap + auth).
Stack: Next.js 14 App Router, TypeScript strict, Tailwind, MongoDB/Mongoose, JWT httpOnly cookie.
Project: /Users/priypatel/Vault/Development/AI-Powered-Expense-Tracker-
CATEGORIES (from src/types/index.ts) = ["Food","Transport","Shopping","Entertainment",
  "Health","Utilities","Housing","Education","Travel","Other"]

═══════════════════════════════════════════
UNIVERSAL CODE RULES — follow in every file
═══════════════════════════════════════════
- TypeScript strict mode, no `any`, explicit return types
- No console.log, no hardcoded values, all imports @/ alias
- All API routes wrapped with withAuth middleware
- Every DB query scoped to authenticated userId — never leak cross-user data
- Ownership check before every PUT/DELETE: expense.userId.equals(req.userId) → 403 if fail
- Validation server-side before every DB write
- 500 responses return { error: "Internal server error" } — never expose stack traces
═══════════════════════════════════════════

STEP 1 — src/models/Expense.ts
Mongoose schema:
  userId:    { type: Schema.Types.ObjectId, ref: "User", required: true }
  amount:    { type: Number, required: true, min: 0.01 }
  category:  { type: String, enum: CATEGORIES, required: true }
  date:      { type: Date, required: true }
  note:      { type: String, maxlength: 200, default: "" }
  timestamps: true (adds createdAt, updatedAt)

Indexes:
  { userId: 1 }
  { date: -1 }
  { userId: 1, date: -1 } compound
  { userId: 1, category: 1 } compound

Export: IExpenseDocument extending mongoose.Document
Schema name: "Expense"

STEP 2 — Validation helper: src/lib/validators.ts
Export:
  validateExpenseBody(body: unknown): { amount: number; category: Category; date: Date; note?: string } | { error: string }
  — checks amount is positive number
  — checks category is in CATEGORIES
  — checks date is parseable ISO string
  — returns typed data object on success, { error: string } on failure

STEP 3 — API Routes (all use withAuth)

GET /api/expenses/route.ts:
  Query params: category?, month? (number 1-12), year? (number), page? (default 1), limit? (default 10)
  Build match: { userId: req.userId }
  If category provided and valid: add { category } to match
  If month AND year provided: add date range to match
    startOfMonth = new Date(year, month-1, 1)
    endOfMonth   = new Date(year, month, 0, 23, 59, 59)
  const total = await Expense.countDocuments(match)
  const expenses = await Expense.find(match).sort({ date: -1 }).skip((page-1)*limit).limit(limit).lean()
  Return: 200 { expenses, total, page, totalPages: Math.ceil(total/limit) }

POST /api/expenses/route.ts:
  Parse body → validateExpenseBody → if error return 400
  Create new Expense({ userId: req.userId, ...validatedData })
  Return: 201 { expense }

PUT /api/expenses/[id]/route.ts:
  Find expense by _id
  If not found → 404 { error: "Expense not found" }
  If expense.userId.toString() !== req.userId → 403 { error: "Forbidden" }
  Validate provided fields (only validate fields that are present in body)
  Update and return: 200 { expense }

DELETE /api/expenses/[id]/route.ts:
  Find expense by _id
  If not found → 404 { error: "Expense not found" }
  If expense.userId.toString() !== req.userId → 403 { error: "Forbidden" }
  Delete → return 200 { message: "Deleted" }

STEP 4 — src/hooks/useExpenses.ts ('use client')
State: expenses: IExpense[], total: number, loading: boolean, error: string | null
Functions (all return Promise<void>, set error state on failure):
  fetchExpenses(filters?: { category?: string; month?: number; year?: number; page?: number }): Promise<void>
  createExpense(data: { amount: number; category: string; date: string; note?: string }): Promise<void>
  updateExpense(id: string, data: Partial<{amount, category, date, note}>): Promise<void>
  deleteExpense(id: string): Promise<void>
Export: { expenses, total, loading, error, fetchExpenses, createExpense, updateExpense, deleteExpense }

STEP 5 — UI Components

src/components/ui/Modal.tsx:
  Props: isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode
  Features: backdrop click closes, Escape key closes, focus trap, scroll lock on body
  Transition: fade-in/fade-out animation

src/components/ui/Spinner.tsx:
  Animated SVG spinner, accepts size and color props

src/components/expenses/ExpenseFilters.tsx ('use client'):
  Props: filters: FilterState, onChange: (filters: FilterState) => void
  FilterState: { category: string; month: number | ""; year: number | "" }
  Category select: "All Categories" + CATEGORIES map
  Month select: "All Months" + Jan-Dec
  Year select: current year + 2 previous years
  On any change: call onChange immediately

src/components/expenses/ExpenseForm.tsx ('use client'):
  Props: initialData?: Partial<IExpense>, onSubmit: (data) => Promise<void>, onCancel: () => void
  Fields: amount (number, min 0.01), category (select from CATEGORIES), date (date input), note (textarea, maxlength 200)
  Controlled form — all fields have validation state
  Inline error messages per field (shown below each input, in red)
  Submit button: shows spinner while loading, disabled during submit
  Validates on submit; also validates individually on blur

src/components/expenses/ExpenseList.tsx ('use client'):
  Props: expenses: IExpense[], onEdit: (expense: IExpense) => void, onDelete: (id: string) => void
  Table columns: Date (formatted DD MMM YYYY) | Category (Badge) | Amount (₹X,XXX.XX) | Note | Actions
  Mobile: card layout instead of table (stacked fields)
  Delete: inline confirm (not browser alert) — shows "Confirm delete?" with Yes/No buttons in the row
  Empty state: "No expenses found. Try adjusting your filters or add a new expense."
  Loading state: 5 skeleton rows (gray animated rectangles)

src/components/ui/Badge.tsx:
  Props: category: Category
  Each category has a distinct Tailwind color class (define CATEGORY_COLORS map)

STEP 6 — src/app/(dashboard)/expenses/page.tsx ('use client')
Layout:
  - Page title "Expenses" + "Add Expense" button + "AI Auto-Fill" button (placeholder for Phase 3) in header row
  - ExpenseFilters below header (filter state stored in useState)
  - "Export CSV" button (placeholder for Phase 6, disabled for now)
  - ExpenseList below filters
  - Modal with ExpenseForm for add/edit
Logic:
  - useExpenses hook
  - On filter change → fetchExpenses(filters)
  - On mount → fetchExpenses()
  - editingExpense state → opens ExpenseForm modal in edit mode
  - After create/update/delete → refetch expenses + show success toast (placeholder — implement fully in Phase 7)

STEP 7 — Write and run tests

src/__tests__/unit/validators.test.ts:
  describe("validateExpenseBody"):
    test("returns parsed data for valid input")
    test("returns error for amount = 0")
    test("returns error for negative amount")
    test("returns error for invalid category")
    test("returns error for missing amount")
    test("returns error for missing category")
    test("returns error for invalid date string")
    test("trims and normalizes valid date")
    test("note is optional — valid without note field")

src/__tests__/integration/expense-routes.test.ts:
  Use mongodb-memory-server. Register+login a test user, save cookie.
  Create a second test user to test ownership isolation.

  describe("GET /api/expenses"):
    test("401 with no auth")
    test("200 returns empty array when no expenses")
    test("200 returns only current user's expenses")
    test("filters by category correctly")
    test("filters by month and year correctly")
    test("pagination: page 2 returns correct offset")
    test("returns totalPages correctly")

  describe("POST /api/expenses"):
    test("401 with no auth")
    test("201 creates expense with valid data")
    test("201 expense in DB has correct userId")
    test("400 for amount = 0")
    test("400 for invalid category")
    test("400 for missing required fields")
    test("400 for invalid date")

  describe("PUT /api/expenses/[id]"):
    test("401 with no auth")
    test("200 updates own expense")
    test("403 when updating another user's expense")
    test("404 for non-existent ID")
    test("validates partial update — 400 for invalid amount")

  describe("DELETE /api/expenses/[id]"):
    test("401 with no auth")
    test("200 deletes own expense — no longer in DB")
    test("403 when deleting another user's expense")
    test("404 for non-existent ID")

Run: npm test — ALL tests pass
Run: npm run type-check — zero errors
Run: npm run lint — zero errors

STEP 8 — Manual verification
- Add expense: all fields → appears in list
- Add expense: required fields only (no note) → appears correctly
- Edit expense: change amount → list shows new amount
- Delete expense: confirm prompt → row disappears
- Filter by category: only matching shown
- Filter by month: only that month shown
- Clear filters: all expenses shown
- DevTools Network: GET /api/expenses response never contains another user's data

STEP 9 — Commit
  git add -A
  git commit -m "feat(expenses): full CRUD with category and month filters"
```

---

## PHASE 3 — AI Auto-Fill Feature

```
I'm building an AI-Powered Expense Tracker. Phases 0–2 are complete (bootstrap, auth, expenses).
Stack: Next.js 14, TypeScript strict, Tailwind, MongoDB, JWT. Gemini 1.5 Flash for AI.
Project: /Users/priypatel/Vault/Development/AI-Powered-Expense-Tracker-
CATEGORIES = ["Food","Transport","Shopping","Entertainment","Health","Utilities","Housing","Education","Travel","Other"]

═══════════════════════════════════════════
UNIVERSAL CODE RULES — follow in every file
═══════════════════════════════════════════
- TypeScript strict mode, no `any`, explicit return types
- No console.log, no hardcoded values, all imports @/ alias
- All API routes wrapped with withAuth
- AI failures must NEVER crash the app — always return { error } and let frontend handle gracefully
- Never expose AI API errors or stack traces in responses
- Post-process all Gemini output before trusting it
═══════════════════════════════════════════

STEP 1 — src/lib/gemini.ts
Initialize:
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  Throw clear error if GEMINI_API_KEY is not set.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

Export extractExpenseFromText(text: string): Promise<{ amount: number | null; category: Category; date: string; note: string }>

Build prompt dynamically (today's date injected):
  const today = new Date().toISOString().split("T")[0]
  const prompt = `
You are an expense extraction assistant. From the following text, extract:
- amount (number only, no currency symbol, e.g. 45.50)
- category (must be exactly one of: Food, Transport, Shopping, Entertainment, Health, Utilities, Housing, Education, Travel, Other)
- date (ISO 8601 format YYYY-MM-DD; infer from context, or use today's date ${today} if not mentioned)
- note (short description of the expense, max 80 characters)

Rules:
1. Respond ONLY with a single valid JSON object. No explanation, no markdown, no code blocks.
2. If you cannot determine the amount, set amount to null.
3. If category is ambiguous, choose closest match or "Other".
4. Do not include currency symbols in amount.
5. If multiple expenses appear in the text, extract only the most prominent/total one.

Example response: {"amount": 45.50, "category": "Food", "date": "${today}", "note": "Lunch at restaurant"}

Text:
"""
${text}
"""`.trim()

Post-process pipeline (apply in order):
  a. Strip markdown code blocks: raw.replace(/\`\`\`(?:json)?\n?/g, "").replace(/\`\`\`\n?/g, "").trim()
  b. JSON.parse(cleaned) — throw if fails
  c. Normalize amount:
     - If string: strip all chars except digits and "." → parseFloat → NaN becomes null
     - If number: use as-is
     - If null/undefined: set null
  d. Validate category: if not in CATEGORIES → set "Other"
  e. Validate date: if new Date(parsed.date) is Invalid → set today's date
  f. Trim note to 80 chars if longer
  g. Return typed object

Function must throw on: network error, JSON parse failure, unexpected Gemini error.
Set timeout: wrap generateContent in a Promise.race with 10 second timeout.

STEP 2 — POST /api/ai/extract/route.ts (uses withAuth)
Validate: body.text must be non-empty string → 400 { error: "Text is required" }
Validate: body.text.trim().length >= 5 → 400 { error: "Text too short to extract from" }
Try: call extractExpenseFromText(text)
  On success: return 200 { data: { amount, category, date, note } }
  On timeout: return 422 { error: "AI request timed out — please try again" }
  On any other error: return 422 { error: "AI extraction failed — please fill in manually" }
Never: expose the actual error message or stack trace in the response

STEP 3 — src/components/expenses/AIExtractModal.tsx ('use client')
Props: isOpen: boolean, onClose: () => void, onExpenseSaved: () => void

State machine (3 steps):
  step: "input" | "review" | "saving"

STEP "input":
  - Textarea: placeholder "Paste a bill, SMS, bank message, or receipt..."
  - Min height: 6 rows
  - Character counter showing X/1000
  - "Extract with AI ✨" button (primary)
  - "Cancel" button
  - While loading: disable both buttons, show spinner inside Extract button
  - On submit: POST /api/ai/extract
    Success → set extractedData → go to "review" step
    Failure → show inline error message → stay on "input" step

STEP "review":
  - Heading: "Review & Confirm"
  - Show ExpenseForm pre-populated with extracted data
    Pass as initialData prop: { amount, category, date, note }
    User can edit any field before saving
  - "← Back" button → returns to "input" step
  - ExpenseForm's onSubmit → calls createExpense → if success: onExpenseSaved() → onClose()

On extractedData.amount === null:
  - Show info banner: "Amount could not be extracted — please enter it manually"
  - amount field is empty, focused

STEP 4 — Wire up to expenses page
In src/app/(dashboard)/expenses/page.tsx:
  - Replace "AI Auto-Fill" placeholder button with functional one
  - Open AIExtractModal when clicked
  - On expense saved: refetch expenses + show success toast

STEP 5 — Manual verification
- With valid GEMINI_API_KEY in .env.local:
  Paste "Paid ₹450 for groceries on May 21" → amount=450, category=Food, date=2026-05-21 pre-filled
  Paste bank SMS with amount → correct extraction
- Edit extracted amount → saved value is the edited one
- With GEMINI_API_KEY set to "invalid":
  Error message shown inline in modal, form stays open, no crash, no 500 shown to user
- With empty text → "Extract" button stays disabled or shows validation error

STEP 6 — Commit
  git add -A
  git commit -m "feat(ai): Gemini auto-fill with graceful fallback"
```

---

## PHASE 4 — Dashboard

```
I'm building an AI-Powered Expense Tracker. Phases 0–3 are complete.
Stack: Next.js 14, TypeScript strict, Tailwind, MongoDB, JWT, Recharts.
Project: /Users/priypatel/Vault/Development/AI-Powered-Expense-Tracker-

═══════════════════════════════════════════
UNIVERSAL CODE RULES — follow in every file
═══════════════════════════════════════════
- TypeScript strict mode, no `any`, explicit return types
- No console.log, no hardcoded values, all imports @/ alias
- All API routes wrapped with withAuth
- Every DB aggregation must be scoped to userId — test this explicitly
- Chart components must handle empty data gracefully (no crashes on [])
- No hardcoded chart colors — use a named CATEGORY_COLORS constant
═══════════════════════════════════════════

STEP 1 — GET /api/dashboard/stats/route.ts (uses withAuth)
Run these 3 aggregations IN PARALLEL using Promise.all (not sequential awaits):

Helper: get start/end of current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  const userId = new mongoose.Types.ObjectId(req.userId)

Aggregation A — total + count this month:
  Expense.aggregate([
    { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
  ])
  Result: totalThisMonth = result[0]?.total ?? 0, expenseCount = result[0]?.count ?? 0

Aggregation B — category breakdown (current month):
  Expense.aggregate([
    { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } }
  ])
  Map to: { category: item._id, total: item.total }

Aggregation C — monthly trend (last 6 months):
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); sixMonthsAgo.setDate(1); sixMonthsAgo.setHours(0,0,0,0)
  Expense.aggregate([
    { $match: { userId, date: { $gte: sixMonthsAgo } } },
    { $group: { _id: { year: { $year: "$date" }, month: { $month: "$date" } }, total: { $sum: "$amount" } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ])
  Fill in missing months (if no expenses in a month, include it with total: 0)
  Map to: { label: "Jan", total: 0 }  — label is 3-letter month abbreviation
  IMPORTANT: result must always have exactly 6 entries (fill gaps with 0)

Budget alerts:
  const budgets = await Budget.find({ userId, month: now.getMonth() + 1, year: now.getFullYear() }).lean()
  For each budget:
    const spent = categoryBreakdown.find(c => c.category === budget.category)?.total ?? 0
    const pct = Math.round((spent / budget.monthlyLimit) * 100)
    return { category: budget.category, spent, limit: budget.monthlyLimit, pct }
  
Return: 200 { totalThisMonth, expenseCount, categoryBreakdown, monthlyTrend, budgetAlerts }

STEP 2 — src/hooks/useDashboard.ts ('use client')
  State: stats: DashboardStats | null, loading: boolean, error: string | null
  fetchStats(): fetches /api/dashboard/stats, sets state
  Export: { stats, loading, error, fetchStats }
  Use DashboardStats interface from @/types

STEP 3 — Define CATEGORY_COLORS in src/types/index.ts
  export const CATEGORY_COLORS: Record<Category, string> = {
    Food: "#f97316", Transport: "#3b82f6", Shopping: "#a855f7",
    Entertainment: "#ec4899", Health: "#22c55e", Utilities: "#eab308",
    Housing: "#6366f1", Education: "#14b8a6", Travel: "#f43f5e", Other: "#94a3b8"
  }

STEP 4 — src/components/dashboard/StatsCards.tsx
Props: totalThisMonth: number, expenseCount: number, loading: boolean
Loading state: 2 skeleton card placeholders (animate-pulse gray blocks)
Cards: "Total This Month" (formatted as ₹X,XXX.XX) and "Total Expenses" (count)
Each card: white background, rounded, shadow, icon + label + value

STEP 5 — src/components/dashboard/CategoryPieChart.tsx
Props: data: { category: string; total: number }[], loading: boolean
Recharts: ResponsiveContainer > PieChart > Pie > Cell (color from CATEGORY_COLORS)
Add: Legend (bottom), Tooltip (formatted as ₹X,XXX.XX)
Loading state: gray rounded rectangle placeholder (animate-pulse)
Empty state (data.length === 0): centered "No spending data this month" text
Responsive: width="100%" height={300}
IMPORTANT: Recharts components must be wrapped in 'use client' — do NOT import Recharts in Server Components

STEP 6 — src/components/dashboard/MonthlyTrendChart.tsx
Props: data: { label: string; total: number }[], loading: boolean
Recharts: ResponsiveContainer > BarChart > CartesianGrid + XAxis + YAxis + Tooltip + Bar
Bar color: "#6366f1" (indigo)
Tooltip format: "₹X,XXX.XX"
Loading state: gray placeholder
Empty state: "No trend data available"
Responsive: width="100%" height={300}

STEP 7 — src/components/dashboard/BudgetAlertBanner.tsx
Props: alerts: { category: string; spent: number; limit: number; pct: number }[]
Render nothing (return null) if alerts.length === 0 OR no alert has pct >= 80
For each alert where pct >= 80:
  - pct >= 100: red background "⚠ {category}: ₹{spent} / ₹{limit} — Over budget! ({pct}%)"
  - pct >= 80:  yellow background "⚡ {category}: ₹{spent} / ₹{limit} — Near limit ({pct}%)"
Styled: colored banner with icon + text, dismiss not needed

STEP 8 — src/app/(dashboard)/page.tsx ('use client')
Layout:
  "Dashboard" heading + current month/year subtitle
  BudgetAlertBanner (full width)
  StatsCards row (2 cards)
  Grid: CategoryPieChart (left, 50%) and MonthlyTrendChart (right, 50%)
  On mobile: stack vertically
useEffect: fetchStats() on mount

STEP 9 — Manual verification
- Add 3 expenses in different categories → pie chart shows 3 slices with correct amounts
- Dashboard total matches manual sum (add them up yourself)
- Bar chart shows 6 bars (some at 0)
- Set a budget for Food → add expenses over 80% → yellow alert appears on dashboard
- Empty state: new user sees "No spending data" instead of crashes

STEP 10 — Commit
  git add -A
  git commit -m "feat(dashboard): stats, pie chart, monthly trend chart"
```

---

## PHASE 5 — Budget Alerts

```
I'm building an AI-Powered Expense Tracker. Phases 0–4 are complete.
Stack: Next.js 14, TypeScript strict, Tailwind, MongoDB, JWT.
Project: /Users/priypatel/Vault/Development/AI-Powered-Expense-Tracker-
CATEGORIES = ["Food","Transport","Shopping","Entertainment","Health","Utilities","Housing","Education","Travel","Other"]

═══════════════════════════════════════════
UNIVERSAL CODE RULES — follow in every file
═══════════════════════════════════════════
- TypeScript strict mode, no `any`, explicit return types
- No console.log, no hardcoded values, all imports @/ alias
- All API routes wrapped with withAuth
- Compound unique index prevents duplicate budgets — upsert pattern on POST
- Ownership check before every PUT/DELETE
═══════════════════════════════════════════

STEP 1 — src/models/Budget.ts
Mongoose schema:
  userId:       { type: Schema.Types.ObjectId, ref: "User", required: true }
  category:     { type: String, enum: CATEGORIES, required: true }
  monthlyLimit: { type: Number, required: true, min: 1 }
  month:        { type: Number, required: true, min: 1, max: 12 }
  year:         { type: Number, required: true }
  createdAt:    { type: Date, default: Date.now }

Compound unique index: { userId: 1, category: 1, month: 1, year: 1 } unique: true
Export: IBudgetDocument extending mongoose.Document
Schema name: "Budget"

STEP 2 — API Routes (all use withAuth, all scoped to userId)

GET /api/budgets/route.ts:
  Query: month? (number), year? (number)
  If month+year provided: filter to that month
  Returns: 200 { budgets: Budget[] }

POST /api/budgets/route.ts:
  Body: { category, monthlyLimit, month, year }
  Validate: category in CATEGORIES, monthlyLimit >= 1, month 1-12, year is valid year
  Upsert: Budget.findOneAndUpdate(
    { userId, category, month, year },
    { $set: { monthlyLimit } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
  Returns: 201 { budget }

PUT /api/budgets/[id]/route.ts:
  Find budget by _id
  If not found → 404
  If budget.userId.toString() !== req.userId → 403
  Validate monthlyLimit >= 1
  Update → return 200 { budget }

DELETE /api/budgets/[id]/route.ts:
  Find budget by _id
  If not found → 404
  If budget.userId.toString() !== req.userId → 403
  Delete → return 200 { message: "Deleted" }

STEP 3 — src/hooks/useBudgets.ts ('use client')
  State: budgets: IBudget[], loading: boolean, error: string | null
  fetchBudgets(month?: number, year?: number): Promise<void>
  createBudget(data): Promise<void>
  updateBudget(id: string, data: { monthlyLimit: number }): Promise<void>
  deleteBudget(id: string): Promise<void>

STEP 4 — src/components/budget/BudgetForm.tsx ('use client')
Props: initialData?: IBudget, currentMonth: number, currentYear: number,
       existingCategories: Category[], onSubmit: (data) => Promise<void>, onCancel: () => void

Fields:
  Category select: when creating, only show categories NOT in existingCategories (prevent duplicate)
                   when editing, show current category (read-only/disabled)
  Monthly limit: number input (min 1, required)
  Month select: Jan-Dec (when creating shows current month)
  Year select: current year + 1 previous

Submit: calls onSubmit(data), shows spinner, inline errors

STEP 5 — src/components/budget/BudgetList.tsx ('use client')
Props: budgets: IBudget[], spentByCategory: Record<string, number>,
       onEdit: (budget: IBudget) => void, onDelete: (id: string) => void

For each budget:
  Category name + colored badge
  Progress bar:
    - Compute pct = (spent / monthlyLimit) * 100
    - Bar fill color: green if pct < 80, yellow if 80 <= pct < 100, red if pct >= 100
    - Bar width: min(pct, 100)% (cap at 100% width)
  Text: "₹{spent.toFixed(2)} spent of ₹{monthlyLimit.toFixed(2)} ({pct}%)"
  Status chip: "On track" (green) / "Near limit" (yellow) / "Over budget!" (red)
  Edit icon button → onEdit(budget)
  Delete icon button → inline confirm → onDelete(budget._id)

Empty state: "No budgets set for this month. Click 'Set Budget' to add one."

STEP 6 — src/app/(dashboard)/budget/page.tsx ('use client')
State: selectedMonth (default: current), selectedYear (default: current)
Fetch: useBudgets (budgets for selected month/year) + useExpenses (for spending amounts)
Compute: spentByCategory from expenses filtered to selected month

Layout:
  "Budget Management" heading
  Month/Year picker row + "Set Budget" button
  BudgetAlertBanner (reuse from dashboard — pass computed alerts)
  BudgetList (budgets + spent amounts)
  Modal with BudgetForm for add/edit

STEP 7 — Manual verification
- Set Food budget = ₹1000 for current month
- Add ₹820 Food expense → budget page shows yellow progress bar, dashboard shows yellow alert
- Add ₹250 more Food expense → budget page shows red progress bar, dashboard shows red alert
- Upsert: try adding second budget for Food same month → updates limit instead of creating duplicate
- Delete budget → progress bar gone, alert disappears from dashboard
- Switch month in budget page → shows budgets for that month only

STEP 8 — Commit
  git add -A
  git commit -m "feat(budget): monthly budget limits with 80%/100% visual alerts"
```

---

## PHASE 6 — CSV Export

```
I'm building an AI-Powered Expense Tracker. Phases 0–5 are complete.
Stack: Next.js 14, TypeScript strict, Tailwind, MongoDB, JWT.
Project: /Users/priypatel/Vault/Development/AI-Powered-Expense-Tracker-

═══════════════════════════════════════════
UNIVERSAL CODE RULES — follow in every file
═══════════════════════════════════════════
- TypeScript strict mode, no `any`, explicit return types
- No console.log, no hardcoded values, all imports @/ alias
- Export route uses withAuth — always scoped to userId
- CSV must handle commas inside fields (wrap in double quotes)
- CSV must handle quotes inside fields (escape as "")
- No external CSV library — build the string manually
═══════════════════════════════════════════

STEP 1 — GET /api/expenses/export/route.ts (uses withAuth)
Query params: month? (1-12), year?

Build match: { userId: req.userId }
If month AND year both provided:
  const startOfMonth = new Date(year, month-1, 1)
  const endOfMonth   = new Date(year, month, 0, 23, 59, 59, 999)
  add date range to match

Fetch: await Expense.find(match).sort({ date: -1 }).lean()

CSV builder (pure function — extract as buildCSV for testability):
  function buildCSV(expenses: IExpense[]): string
  Header row: "Date,Category,Amount,Note"
  For each expense:
    date: format as YYYY-MM-DD (use toISOString().split("T")[0])
    category: as-is
    amount: expense.amount.toFixed(2)
    note: escape field (wrap in "" if contains comma, newline, or double-quote; escape internal "" as "")
  Join rows with "\n"

Filename:
  If filtered: "expenses-${year}-${String(month).padStart(2, "0")}.csv"
  If all-time: "expenses-all.csv"

Response:
  new Response(csvString, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    }
  })

STEP 2 — Export button in src/app/(dashboard)/expenses/page.tsx
Add "Export CSV" button in the filters row.
On click:
  Build URL: /api/expenses/export + query params from current filter state
  const response = await fetch(url) — with credentials: "include"
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = objectUrl
  a.download = filename  // get from Content-Disposition header or build from filter state
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(objectUrl)
  Show success toast: "Exported X expenses"
  Show error toast if fetch fails

STEP 3 — Manual verification
- Add 5 expenses in May 2026, 3 in April 2026
- Filter to May → Export → file has 5 rows + header
- Remove filter → Export → file has all 8 rows + header
- Open file in Google Sheets → columns parse correctly
- Add an expense with note containing a comma → export → note cell correct in Sheets
- Empty filter month → Export → file has only header row, downloads successfully

STEP 4 — Commit
  git add -A
  git commit -m "feat(export): CSV export with month filter"
```

---

## PHASE 7 — Polish & Production UX

```
I'm building an AI-Powered Expense Tracker. All core features (phases 0–6) are complete.
Stack: Next.js 14, TypeScript strict, Tailwind, MongoDB.
Project: /Users/priypatel/Vault/Development/AI-Powered-Expense-Tracker-

═══════════════════════════════════════════
UNIVERSAL CODE RULES — follow in every file
═══════════════════════════════════════════
- TypeScript strict mode, no `any`, explicit return types
- No console.log anywhere
- No hardcoded values, all imports @/ alias
- Accessibility: all interactive elements keyboard-accessible
- Mobile-first: test at 375px before 1440px
═══════════════════════════════════════════

STEP 1 — Toast notification system
src/hooks/useToast.ts:
  State: toasts: { id: string; message: string; type: "success" | "error" | "info" }[]
  show(message: string, type: "success" | "error" | "info"): void — adds toast with unique ID
  dismiss(id: string): void
  Auto-dismiss: useEffect sets 3 second timeout per toast → calls dismiss
  Return: { toasts, show, dismiss }

src/components/ui/Toast.tsx + ToastContainer:
  ToastContainer: fixed bottom-right, stack of toasts
  Toast: colored card (green success, red error, blue info), message, × button
  Animation: slide in from right, fade out on dismiss
  
ToastProvider: wraps app in (dashboard)/layout.tsx — provides useToast context globally

STEP 2 — Skeleton loaders
src/components/ui/Skeleton.tsx:
  Props: className?: string
  Renders: animate-pulse gray rounded block
  Variants via className: different widths/heights

Apply skeletons:
  ExpenseList loading state: 5 skeleton rows matching table column widths
  StatsCards loading state: 2 skeleton card shapes
  CategoryPieChart loading: circular skeleton
  MonthlyTrendChart loading: rectangle skeleton with bar shapes

STEP 3 — Form validation (inline, not alert())
Review ALL forms and ensure:
  LoginForm: email format validation, password required
  RegisterForm: name 2-50 chars, email format, password min 8, confirmPassword matches
  ExpenseForm: amount > 0 with 2 decimal max, category required, date required and not future (optional)
  BudgetForm: monthlyLimit >= 1, category required
  AIExtractModal textarea: minimum 5 characters before enabling Extract button

Each field: show error message in <p className="text-red-500 text-sm mt-1"> below the input
Error clears when user starts typing in that field

STEP 4 — Responsive layout
src/components/layout/Sidebar.tsx — mobile behavior:
  On md+ screens: always visible (fixed left column)
  On < md screens: hidden by default, slides in as overlay when hamburger clicked
  Hamburger button visible on < md screens in Navbar
  Overlay backdrop: clicking it closes sidebar
  
ExpenseList: on < md screens switch from table to card layout
  Each expense: card with category badge, amount large, date below, note italic, action buttons

Charts: on < md screens stack vertically (full width each)

STEP 5 — Accessibility
All modals:
  - Focus trap: Tab key cycles within modal only
  - Escape key: closes modal, returns focus to trigger button
  - aria-modal="true", role="dialog", aria-labelledby pointing to title

All icon buttons: aria-label="Edit expense" / aria-label="Delete expense" / etc.
All form inputs: associated <label> via htmlFor/id, required fields have aria-required="true"
Error messages: aria-live="polite" on error containers so screen readers announce them
Color contrast: ensure all text meets WCAG AA (4.5:1 for normal text, 3:1 for large)

STEP 6 — Page metadata
Each page file, add:
  src/app/(auth)/login/page.tsx:     export const metadata = { title: "Login | ExpenseAI", description: "Sign in to your account" }
  src/app/(auth)/register/page.tsx:  export const metadata = { title: "Register | ExpenseAI", description: "Create your account" }
  src/app/(dashboard)/page.tsx:      export const metadata = { title: "Dashboard | ExpenseAI" }
  src/app/(dashboard)/expenses/page.tsx: export const metadata = { title: "Expenses | ExpenseAI" }
  src/app/(dashboard)/budget/page.tsx:   export const metadata = { title: "Budget | ExpenseAI" }

Root layout: export const metadata = { title: { default: "ExpenseAI", template: "%s | ExpenseAI" }, description: "..." }

STEP 7 — Empty states (with icon + helpful text)
Each component that shows data must have a styled empty state:
  ExpenseList (no expenses, or no results for filter):
    Icon: receipt/list icon, Text: "No expenses found", 
    Sub: if filters active "Try adjusting your filters" else "Add your first expense to get started"
    Button: "Add Expense" (if no filters active)
  
  Dashboard charts (no data):
    CategoryPieChart: "No spending this month"
    MonthlyTrendChart: "No trend data yet — add expenses to see your spending history"
  
  BudgetList (no budgets):
    Icon: budget/piggy icon, Text: "No budgets set for this period"
    Sub: "Set a monthly limit per category to track your spending"
    Button: "Set Budget"

STEP 8 — Manual verification
- Throttle network to "Slow 3G" in DevTools → verify skeletons appear on all pages
- Submit empty LoginForm → inline errors appear under each field (no alert())
- 375px viewport (iPhone SE in DevTools):
  □ Hamburger menu shows and toggles sidebar
  □ Expense table switches to card layout
  □ Charts stack vertically
  □ All modals are usable (not cut off)
  □ No horizontal scroll
- Tab through LoginForm → focus order is logical (name → email → password → submit)
- Open a modal → press Escape → modal closes, focus returns to button that opened it

STEP 9 — Commit
  git add -A
  git commit -m "feat(ux): loading states, empty states, toasts, responsive layout, accessibility"
```

---

## PHASE 8 — Documentation & Final Audit

```
I'm building an AI-Powered Expense Tracker. All features (phases 0–7) are complete.
Project: /Users/priypatel/Vault/Development/AI-Powered-Expense-Tracker-

STEP 1 — README.md
Create a professional README.md with these sections in order:

# ExpenseAI — AI-Powered Expense Tracker

## Live Demo
[Link placeholder — update after deployment]

## Overview
2-sentence description of what the app does and its key feature (AI auto-fill)

## Features
- [ ] JWT Authentication (register, login, protected routes)
- [ ] Expense Management (add, edit, delete, filter by category/month)
- [ ] AI Auto-Fill (paste text → Gemini extracts amount/category/date)
- [ ] Dashboard (total spending, category pie chart, 6-month trend)
- [ ] Budget Alerts (per-category limits, 80%/100% visual indicators)
- [ ] CSV Export (filtered by month or all-time)

## Tech Stack
| Layer       | Technology                    |
|-------------|-------------------------------|
| Frontend    | Next.js 14 · TypeScript · Tailwind CSS |
| Backend     | Next.js API Routes            |
| Database    | MongoDB Atlas · Mongoose      |
| AI          | Google Gemini 1.5 Flash       |
| Auth        | JWT (httpOnly cookie)         |
| Charts      | Recharts                      |
| Deployment  | Vercel + MongoDB Atlas        |

## Local Setup
Step-by-step (numbered):
1. Prerequisites: Node.js 18+, npm, MongoDB Atlas account, Google AI Studio account
2. Clone: git clone ...
3. Install: npm install
4. Environment: cp .env.example .env.local, then fill each value (link to where to get each)
5. Run: npm run dev → open http://localhost:3000
6. Test: npm test

## Environment Variables
| Variable              | Description                           | Where to get               |
|-----------------------|---------------------------------------|----------------------------|
| MONGODB_URI           | MongoDB Atlas connection string       | atlas.mongodb.com          |
| JWT_SECRET            | Random 64-char secret                 | openssl rand -base64 48    |
| GEMINI_API_KEY        | Google Gemini API key                 | aistudio.google.com        |
| NEXT_PUBLIC_APP_URL   | Deployed app URL                      | Your Vercel domain         |

## Project Structure
See [Project Structure.md](Project Structure.md) for the annotated folder tree.

## Architecture
See [Architecture.md](Architecture.md) for system design and API contract.

STEP 2 — Verify .env.example
Confirm it has all 4 variables with inline comments. No actual values committed.

STEP 3 — Final codebase audit
Search for and fix every instance of:
  grep -r "console.log" src/ — remove all found instances
  grep -r "TODO" src/ — resolve or remove all
  grep -r "any" src/ --include="*.ts" --include="*.tsx" — fix all TypeScript `any` types
  grep -r "hardcoded" src/ — review and parameterize

STEP 4 — Quality gates (all must pass before committing)
  npm run lint          → 0 errors, 0 warnings
  npm run type-check    → 0 TypeScript errors
  npm run build         → builds successfully, 0 errors

If any gate fails: fix the issue, re-run, do NOT skip with flags.

STEP 5 — Update all 5 project doc files
  Architecture.md — verify reflects final API shape
  PROMPTS.md — verify final Gemini prompt is documented
  tasklist.md — mark ALL completed phases as [x]
  testing.strategy.md — add any tests added beyond original plan
  Project Structure.md — verify folder tree matches actual file system

STEP 6 — Commit
  git add -A
  git commit -m "docs: README, env example, finalize project documentation"

STEP 7 — Verify git log
Run: git log --oneline
Expected output (one line per phase):
  docs: README, env example, finalize project documentation
  feat(ux): loading states, empty states, toasts, responsive layout, accessibility
  feat(export): CSV export with month filter
  feat(budget): monthly budget limits with 80%/100% visual alerts
  feat(dashboard): stats, pie chart, monthly trend chart
  feat(ai): Gemini auto-fill with graceful fallback
  feat(expenses): full CRUD with category and month filters
  feat(auth): JWT register/login with httpOnly cookie and protected routes
  chore: bootstrap Next.js 14 project with dependencies and test setup

If the log looks messy, do NOT squash or rebase — just continue to Phase 9 as-is.
```

---

## PHASE 9 — Deployment

```
I'm building an AI-Powered Expense Tracker. All code and docs are complete (phases 0–8).
Project: /Users/priypatel/Vault/Development/AI-Powered-Expense-Tracker-

STEP 1 — Pre-deploy checks (must all pass before deploying)
  npm run build         → must succeed with 0 errors
  npm run lint          → 0 errors
  npm run type-check    → 0 TypeScript errors

STEP 2 — Security pre-check
  git status → working tree must be clean
  git diff HEAD --name-only → no .env files in any commits
  grep -r "GEMINI_API_KEY\|JWT_SECRET\|MONGODB_URI" src/ → should return 0 results (no hardcoded values)
  Verify .env.local is in .gitignore

STEP 3 — MongoDB Atlas setup instructions
Tell me the exact steps for:
1. Create M0 (free) cluster on atlas.mongodb.com
2. Create a database user with readWrite role
3. Whitelist IP 0.0.0.0/0 (allow all — required for Vercel dynamic IPs)
4. Get the connection string in format: mongodb+srv://<user>:<pass>@<cluster>/<dbname>?retryWrites=true&w=majority
   Replace <dbname> with "expense-tracker"

STEP 4 — Vercel deployment instructions
Tell me the exact steps for:
1. Push this repo to GitHub (public)
2. Import GitHub repo in vercel.com
3. Framework preset: Next.js (should auto-detect)
4. Add these environment variables in Vercel dashboard:
   - MONGODB_URI: [from Atlas]
   - JWT_SECRET: [run: openssl rand -base64 48 — paste result]
   - GEMINI_API_KEY: [from aistudio.google.com]
   - NEXT_PUBLIC_APP_URL: https://[your-vercel-app-url]
5. Click Deploy

STEP 5 — Post-deploy smoke test checklist
After deploy succeeds, test EVERY feature on the live URL:

Authentication:
  □ Register a new account on the live URL
  □ Logout
  □ Login with the same account
  □ Try visiting /dashboard without being logged in → redirected to /login

Expenses:
  □ Add an expense manually
  □ Edit the expense
  □ Delete the expense
  □ Add 5 expenses in different categories
  □ Filter by category → correct results
  □ Filter by month → correct results

AI Auto-Fill:
  □ Click "AI Auto-Fill"
  □ Paste: "Paid ₹450 for lunch at McDonald's on 21 May"
  □ Verify fields are pre-populated
  □ Save → appears in expense list

Dashboard:
  □ Total this month shows correct sum
  □ Pie chart renders with correct slices
  □ Bar chart shows 6 months

Budget:
  □ Set a budget for Food (₹500)
  □ Add ₹420 Food expense → yellow alert appears
  □ Add ₹150 more Food → red alert appears

Export:
  □ Export all-time → file downloads
  □ Open in Google Sheets → columns parse correctly

Performance:
  □ No 500 errors in Network tab
  □ No JavaScript errors in Console tab
  □ Page loads under 3 seconds on first visit

STEP 6 — Update README
After all smoke tests pass:
Update README.md Live Demo link with the actual Vercel URL.
  git add README.md
  git commit -m "chore: update README with production URL"
  git push origin main

STEP 7 — Final deliverables checklist
  □ GitHub repo is public
  □ README.md has live URL, setup steps, env vars table
  □ .env.example is committed (no real values)
  □ No .env.local or secrets in git history
  □ All features work on the live URL
  □ git log shows clean incremental commits (one per phase)
  □ Architecture.md, PROMPTS.md, tasklist.md, testing.strategy.md, Project Structure.md all present
```

---

> **Usage:** Paste one phase at a time. Complete all STEPS including running tests and manual
> verification before moving to the next phase. Every phase must end with a clean git commit.
