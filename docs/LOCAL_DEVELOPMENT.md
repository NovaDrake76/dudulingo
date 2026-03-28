# Local Development Guide

This guide helps you set up Dudulingo for local development.

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- MongoDB (or Docker for containerized setup)
- Git

### Option 1: Docker Setup (Recommended)

**Fastest way to get started!**

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/dudulingo.git
cd dudulingo

# 2. Setup backend environment
cd backend
cp .env.example .env
# Edit .env and add your Google OAuth credentials

# 3. Start with Docker Compose
docker-compose up -d

# 4. Backend running at http://localhost:8000
# 5. MongoDB running at mongodb://admin:admin123@localhost:27017
```

### Option 2: Native Setup

#### 1. Install MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Windows:**
1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run installer
3. MongoDB Compass (GUI) included

**Linux (Ubuntu):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
# At minimum, set:
# - DATABASE_URL (MongoDB connection string)
# - JWT_SECRET (generate with command below)
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Run database migrations
npm run db:migrate

# Seed database (optional - creates sample data)
npm run db:seed

# Start development server
npm run dev
```

Backend will start on http://localhost:8000

#### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env
# Set EXPO_PUBLIC_API_URL=http://localhost:8000

# Start Expo development server
npx expo start
```

#### 4. Run the App

- **iOS Simulator**: Press `i` in the Expo terminal
- **Android Emulator**: Press `a` in the Expo terminal
- **Physical Device**: Scan QR code with Expo Go app

---

## Google OAuth Setup (Local Development)

### 1. Create OAuth Credentials

Follow the [Google OAuth Setup](DEPLOYMENT.md#google-oauth-setup) section in DEPLOYMENT.md, but use local redirect URIs:

**Authorized redirect URIs:**
```
http://localhost:8000/auth/google/callback
```

### 2. Add Credentials to .env

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 3. Test OAuth Flow

1. Start the backend: `npm run dev`
2. Start the frontend: `npx expo start`
3. Open the app in Expo Go
4. Tap "Continue with Google"
5. Sign in with your Google account

---

## Database Management

### View Data (MongoDB Compass)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to: `mongodb://localhost:27017` (or `mongodb://admin:admin123@localhost:27017` for Docker)
3. Database: `dudulingo`
4. Collections: `users`, `decks`, `cards`, `usercardprogresses`

### Seed Sample Data

```bash
cd backend
npm run db:seed
```

Creates:
- 1 sample user
- 3 sample decks (Fruits, Animals, Colors)
- 30+ sample cards with images

### Reset Database

**Warning**: This deletes all data!

```bash
# Connect to MongoDB
mongosh

# Drop database
use dudulingo
db.dropDatabase()

# Exit and re-seed
exit
npm run db:seed
```

---

## Development Workflow

### Backend Hot Reload

The backend uses `--watch` flag for automatic restart on file changes:

```bash
npm run dev
# Edit any file in /api
# Server automatically restarts
```

### Frontend Hot Reload

Expo supports fast refresh:

```bash
npx expo start
# Edit any .tsx file
# Changes appear instantly (no restart needed)
```

### Running Tests

**Backend:**
```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test cards.test.ts
```

**Frontend:**
```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test -- --coverage --watchAll=false

# Update snapshots
npm run test -- -u
```

### Linting & Formatting

**Backend:**
```bash
npm run lint         # Check for issues
npm run format       # Auto-fix formatting
```

**Frontend:**
```bash
npm run lint         # Check for issues
```

---

## Environment Variables Reference

### Backend (.env)

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for full reference.

**Required:**
```env
DATABASE_URL=mongodb://localhost:27017/dudulingo
JWT_SECRET=your_secret_min_32_chars
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
```

**Optional:**
```env
PORT=8000
BASE_URL=http://localhost
API_URL=http://localhost:8000
IS_DEV=true
NODE_ENV=development
LOG_LEVEL=http
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:8081
```

### Frontend (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

**For Android Emulator:**
If using Android emulator, use `http://10.0.2.2:8000` instead of `localhost:8000`.

---

## Debugging

### Backend Debugging (VS Code)

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/api/index.ts",
      "envFile": "${workspaceFolder}/backend/.env",
      "runtimeArgs": ["--import", "tsx/esm"],
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    }
  ]
}
```

Set breakpoints and press F5 to start debugging.

### Frontend Debugging

**React DevTools:**
```bash
npm install -g react-devtools
react-devtools
```

**Expo DevTools:**
- Press `m` in Expo terminal to open developer menu
- "Toggle Element Inspector" to inspect UI elements
- "Toggle Performance Monitor" to see FPS

### Network Debugging

**Backend:**
- Logs show in terminal (HTTP requests, errors)
- Log level controlled by `LOG_LEVEL` env var

**Frontend:**
- Use Reactotron: `npm install reactotron-react-native`
- Or console.log() - visible in Expo terminal

---

## Common Issues

### "Cannot connect to backend"

**Solution:**
1. Check backend is running: `curl http://localhost:8000/health`
2. Check firewall isn't blocking port 8000
3. On Android emulator, use `10.0.2.2:8000` instead of `localhost:8000`

### "MongoDB connection failed"

**Solution:**
1. Verify MongoDB is running: `mongosh` (should connect)
2. Check DATABASE_URL in .env
3. For Docker: Use `mongodb://admin:admin123@localhost:27017/dudulingo?authSource=admin`

### "Google OAuth redirect failed"

**Solution:**
1. Verify redirect URI in Google Console matches exactly: `http://localhost:8000/auth/google/callback`
2. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
3. Clear browser cookies and try again

### "Port 8000 already in use"

**Solution:**
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### "npm ERR! peer dependencies"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Tips

### Speed Up Backend Restart

Use `tsx` instead of `ts-node`:
```bash
npm run dev  # Already configured to use tsx
```

### Speed Up Frontend Reload

Enable Fast Refresh in `app.json`:
```json
{
  "expo": {
    "fastRefresh": true
  }
}
```

### Reduce Build Time

**Backend:**
- Use `--watch` flag (already enabled in `npm run dev`)
- Keep `node_modules` directory

**Frontend:**
- Use Expo Go app instead of building APK each time
- Clear Metro bundler cache if issues: `npx expo start -c`

---

## Database Schema

### Collections

1. **users**
   - `_id`: ObjectId
   - `providerId`: String (Google ID)
   - `name`: String
   - `photoUrl`: String
   - `selectedLanguage`: String

2. **decks**
   - `_id`: ObjectId
   - `ownerId`: ObjectId (ref: users)
   - `name`: String
   - `description`: String
   - `cards`: Array of ObjectId (ref: cards)

3. **cards**
   - `_id`: ObjectId
   - `deckId`: ObjectId (ref: decks)
   - `type`: String (enum)
   - `prompt`: String
   - `answer`: String
   - `imageUrl`: String
   - `audioUrl`: String

4. **usercardprogresses**
   - `_id`: ObjectId
   - `userId`: ObjectId (ref: users)
   - `cardId`: ObjectId (ref: cards)
   - `deckId`: ObjectId (ref: decks)
   - `repetitions`: Number
   - `easeFactor`: Number
   - `interval`: Number
   - `nextReviewAt`: Date

---

## Useful Commands

```bash
# Backend
npm run dev              # Start development server
npm test                 # Run tests
npm run lint             # Lint code
npm run build            # Build for production
npm run db:seed          # Seed database

# Frontend
npx expo start           # Start Expo dev server
npx expo start -c        # Clear cache and start
npm test                 # Run tests
npm run lint             # Lint code

# Docker
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
docker-compose restart   # Restart services
```

---

## Next Steps

- [Deployment Guide](DEPLOYMENT.md) - Deploy to production
- [Environment Variables](ENVIRONMENT_VARIABLES.md) - Full env var reference
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [API Documentation](API.md) - REST API reference (if exists)

---

## Support

Need help?
- Check [Troubleshooting](#common-issues) section
- Open an issue on GitHub
- Ask in discussions
