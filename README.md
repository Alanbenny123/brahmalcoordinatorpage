# 🎓 Brahma Fest - Event Coordinator System

> A comprehensive event management system for ASIET's Brahma Fest, built with Node.js, Express, Appwrite, and Firebase.

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-Database-F02E65?logo=appwrite&logoColor=white)](https://appwrite.io/)
[![Firebase](https://img.shields.io/badge/Firebase-Storage-FFCA28?logo=firebase&logoColor=white)](https://firebase.google.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Usage Guide](#usage-guide)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The **Brahma Fest Event Coordinator System** is a full-stack web application designed to streamline event management for ASIET's annual fest. It enables coordinators to:

- ✅ Manage assigned events
- 📱 Scan QR codes for attendance verification
- 👥 Handle both individual and group event attendance
- 📊 Generate real-time attendance reports
- 🎓 Auto-generate certificates for attendees

---

## ✨ Features

### 🔐 Authentication
- Secure coordinator login with JWT
- Role-based access control
- Session management

### 📅 Event Management
- View assigned events
- Real-time event status updates
- Event details with photos and banners

### 📱 QR Code Scanner
- **Individual Events**: 
  - Scan QR → Display student name → Auto-mark attendance
- **Group Events**: 
  - Scan QR → Display team members with checkboxes
  - Coordinator selects attended members
  - Mark attendance only for selected participants

### 📊 Attendance Reports
- Real-time attendance tracking
- Filter by event, date, and status
- Export to CSV/Excel
- Visual analytics and charts

### 🎓 Certificate Generation
- Auto-generate certificates for attendees
- PDF format with custom templates
- Store in Firebase Storage
- Download and share functionality


## 🛠️ Tech Stack

### Frontend
- **React 18+** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **html5-qrcode** - QR code scanning
- **Tailwind CSS** - Styling
- **React Context API** - State management

### Backend
- **Node.js 18+** - Runtime
- **Express.js** - Web framework
- **Appwrite SDK** - Database operations
- **Firebase Admin SDK** - Storage management
- **jsonwebtoken** - Authentication
- **qrcode** - QR generation
- **pdfkit** - Certificate generation

### Database & Storage
- **Appwrite** - Primary database (6 collections)
- **Firebase Storage** - Images, certificates, QR codes

---

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Port 5173)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Node.js API    │
│   (Port 5000)   │
└────┬──────┬─────┘
     │      │
     ▼      ▼
┌─────────┐ ┌──────────────┐
│Appwrite │ │   Firebase   │
│Database │ │   Storage    │
└─────────┘ └──────────────┘
```

For detailed architecture diagrams and database schemas, see [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Appwrite account and project
- Firebase account and project
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/brahma-coordinator.git
   cd brahma-coordinator
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your Appwrite and Firebase credentials
   npm run dev
   ```

3. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API endpoint
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## 📁 Project Structure

```
brahma-coordinator/
├── backend/
│   ├── src/
│   │   ├── config/          # Appwrite & Firebase setup
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & error handling
│   │   ├── services/        # QR, certificates, storage
│   │   ├── utils/           # Helpers & validators
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Login/
│   │   │   ├── Dashboard/
│   │   │   ├── Events/
│   │   │   ├── Scanner/
│   │   │   └── Reports/
│   │   ├── services/        # API calls
│   │   ├── context/         # Global state
│   │   ├── hooks/           # Custom hooks
│   │   └── App.jsx
│   ├── package.json
│   └── .env
│
├── ARCHITECTURE.md          # Detailed architecture
└── README.md               # This file
```

---

## 📡 API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "coordinator@asiet.ac.in",
  "password": "password123"
}

Response: 200 OK
{
  "token": "jwt_token_here",
  "coordinator": { ... }
}
```

### Events

#### Get Assigned Events
```http
GET /api/events/assigned/:coordinatorId
Authorization: Bearer {token}

Response: 200 OK
{
  "events": [
    {
      "eventId": "evt_123",
      "eventName": "Code Sprint",
      "eventType": "individual",
      ...
    }
  ]
}
```

### Tickets

#### Validate QR Code
```http
POST /api/tickets/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "qrCode": "encrypted_qr_data"
}

Response: 200 OK
{
  "valid": true,
  "ticket": { ... },
  "user": { ... },
  "team": { ... } // Only for group events
}
```

### Attendance

#### Mark Individual Attendance
```http
POST /api/attendance/mark
Authorization: Bearer {token}
Content-Type: application/json

{
  "ticketId": "tkt_123",
  "userId": "usr_456",
  "eventId": "evt_789",
  "coordinatorId": "coord_012"
}

Response: 201 Created
{
  "message": "Attendance marked successfully",
  "attendance": { ... }
}
```

#### Mark Group Attendance
```http
POST /api/attendance/mark-group
Authorization: Bearer {token}
Content-Type: application/json

{
  "ticketId": "tkt_123",
  "eventId": "evt_789",
  "teamId": "team_456",
  "coordinatorId": "coord_012",
  "attendedMembers": ["usr_001", "usr_002", "usr_003"]
}

Response: 201 Created
{
  "message": "Group attendance marked successfully",
  "attendanceRecords": [ ... ]
}
```

#### Get Attendance Report
```http
GET /api/attendance/report/:eventId
Authorization: Bearer {token}

Response: 200 OK
{
  "eventId": "evt_789",
  "totalRegistered": 150,
  "totalAttended": 142,
  "attendees": [ ... ]
}
```

For complete API documentation, see [API.md](./docs/API.md)

---

## 🗄️ Database Schema

### Appwrite Collections

#### 1. coordinators
- `coordinatorId` (string, unique)
- `name` (string)
- `email` (string)
- `password` (string, hashed)
- `assignedEvents` (array of eventIds)
- `role` (coordinator | admin)

#### 2. events
- `eventId` (string, unique)
- `eventName` (string)
- `eventType` (individual | group)
- `date` (datetime)
- `venue` (string)
- `coordinatorId` (string)
- `certificateEnabled` (boolean)

#### 3. tickets
- `ticketId` (string, unique)
- `qrCode` (string, encrypted)
- `userId` (string)
- `eventId` (string)
- `teamId` (string, nullable)
- `status` (valid | used | invalid)

#### 4. attendance
- `attendanceId` (string, unique)
- `userId` (string)
- `eventId` (string)
- `markedBy` (coordinatorId)
- `markedAt` (datetime)
- `certificateUrl` (string, nullable)

#### 5. users
- `userId` (string, unique)
- `name` (string)
- `email` (string)
- `rollNumber` (string)
- `department` (string)

#### 6. teams
- `teamId` (string, unique)
- `teamName` (string)
- `eventId` (string)
- `leaderId` (userId)
- `members` (array of user objects)

For detailed schemas, see [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_STORAGE_BUCKET=your_bucket_name

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
```

---

## 📖 Usage Guide

### For Coordinators

#### 1. Login
1. Navigate to the login page
2. Enter your coordinator credentials
3. Click "Login"

#### 2. View Assigned Events
1. After login, you'll see the dashboard
2. Click "Assigned Events" to view your events
3. See event details, date, venue, and status

#### 3. Scan QR Codes

**For Individual Events:**
1. Click "QR Scanner"
2. Allow camera access
3. Scan student's QR code
4. Student name will be displayed
5. Attendance is marked automatically
6. Success message appears

**For Group Events:**
1. Click "QR Scanner"
2. Scan team's QR code
3. Team members list appears with checkboxes
4. Select members who attended
5. Click "Mark Attendance"
6. Only selected members get attendance + certificates

#### 4. View Attendance Reports
1. Click "Attendance Report"
2. Select event from dropdown
3. View attendance statistics
4. Export to CSV if needed

---

## 🎨 Screenshots

### Coordinator Dashboard
![Dashboard](./docs/screenshots/dashboard.png)

### QR Scanner - Individual Event
![QR Scanner Individual](./docs/screenshots/qr-individual.png)

### QR Scanner - Group Event
![QR Scanner Group](./docs/screenshots/qr-group.png)

### Attendance Report
![Attendance Report](./docs/screenshots/report.png)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Brahma Fest Tech Team - ASIET**

- Project Lead: [Your Name]
- Backend Developer: [Name]
- Frontend Developer: [Name]
- UI/UX Designer: [Name]

---

## 📞 Support

For support, email brahma.tech@asiet.ac.in or join our Slack channel.

--

## 🙏 Acknowledgments

- ASIET for organizing Brahma Fest
- Appwrite for the amazing database platform
- Firebase for reliable storage solutions
- All contributors and coordinators

--

**Made with ❤️ for Brahma Fest 2025**
