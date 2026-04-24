# ClinicFlow — Appointment Manager

A full-stack MERN application with real-time appointment updates via Socket.IO.

## Prerequisites

- Node.js v18+
- MongoDB running locally on port 27017

## Project Structure

```
clinicflows/
├── backend/      # Express + TypeScript + Socket.IO
├── frontend/     # React + TypeScript + Vite
└── README.md
```

---

## Setup & Run

### 1. Start MongoDB

Make sure MongoDB is running. On Windows with MongoDB installed as a service it starts automatically. To start it manually:

```
mongod
```

### 2. Backend

```bash
cd backend
npm install
npm run seed        # Creates admin + 2 doctor accounts in MongoDB
npm run dev         # Starts on http://localhost:5000
```

### 3. Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev         # Starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Demo Accounts (created by seed)

| Role   | Email                     | Password    |
|--------|---------------------------|-------------|
| Admin  | admin@clinic.com          | admin123    |
| Doctor | dr.smith@clinic.com       | doctor123   |
| Doctor | dr.jones@clinic.com       | doctor123   |

---

## Testing the Live Update (WebSocket Demo)

1. Open **two browser tabs** (or two different browsers).
2. **Tab 1** — log in as `admin@clinic.com` / `admin123`
3. **Tab 2** — log in as `dr.smith@clinic.com` / `doctor123`
4. In Tab 1 (Admin), fill in the booking form:
   - Patient Name: any name
   - Doctor: Dr. Smith
   - Date: today or a future date
   - Start Time: any time
   - Duration: any option
   - Click **Book Appointment**
5. **Tab 2 (Doctor dashboard) will update instantly** — the new card appears at the top highlighted in blue, without any page refresh.

---

## API Routes

### Auth
| Method | Path              | Auth | Description         |
|--------|-------------------|------|---------------------|
| POST   | /api/auth/login   | None | Login, returns JWT  |

### Appointments
| Method | Path                         | Role   | Description                        |
|--------|------------------------------|--------|------------------------------------|
| GET    | /api/appointments/doctors    | admin  | List all doctors (for dropdown)    |
| POST   | /api/appointments            | admin  | Create new appointment             |
| GET    | /api/appointments/my         | doctor | Get today's own appointments       |

### Request body — POST /api/appointments
```json
{
  "patientName": "John Doe",
  "doctorId": "<MongoDB ObjectId>",
  "date": "2024-06-15",
  "startTime": "09:30",
  "duration": 30
}
```

---

## Environment Variables

### backend/.env
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/clinicflow
JWT_SECRET=clinicflow_jwt_secret_2024
CLIENT_URL=http://localhost:5173
```

### frontend — uses Vite proxy
The frontend proxies `/api` to `http://localhost:5000` via `vite.config.ts`, so no `.env` file is needed for local development.

---

## Testing the API with curl

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.com","password":"admin123"}'

# Copy the token, then get doctors list
curl http://localhost:5000/api/appointments/doctors \
  -H "Authorization: Bearer <TOKEN>"

# Book an appointment
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"patientName":"Jane Doe","doctorId":"<DOCTOR_ID>","date":"2024-06-15","startTime":"10:00","duration":30}'
```
