# DADN - Smart Automatic Irrigation Web System

## 1. Overview
This system includes:
- Frontend: web UI (dashboard, history, profile, login/signup)
- Backend: Express API + static file hosting
- Firebase sync worker: syncs sensor and pump status data from Firebase to MySQL

## 2. Main Structure
- backend/server.js: backend API and static frontend hosting
- backend/firebase-sync.js: Firebase -> MySQL sync worker
- backend/config/db.config.js: MySQL config from .env
- backend/scripts/init-db.js: initialize schema and minimal runtime seed from SQL file
- backend/scripts/clean-test-data.js: remove historical test data in database
- frontend/: full frontend source
- archive/non-runtime/database/SmartGarden_db.sql: SQL schema file

## 3. Prerequisites
Required:
1. Node.js 18+ (LTS recommended)
2. MySQL 8.x (or compatible MariaDB)
3. npm (comes with Node.js)

## 4. Environment Setup
### Step 1: Install dependencies
```bash
npm install
```

### Step 2: Create .env file
Copy from the template:
```bash
copy .env.example .env
```
On PowerShell, you can also use:
```bash
Copy-Item .env.example .env
```

Review the main settings in `.env`:
- FIREBASE_DATABASE_URL
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- DEVICE_ID
- PORT
- NODE_ENV

Optional:
- JWT_SECRET
- PUMP_FLOW_RATE_LPM

### Step 3: Initialize database
```bash
npm run db:init
```
This command will:
- Ensure `SmartGardenDB` exists (without dropping existing data)
- Ensure all required tables exist
- Insert minimal runtime seed data (not demo data):
  - 1 internal owner account
  - 1 default device

This minimal seed is required so the sync worker can write sensor logs without foreign key errors.

## 5. Clean Test Data (Optional)
If you want to clear generated test/history data:
```bash
npm run db:clean-test
```
This command deletes known test-related data in:
- Sensor_logs
- Pump_actions
- Alert
- known legacy test users/devices (if any)

Note: this command does not remove the database schema.

## 6. Run the Project
### Run full stack (backend + Firebase sync)
```bash
npm start
```
`npm start` now runs database initialization automatically (safe/idempotent) before starting the services.

### Run backend API only
```bash
npm run server
```

### Run Firebase sync worker only
```bash
npm run firebase-sync
```

## 7. Access the App
After backend starts:
- Default URL: http://localhost:3000

## 8. Useful Commands
- Check backend syntax:
```bash
node --check backend/server.js
```

- Reset database to clean initialized state:
```bash
npm run db:init
```

Note: `db:init` is idempotent and safe to run multiple times. It does not drop existing database data.

- Clean generated test/history data:
```bash
npm run db:clean-test
```

## 9. Operational Notes
1. If MySQL connection fails:
- Verify DB_HOST/DB_PORT/DB_USER/DB_PASSWORD in `.env`
- Ensure MySQL is running

2. If port 3000 is already in use:
- Change `PORT` in `.env`

3. `firebase-sync` runs on an interval, so `Sensor_logs` and `Pump_actions` can grow quickly during long test sessions.