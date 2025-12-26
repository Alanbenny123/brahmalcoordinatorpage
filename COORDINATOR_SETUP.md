# Coordinator Login & Mobile Setup Guide

## Overview

Coordinators login using **`event_id` + `event_pass`** from the `events` table (no email auth). After login, they can see their assigned events and scan tickets.

## Database Structure

### `events` Table (Appwrite)
- `event_id` (string, required) - Used for login
- `event_pass` (string, required) - Password for login
- `coordinator[]` (string array) - Contains coordinator names assigned to this event
- `event_name`, `venue`, `date`, `time`, `status`, etc.

### `event_coordinators` Table (Appwrite)
- `event_id` (string, required) - Links to events table
- `name` (string, required) - Coordinator name
- `role` (string, required) - "Coordinator 1" or "Coordinator 2"
- `phone`, `email` (optional)

## API Endpoints

### 1. Coordinator Login
```http
POST /login
Content-Type: application/json

{
  "event_id": "BRAHMA26",
  "event_pass": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "event_id": "BRAHMA26",
  "event_name": "BRAHMA'26 Technical Fest",
  "coordinators": [
    {
      "name": "Richard George",
      "role": "Coordinator 1",
      "phone": "..."
    },
    {
      "name": "Amal A A",
      "role": "Coordinator 2"
    }
  ],
  "session_token": "uuid-here",
  "event_data": {
    "venue": "CCF Lab, ASIET",
    "date": "2025-02-05",
    "time": "12 PM",
    "status": "live"
  }
}
```

### 2. Get Assigned Events for Coordinator
```http
GET /coord/events?coordinator_name=Richard George
```

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "$id": "...",
      "event_id": "BRAHMA26",
      "event_name": "BRAHMA'26 Technical Fest",
      "venue": "CCF Lab, ASIET",
      "date": "2025-02-05",
      "time": "12 PM",
      "status": "live",
      "poster": "https://..."
    }
  ]
}
```

## Mobile Login Flow

1. **Login Page:**
   - Input: `event_id` and `event_pass`
   - POST to `/login`
   - Store `session_token` and `coordinators` in localStorage

2. **Assigned Events Page:**
   - Get coordinator name from login response
   - GET `/coord/events?coordinator_name=...`
   - Display events with status (All/Live/Upcoming/Completed)
   - Each card has "Open Scanner" button

3. **Scanner:**
   - Uses existing `/scan` endpoint
   - Requires `event_id` from selected event

## Status Calculation

Events status is determined by:
- `completed = true` → **"completed"**
- `date > today` → **"upcoming"**
- `date <= today` → **"live"**

## Setup Steps

1. **Install uuid package:**
   ```bash
   npm install uuid
   ```

2. **Add to .env:**
   ```env
   APPWRITE_COLLECTION_COORDINATORS=event_coordinators
   ```

3. **Populate `event_coordinators` table:**
   - For each event, add 2 rows (Coordinator 1 and Coordinator 2)
   - Link by `event_id`

4. **Populate `events.coordinator[]` array:**
   - Add coordinator names to the `coordinator[]` array field
   - Example: `["Richard George", "Amal A A"]`

## Mobile UI (Next.js/React)

### Login Component
```tsx
// Mobile login with event_id + event_pass
const handleLogin = async () => {
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id, event_pass })
  });
  const data = await res.json();
  if (data.success) {
    localStorage.setItem('session_token', data.session_token);
    localStorage.setItem('coordinators', JSON.stringify(data.coordinators));
    localStorage.setItem('event_id', data.event_id);
    // Navigate to events page
  }
};
```

### Assigned Events Component
```tsx
// Fetch events for logged-in coordinator
useEffect(() => {
  const coord = JSON.parse(localStorage.getItem('coordinators') || '[]')[0];
  fetch(`/coord/events?coordinator_name=${coord.name}`)
    .then(res => res.json())
    .then(data => setEvents(data.events));
}, []);
```

## Notes

- **No Firebase Auth** - Using event_id + event_pass from events table
- **Session Token** - UUID generated on login (can be enhanced with JWT later)
- **Coordinator Lookup** - Searches `events.coordinator[]` array to find assigned events
- **Mobile-First** - UI designed for mobile coordinators

