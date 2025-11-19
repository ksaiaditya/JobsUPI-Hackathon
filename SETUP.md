# Project Setup Guide

This document provides end-to-end setup instructions for the Jobs UPI monorepo (client + server), including environment variables, development workflows, and common troubleshooting tips.

## 1. Prerequisites
- Node.js: v18+ recommended (supports modern ESM / Web APIs). Check: `node -v`
- Git
- (Optional) MongoDB instance if using the provided server dependencies.
- PowerShell (Windows) or a POSIX shell (macOS/Linux).

## 2. Repository Structure (Recap)
```
jobs_upi/
  client/        # React + Vite front-end
  server/        # Express + Socket.IO + Mongoose (skeleton)
  docs/          # Architecture & approach docs
  setup.ps1      # Windows convenience script
  README.md      # High-level overview
  SETUP.md       # This setup guide
```

## 3. Quick Start (Windows)
Use the automated script:
```powershell
./setup.ps1
```
This will:
1. Install `client` dependencies (`npm install`).
2. Install `server` dependencies if `server/package.json` exists.
3. Generate `client/.env.example` if missing.

Then:
```powershell
cd client
npm run dev
```
Open http://localhost:5173.

## 4. Quick Start (macOS / Linux)
```bash
# Clone
git clone <repo-url> jobs_upi
cd jobs_upi

# Install client
cd client
npm install
npm run dev &

# In a new terminal start server (if implemented)
cd ../server
npm install
npm run dev
```
Client default dev port: 5173
Server (suggested): 5000

## 5. Environment Variables
### Client (`client/.env`)
| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_URL` | Base REST API URL | `http://localhost:5000/api` |

Create file:
```
# client/.env
VITE_API_URL=http://localhost:5000/api
```
Restart Vite after changes.

Optional future additions:
```
VITE_FEATURE_VOICE=true
VITE_ANALYTICS_WRITE_KEY=xyz123
```

### Server (`server/.env.example` → copy to `.env`)
| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (e.g. 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for auth tokens (future) |
| `CORS_ORIGINS` | Comma-separated allowed origins (client URL) |
| `SOCKET_PATH` | Custom Socket.IO path (optional) |
| `QR_SESSION_TTL_MIN` | Minutes before auto-expiring QR session (optional) |

Example:
```
# server/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobs_upi
JWT_SECRET=replace_me_with_a_long_random_string
CORS_ORIGINS=http://localhost:5173
SOCKET_PATH=/socket.io
QR_SESSION_TTL_MIN=60
```

## 6. Running the Server (Skeleton)
Implement `src/index.js` similar to:
```js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()
app.use(express.json())
app.use(cors({ origin: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean) }))

app.get('/api/health', (_, res) => res.json({ ok: true }))

const httpServer = createServer(app)
const io = new Server(httpServer, { path: process.env.SOCKET_PATH || '/socket.io', cors: { origin: '*' } })

io.on('connection', (socket) => {
  console.log('socket connected', socket.id)
})

httpServer.listen(process.env.PORT || 5000, () => console.log('Server listening'))
```

## 7. Development Workflow
- Client changes: Hot-reloaded via Vite.
- API requests: Centralized through `client/src/api/http.js` using `VITE_API_URL`.
- Status updates: Client attempts PATCH → PUT → batch fallback; ensure server supports at least one.
- QR flow: If server endpoints absent, localStorage fallback still enables demo mode.

## 8. QR Flow (Server Expectations)
Endpoints to implement for full functionality:
```
POST   /api/qr/sessions            # create session { employerId }
GET    /api/qr/sessions?active=true
PATCH  /api/qr/sessions/:id/stop
POST   /api/qr/register            # { code, name, phone, role, area }
```
Socket events (emit on create/stop/scan/register):
```
qr:session:created
qr:session:stopped
qr:scan
qr:registration
```

## 9. Common Issues
| Symptom | Cause | Fix |
|--------|-------|-----|
| 404 on API calls | Server not running or wrong `VITE_API_URL` | Start server / adjust client `.env` |
| Modal not visible | Portal z-index conflict | Ensure no global overlay blocking; inspect DOM | 
| QR link opens blank | Missing route | Confirm `/qr/register` present in `App.jsx` |

## 10. Recommended Enhancements
- Add toast system (success/error) for status & registration events.
- Introduce authentication (JWT) before enabling sensitive operations.
- Replace localStorage fallback with IndexedDB for larger offline datasets.

## 11. Scripts Reference
Client:
```
npm run dev
npm run build
npm run preview
npm run lint
```
Server:
```
npm run dev
npm start
```

## 12. Cleanup & Reset
To clear local demo data:
```js
localStorage.removeItem('qr_sessions_history')
localStorage.removeItem('qr_registrations')
localStorage.removeItem('qr_scans')
```
Or in DevTools Console.

## 13. Security Notes
- Never commit real secrets (`.env` kept out by `.gitignore`).
- Use strong `JWT_SECRET` and rotate periodically.
- Validate and sanitize all registration and voice-derived input server-side.

## 14. Next Steps After Setup
1. Implement server health & candidate endpoints.
2. Expand voice parsing to multi-language support.
3. Persist sessions to database and add analytics.

---
*For architectural rationale see `docs/APPROACH.md`.*
