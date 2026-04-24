# SOLUTION_NOTES.md

## Data Model

**User** (`users` collection)
- `name`, `email` (unique), `password` (bcrypt-hashed), `role` (`'admin' | 'doctor'`)
- Role is embedded in the document and replicated in the JWT payload so every request can gate on role without an extra DB lookup.

**Appointment** (`appointments` collection)
- `patientName`, `doctorId` (ObjectId ref → User), `date` (ISO string `YYYY-MM-DD`), `startTime` (`HH:MM`), `duration` (15 | 30 | 45 | 60)
- The doctor relationship is a foreign key (`doctorId`) pointing at the User collection. This keeps appointments lightweight while still allowing population if a full doctor object is needed.

## Real-Time Approach

When a doctor's socket connects, the server authenticates the JWT from `socket.handshake.auth.token` and joins the socket into a named room: `doctor:<userId>`. When the admin creates an appointment, the server does:

```ts
io.to(`doctor:${doctorId}`).emit('appointment:new', payload);
```

This targets only the room for the booked doctor — no other doctor receives the event. The frontend `useSocket` hook listens for `appointment:new` and prepends the card to the schedule if the date matches today.

## Trade-offs

- **No refresh-token / session invalidation** — JWTs are stateless 8-hour tokens. A production system would need a token blacklist or refresh flow.
- **No pagination** — the doctor's `GET /appointments/my` returns all of today's appointments at once. Fine for a daily schedule list.
- **Plain CSS-in-JS objects** — skipped Tailwind/CSS modules to reduce setup time. The styling is functional but not polished.
- **No appointment edit/delete** — out of scope per the brief; CRUD is read + create only.
- **No test suite** — omitted under time pressure; would add Vitest + Supertest in production.

## If I Had More Time

- Add refresh tokens and logout-on-other-devices support.
- Show a toast notification when a new appointment arrives (not just a highlighted card).
- Add an appointment list view on the admin side to see all bookings.
- Add conflict detection — warn if a doctor already has an overlapping appointment.
- Write unit tests for Zod schemas and integration tests for the API routes.
- Add WebSocket reconnection UI feedback (offline banner).
