# Brahma Coordinator App

Event coordinator dashboard for managing event registrations, attendance tracking, and winner declarations.

## Features
### 🎟️ Ticket Scanning
- Manual ticket ID entry
- QR code scanning via device camera
- Real-time ticket validation
- Attendance marking for team members
- Support for both team and individual registrations

### 👥 Participant Management
- View all registered participants
- Team-based organization with expandable groups
- Check-in status tracking
- Participant details (name, email, phone, college)
- Real-time attendance statistics

### 🏆 Winner Declaration
- Select winners for 1st, 2nd, and 3rd place
- Choose from registered teams
- Live winner preview before saving
- Automatic winner data submission

### ⚙️ Event Settings
- Update venue location
- Modify event date and time
- Configure event slot
- Real-time preview of current settings

### 📊 Dashboard Statistics
- Total registrations count
- Total participants count
- Checked-in participants
- Pending check-ins
- Event status (Active/Completed)

## Tech Stack

- **Framework:** Next.js 16.1.0 (React 19.2.3)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Backend:** Appwrite (Authentication & Database)
- **Firebase:** Additional backend services
- **QR Scanning:** html5-qrcode
- **Icons:** Lucide React
- **Validation:** Zod

## Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Setup

Create appropriate environment files with your Appwrite and Firebase credentials:

- Appwrite project configuration
- Firebase project configuration
- API endpoints

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── coordinator/
│   │   │   ├── dashboard/      # Dashboard stats & event info
│   │   │   ├── login/          # Coordinator authentication
│   │   │   ├── logout/         # Session cleanup
│   │   │   ├── participants/   # Fetch participant list
│   │   │   ├── update-event/   # Update event settings
│   │   │   └── winners/        # Save winner declarations
│   │   └── tickets/
│   │       ├── scan/           # Ticket validation
│   │       ├── mark-attendance/# Mark participant present
│   │       └── close-ticket/   # Close ticket after event
│   ├── coordinator/
│   │   ├── login/              # Login page
│   │   └── page.tsx            # Main dashboard
│   └── layout.tsx
├── lib/
│   ├── appwrite/
│   │   ├── backend.ts          # Server-side Appwrite client
│   │   └── client.ts           # Client-side Appwrite client
│   ├── validations/
│   │   └── schemas.ts          # Zod validation schemas
│   ├── firebase.ts             # Firebase configuration
│   ├── hash.ts                 # Password hashing utilities
│   ├── types.ts                # TypeScript type definitions
│   └── utils.ts                # Utility functions
└── package.json
```

## API Endpoints

### Coordinator Routes
- `GET /api/coordinator/dashboard` - Get event stats and info
- `POST /api/coordinator/login` - Authenticate coordinator
- `POST /api/coordinator/logout` - Clear session
- `GET /api/coordinator/participants` - Get all participants
- `POST /api/coordinator/update-event` - Update event details
- `POST /api/coordinator/winners` - Save winners

### Ticket Routes
- `POST /api/tickets/scan` - Validate ticket and get member list
- `POST /api/tickets/mark-attendance` - Mark participant as present
- `POST /api/tickets/close-ticket` - Close ticket after event

## Usage

1. **Login:** Coordinators log in with their credentials
2. **Dashboard:** View event statistics and participant counts
3. **Scanner Tab:** Scan QR codes or enter ticket IDs manually
4. **Participants Tab:** Browse all registered participants by team
5. **Winners Tab:** Select and save winner declarations
6. **Settings Tab:** Update event venue, date, time, and slot

## Camera Permissions

The QR scanner requires camera access. Ensure your browser has camera permissions enabled. Supports both front and rear cameras.

## Development

```bash
# Run linter
pnpm lint

# Type check
npx tsc --noEmit
```

## License
Private project for Brahma event management.
