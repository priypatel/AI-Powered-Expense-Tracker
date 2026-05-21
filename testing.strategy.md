# Testing Strategy — AI-Powered Expense Tracker

## Testing Philosophy
- Test behavior, not implementation details
- Every API route has at minimum: happy path + auth failure + validation failure
- UI testing focuses on user flows, not component internals
- AI tests use mocked Gemini responses to be deterministic

---

## Test Layers

```
┌─────────────────────────────────────────┐
│           E2E Tests (Cypress/Playwright) │  ← Full user journeys
├─────────────────────────────────────────┤
│       Integration Tests (Jest + Supertest)│  ← API routes + DB
├─────────────────────────────────────────┤
│         Unit Tests (Jest + RTL)          │  ← Utilities + components
└─────────────────────────────────────────┘
```

---

## Unit Tests

### `src/lib/auth.ts`

| Test | Input | Expected |
|---|---|---|
| `hashPassword` returns bcrypt hash | `"password123"` | Starts with `$2b$` |
| `hashPassword` same input gives different hashes | `"abc"` x2 | Two different hashes (salt) |
| `comparePassword` returns true for correct password | plain + hash | `true` |
| `comparePassword` returns false for wrong password | wrong + hash | `false` |
| `signJWT` returns a string | `{ userId: "abc" }` | Non-empty string |
| `verifyJWT` returns payload for valid token | valid token | `{ userId: "abc" }` |
| `verifyJWT` throws for expired token | expired token | Throws `JsonWebTokenError` |
| `verifyJWT` throws for tampered token | modified token | Throws |

### `src/lib/gemini.ts`

| Test | Mock | Expected |
|---|---|---|
| Returns parsed fields on valid Gemini response | `'{"amount":430,"category":"Food","date":"2026-05-21","note":"Lunch"}'` | `{ amount: 430, category: "Food", ... }` |
| Strips markdown code block wrapper | `'` ```json\n{"amount":100}``` `'` | Parsed correctly |
| Normalizes amount with currency symbol | `"₹430"` in response | `amount: 430` |
| Defaults unknown category to "Other" | `"category":"Groceries"` | `category: "Other"` |
| Defaults date to today if invalid | `"date":"not-a-date"` | Today's ISO date |
| Sets amount to null when not detectable | `"amount":null` | `amount: null` |
| Throws on network error | Gemini throws | Function re-throws |

### `src/types/index.ts`

| Test | Check |
|---|---|
| `CATEGORIES` contains exactly 10 values | Length === 10 |
| All category values are non-empty strings | Every item is string |

---

## Integration Tests (API Routes)

### Auth Routes

#### `POST /api/auth/register`

| Scenario | Body | Expected Status | Expected Body |
|---|---|---|---|
| Valid registration | `{name, email, password}` | 201 | `{ user: { name, email } }` |
| Duplicate email | Same email twice | 400 | `{ error: "Email already in use" }` |
| Missing name | `{email, password}` | 400 | `{ error: "All fields required" }` |
| Missing password | `{name, email}` | 400 | `{ error: "All fields required" }` |
| Invalid email format | `email: "notanemail"` | 400 | validation error |
| Short password (<8 chars) | `password: "abc"` | 400 | `{ error: "Password too short" }` |
| Response sets httpOnly cookie | Valid body | Cookie header present | `Set-Cookie: token=...; HttpOnly` |

#### `POST /api/auth/login`

| Scenario | Body | Expected Status |
|---|---|---|
| Valid credentials | Registered user | 200 + cookie |
| Wrong password | Correct email, wrong pw | 401 |
| Non-existent email | Unknown email | 401 |
| Missing fields | `{}` | 400 |

#### `POST /api/auth/logout`

| Scenario | Expected |
|---|---|
| Logout clears cookie | `Set-Cookie: token=; Max-Age=0` |

---

### Expense Routes

#### `GET /api/expenses`

| Scenario | Setup | Expected |
|---|---|---|
| No auth | No cookie | 401 |
| No expenses yet | Authenticated | `{ expenses: [], total: 0 }` |
| Returns only own expenses | 2 users, each with expenses | Only caller's expenses |
| Filter by category | 3 Food, 2 Transport | Returns 3 when `?category=Food` |
| Filter by month | Expenses in May + June | Returns May only when `?month=5&year=2026` |
| Pagination works | 15 expenses, limit=10 | `{ totalPages: 2 }` on page 1 |

#### `POST /api/expenses`

| Scenario | Body | Expected Status |
|---|---|---|
| Valid expense | `{amount:100, category:"Food", date:"2026-05-21"}` | 201 |
| Amount = 0 | `{amount:0, ...}` | 400 |
| Amount negative | `{amount:-50, ...}` | 400 |
| Invalid category | `{category:"Xyz", ...}` | 400 |
| Missing required fields | `{note:"hi"}` | 400 |
| No auth | No cookie | 401 |

#### `PUT /api/expenses/[id]`

| Scenario | Expected |
|---|---|
| Valid update by owner | 200, updated fields |
| Update by non-owner | 403 |
| Non-existent ID | 404 |
| No auth | 401 |

#### `DELETE /api/expenses/[id]`

| Scenario | Expected |
|---|---|
| Delete by owner | 200, expense removed from DB |
| Delete by non-owner | 403 |
| Non-existent ID | 404 |
| No auth | 401 |

#### `GET /api/expenses/export`

| Scenario | Expected |
|---|---|
| Export all-time | 200, `Content-Type: text/csv`, correct rows |
| Export by month | Only that month's expenses in CSV |
| Empty result | CSV with header row only |
| No auth | 401 |

---

### AI Route

#### `POST /api/ai/extract`

| Scenario | Mock | Expected |
|---|---|---|
| Gemini returns valid JSON | Valid response | 200 `{ data: {...} }` |
| Gemini returns malformed JSON | Broken JSON string | 422 `{ error: "AI extraction failed" }` |
| Gemini API throws network error | Exception | 422 `{ error: "AI extraction failed" }` |
| Empty text body | `{ text: "" }` | 400 `{ error: "Text is required" }` |
| No auth | No cookie | 401 |

---

### Budget Routes

#### `POST /api/budgets`

| Scenario | Expected |
|---|---|
| Create valid budget | 201, budget in DB |
| Duplicate category+month+year | Upserts (no duplicate doc) |
| Invalid category | 400 |
| Limit = 0 | 400 |
| No auth | 401 |

#### `PUT /api/budgets/[id]`

| Scenario | Expected |
|---|---|
| Update by owner | 200 updated |
| Update by non-owner | 403 |

#### `DELETE /api/budgets/[id]`

| Scenario | Expected |
|---|---|
| Delete by owner | 200 |
| Delete by non-owner | 403 |

---

### Dashboard Stats Route

#### `GET /api/dashboard/stats`

| Scenario | Setup | Expected |
|---|---|---|
| No expenses | Empty DB | `totalThisMonth: 0`, empty arrays |
| With expenses | 3 expenses this month | `totalThisMonth` equals sum |
| Category breakdown | Food: 200, Transport: 100 | Two entries in `categoryBreakdown` |
| Monthly trend | Expenses over 6 months | Exactly 6 entries in `monthlyTrend` |
| Budget alert at 85% | Budget: 1000, spent: 850 | `pct: 85` in `budgetAlerts` |
| No cross-user data | Two users | Each sees only their own data |
| No auth | No cookie | 401 |

---

## Manual QA Matrix (Pre-Deploy Checklist)

### Authentication
- [ ] Register with valid data → see dashboard
- [ ] Register with existing email → error message shown
- [ ] Login with wrong password → error message shown
- [ ] Navigate to `/dashboard` without being logged in → redirected to `/login`
- [ ] Logout → cookie cleared → `/dashboard` redirects to `/login`

### Expense Management
- [ ] Add expense with all fields → appears in list
- [ ] Add expense with only required fields → appears in list
- [ ] Edit expense amount → list reflects change
- [ ] Delete expense → row removed from list
- [ ] Filter by category → only matching expenses shown
- [ ] Filter by month → only that month shown
- [ ] Clear filters → all expenses shown

### AI Auto-Fill
- [ ] Paste restaurant receipt → fields pre-populated correctly
- [ ] Paste bank SMS → amount and category extracted
- [ ] Paste vague text → graceful fallback (empty form, toast message)
- [ ] Edit AI-extracted fields before saving → saved values reflect edits

### Dashboard
- [ ] Total this month matches manual sum of expenses
- [ ] Pie chart shows slice per category
- [ ] Bar chart shows exactly 6 months
- [ ] Dashboard empty state when no expenses

### Budget Alerts
- [ ] Set Food budget = ₹1000
- [ ] Add ₹800 Food expense → yellow alert shown
- [ ] Add ₹300 more Food expense → red alert shown
- [ ] Delete budget → alert disappears
- [ ] Alerts shown on both dashboard and expenses page

### CSV Export
- [ ] Export all-time → all expenses in file
- [ ] Export filtered by month → only that month's data
- [ ] Empty month → file downloads with header row only
- [ ] Exported file opens correctly in Excel/Google Sheets

### Cross-Cutting
- [ ] All features work on mobile (375px viewport)
- [ ] No JavaScript errors in browser console
- [ ] No 500 errors in network tab
- [ ] No API keys visible in network tab responses
- [ ] All above work on the production Vercel URL (not just localhost)

---

## Test Setup & Commands

```bash
# Run unit + integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Type check (zero errors required before commit)
npm run type-check

# Lint (zero errors required before commit)
npm run lint
```

### Recommended Test Libraries

| Purpose | Library |
|---|---|
| Unit + integration | Jest + ts-jest |
| React components | React Testing Library |
| API route testing | `node-mocks-http` or direct fetch in Jest |
| E2E (optional) | Playwright |
| DB test isolation | `mongodb-memory-server` |

### Test Database
- Use `mongodb-memory-server` for integration tests — no connection to real Atlas
- Each test suite: `beforeEach` creates fresh collections, `afterEach` clears them
- Never run tests against the production MongoDB URI
