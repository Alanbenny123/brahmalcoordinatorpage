🧠 BRAHMA – Campus Event & Learning Platform

A full-stack campus platform for discovering events, managing registrations, handling payments, tracking attendance, and generating certificates — with role-based dashboards for Users, Coordinators, and Admins.

📌 Tech Stack
Frontend

Next.js 14+ (App Router)

TypeScript

Tailwind CSS

Server Components + Client Components

QR Code rendering (Tickets)

Backend

Appwrite ( Database )
Firebase(Auth, Storage)

Node.js (Express) – Custom API layer

Payment Gateway (Cashfree)


🗂️ Project Structure

frontend/
├── app/                          # App Router (Next.js 13+)
│   ├── (public)/                 # Publicly accessible pages
│   │   ├── page.tsx              # Home page
│   │   ├── events/
│   │   │   ├── page.tsx          # Events listing
│   │   │   └── [eventId]/
│   │   │       └── page.tsx      # Event details
│   │   └── about/
│   │       └── page.tsx          # About BRAHMA
│
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   │   └── page.tsx          # Login form + OAuth
│   │   ├── register/
│   │   │   └── page.tsx          # User registration
│   │   └── callback/
│   │       └── page.tsx          # OAuth redirect handler
│
│   ├── (authenticated)/          # Protected routes (middleware)
│   │   ├── layout.tsx            # Authenticated layout
│   │   ├── dashboard/
│   │   │   └── page.tsx          # User dashboard
│   │   │
│   │   ├── my-events/
│   │   │   └── page.tsx          # Registered events
│   │   │
│   │   ├── tickets/
│   │   │   └── page.tsx          # Tickets + QR codes
│   │   │
│   │   ├── certificates/
│   │   │   └── page.tsx          # Certificates download
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx          # Profile & settings
│   │   │
│   │   ├── coordinator/          # Coordinator panel
│   │   │   └── page.tsx          # QR scanning & attendance
│   │   │
│   │   └── admin/                # Admin panel
│   │       └── page.tsx          # Event & user management
│
│   ├── api/                      # Next.js route handlers (optional)
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts      # OAuth callback logic
│
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # Reusable UI components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── OAuthButton.tsx
│   │   └── ProtectedRoute.tsx
│
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventList.tsx
│   │   ├── EventDetails.tsx
│   │   └── RegisterButton.tsx
│
│   ├── tickets/
│   │   ├── TicketCard.tsx
│   │   ├── QRCodeView.tsx
│   │   └── TicketDownload.tsx
│
│   ├── certificates/
│   │   ├── CertificateCard.tsx
│   │   └── CertificateDownload.tsx
│
│   ├── chatbot/
│   │   ├── ChatWidget.tsx
│   │   └── ChatMessage.tsx
│
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│
│   └── common/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       ├── Loader.tsx
│       └── EmptyState.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Auth state & role
│   ├── useEvents.ts              # Fetch events
│   ├── useTickets.ts             # User tickets
│   ├── useCertificates.ts        # Certificate status
│   └── useChatbot.ts             # Chatbot logic
│
├── lib/                          # Utilities & configs
│   ├── appwrite.ts               # Appwrite client setup
│   ├── api.ts                    # Axios / fetch wrapper
│   ├── auth.ts                   # Token helpers
│   └── validators.ts             # Client-side validation
│
├── context/                      # React contexts
│   ├── AuthContext.tsx
│   └── UIContext.tsx
│
├── styles/
│   ├── globals.css
│   └── theme.css
│
├── public/
│   ├── images/
│   ├── icons/
│   └── certificates/
│
├── .env.local                    # Environment variables
├── next.config.js
├── package.json
└── tsconfig.json

