# Main Coordinator Configuration

## Current Default Credentials
⚠️ **IMPORTANT: Change these before deploying!**

- **Coordinator ID**: `mainadmin`
- **Password**: `admin123`

## To Change Credentials:

### Option 1: Hardcoded in Code (Current Setup)

1. Generate a password hash:
```bash
node generate-hash.js YourNewSecurePassword
```

2. Update `app/api/coordinator/main-login/route.ts`:
   - Change `MAIN_COORDINATOR_ID` default value to your desired ID
   - Replace the bcrypt hash in `MAIN_COORDINATOR_PASS` with your generated hash

### Option 2: Using Environment Variables (Recommended for Production)

Add to your `.env` or `.env.local` file:
```env
MAIN_COORDINATOR_ID=your_custom_id
MAIN_COORDINATOR_PASS=$2a$10$...your_hash...
```

The environment variables will override the hardcoded values.

## Access

- **Login URL**: `/coordinator/main-login`
- **Dashboard**: `/coordinator/overview` (redirects after login)

## Security Notes

- The password is stored as a bcrypt hash (not plain text)
- Sessions last 24 hours
- Separate authentication from event coordinators
- Read-only access to all events

---

**Need to generate a hash quickly?**
```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword', 10))"
```
