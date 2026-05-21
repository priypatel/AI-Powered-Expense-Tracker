# Architecture — AI-Powered Expense Tracker

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  Next.js 14 App Router · React 18 · Tailwind CSS · Recharts     │
│                                                                 │
│  /login  /register  /dashboard  /expenses  /budget              │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────────┐
│                   NEXT.JS API ROUTES (Edge/Node)                 │
│                                                                 │
│  /api/auth/*   /api/expenses/*   /api/budgets/*                 │
│  /api/ai/extract   /api/dashboard/stats                         │
│                                                                 │
│  withAuth middleware → verifies JWT from httpOnly cookie        │
└───────┬────────────────────────────┬────────────────────────────┘
        │                            │
┌───────▼────────┐        ┌──────────▼──────────────┐
│  MongoDB Atlas │        │  Google Gemini 1.5 Flash │
│  (Mongoose)    │        │  (AI text extraction)    │
│                │        │                          │
│  Users         │        │  POST /v1/models/...     │
│  Expenses      │        │  generateContent()       │
│  Budgets       │        └──────────────────────────┘
└────────────────┘
```

---

## Data Flow Diagrams

### 1. Authentication Flow
```
User fills LoginForm
      │
      ▼
POST /api/auth/login
      │
      ├─ Find user by email in MongoDB
      ├─ bcrypt.compare(password, passwordHash)
      ├─ signJWT({ userId, email })
      └─ Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict
             │
             ▼
      Redirect → /dashboard
      (subsequent requests carry cookie automatically)
```

### 2. Expense CRUD Flow
```
User submits ExpenseForm
      │
      ▼
POST /api/expenses
      │
      ├─ withAuth → extract userId from JWT cookie
      ├─ Validate: amount > 0, category in enum, date parseable
      ├─ new Expense({ userId, amount, category, date, note })
      └─ expense.save() → return 201 + expense doc
             │
             ▼
      useExpenses hook updates local state
      ExpenseList re-renders with new entry
```

### 3. AI Auto-Fill Flow
```
User pastes text in AIExtractModal
      │
      ▼
POST /api/ai/extract  { text: "..." }
      │
      ├─ withAuth → verify JWT
      ├─ gemini.ts → GoogleGenerativeAI.generateContent(prompt)
      │     │
      │     ├─ Success → parse JSON → { amount, category, date, note }
      │     └─ Failure → return { error: "AI extraction failed" }
      │
      ▼
Frontend receives response
      ├─ Success → pre-populate ExpenseForm fields
      └─ Failure → show toast, open empty ExpenseForm
```

### 4. Dashboard Stats Flow
```
GET /api/dashboard/stats
      │
      ├─ withAuth → userId
      │
      ├─ Aggregation 1: totalThisMonth
      │   $match { userId, date: { $gte: startOfMonth } }
      │   $group { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } }
      │
      ├─ Aggregation 2: categoryBreakdown
      │   $match { userId, date in current month }
      │   $group { _id: "$category", total: { $sum: "$amount" } }
      │
      ├─ Aggregation 3: monthlyTrend (last 6 months)
      │   $match { userId, date >= 6 months ago }
      │   $group { _id: { year: $year, month: $month }, total: { $sum: "$amount" } }
      │   $sort { "_id.year": 1, "_id.month": 1 }
      │
      └─ Budget alerts: join budgets + category totals → compute pct
             │
             ▼
      Single JSON response to dashboard page
      React renders StatsCards + PieChart + BarChart + AlertBanners
```

---

## Component Hierarchy

```
app/
├── layout.tsx                     ← <html>, fonts, global styles
│
├── (auth)/
│   ├── login/page.tsx
│   │   └── LoginForm              ← email + password + submit
│   └── register/page.tsx
│       └── RegisterForm           ← name + email + password + submit
│
└── (dashboard)/
    ├── layout.tsx                 ← AuthProvider, Sidebar, Navbar
    │   ├── AuthProvider           ← user context, login/logout helpers
    │   ├── Sidebar                ← nav links (Dashboard, Expenses, Budget)
    │   └── Navbar                 ← current user display, logout button
    │
    ├── page.tsx (Dashboard)
    │   ├── StatsCards             ← total this month, expense count
    │   ├── BudgetAlertBanner      ← colored alerts per category
    │   ├── CategoryPieChart       ← Recharts PieChart
    │   └── MonthlyTrendChart      ← Recharts BarChart
    │
    ├── expenses/page.tsx
    │   ├── ExpenseFilters         ← category dropdown, month/year picker
    │   ├── AIExtractModal         ← textarea → extracted form
    │   ├── ExpenseForm            ← add/edit expense
    │   └── ExpenseList            ← table rows with edit/delete
    │
    └── budget/page.tsx
        ├── BudgetForm             ← category + limit + month/year
        └── BudgetList             ← progress bars per category
```

---

## API Contract

### Authentication

```
POST /api/auth/register
Body:    { name: string, email: string, password: string }
Success: 201 { user: { _id, name, email } } + Set-Cookie
Errors:  400 { error: "Email already in use" }
         400 { error: "All fields required" }

POST /api/auth/login
Body:    { email: string, password: string }
Success: 200 { user: { _id, name, email } } + Set-Cookie
Errors:  401 { error: "Invalid credentials" }
         400 { error: "Email and password required" }

POST /api/auth/logout
Success: 200 { message: "Logged out" } + clears cookie
```

### Expenses

```
GET /api/expenses
Query:   ?category=Food&month=5&year=2026&page=1&limit=10
Auth:    Required (cookie)
Success: 200 { expenses: Expense[], total: number, page: number, totalPages: number }

POST /api/expenses
Auth:    Required
Body:    { amount: number, category: string, date: string, note?: string }
Success: 201 { expense: Expense }
Errors:  400 { error: "Amount must be positive" }
         400 { error: "Invalid category" }

PUT /api/expenses/[id]
Auth:    Required (must own expense)
Body:    Partial<{ amount, category, date, note }>
Success: 200 { expense: Expense }
Errors:  403 { error: "Forbidden" }
         404 { error: "Expense not found" }

DELETE /api/expenses/[id]
Auth:    Required (must own expense)
Success: 200 { message: "Deleted" }
Errors:  403 { error: "Forbidden" }

GET /api/expenses/export
Query:   ?month=5&year=2026  (omit for all-time)
Auth:    Required
Success: 200 text/csv with Content-Disposition: attachment
```

### AI

```
POST /api/ai/extract
Auth:    Required
Body:    { text: string }
Success: 200 { data: { amount: number, category: string, date: string, note: string } }
Errors:  422 { error: "AI extraction failed" }
         400 { error: "Text is required" }
```

### Budgets

```
GET /api/budgets
Query:   ?month=5&year=2026
Auth:    Required
Success: 200 { budgets: Budget[] }

POST /api/budgets
Auth:    Required
Body:    { category: string, monthlyLimit: number, month: number, year: number }
Success: 201 { budget: Budget }  (upserts on duplicate category+month+year)

PUT /api/budgets/[id]
Auth:    Required (must own budget)
Body:    { monthlyLimit: number }
Success: 200 { budget: Budget }

DELETE /api/budgets/[id]
Auth:    Required
Success: 200 { message: "Deleted" }
```

### Dashboard

```
GET /api/dashboard/stats
Auth:    Required
Success: 200 {
  totalThisMonth: number,
  expenseCount: number,
  categoryBreakdown: { category: string, total: number }[],
  monthlyTrend: { label: string, total: number }[],
  budgetAlerts: { category: string, spent: number, limit: number, pct: number }[]
}
```

---

## Database Schema

### Users Collection
```
{
  _id:          ObjectId  (PK)
  name:         String    (required)
  email:        String    (required, unique, indexed)
  passwordHash: String    (required, bcrypt hash)
  createdAt:    Date      (auto)
}
Indexes: { email: 1 } unique
```

### Expenses Collection
```
{
  _id:       ObjectId  (PK)
  userId:    ObjectId  (ref: User, required, indexed)
  amount:    Number    (required, min: 0.01)
  category:  String    (enum: CATEGORIES, required)
  date:      Date      (required, indexed)
  note:      String    (optional, maxlength: 200)
  createdAt: Date      (auto)
  updatedAt: Date      (auto)
}
Indexes: { userId: 1 }, { date: -1 }, { userId: 1, date: -1 }, { userId: 1, category: 1 }
```

### Budgets Collection
```
{
  _id:          ObjectId  (PK)
  userId:       ObjectId  (ref: User, required)
  category:     String    (enum: CATEGORIES, required)
  monthlyLimit: Number    (required, min: 1)
  month:        Number    (1–12, required)
  year:         Number    (required)
  createdAt:    Date      (auto)
}
Indexes: { userId: 1, category: 1, month: 1, year: 1 } unique compound
```

---

## Security Architecture

| Concern | Implementation |
|---|---|
| Password storage | bcryptjs, cost factor 12 |
| Token transport | httpOnly + Secure + SameSite=Strict cookie |
| Token expiry | 7 days, re-issued on login |
| API authorization | `withAuth` middleware on every protected route |
| Ownership checks | `expense.userId.equals(req.userId)` before update/delete |
| Secret management | Env vars only — no secrets in code |
| Input validation | Server-side on every POST/PUT before DB write |
| MongoDB injection | Mongoose typed schemas prevent raw query injection |

---

## Deployment Architecture

```
GitHub repo (public)
      │
      ▼ push to main
Vercel CI/CD pipeline
      ├─ npm install
      ├─ npm run build  (Next.js static + serverless)
      └─ Deploy to Vercel Edge Network
             │
             └─ Runtime env vars injected:
                MONGODB_URI → MongoDB Atlas (M0 free cluster)
                JWT_SECRET
                GEMINI_API_KEY
                NEXT_PUBLIC_APP_URL
```
