# 🔧 Fix: Wrong Appwrite Endpoint

## The Error
```
Project is not accessible in this region. Please make sure you are using the correct endpoint
```

## The Problem
Your `APPWRITE_ENDPOINT` in `.env` doesn't match your Appwrite project's region.

## The Solution

### Step 1: Find Your Correct Endpoint

**If using Appwrite Cloud:**
1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Select your project
3. Go to **Settings** → **General**
4. Look for **"API Endpoint"** or **"Region"**
5. Common endpoints:
   - **US East**: `https://cloud.appwrite.io/v1`
   - **EU West**: `https://eu.cloud.appwrite.io/v1`
   - **Asia Pacific**: `https://ap.cloud.appwrite.io/v1`

**If using Self-Hosted Appwrite:**
- Use your self-hosted URL: `https://your-appwrite-instance.com/v1`

### Step 2: Update .env File

Open `.env` and update the endpoint:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
```

Or if you're in a different region:
```env
APPWRITE_ENDPOINT=https://eu.cloud.appwrite.io/v1
```

### Step 3: Restart Server

```bash
npm start
```

### Step 4: Test Again

Try logging in with:
- Event ID: `TEST001`
- Password: `test123`

## How to Find Your Endpoint in Appwrite Console

1. **Appwrite Cloud**: 
   - Settings → General → Look for "API Endpoint" or check the region
   - If you see "US", use: `https://cloud.appwrite.io/v1`
   - If you see "EU", use: `https://eu.cloud.appwrite.io/v1`
   - If you see "AP", use: `https://ap.cloud.appwrite.io/v1`

2. **Self-Hosted**:
   - Use your server URL + `/v1`
   - Example: `https://appwrite.yourdomain.com/v1`

## Common Endpoints

- **US East (Default)**: `https://cloud.appwrite.io/v1`
- **EU West**: `https://eu.cloud.appwrite.io/v1`
- **Asia Pacific**: `https://ap.cloud.appwrite.io/v1`
- **Self-Hosted**: `https://your-server.com/v1`

