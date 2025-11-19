# Jobs UPI – Hiring Platform

A React + Vite client with a lightweight Node-ready server folder (API not fully shown here) providing rapid hiring workflows: real-time candidate feeds, voice-based search, status management, role templates, and QR spot walk‑in registration (online + offline fallback).

## Features
- Voice Hiring: Speech or typed natural language → candidate filters (role, area, education).
- Daily Feed: Nearby, active today, and recent applicants with location search + fallbacks.
- Role Templates: Predefined salary bands, work hours, requirements rendered cleanly.
- Candidate Status Updates: Floating modal with PATCH → PUT → fallback API strategy.
- QR Spot Hiring: Start/stop walk‑in sessions; generate QR linking to registration form; offline/localStorage fallback when API unreachable; live event stream (session, scan, registration).
- Offline Resilience: LocalStorage mirrors sessions & registrations; storage events simulate real‑time updates if sockets unavailable.

## Monorepo Layout
```
jobs_upi/
  client/            # React + Vite front-end
    src/
      pages/         # Feature pages (Home, Feed, VoiceHire, Candidates, QRSpot, QRRegister, etc.)
      components/    # Reusable UI (NavBar, StatusModal, CandidateCard)
      api/           # API base + http request helper
      hooks/         # useApi abstraction
  server/            # Placeholder (package.json present). Implement REST & Socket.IO endpoints here.
  .gitignore
  README.md
  setup.ps1          # First-time setup automation (Windows PowerShell)
  docs/APPROACH.md   # One-page architecture & design explanation
```

## Quick Start
### 1. Clone & Enter
```powershell
git clone <repo-url> jobs_upi
cd jobs_upi
```
### 2. Run Setup Script (Windows)
```powershell
./setup.ps1
```
This installs dependencies in `client` and `server`, creates a sample `.env.example`, and reminds you about environment variables.

### 3. Manual (Alternative)
```powershell
cd client
npm install
npm run dev
```
Open http://localhost:5173 (default Vite port). If you implement the server, start it separately (e.g. at http://localhost:5000).

## Environment Variables
Client expects (optional):
- `VITE_API_URL` – Base URL for API (defaults to `http://localhost:5000/api`).
Example:
```
# client/.env
VITE_API_URL=http://localhost:5000/api
```
Restart dev server after changes.

## API Endpoints (Expected)
(Not all are shown in this repo; implement them in `server/`):
- `GET /feed` (query: area/location) – Provides nearby, activeToday, recentApplicants.
- `GET /roles/templates` – Returns role template metadata.
- `GET /candidates/search` – Query candidates by area, role, education.
- `PATCH /candidates/:id/status` – Update candidate status (fallback to PUT or batch endpoint).
- `POST /qr/sessions` / `GET /qr/sessions?active=true` / `PATCH /qr/sessions/:id/stop`
- `POST /qr/register` – Handle walk‑in registration.
- WebSocket events (optional): `qr:session:created`, `qr:session:stopped`, `qr:scan`, `qr:registration`.

## Offline / Fallback Logic
If API or sockets fail:
- Sessions & registrations stored in `localStorage` (`qr_sessions_history`, `qr_registrations`, `qr_scans`).
- Storage events propagate to `QRSpot` for real-time UI without backend.
- Candidate status updates attempt PATCH → PUT → batch fallback.

## Scripts (Client)
- `npm run dev` – Start Vite dev server.
- `npm run build` – Production build.
- `npm run preview` – Preview built client.
- `npm run lint` – ESLint checks.

## Adding Server Functionality
Implement an Express/Fastify/Node server that:
1. Serves REST endpoints above.
2. Emits Socket.IO events for QR interactions.
3. Persists sessions & registrations in a DB (e.g., PostgreSQL, MongoDB).

## Testing Suggestions
- Unit test parsing logic (voice → filters) and status update fallbacks.
- Integration test QR registration offline → online transition.
- Snapshot test for StatusModal rendering.

## Development Conventions
- UI components are headless with Tailwind-esque utility classes.
- Fallback-first approach for robustness (try primary → fallback chain).
- Word-break & overflow defenses applied to prevent layout spill.

## Next Improvements
- Toast notifications (success/error) after status updates & registration.
- Geolocation “Use current location” button on feeds.
- Role template editor & persistence.
- Server integration + authentication layer.

See `docs/APPROACH.md` for architectural reasoning and design trade-offs.
