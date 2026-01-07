# Windows Setup Guide for Bill Book App

## Prerequisites
- **Python 3.9+** (You have Python 3.8 - please upgrade to 3.9 or higher)
- **Node.js 16+** and npm
- **MongoDB Community Edition**

## Step-by-Step Setup

### 1. Backend Setup (PowerShell)

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (WINDOWS COMMAND)
.\venv\Scripts\activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies (if you get errors, try installing without exact versions)
pip install fastapi uvicorn motor pymongo pydantic python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv bcrypt

# Create .env file
# Use notepad or VS Code to create backend\.env with this content:
```

**Create `backend\.env` file:**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=billbook_db
CORS_ORIGINS=*
JWT_SECRET_KEY=your-secret-key-change-in-production-use-long-random-string
```

```powershell
# Run the backend server
uvicorn server:app --reload --port 8001
```

### 2. Frontend Setup (New PowerShell Terminal)

```powershell
# Navigate to frontend folder
cd frontend

# Install dependencies with legacy peer deps flag (fixes the date-fns conflict)
npm install --legacy-peer-deps

# Create .env file
```

**Create `frontend\.env` file:**
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

```powershell
# Start the frontend
npm start
```

### 3. MongoDB Setup

#### Option A: MongoDB Compass (Easiest - GUI Tool)
1. Download MongoDB Compass from https://www.mongodb.com/try/download/compass
2. Install and open MongoDB Compass
3. Connect to: `mongodb://localhost:27017`
4. Database will be auto-created when you run the app

#### Option B: MongoDB Community Server
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows Service automatically
4. Verify it's running:
   ```powershell
   mongod --version
   ```

### 4. Verify MongoDB is Running

```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# Or check if port 27017 is listening
netstat -an | findstr "27017"
```

If MongoDB is not running:
```powershell
# Start MongoDB service
net start MongoDB
```

## Common Windows Issues & Solutions

### Issue 1: Python Version Too Old
**Error:** `No matching distribution found for anyio==4.12.0`

**Solution:** 
- Download Python 3.9 or higher from https://www.python.org/downloads/
- During installation, check "Add Python to PATH"
- Restart PowerShell and try again

### Issue 2: npm Dependency Conflicts
**Error:** `ERESOLVE unable to resolve dependency tree`

**Solution:**
```powershell
npm install --legacy-peer-deps
```

### Issue 3: "craco not found"
**Solution:**
```powershell
npm install --legacy-peer-deps
# This will install craco and all dependencies
```

### Issue 4: PowerShell Execution Policy
**Error:** `cannot be loaded because running scripts is disabled`

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## VS Code MongoDB Connection

### Method 1: MongoDB for VS Code Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "MongoDB for VS Code"
4. Install the official MongoDB extension
5. Click the MongoDB icon in the sidebar
6. Click "Connect"
7. Enter connection string: `mongodb://localhost:27017`
8. You can now browse your database directly in VS Code!

### Method 2: Connection String in Code
Your application already connects via the `.env` file:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=billbook_db
```

## Accessing Your Application

Once both servers are running:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs

## Quick Commands Summary

**Backend (Terminal 1):**
```powershell
cd backend
.\venv\Scripts\activate
uvicorn server:app --reload --port 8001
```

**Frontend (Terminal 2):**
```powershell
cd frontend
npm start
```

## Troubleshooting

### If MongoDB won't start:
```powershell
# Check if another process is using port 27017
netstat -ano | findstr "27017"

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### If ports 3000 or 8001 are in use:
```powershell
# Find what's using the port
netstat -ano | findstr "3000"
netstat -ano | findstr "8001"

# Kill the process
taskkill /PID <PID> /F
```

### Reset Everything:
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\activate
pip install fastapi uvicorn motor pymongo pydantic python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv bcrypt

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install --legacy-peer-deps
```
