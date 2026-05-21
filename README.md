# ExpenseAI — AI-Powered Expense Tracker

A full-stack expense management app with AI-assisted data entry, interactive dashboards, budget alerts, and CSV export. Built with Next.js 14 App Router, MongoDB, and the Gemini API.

**Live:** https://ai-powered-expense-tracker-theta.vercel.app/

---

## Features

- **Auth** — JWT-based register / login / logout with httpOnly cookie sessions
- **Expense CRUD** — create, edit, delete expenses with category, date, and note
- **AI Auto-Fill** — paste any receipt, SMS, or bank message and Gemini extracts the expense fields automatically
- **Dashboard** — monthly spend total, category pie chart, 6-month bar trend, budget alert banners
- **Budget Management** — set per-category monthly limits, track spending progress with visual bars
- **CSV Export** — download filtered or full expense history as a properly escaped CSV
- **Filters** — filter expenses by category, month, and year simultaneously
- **Toast notifications** — success / error / info toasts with auto-dismiss and manual close
- **Responsive** — table layout on desktop, card layout on mobile (375 px tested)
- **Accessible** — focus trap in modals, focus return on close, aria-required, aria-live, WCAG AA contrast

---

## Tech Stack

| Layer     | Technology                                        |
| --------- | ------------------------------------------------- |
| Framework | Next.js 14 (App Router)                           |
| Language  | TypeScript 5 (strict mode)                        |
| Styling   | Tailwind CSS 3                                    |
| Database  | MongoDB Atlas via Mongoose 9                      |
| Auth      | JWT (jsonwebtoken) + bcryptjs                     |
| AI        | Google Gemini API (`@google/generative-ai`)       |
| Charts    | Recharts 3                                        |
| Testing   | Jest 30 + Testing Library + mongodb-memory-server |

---

## Local Setup

### Prerequisites

- Node.js 18 or later
- A free [MongoDB Atlas] cluster (or local MongoDB)
- A free [Google AI Studio](https://aistudio.google.com) API key

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/priypatel/AI-Powered-Expense-Tracker.git
cd ai-powered-expense-tracker

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Open .env.local and fill in all four values (see section below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — register an account and start tracking.

### Other Scripts

```bash
npm run build        # Production build
npm run start        # Start production server
npm run type-check   # TypeScript type check (no emit)
npm run lint         # ESLint
npm test             # Jest unit + integration tests
npm run test:watch   # Jest in watch mode
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in each value:

```env
# .env.example

MONGODB_URI=              # MongoDB Atlas connection string
                          # mongodb+srv://<user>:<pass>@<cluster>/<dbname>?retryWrites=true&w=majority

JWT_SECRET=               # Min 64-char random string
                          # Generate one: openssl rand -base64 48

GEMINI_API_KEY=           # Google AI Studio API key
                          # Get a free key at: aistudio.google.com

NEXT_PUBLIC_APP_URL=      # Your deployed URL (https://your-app.vercel.app)
                          # Use http://localhost:3000 for local development
```

| Variable              | Required | Description                                                                |
| --------------------- | -------- | -------------------------------------------------------------------------- |
| `MONGODB_URI`         | Yes      | Atlas connection string — database is created automatically on first write |
| `JWT_SECRET`          | Yes      | Signs auth tokens — must be kept secret and at least 64 characters         |
| `GEMINI_API_KEY`      | Yes      | Powers AI Auto-Fill — the free tier is sufficient for personal use         |
| `NEXT_PUBLIC_APP_URL` | Yes      | Used for CORS and absolute URL generation                                  |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login and register pages
│   ├── (dashboard)/         # Protected pages — dashboard, expenses, budget
│   └── api/                 # Route handlers
│       ├── auth/            # register, login, logout, me
│       ├── expenses/        # CRUD + /export (CSV)
│       ├── budgets/         # CRUD
│       ├── ai/extract/      # Gemini extraction endpoint
│       └── dashboard/stats/ # Aggregated stats
├── components/
│   ├── auth/                # LoginForm, RegisterForm
│   ├── budget/              # BudgetForm, BudgetList
│   ├── dashboard/           # StatsCards, CategoryPieChart, MonthlyTrendChart, BudgetAlertBanner
│   ├── expenses/            # ExpenseForm, ExpenseList, ExpenseFilters, AIExtractModal
│   ├── layout/              # AuthProvider, ToastProvider, DashboardShell, Navbar, Sidebar
│   └── ui/                  # Button, Input, Modal, Badge, Skeleton, Spinner, Toast
├── hooks/                   # useExpenses, useBudgets, useDashboard, useToast
├── lib/                     # mongodb, auth (JWT), withAuth, validators, csv, gemini
├── models/                  # Mongoose models — User, Expense, Budget
└── types/                   # Shared TypeScript types
```

---
