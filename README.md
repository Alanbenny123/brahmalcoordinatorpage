🧱 Tech Stack

    Next.js (App Router)

    TypeScript

    React

    API Routes (Route Handlers)

    Database: APPWRITE AND FIRBASE

    Auth: Firebase Auth

    Styling: Tailwind CSS
```
/src
 ├── app
 │    ├── (public)                    → Routes accessible without login
 │    │     ├── page.tsx              → Home Page
 │    │     ├── about/page.tsx
 │    │     ├── events
 │    │     │     ├── page.tsx        → Event Listing
 │    │     │     └── [eventId]/page.tsx → Event Details
 │    │     ├── auth
 │    │     │     ├── login/page.tsx
 │    │     │     └── register/page.tsx
 │    │     └── verify/page.tsx        → Public ticket verification
 │
 │    ├── (protected)                 → Requires authentication
 │    │     ├── layout.tsx            → Auth guard wrapper
 │    │     ├── dashboard
 │    │     │      ├── page.tsx       → User dashboard
 │    │     │      ├── tickets.tsx    → User tickets
 │    │     │      └── certificates.tsx → Certificates
 │    │     ├── events/register/[eventId]
 │    │     │      ├── single.tsx
 │    │     │      └── group.tsx
 │    │     └── admin
 │    │            ├── page.tsx       → Admin panel
 │    │            └── attendance/[eventId]/page.tsx
 │
 │    ├── api                         → Backend (server-only)
 │    │     ├── events
 │    │     │     ├── list/route.ts
 │    │     │     
 │    │     ├── tickets
 │    │     │     ├── generate/route.ts
 │    │     │     ├── scan/route.ts
 │    │     │     ├── mark-attendance/route.ts
 |    |     |     ├── close-ticket/route.ts
 │    │     │     └── list/route.ts
 │    │     └── certificates/generate/route.ts
 │
 ├── lib
 │     ├── appwrite
 │     │     ├── client.ts            → Browser Appwrite client
 │     │     └── server.ts            → Server-side Appwrite client
 │     ├── tickets.ts
 │     ├── certificates.ts
 │     └── validation.ts
 │
 ├── components
 │     ├── EventCard.tsx
 │     ├── TicketCard.tsx
 │     └── CertificateViewer.tsx
 │
 ├── utils
 │     ├── qr.ts
 │     ├── ticketId.ts
 │     └── format.ts
 │
 ├── types
 │     └── index.ts
 │
 └── middleware.ts                    → Route protection



TICKET ARCHITECTURE

Event Created
   ↓
User Registers (Single / Group)
   ↓
Ticket Generated (active = true)
   ↓
QR Scanned by Coordinator
   ↓
Attendance Marked (per user)
   ↓
Event Marked Completed
   ↓
All Tickets Deactivated
   ↓
Certificates Generated




🔌 Backend API Reference
    1️⃣ Generate Ticket

    POST /api/tickets/generate

    {
    "event_id": "EVT101",
    "stud_ids": ["USER_1", "USER_2"]
    "team_name": "team name"
    }

    Response

    {
    "ok": true,
    "ticket_id": "TICKET_ABC",
    "event_id": "EVT101"
    }


    2️⃣ Scan Ticket (QR)

    POST /api/tickets/scan

    {
    "ticket_id": "TICKET_ABC",
    "event_id": "EVT101"
    }


    Response

    {
    "ok": true,
    "ticket_active": true,
    "members": [
        { "stud_id": "USER_1", "present": true },
        { "stud_id": "USER_2", "present": false }
    ]
    }


    3️⃣ Mark Attendance

    POST /api/tickets/mark-attendance

    {
    "ticket_id": "TICKET_ABC",
    "stud_id": "USER_1",
    "event_id": "EVT101"
    }


    Response

    {
    "ok": true,
    "message": "Attendance marked successfully"
    }


    4️⃣ Complete Event (Close All Tickets)

    POST /api/tickets/close-ticket

    {
    "event_id": "EVT101"
    }


    Response

    {
    "ok": true,
    "tickets_closed": 120
    }


    5️⃣ Save Winners

    POST /api/coordinator/winners

    {
    "event_id": "event_appwrite_document_id",
    "winners": [
        { "position": 1, "name": "Team Alpha" },
        { "position": 2, "name": "Team Beta" },
        { "position": 3, "name": "Team Gamma" }
    ]
    }


    Response

    {
    "ok": true,
    "message": "Winners saved successfully",
    "event_id": "event_appwrite_document_id",
    "winners": [
        { "position": 1, "name": "Team Alpha" },
        { "position": 2, "name": "Team Beta" },
        { "position": 3, "name": "Team Gamma" }
    ]
    }


    6️⃣ Get Winners

    GET /api/coordinator/winners
    Headers: { "x-event-id": "event_appwrite_document_id" }


    Response

    {
    "ok": true,
    "winners": [
        { "position": 1, "name": "Team Alpha" },
        { "position": 2, "name": "Team Beta" },
        { "position": 3, "name": "Team Gamma" }
    ]
    }