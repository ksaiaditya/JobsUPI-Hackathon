# Jobs UPI – Architecture & Approach (One Page)

## 1. Goals & Principles
Provide a fast hiring command center with resilience against partial backend outages. Priorities: speed of interaction, graceful degradation, minimal friction for walk‑in (QR) registrations, and clear candidate status management.

Guiding principles:
- Progressive enhancement: Full API + Socket.IO if available; seamless localStorage fallback if not.
- User feedback clarity: Structured event display replaces raw JSON dumps.
- Defensive UI: Word-break, overflow control, portal modals with high z-index.
- API flexibility: Multi–strategy updates (PATCH → PUT → batch fallback) for status changes.

## 2. High-Level Architecture
```
client (React + Vite)
  pages/      Feature screens (Feed, VoiceHire, Candidates, QRSpot, QRRegister, etc.)
  components/ Reusable UI (NavBar, StatusModal, CandidateCard, VoiceSearchBar)
  api/        API base + request helper (resilient fetch wrapper)
  hooks/      useApi for loading & error state management
server (placeholder)
  REST endpoints & Socket.IO events (to be implemented)
fallback layer
  localStorage (sessions, scans, registrations) + storage events
```

## 3. Data Flow Examples
- Voice search: SpeechRecognition → parse → query `/candidates/search` → render grid.
- Status update: User selects candidate → portal modal → submit → attempt PATCH; fallback PUT; fallback batch endpoint.
- QR Session: Start session → server (or local fallback) returns code → generate QR (client origin) → candidate scans → registration form → post API OR localStorage → storage event triggers live event update.

## 4. Offline / Degradation Strategy
If network or backend fails:
- QRSpot falls back to localStorage for sessions and events.
- Registration writes to localStorage and fires `storage` events; UI simulates real‑time without sockets.
- Status updates escalate through allowed endpoints—first success ends chain.

Benefits: Demo & testing uninterrupted; partial systems still function; avoids blank screens.

## 5. Key Components & Decisions
- `StatusModal`: Portal ensures overlay visibility; simplified escape/backdrop semantics.
- `useApi`: Centralizes fetch, loading, and error; callers remain lean.
- `QRSpot` + `QRRegister`: Demonstrate hybrid live system (Socket.IO + storage sync).
- `CandidateCard`: Encapsulated action triggers (call, update) with consistent styling & overflow safety.

## 6. Styling & UX
Utility-first classes (Tailwind-like) + semantic wrappers (`ui-card`). Overflow prevention (`break-words`, `min-w-0`). Event feed redesign: iconography, color-coded badges, minimal cognitive load.

## 7. Security & Privacy Considerations (Future)
- Sanitize voice input & registration fields server-side.
- Rate-limit session creation & status updates.
- Auth layer + role-based access controls for employer actions.
- Transport security (HTTPS) & secure WebSocket.

## 8. Extensibility Roadmap
| Feature | Next Step |
|---------|-----------|
| Templates | Editable & versioned in DB |
| QR Flow | Server persistence + analytics (conversion, peak times) |
| Voice Hire | Multi-language NLU + synonyms library |
| Status Updates | Audit trail & bulk operations |
| Feed | Real-time push via sockets & geolocation auto-fill |

## 9. Trade-offs
- LocalStorage fallback simplifies demo but not multi-device consistency; acceptable for resilience prototype.
- No global state library: React hooks adequate; complexity low.
- Minimal error granularity in UI to avoid clutter; can be expanded with toast system.

## 10. Testing Strategy (Planned)
- Unit: voice parsing, status fallback logic.
- Integration: QR registration offline → online transition.
- UI: snapshot critical components (StatusModal, event feed entries).

## 11. Deployment Notes (Future)
- Client: Vite build → static hosting (Netlify/Vercel/S3+CloudFront).
- Server: Node (Express/Fastify) behind reverse proxy; enable CORS for client origin.
- WebSocket scaling: Use a message broker or sticky sessions if needed.

## 12. Summary
Jobs UPI focuses on a resilient, user-friendly hiring workflow: clear feeds, voice search convenience, structured candidate updates, and QR-based walk-in flow—all designed with progressive enhancement and graceful fallback to keep the system operational under partial failures.
