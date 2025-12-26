# Testing the Web Application

## Step 1: Start the Server

```bash
# Make sure you're in the project directory
cd C:\Users\alanb\Downloads\brahma_coordinor

# Install dependencies (if not done already)
npm install

# Start the server
node server.js
```

You should see:
```
✅ Server running at http://localhost:3000
```

## Step 2: Open the Web App

Open your browser and go to:
```
http://localhost:3000
```

You should see the **Login Page**.

## Step 3: Test Login

### Prerequisites:
Make sure you have an event in your `events` collection with:
- `event_id`: e.g., "BRAHMA26"
- `pass` or `event_pass`: e.g., "password123"
- `name` or `event_name`: e.g., "BRAHMA'26 Technical Fest"

### Login Test:
1. Enter your **Event ID** (from your events collection)
2. Enter your **Event Password** (from your events collection)
3. Click **Login**

**Expected Result:**
- ✅ If credentials are correct → Redirects to Dashboard
- ❌ If wrong → Shows error message

## Step 4: Test Dashboard

After successful login, you should see:
- **Event Name** displayed at the top
- **Stats Cards** showing:
  - Total Participants
  - Checked In count
  - Not Checked In count
- **Tabs** to switch between:
  - Checked In participants (with names and phone numbers)
  - Not Checked In participants (with names and phone numbers)

## Step 5: Test QR Scanner

1. Click **"Scan / Register"** button
2. Allow camera permissions
3. Scan a QR code (ticket_id from your tickets collection)

**Expected Results:**
- ✅ **Valid ticket for this event** → Shows "Welcome [Student Name]"
- ❌ **Ticket already used** → Shows "Ticket already used"
- ❌ **Wrong event** → Shows popup "You are in the wrong event!" with event name
- ❌ **Ticket doesn't exist** → Shows "Ticket does not exist"

## Step 6: Test Attendance List

1. Go back to Dashboard
2. Click **"Attendance"** button
3. Should show list of checked-in participants

## Common Issues & Solutions

### Issue: "Missing required environment variables"
**Solution:** 
- Check that `.env` file exists in project root
- Verify all required variables are set (APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID)

### Issue: "Project with the requested ID could not be found"
**Solution:**
- Verify `APPWRITE_PROJECT_ID` matches your Appwrite project ID
- Check `APPWRITE_ENDPOINT` matches your project region

### Issue: "missing scopes"
**Solution:**
- Create a new API key in Appwrite Console
- Enable these scopes: `databases.read`, `databases.write`, `tables.read`, `tables.write`, `rows.read`, `rows.write`

### Issue: "Collection not found"
**Solution:**
- Verify collection names in `.env` match your Appwrite collections
- Default names: `events`, `tickets`, `users`, `attendance`

### Issue: Dashboard shows "N/A" for phone numbers
**Solution:**
- Make sure `users` collection has `phone` or `phone_number` field
- Verify `stud_id` in tickets matches `stud_id` in users collection

## Test Data Setup

To test properly, make sure you have:

### 1. Events Collection
```json
{
  "event_id": "BRAHMA26",
  "name": "BRAHMA'26 Technical Fest",
  "pass": "password123",
  "active": true
}
```

### 2. Tickets Collection
```json
{
  "event_id": "BRAHMA26",
  "ticket_id": "TCKT001",
  "stud_id": "STUD001",
  "present": false
}
```

### 3. Users Collection
```json
{
  "stud_id": "STUD001",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

## API Endpoints to Test

You can also test endpoints directly:

### Test Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"event_id":"BRAHMA26","event_pass":"password123"}'
```

### Test Dashboard Stats
```bash
curl http://localhost:3000/dashboard/BRAHMA26
```

### Test Scan Ticket
```bash
curl -X POST http://localhost:3000/scan \
  -H "Content-Type: application/json" \
  -d '{"ticket_id":"TCKT001","event_id":"BRAHMA26"}'
```

