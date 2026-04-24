# ClinicFlow — Complete Setup Guide (From Zero to Running)

This guide assumes you have **nothing installed** except a browser and your code on GitHub.  
Follow every step in order. Do not skip anything.

---

## PART 1 — Install Required Software

### Step 1 — Install Node.js

1. Open your browser and go to: **https://nodejs.org**
2. Download the **LTS version** (the green button on the left)
3. Run the installer → click Next → Next → Install → Finish
4. **Verify it worked:** Open a new terminal (Command Prompt or PowerShell) and type:
   ```
   node --version
   ```
   You should see something like: `v20.x.x`
   ```
   npm --version
   ```
   You should see something like: `10.x.x`

---

### Step 2 — Install MongoDB Community Server

1. Go to: **https://www.mongodb.com/try/download/community**
2. Select:
   - Version: **7.0 (current)**
   - Platform: **Windows**
   - Package: **msi**
3. Click **Download**
4. Run the `.msi` installer:
   - Click Next
   - Accept the license agreement
   - Choose **Complete** (not Custom)
   - On the "Service Configuration" screen:
     - Leave **"Install MongoDB as a Service"** checked ✅
     - Leave everything else as default
   - **Uncheck** "Install MongoDB Compass" (we'll do it separately)
   - Click Next → Install → Finish

5. **Verify MongoDB is running:** Open Command Prompt and type:
   ```
   sc query MongoDB
   ```
   You should see `STATE: 4 RUNNING`

   > **If it says STOPPED**, start it with:
   > ```
   > net start MongoDB
   > ```

---

### Step 3 — Install MongoDB Compass (GUI to see your data)

1. Go to: **https://www.mongodb.com/try/download/compass**
2. Download and install it (just click Next through the installer)
3. Open Compass
4. In the connection box, type exactly:
   ```
   mongodb://localhost:27017
   ```
5. Click **Save & Connect**
6. You will see a list of databases on the left side — this is where your data lives

---

### Step 4 — Install Git (if not already installed)

1. Go to: **https://git-scm.com/download/win**
2. Download and run the installer (click Next through everything, defaults are fine)
3. **Verify:**
   ```
   git --version
   ```
   Should show: `git version 2.x.x`

---

## PART 2 — Get the Code from GitHub

### Step 5 — Clone your repository

Open **Command Prompt** or **PowerShell** and run:

```bash
cd C:\Users\YourName
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

> Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repo name.

After cloning, your folder structure should look like this:
```
clinicflows/
├── backend/
├── frontend/
├── README.md
├── SOLUTION_NOTES.md
└── SETUP_GUIDE.md
```

---

## PART 3 — Set Up the Backend

### Step 6 — Create the backend environment file

The backend needs a `.env` file to know your database address and secret key.  
This file is **not on GitHub** (it's in `.gitignore` for security). You must create it manually.

1. Open the `backend` folder
2. Create a new file called `.env` (exactly that name, with the dot)
3. Paste this inside it:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/clinicflow
JWT_SECRET=clinicflow_jwt_secret_2024
CLIENT_URL=http://localhost:5173
```

> **How to create the file:**
> - Open Notepad
> - Paste the 4 lines above
> - File → Save As → navigate to the `backend` folder
> - In the "File name" box type: `.env`
> - In "Save as type" select: **All Files**
> - Click Save

---

### Step 7 — Install backend dependencies

Open a terminal, navigate to the backend folder and run:

```bash
cd C:\Users\YourName\clinicflows\backend
npm install
```

This downloads all the packages listed in `package.json`.  
Wait for it to finish (you will see a progress bar). It takes 1–2 minutes.

---

### Step 8 — Seed the database (create admin + doctor accounts)

This command creates the initial user accounts in MongoDB:

```bash
npm run seed
```

You should see:
```
Seeded: admin@clinic.com / admin123
Seeded: dr.smith@clinic.com / doctor123
Seeded: dr.jones@clinic.com / doctor123
```

> **What this does:** It connects to your local MongoDB, clears the `users` collection, and inserts 1 admin and 2 doctor accounts. You only need to run this once. If you run it again it will reset the users (appointments are kept).

---

### Step 9 — Start the backend server

```bash
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

> **Keep this terminal open.** The backend must stay running while you use the app.  
> If you close this terminal, the backend stops.

---

## PART 4 — Set Up the Frontend

### Step 10 — Open a second terminal

Do NOT close the first terminal (backend is running there).  
Open a new terminal window.

---

### Step 11 — Install frontend dependencies

```bash
cd C:\Users\YourName\clinicflows\frontend
npm install
```

Wait for it to finish.

---

### Step 12 — Start the frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## PART 5 — Use the App

### Step 13 — Open the app in browser

Go to: **http://localhost:5173**

You will see the ClinicFlow login page.

---

### Step 14 — Login accounts

| Who        | Email                   | Password   | Goes to          |
|------------|-------------------------|------------|------------------|
| Admin      | admin@clinic.com        | admin123   | Booking form     |
| Doctor 1   | dr.smith@clinic.com     | doctor123  | Doctor dashboard |
| Doctor 2   | dr.jones@clinic.com     | doctor123  | Doctor dashboard |

---

### Step 15 — Test the live update (WebSocket demo)

1. Open **two browser tabs** (or two different browser windows)
2. **Tab 1** → go to `http://localhost:5173` → log in as **admin@clinic.com**
3. **Tab 2** → go to `http://localhost:5173` → log in as **dr.smith@clinic.com**
4. In **Tab 1 (Admin)**:
   - Click "Book Appointment"
   - Patient Name: any name
   - Doctor: Dr. Smith
   - Date: today or any future date
   - Start Time: any time
   - Duration: any option
   - Click **Book Appointment**
5. Watch **Tab 2 (Doctor dashboard)** — the new appointment appears **instantly** with a blue highlight, no page refresh needed

---

### Step 16 — Add a new doctor (from admin panel)

1. Log in as admin
2. Click the **"Manage Doctors"** tab at the top
3. Fill in the form:
   - Full Name: e.g. `Dr. Priya Sharma`
   - Email: e.g. `dr.priya@clinic.com`
   - Password: e.g. `doctor123`
4. Click **Add Doctor**
5. The doctor now appears in:
   - The list on the right side of the screen
   - The dropdown in the "Book Appointment" tab
   - They can log in at `http://localhost:5173` with their email and password

---

## PART 6 — See Your Data in MongoDB Compass

### Step 17 — View saved appointments and users

1. Open **MongoDB Compass** (installed in Step 3)
2. Connect to: `mongodb://localhost:27017`
3. On the left you will see databases — click **clinicflow**
4. Inside you'll see two collections:

**users** — all accounts
```
Each document has: name, email, password (hashed), role, createdAt
```

**appointments** — all bookings
```
Each document has: patientName, doctorId, date, startTime, duration, createdAt
```

> You can click any document to expand it and see all its fields.  
> You can also filter: click "Filter" and type `{ "role": "doctor" }` to see only doctors.

---

## PART 7 — Test the API Endpoints (Optional but useful)

### Step 18 — Import Postman collection

1. Download and install **Postman** from: **https://www.postman.com/downloads**
2. Open Postman
3. Click **Import** (top left)
4. Drag and drop the file: `clinicflows/clinicflow-api.postman_collection.json`
5. You will see a collection called **"ClinicFlow API"** with all routes

### Step 19 — Test with Postman (in order)

Run these requests **in this exact order**:

1. **Auth → Login as Admin** — click Send  
   ✅ You get back a `token`. The collection saves it automatically.

2. **Appointments → Get Doctors List** — click Send  
   ✅ You see a list of doctors from the database.

3. **Appointments → Create Appointment** — edit the body, replace `REPLACE_WITH_DOCTOR_ID` with an actual `_id` from step 2, then click Send  
   ✅ Appointment is created and saved to MongoDB.

4. **Auth → Login as Doctor** — click Send  
   ✅ You get a doctor token. Saved automatically.

5. **Appointments → Get My Appointments - Today** — click Send  
   ✅ You see the doctor's appointments.

---

## PART 8 — Every Time You Come Back

These are the steps you run **every single time** you want to work on or demo the project:

### Step A — Make sure MongoDB is running

Open Command Prompt:
```bash
sc query MongoDB
```
If it says `RUNNING` → you're good.  
If it says `STOPPED` → run:
```bash
net start MongoDB
```

### Step B — Start the backend (Terminal 1)

```bash
cd C:\Users\YourName\clinicflows\backend
npm run dev
```
Wait for: `MongoDB connected` and `Server running on port 5000`

### Step C — Start the frontend (Terminal 2 — new window)

```bash
cd C:\Users\YourName\clinicflows\frontend
npm run dev
```
Wait for: `Local: http://localhost:5173/`

### Step D — Open the browser

Go to: **http://localhost:5173**

---

## PART 9 — Common Problems and Fixes

### Problem: `npm run dev` gives "Cannot find module" error
**Fix:** You haven't installed dependencies. Run `npm install` first in that folder.

### Problem: "MongoDB connection error" when starting backend
**Fix:** MongoDB is not running. Run `net start MongoDB` in Command Prompt.

### Problem: Login says "Invalid email or password"
**Fix:** You haven't seeded the database. Run `npm run seed` in the backend folder.

### Problem: Doctor dashboard shows no appointments
**Fix:** The appointment was booked for a different date or different doctor. Check in MongoDB Compass → `appointments` collection to see what date was saved.

### Problem: Frontend shows blank page
**Fix:** Make sure the backend is running first (Terminal 1), then the frontend (Terminal 2). Both must be running at the same time.

### Problem: "Port 5000 already in use"
**Fix:** A previous backend process is still running. Either close the old terminal, or kill the process:
```bash
npx kill-port 5000
```
Then start `npm run dev` again.

### Problem: Changes not reflecting in browser
**Fix:** The frontend (Vite) auto-refreshes on file save. If it doesn't, press `Ctrl + Shift + R` in the browser (hard refresh).

---

## PART 10 — Project Summary (What Does What)

```
backend/src/
  index.ts          → starts the server, connects to MongoDB, sets up Socket.IO
  seed.ts           → creates admin + doctor accounts (run once)
  models/
    User.ts         → defines what a user looks like in the database
    Appointment.ts  → defines what an appointment looks like
  routes/
    auth.ts         → POST /api/auth/login (handles login for all roles)
    appointments.ts → GET/POST for appointments
    doctors.ts      → GET/POST for doctor accounts (admin only)
  middleware/
    auth.ts         → checks JWT token on every protected route
  socket/
    index.ts        → handles real-time WebSocket connections

frontend/src/
  App.tsx           → routing — who goes where based on role
  pages/
    LoginPage.tsx   → login form
    AdminPage.tsx   → booking form + manage doctors tab
    DoctorDashboard → upcoming appointments + live updates
  hooks/
    useAuth.ts      → saves/loads login state
    useSocket.ts    → connects to Socket.IO for live updates
  lib/
    api.ts          → all HTTP requests to the backend
    auth.ts         → saves login token to localStorage
```

---

## API Quick Reference

| Method | URL                              | Who can use | What it does                  |
|--------|----------------------------------|-------------|-------------------------------|
| POST   | /api/auth/login                  | Anyone      | Login, returns JWT token      |
| GET    | /api/appointments/doctors        | Admin only  | List doctors for dropdown     |
| POST   | /api/appointments                | Admin only  | Create a new appointment      |
| GET    | /api/appointments/my?date=...    | Doctor only | Get doctor's upcoming appts   |
| POST   | /api/doctors                     | Admin only  | Create a new doctor account   |
| GET    | /api/doctors                     | Admin only  | List all doctors              |

---

*Document prepared for ClinicFlow MERN Practical — keep this file for reference.*
