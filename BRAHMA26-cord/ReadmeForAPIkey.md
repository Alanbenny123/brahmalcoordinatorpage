# BRAHMA'26 Event Management Project – API Keys & Database Details

This document lists all the API keys, credentials, and Firebase database structure used in the project.

---

## Firebase Service Account Key

The Firebase **Service Account Key** is stored in:

serviceAccountKey.json

pgsql
Copy code

This file is required for **server-side access** to Firebase using the Firebase Admin SDK.

### Required Fields

```json
{
  "type": "service_account",
  "project_id": "<YOUR_PROJECT_ID>",
  "private_key_id": "<YOUR_PRIVATE_KEY_ID>",
  "private_key": "<YOUR_PRIVATE_KEY>",
  "client_email": "<YOUR_CLIENT_EMAIL>",
  "client_id": "<YOUR_CLIENT_ID>",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "<YOUR_CLIENT_CERT_URL>"
}
```

# Firestore Database Structure
## events Collection
Used for Event Coordinator Login

Collection Name: events
Document ID: Auto-generated
```
{
  "event_id": "BRAHMA26",
  "event_name": "BRAHMA'26 Technical Fest",
  "event_pass": "password123"
}
```
Used in API
POST /login

## tickets Collection
Used for QR Ticket Validation & Attendance Tracking

Collection Name: tickets
Document ID: Auto-generated
```
{
  "ticket_id": "TCKT001",
  "event_id": "BRAHMA26",
  "student_name": "Arjun S",
  "usage": false
}
```
### Field Description
ticket_id → QR code value
event_id → Associated event
student_name → Participant name
usage :
    false → Ticket not scanned
    true → Attendance marked

# API Usage Mapping
##  Login
```
db.collection("events")
  .where("event_id", "==", event_id)
```
## Dashboard Count
```
db.collection("tickets")
  .where("event_id", "==", event_id)
```
## QR Scan & Attendance
```
db.collection("tickets")
  .where("ticket_id", "==", ticket_id)
  .where("event_id", "==", event_id)
```
## Update Ticket Status
```
ticketDoc.ref.update({ usage: true });
```

## Attendance Report
```
db.collection("tickets")
  .where("event_id", "==", event_id)
  .where("usage", "==", true)
```
## Dashboard Table
```
db.collection("tickets")
  .where("event_id", "==", event_id)
```