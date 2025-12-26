# Environment Configuration

## Required .env File Setup

Create a `.env` file in the root directory with the following variables:

```env
# ============================================
# REQUIRED - Appwrite Configuration
# ============================================
# Get these from your Appwrite Console:
# 1. Project Settings -> Project ID
# 2. API Keys -> Create API Key (with databases.read, databases.write, tables.read, tables.write, rows.read, rows.write permissions)
# 3. Databases -> Your Database -> Database ID

APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
# OR if your project is in Singapore region:
# APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1

APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here
APPWRITE_DATABASE_ID=brahma26

# ============================================
# OPTIONAL - Collection Names
# (Only change if your collection names are different)
# ============================================
APPWRITE_COLLECTION_EVENTS=events
APPWRITE_COLLECTION_TICKETS=tickets
APPWRITE_COLLECTION_USERS=users
APPWRITE_COLLECTION_ATTENDANCE=attendance
APPWRITE_COLLECTION_COORDINATORS=event_coordinators

# ============================================
# OPTIONAL - Server Configuration
# ============================================
NODE_ENV=development
PORT=3000
```

## Quick Setup Steps

1. **Create `.env` file** in the project root:
   ```bash
   # Windows PowerShell
   New-Item .env
   
   # Or manually create a file named .env
   ```

2. **Copy the template above** and fill in your Appwrite credentials

3. **Get your Appwrite credentials:**
   - **APPWRITE_PROJECT_ID**: Appwrite Console → Settings → Project ID
   - **APPWRITE_API_KEY**: Appwrite Console → API Keys → Create API Key
     - Required scopes: `databases.read`, `databases.write`, `tables.read`, `tables.write`, `rows.read`, `rows.write`
   - **APPWRITE_DATABASE_ID**: Appwrite Console → Databases → Your Database → Settings → Database ID
   - **APPWRITE_ENDPOINT**: 
     - Default: `https://cloud.appwrite.io/v1`
     - Singapore: `https://sgp.cloud.appwrite.io/v1`
     - Check your project region in Appwrite Console

4. **Save the `.env` file** and restart the server

## Database Collections

Based on your Appwrite database schema:

1. **events** - Event information
   - Fields: `event_id`, `name`, `pass`, `active`, `stud_id[]`, etc.

2. **tickets** - Ticket/QR code information
   - Fields: `event_id`, `ticket_id`, `stud_id`, `present` (boolean)

3. **users** - User/Student information
   - Fields: `stud_id`, `name`, `email`, `phone`, etc.

4. **attendance** - Attendance records (if used separately)

5. **event_coordinators** - Coordinator information (if exists)

## Important Notes

- The code now uses `present` (boolean) instead of `usage` for ticket status
- Student names and phone numbers are fetched from the `users` collection using `stud_id`
- Make sure your `users` collection has `stud_id` as a field to match with tickets

