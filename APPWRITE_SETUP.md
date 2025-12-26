# Appwrite Setup Guide

## Step 1: Create Appwrite Project

1. Go to [Appwrite Cloud](https://cloud.appwrite.io/) or your self-hosted Appwrite instance
2. Create a new project (e.g., "Brahma Fest")
3. Note down your **Project ID**

## Step 2: Create API Key

1. In your Appwrite project, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it "Server Key" or similar
4. Set permissions to include:
   - `databases.read`
   - `databases.write`
5. Copy the generated **API Key**

## Step 3: Create Database

1. Go to **Databases** in the Appwrite console
2. Click **Create Database**
3. Name it "brahma_fest_db" (or your preferred name)
4. Note down the **Database ID**

## Step 4: Create Collections

### Collection 1: events

1. Click **Create Collection**
2. Name: `events`
3. Add the following attributes:
   - `event_id` (String, 255, Required, Unique)
   - `event_name` (String, 255, Required)
   - `event_pass` (String, 255, Required)
4. Go to **Indexes** and create an index on `event_id`
5. Go to **Settings** → **Permissions** and set:
   - Read: Any
   - Create/Update/Delete: API Key (your server key)

### Collection 2: tickets

1. Click **Create Collection**
2. Name: `tickets`
3. Add the following attributes:
   - `ticket_id` (String, 255, Required, Unique)
   - `event_id` (String, 255, Required)
   - `student_name` (String, 255, Required)
   - `usage` (Boolean, Required, Default: false)
4. Go to **Indexes** and create indexes on:
   - `ticket_id`
   - `event_id`
5. Go to **Settings** → **Permissions** and set:
   - Read: Any
   - Create/Update/Delete: API Key (your server key)

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Appwrite credentials:
   ```env
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your_project_id_here
   APPWRITE_API_KEY=your_api_key_here
   APPWRITE_DATABASE_ID=your_database_id_here
   APPWRITE_COLLECTION_EVENTS=events
   APPWRITE_COLLECTION_TICKETS=tickets
   ```

## Step 6: Add Test Data (Optional)

You can add test data directly in the Appwrite console:

### Test Event:
```json
{
  "event_id": "TEST001",
  "event_name": "Test Event",
  "event_pass": "test123"
}
```

### Test Ticket:
```json
{
  "ticket_id": "TKT001",
  "event_id": "TEST001",
  "student_name": "John Doe",
  "usage": false
}
```

## Step 7: Run the Server

```bash
node server.js
```

The server should start at `http://localhost:3000`

## Testing the API

### Test Login:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"event_id":"TEST001","event_pass":"test123"}'
```

Expected response:
```json
{"success":true,"event_name":"Test Event"}
```

### Test Count:
```bash
curl http://localhost:3000/count/TEST001
```

Expected response:
```json
{"count":1}
```

### Test Scan:
```bash
curl -X POST http://localhost:3000/scan \
  -H "Content-Type: application/json" \
  -d '{"ticket_id":"TKT001","event_id":"TEST001"}'
```

Expected response:
```json
{"success":true,"message":"Attendance marked","student_name":"John Doe"}
```

## Troubleshooting

- **"Project not found"**: Check your `APPWRITE_PROJECT_ID`
- **"Collection not found"**: Verify collection names match exactly
- **"Invalid API key"**: Regenerate API key with correct permissions
- **"Document not found"**: Ensure test data is added to collections
