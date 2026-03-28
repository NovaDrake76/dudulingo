# Environment Variables Reference

Complete reference for all environment variables used in Dudulingo.

## Backend Environment Variables

### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `DATABASE_URL` | String | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dudulingo` |
| `JWT_SECRET` | String | Secret key for JWT tokens (min 32 chars) | `a1b2c3d4e5f6...` (64 chars) |
| `GOOGLE_CLIENT_ID` | String | Google OAuth Client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | String | Google OAuth Client Secret | `GOCSPX-abc123def456` |

### Optional Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | Number | `8000` | Server port |
| `BASE_URL` | String | `http://localhost` | Base URL for redirects |
| `API_URL` | String | `http://localhost:8000` | Full API URL |
| `IS_DEV` | Boolean | `true` | Development mode flag |
| `NODE_ENV` | String | `development` | Node environment (`development`, `production`, `test`) |
| `LOG_LEVEL` | String | `http` | Logging level (`error`, `warn`, `info`, `http`, `debug`) |
| `ALLOWED_ORIGINS` | String | `*` (dev only) | Comma-separated CORS allowed origins |
| `SENTRY_DSN` | String | - | Sentry error tracking DSN (optional) |

---

## Frontend Environment Variables

All frontend environment variables must be prefixed with `EXPO_PUBLIC_` to be exposed to the client.

### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | String | Backend API base URL | `http://localhost:8000` |

### Optional Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `EXPO_PUBLIC_SENTRY_DSN` | String | - | Sentry error tracking DSN |

---

## Variable Details

### DATABASE_URL

**Format**: MongoDB connection string

**Examples:**

**Local development:**
```
mongodb://localhost:27017/dudulingo
```

**Docker:**
```
mongodb://admin:admin123@mongodb:27017/dudulingo?authSource=admin
```

**MongoDB Atlas:**
```
mongodb+srv://username:password@cluster.mongodb.net/dudulingo?retryWrites=true&w=majority
```

**Important**:
- Must include database name (`/dudulingo`)
- For Atlas, include `retryWrites=true&w=majority`
- For Docker, include `authSource=admin` if using auth
- Replace `username` and `password` with actual credentials

---

### JWT_SECRET

**Format**: Random string, minimum 32 characters

**Generate:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

**Example output:**
```
7f9b3c2a1d8e5f4c6b9a0d3e7f1a4c8b2d5e9f0a3c6b8d1e4f7a9c2b5d8e1f4a7b
```

**Security**:
- Use a different secret for each environment (dev, staging, prod)
- Never commit secrets to version control
- Rotate periodically (every 6-12 months)
- Store securely (environment variables, secrets manager)

---

### GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET

**Obtain from**: [Google Cloud Console](https://console.cloud.google.com/)

**Setup:**
1. Create a project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - Development: `http://localhost:8000/auth/google/callback`
   - Production: `https://your-domain.com/auth/google/callback`

**Format:**
- Client ID: `123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com`
- Client Secret: `GOCSPX-abcdefghijklmnopqrstuvwx`

**Security**:
- Client ID is public (can be in frontend code)
- Client Secret is private (backend only, never expose)

---

### ALLOWED_ORIGINS

**Format**: Comma-separated list of allowed origins for CORS

**Development:**
```
http://localhost:19000,http://localhost:8081,exp://localhost:8081
```

**Production:**
```
https://app.dudulingo.com,exp://your-app-host
```

**Important**:
- No trailing slashes
- Include protocol (`http://` or `https://`)
- For Expo development, include `exp://` origin
- Separate multiple origins with commas (no spaces)
- If empty in production, all origins will be blocked

---

### LOG_LEVEL

**Options**: `error` | `warn` | `info` | `http` | `debug`

**Recommended by environment:**
- **Development**: `http` (shows all HTTP requests)
- **Production**: `info` (shows important info, warnings, errors)
- **Debugging**: `debug` (shows everything)

**Log levels explained:**
- `error`: Only errors
- `warn`: Warnings and errors
- `info`: General info, warnings, and errors
- `http`: HTTP requests + all above
- `debug`: Everything (verbose)

---

### NODE_ENV

**Options**: `development` | `production` | `test`

**Effects:**
- Production: Optimized builds, error handling, logging
- Development: Hot reload, verbose logging, dev tools
- Test: Special configuration for testing

**Set automatically by:**
- Render: Sets to `production`
- Vitest: Sets to `test`
- Local development: Defaults to `development`

---

### IS_DEV

**Type**: Boolean (`true` or `false`)

**Purpose**: Additional dev mode flag used for:
- Disabling rate limiting in development
- Showing detailed error messages
- Enabling CORS for all origins (if ALLOWED_ORIGINS not set)

**Set to:**
- `true`: Local development, Docker Compose
- `false`: Production environments

**Note**: Different from `NODE_ENV` - allows dev-like behavior in production-like environments.

---

### SENTRY_DSN

**Format**: Sentry Data Source Name

**Example:**
```
https://abc123def456@o123456.ingest.sentry.io/789012
```

**Obtain from:**
1. Create account at [sentry.io](https://sentry.io)
2. Create project (Node.js for backend, React Native for frontend)
3. Copy DSN from project settings

**Optional**: Leave empty to disable error tracking

**Free tier**: 5,000 errors/month

---

## Environment File Templates

### Backend `.env.example`

See `backend/.env.example` for the complete template with all variables.

### Frontend `.env.example`

See `frontend/.env.example` for the complete template.

---

## Security Best Practices

### 1. Never Commit Secrets

**Add to `.gitignore`:**
```gitignore
.env
.env.local
.env.*.local
```

**Verify not tracked:**
```bash
git ls-files .env
# Should return nothing
```

### 2. Use Different Secrets Per Environment

| Environment | DATABASE_URL | JWT_SECRET | Other |
|-------------|--------------|------------|-------|
| Development | Local MongoDB | Dev secret | Dev OAuth |
| Staging | Staging DB | Staging secret | Staging OAuth |
| Production | Production DB | Production secret | Production OAuth |

### 3. Rotate Secrets Regularly

- Rotate JWT_SECRET every 6-12 months
- Rotate database passwords annually
- Regenerate OAuth credentials if compromised

### 4. Secret Length Requirements

- `JWT_SECRET`: Minimum 32 characters (recommended: 64)
- Database passwords: Minimum 16 characters
- OAuth secrets: Generated by provider

### 5. Validate on Startup

The backend automatically validates:
- All required variables are present
- JWT_SECRET is at least 32 characters
- ALLOWED_ORIGINS is set in production

**See**: `backend/api/config/env.ts`

---

## Troubleshooting

### "Missing required environment variables"

**Error:** Environment validation fails on startup

**Solution:**
1. Check all required variables are in `.env`
2. Verify variable names (case-sensitive)
3. Ensure no typos in `.env`
4. Restart server after changing `.env`

### "JWT_SECRET must be at least 32 characters"

**Error:** JWT secret too short

**Solution:**
```bash
# Generate a proper secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output to .env
```

### "ALLOWED_ORIGINS must be set in production"

**Error:** Production mode requires CORS origins

**Solution:**
Add to production environment variables:
```
ALLOWED_ORIGINS=https://your-frontend-url.com
```

### "Cannot connect to DATABASE_URL"

**Error:** MongoDB connection failed

**Solution:**
1. Check MongoDB is running: `mongosh <YOUR_DATABASE_URL>`
2. Verify credentials are correct
3. Check network access (for Atlas: whitelist IP)
4. Verify database name is in connection string

---

## Quick Reference

### Generate Secrets

```bash
# JWT Secret (64 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Random password (32 chars)
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

### Example Production .env

```env
# Backend Production .env
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/dudulingo?retryWrites=true&w=majority
JWT_SECRET=7f9b3c2a1d8e5f4c6b9a0d3e7f1a4c8b2d5e9f0a3c6b8d1e4f7a9c2b5d8e1f4a7b
GOOGLE_CLIENT_ID=123456789012-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
PORT=8000
NODE_ENV=production
IS_DEV=false
LOG_LEVEL=info
ALLOWED_ORIGINS=https://app.dudulingo.com
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Example Development .env

```env
# Backend Development .env
DATABASE_URL=mongodb://localhost:27017/dudulingo
JWT_SECRET=local_dev_secret_minimum_32_characters_long
GOOGLE_CLIENT_ID=123456789012-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
PORT=8000
NODE_ENV=development
IS_DEV=true
LOG_LEVEL=http
```

---

## References

- [MongoDB Connection String](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Sentry Documentation](https://docs.sentry.io/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
