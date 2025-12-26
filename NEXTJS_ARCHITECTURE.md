# Next.js + TypeScript Architecture

## Current Setup

- **Backend:** Node.js/Express (`server.js`) on port 3000
- **Frontend:** Plain HTML in `public/` folder
- **Mobile Coordinator App:** Need to create Next.js + TypeScript

## Recommended Structure

### Option A: Separate Next.js App (Best for Development)

```
brahma_coordinor/
├── server.js              # Express API (port 3000)
├── coordinator-app/       # Next.js mobile app (port 3001)
│   └── [Next.js files]
```

**Pros:**
- Clean separation
- Easy to deploy separately
- Can develop frontend/backend independently

### Option B: Monorepo (Same Folder)

```
brahma_coordinor/
├── server.js              # Express API
├── app/                    # Next.js app directory
├── public/                 # Static files
└── package.json            # Combined dependencies
```

**Pros:**
- Single repo
- Shared types
- Easier deployment

## Which Do You Prefer?

I recommend **Option A** (separate app) for now. We can:
1. Create `coordinator-app/` folder
2. Set up Next.js + TypeScript
3. Build mobile UI components
4. Connect to your Express backend

Tell me which option you prefer, and I'll set it up!

