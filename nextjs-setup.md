# Next.js + TypeScript Setup for Mobile Coordinator App

## Project Structure

```
brahma_coordinor/
├── server.js              # Express backend (existing)
├── appwrite.js            # Appwrite helpers (existing)
├── public/                # Static files (existing)
│
├── coordinator-app/       # NEW: Next.js mobile app
│   ├── app/
│   │   ├── (coord)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── events/
│   │   │   │   └── page.tsx
│   │   │   └── scan/
│   │   │       └── page.tsx
│   │   ├── api/           # Optional: Next.js API routes
│   │   └── layout.tsx
│   ├── lib/
│   │   └── api.ts         # API client for Express backend
│   ├── types/
│   │   └── index.ts       # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
└── package.json           # Root (Express server)
```

## Setup Steps

### Option 1: Separate Next.js App (Recommended)

1. **Create Next.js app:**
   ```bash
   npx create-next-app@latest coordinator-app --typescript --tailwind --app
   cd coordinator-app
   ```

2. **Install dependencies:**
   ```bash
   npm install html5-qrcode
   ```

3. **Configure API base URL:**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

### Option 2: Monorepo (Same folder)

Keep Express backend and add Next.js in same repo.

## Architecture

- **Express Backend** (`server.js`) → Runs on port 3000
- **Next.js Frontend** → Runs on port 3001 (dev) or 3000 (production)
- **Mobile Coordinator App** → Calls Express API endpoints

## API Client (TypeScript)

```typescript
// coordinator-app/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function coordinatorLogin(eventId: string, eventPass: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: eventId, event_pass: eventPass })
  });
  return res.json();
}

export async function getAssignedEvents(coordinatorName: string) {
  const res = await fetch(`${API_URL}/coord/events?coordinator_name=${coordinatorName}`);
  return res.json();
}
```

## Next Steps

Would you like me to:
1. Create the full Next.js app structure?
2. Set up TypeScript types?
3. Build the mobile UI components (login, events list, scanner)?
4. Configure it to work with your Express backend?

