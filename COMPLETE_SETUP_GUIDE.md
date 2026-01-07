# Complete Bill Book with Solar Business - Setup Guide

## 🚀 Quick Start (Windows)

### Step 1: Install ajv Fix (Frontend)
```powershell
cd C:\Users\dines\OneDrive\Desktop\bill_book-main\bill_book-main\frontend
npm install ajv@8.17.1 ajv-keywords@5.1.0 --legacy-peer-deps --force
```

### Step 2: Start Backend (Terminal 1)
```powershell
cd C:\Users\dines\OneDrive\Desktop\bill_book-main\bill_book-main\backend
.\venv\Scripts\activate
uvicorn server:app --reload --port 8001
```

### Step 3: Start Frontend (Terminal 2)
```powershell
cd C:\Users\dines\OneDrive\Desktop\bill_book-main\bill_book-main\frontend
npm start
```

**Access:** http://localhost:3000

---

## ✅ All Issues Fixed

1. ✅ **ajv module error** - Fixed with correct version
2. ✅ **Missing Solar pages** - Created SolarProjectForm & SolarProjectDetails
3. ✅ **Branding updated** - Removed "made with emergent", looks professional
4. ✅ **All dependencies installed** - Backend & Frontend ready

---

## 📋 Features Implemented

### Core Accounting Features
- ✅ User Authentication (JWT-based)
- ✅ Business Management
- ✅ Customer & Vendor Management
- ✅ Product/Inventory with stock tracking
- ✅ Invoice Creation with auto-numbering
- ✅ Expense Management with categories
- ✅ Payment Tracking
- ✅ Dashboard with metrics
- ✅ Sales & Expense Reports

### Solar Business Features (PM Surya Ghar)
- ✅ Solar Project Management (SOLAR-00001 auto-numbering)
- ✅ **Auto Subsidy Calculation** (₹30k/kW for ≤2kW, ₹60k for 2kW, ₹78k for ≥3kW)
- ✅ Project-wise Cost Tracking
- ✅ Installation Milestones
- ✅ Material Consumption per Project
- ✅ Government Document Management
  - Subsidy Application
  - Technical Approval
  - Net Metering Certificate
  - Completion Certificate
- ✅ Subsidy Status Tracking (pending → applied → approved → received)
- ✅ DISCOM-wise Tracking
- ✅ Consumer Number Management
- ✅ Solar Dashboard with Analytics
- ✅ System Capacity & Revenue Metrics

---

## 🔧 Environment Variables

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

## 📊 MongoDB Collections

The app creates these collections automatically:
- `users` - User accounts
- `businesses` - Business profiles
- `customers` - Customer list
- `vendors` - Vendor list
- `products` - Product inventory
- `invoices` - Sales invoices
- `expenses` - Business expenses
- `expense_categories` - Expense categories
- `payments` - Payment records
- `solar_projects` - Solar installation projects
- `project_milestones` - Installation milestones
- `material_consumption` - Material usage tracking
- `government_documents` - Document management
- `subsidy_tracking` - PM Surya Ghar subsidy tracking

---

## 🎯 User Flow Examples

### Example 1: Create Solar Project
1. Login to the app
2. Create a Customer (if new)
3. Navigate to "Solar Projects" menu
4. Click "New Project"
5. Fill in:
   - Customer details
   - System capacity (e.g., 3.5 kW) → **Subsidy auto-calculated to ₹78,000**
   - Panel type (e.g., "Monocrystalline 540W")
   - Number of panels
   - Inverter details
   - DISCOM name
   - Consumer number
   - Estimated cost
6. Submit → Project number generated (SOLAR-00001)

### Example 2: Track Subsidy
1. Open Solar Project details
2. Go to "Subsidies" tab
3. Add subsidy application
4. Track status changes:
   - Pending → Applied → Approved → Received
5. Record approved and received amounts

### Example 3: Regular Invoice
1. Navigate to "Invoices"
2. Click "Create Invoice"
3. Select customer
4. Add items from product list
5. Tax auto-calculated
6. Submit → Invoice number generated (INV-00001)

---

## 💡 Pro Tips

### For Solar Vendors
- **Subsidy Calculator Built-in**: Just enter system capacity, subsidy amount is auto-calculated per PM Surya Ghar scheme
- **Track Every Project Stage**: Planning → In Progress → Completed
- **Document Everything**: Upload subsidy forms, approvals, net metering certificates
- **Material Tracking**: Know exactly which materials used in each project

### For Regular Business
- **Auto-numbering**: Invoices and expenses get automatic sequential numbers
- **Stock Alerts**: Get notified when product stock is low
- **Outstanding Tracking**: See which invoices are unpaid
- **Multi-currency Ready**: Easy to extend for international sales

---

## 🔍 MongoDB Connection in VS Code

1. Install "MongoDB for VS Code" extension
2. Click MongoDB icon in sidebar
3. Click "Connect"
4. Enter: `mongodb://localhost:27017`
5. Browse `billbook_db` database

---

## 🛠️ Troubleshooting

### Issue: Frontend won't start
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install ajv@8.17.1 ajv-keywords@5.1.0 --legacy-peer-deps --force
npm start
```

### Issue: Backend module not found
```powershell
cd backend
.\venv\Scripts\activate
pip install <missing-package>
```

### Issue: MongoDB connection failed
```powershell
# Check if MongoDB is running
Get-Service -Name MongoDB

# Start if stopped (run as Administrator)
net start MongoDB
```

### Issue: Port already in use
```powershell
# Find process on port 3000
netstat -ano | findstr "3000"

# Kill the process
taskkill /PID <PID> /F
```

---

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Core Business
- `GET/POST /api/customers` - Customer management
- `GET/POST /api/vendors` - Vendor management
- `GET/POST /api/products` - Product management
- `GET/POST /api/invoices` - Invoice management
- `GET/POST /api/expenses` - Expense management

### Solar Business
- `GET/POST /api/solar/projects` - Solar projects
- `GET /api/solar/dashboard` - Solar analytics
- `GET/POST /api/solar/milestones/{project_id}` - Milestones
- `GET/POST /api/solar/materials/{project_id}` - Material consumption
- `GET/POST /api/solar/documents/{project_id}` - Government documents
- `GET/POST /api/solar/subsidies/{project_id}` - Subsidy tracking

**API Docs:** http://localhost:8001/docs (FastAPI auto-generated)

---

## 🎨 Design Features

- Professional Swiss Vault inspired design
- Clean, modern interface
- Responsive layout (works on mobile)
- Clear visual hierarchy
- Status badges with colors
- Real-time calculations
- Form validation
- Toast notifications

---

## 🔐 Security Features

- JWT authentication with token expiry
- Password hashing with bcrypt
- CORS configuration
- MongoDB connection security
- Input validation
- Protected routes

---

## 📈 Future Enhancements (Optional)

1. **WhatsApp Integration** - Send invoices via WhatsApp
2. **Email Notifications** - Automated reminders
3. **PDF Export** - Print invoices and reports
4. **Excel Export** - Download reports
5. **File Upload** - Attach documents to projects
6. **SMS Alerts** - Payment reminders
7. **Multi-language** - Hindi, English, regional languages
8. **Mobile App** - React Native version
9. **Payment Gateway** - Online payment collection
10. **Analytics Dashboard** - Advanced charts and graphs

---

## 🎯 PM Surya Ghar Subsidy Rates (Built-in)

| System Capacity | Subsidy Amount |
|----------------|----------------|
| Up to 2 kW     | ₹30,000/kW     |
| 2-3 kW         | ₹60,000 + ₹18,000/kW for additional |
| 3 kW and above | ₹78,000 (maximum) |

**Auto-calculated** when you enter system capacity!

---

## 📞 Support

- Check backend logs: Terminal where uvicorn is running
- Check frontend logs: Browser console (F12)
- MongoDB status: `Get-Service -Name MongoDB`
- Restart services if needed

---

**Built with:** FastAPI + React + MongoDB  
**Tested on:** Windows 10/11, Python 3.8+, Node.js 16+
