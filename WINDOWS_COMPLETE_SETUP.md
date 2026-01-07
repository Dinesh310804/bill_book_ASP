# Bill Book - Complete Windows Setup Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ and npm installed
- MongoDB Community Server running
- Git (optional, for cloning)

---

## Quick Start Commands (Copy-Paste These)

### Terminal 1: Backend Setup
```powershell
# Navigate to backend
cd C:\Users\dines\OneDrive\Desktop\bill_book-main\bill_book-main\backend

# Activate virtual environment
.\venv\Scripts\activate

# Upgrade pip
python -m pip install --upgrade pip

# Install all dependencies
pip install fastapi uvicorn motor pymongo pydantic python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv bcrypt

# Create .env file
@"
MONGO_URL=mongodb://localhost:27017
DB_NAME=billbook_db
CORS_ORIGINS=*
JWT_SECRET_KEY=your-secret-key-change-in-production-use-long-random-string
"@ | Out-File -FilePath .env -Encoding utf8

# Start backend server
uvicorn server:app --reload --port 8001
```

**Expected Output:** 
```
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

### Terminal 2: Frontend Setup
```powershell
# Navigate to frontend
cd C:\Users\dines\OneDrive\Desktop\bill_book-main\bill_book-main\frontend

# Remove old installations (if any)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Install dependencies with correct ajv version
npm install --legacy-peer-deps --force
npm install ajv@8.17.1 ajv-keywords@5.1.0 --legacy-peer-deps --force

# Create .env file
@"
REACT_APP_BACKEND_URL=http://localhost:8001
"@ | Out-File -FilePath .env -Encoding utf8

# Start frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

## MongoDB Setup

### Option 1: MongoDB Compass (Easiest - GUI)
1. Download: https://www.mongodb.com/try/download/compass
2. Install and open
3. Connect to: `mongodb://localhost:27017`
4. Database `billbook_db` will be auto-created

### Option 2: Verify MongoDB Service
```powershell
# Check if MongoDB is running
Get-Service -Name MongoDB

# If not running, start it (run PowerShell as Administrator)
net start MongoDB
```

---

## Access Your Application

Once both servers are running:

- **Frontend (App):** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs (FastAPI auto-generated)

---

## Troubleshooting

### Issue: "ajv/dist/compile/codegen" error

**Solution:**
```powershell
cd frontend
npm install ajv@8.17.1 ajv-keywords@5.1.0 --legacy-peer-deps --force
npm start
```

### Issue: Backend "ModuleNotFoundError"

**Solution:**
```powershell
cd backend
.\venv\Scripts\activate
pip install <missing-package-name>
```

### Issue: "Port 3000 is already in use"

**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr "3000"

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue: "Port 8001 is already in use"

**Solution:**
```powershell
# Find and kill process
netstat -ano | findstr "8001"
taskkill /PID <PID> /F
```

### Issue: MongoDB Connection Failed

**Solution:**
```powershell
# Check MongoDB status
Get-Service -Name MongoDB

# Restart MongoDB (as Administrator)
net stop MongoDB
net start MongoDB
```

---

## VS Code MongoDB Extension Setup

1. Open VS Code
2. Press `Ctrl+Shift+X` (Extensions)
3. Search "MongoDB for VS Code"
4. Install the official extension
5. Click MongoDB icon in sidebar
6. Click "Connect"
7. Enter: `mongodb://localhost:27017`
8. Browse your `billbook_db` database

---

## Project Structure

```
bill_book-main/
├── backend/
│   ├── server.py          # Main FastAPI application
│   ├── .env               # Backend environment variables
│   ├── requirements.txt   # Python dependencies
│   └── venv/             # Python virtual environment
│
└── frontend/
    ├── src/
    │   ├── App.js        # Main React component
    │   ├── pages/        # All page components
    │   └── components/   # Reusable components
    ├── .env              # Frontend environment variables
    └── package.json      # Node.js dependencies
```

---

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=billbook_db
CORS_ORIGINS=*
JWT_SECRET_KEY=your-secret-key-change-in-production
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## Default Test Credentials

After starting the app, create an account via the signup page. There are no default credentials.

---

## Common Commands Reference

### Backend Commands
```powershell
# Activate virtual environment
.\venv\Scripts\activate

# Install new package
pip install <package-name>

# Update requirements.txt
pip freeze > requirements.txt

# Run backend
uvicorn server:app --reload --port 8001

# Deactivate virtual environment
deactivate
```

### Frontend Commands
```powershell
# Install new package
npm install <package-name> --legacy-peer-deps

# Build for production
npm run build

# Run frontend
npm start
```

---

## MongoDB Commands (Optional)

### Using MongoDB Shell (mongosh)
```powershell
# Connect to MongoDB
mongosh mongodb://localhost:27017

# Show databases
show dbs

# Use billbook database
use billbook_db

# Show collections
show collections

# Query users
db.users.find()

# Query invoices
db.invoices.find()

# Exit shell
exit
```

---

## Need Help?

If you're still facing issues:

1. **Check Backend Logs:** Look at the terminal where uvicorn is running
2. **Check Frontend Logs:** Look at browser console (F12 → Console tab)
3. **Check MongoDB:** Ensure service is running with `Get-Service -Name MongoDB`
4. **Restart Everything:** Close all terminals, stop MongoDB, restart computer if needed

---

## Production Deployment Notes

This setup is for LOCAL DEVELOPMENT only. For production:

1. Use strong JWT secret key
2. Use environment-specific CORS origins
3. Use production MongoDB (MongoDB Atlas recommended)
4. Build frontend for production: `npm run build`
5. Use proper process manager for backend (PM2, Gunicorn+Nginx)

---

**Created:** December 2024  
**Tech Stack:** FastAPI + React + MongoDB  
**Tested On:** Windows 10/11, Python 3.8+, Node.js 16+
