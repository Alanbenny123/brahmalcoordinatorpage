🧱 Tech Stack

Next.js (App Router)

TypeScript

React

API Routes (Route Handlers)

Database: APPWRITE AND FIRBASE

Auth: Firebase Auth

Styling: Tailwind CSS
my-next-app/
├─ app/
│  ├─ api/
│  ├─ auth/
│  ├─ dashboard/
│  ├─ admin/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ loading.tsx
│  ├─ error.tsx
│  └─ not-found.tsx
│
├─ components/
│  ├─ ui/
│  ├─ layout/
│  ├─ forms/
│  └─ cards/
│
├─ lib/
│  ├─ db.ts
│  ├─ auth.ts
│  ├─ permissions.ts
│  └─ constants.ts
│
├─ services/
│  ├─ auth.service.ts
│  ├─ user.service.ts
│  ├─ event.service.ts
│  └─ payment.service.ts
│
├─ hooks/
│  ├─ useAuth.ts
│  ├─ useUser.ts
│  └─ useFetch.ts
│
├─ store/
│  ├─ auth.store.ts
│  └─ ui.store.ts
│
├─ types/
│  ├─ user.ts
│  ├─ event.ts
│  └─ api.ts
│
├─ utils/
│  ├─ formatter.ts
│  ├─ validator.ts
│  └─ logger.ts
│
├─ styles/
│  └─ globals.css
│
├─ public/
│  ├─ images/
│  └─ favicon.ico
│
├─ middleware.ts
├─ next.config.js
├─ tsconfig.json
├─ .env.local
└─ package.json


📦 Folder Explanation
app/

Main routing system (App Router)

Handles pages, layouts, loading & error boundaries

api/ contains backend route handlers

components/

Reusable UI components

Split into UI primitives, layouts, forms, and cards

lib/

Core utilities (DB, auth helpers, constants, permissions)

services/

Business logic layer

Keeps API routes clean and maintainable

hooks/

Custom React hooks for reusable logic

types/

Centralized TypeScript interfaces & types

utils/

Helper functions (formatting, validation, logging)

middleware.ts

Route protection

Role-based access control (admin/user)

🔐 Authentication & Authorization

Protect routes like /dashboard and /admin

Middleware enforces access control

Supports:

Role-based routing

Token/session validation

🌐 API Routes

Located in:

app/api/*

Example:

POST /api/auth

GET /api/users

POST /api/events

GET /api/payments

Business logic lives in services/, not inside routes.

🛠 Environment Variables

Create a .env.local file:

DATABASE_URL=
NEXT_PUBLIC_APP_URL=
AUTH_SECRET=

