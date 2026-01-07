from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from decimal import Decimal

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============= MODELS =============

class UserRole(BaseModel):
    name: str
    permissions: List[str] = []

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    mobile: Optional[str] = None
    name: str
    role: str = "Admin"  # SuperAdmin, Admin, Accountant, Staff, Viewer
    business_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    mobile: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Business(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    gstin: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    owner_id: str
    financial_year: str = "2024-25"
    tax_rate: float = 18.0  # Default GST rate
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BusinessCreate(BaseModel):
    name: str
    gstin: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    tax_rate: float = 18.0

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    gstin: Optional[str] = None
    address: Optional[str] = None
    business_id: str
    opening_balance: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    gstin: Optional[str] = None
    address: Optional[str] = None
    opening_balance: float = 0.0

class Vendor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    gstin: Optional[str] = None
    address: Optional[str] = None
    business_id: str
    opening_balance: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VendorCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    gstin: Optional[str] = None
    address: Optional[str] = None
    opening_balance: float = 0.0

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    sku: Optional[str] = None
    hsn_code: Optional[str] = None
    unit: str = "pcs"  # pcs, kg, ltr, etc
    price: float
    tax_rate: float = 18.0
    business_id: str
    stock_quantity: float = 0.0
    low_stock_alert: float = 10.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    sku: Optional[str] = None
    hsn_code: Optional[str] = None
    unit: str = "pcs"
    price: float
    tax_rate: float = 18.0
    stock_quantity: float = 0.0
    low_stock_alert: float = 10.0

class InvoiceItem(BaseModel):
    product_id: str
    product_name: str
    quantity: float
    price: float
    tax_rate: float
    discount: float = 0.0
    amount: float

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    customer_id: str
    customer_name: str
    business_id: str
    invoice_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_date: Optional[datetime] = None
    items: List[InvoiceItem]
    subtotal: float
    tax_amount: float
    discount: float = 0.0
    total: float
    paid_amount: float = 0.0
    balance: float
    status: str = "unpaid"  # unpaid, partial, paid
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvoiceCreate(BaseModel):
    customer_id: str
    invoice_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    items: List[InvoiceItem]
    discount: float = 0.0
    notes: Optional[str] = None

class ExpenseCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    business_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExpenseCategoryCreate(BaseModel):
    name: str

class Expense(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    expense_number: str
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    vendor_id: Optional[str] = None
    vendor_name: Optional[str] = None
    business_id: str
    amount: float
    tax_amount: float = 0.0
    total: float
    expense_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    description: Optional[str] = None
    payment_method: str = "cash"  # cash, bank, card
    receipt_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExpenseCreate(BaseModel):
    category_id: Optional[str] = None
    vendor_id: Optional[str] = None
    amount: float
    tax_amount: float = 0.0
    expense_date: Optional[datetime] = None
    description: Optional[str] = None
    payment_method: str = "cash"

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    payment_number: str
    invoice_id: Optional[str] = None
    customer_id: Optional[str] = None
    business_id: str
    amount: float
    payment_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    payment_method: str = "cash"
    reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentCreate(BaseModel):
    invoice_id: Optional[str] = None
    customer_id: Optional[str] = None
    amount: float
    payment_date: Optional[datetime] = None
    payment_method: str = "cash"
    reference: Optional[str] = None
    notes: Optional[str] = None

# ============= SOLAR BUSINESS MODELS =============

class SolarProject(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_number: str
    customer_id: str
    customer_name: str
    business_id: str
    project_name: str
    site_address: str
    system_capacity_kw: float
    panel_type: str
    panel_quantity: int
    inverter_type: str
    inverter_quantity: int
    estimated_cost: float
    actual_cost: float = 0.0
    subsidy_amount: float = 0.0
    subsidy_status: str = "pending"  # pending, applied, approved, received
    discom_name: str
    consumer_number: str
    installation_status: str = "planning"  # planning, in_progress, completed, on_hold
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SolarProjectCreate(BaseModel):
    customer_id: str
    project_name: str
    site_address: str
    system_capacity_kw: float
    panel_type: str
    panel_quantity: int
    inverter_type: str
    inverter_quantity: int
    estimated_cost: float
    subsidy_amount: float = 0.0
    discom_name: str
    consumer_number: str
    start_date: Optional[datetime] = None
    notes: Optional[str] = None

class ProjectMilestone(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    milestone_name: str
    description: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed
    due_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    amount: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectMilestoneCreate(BaseModel):
    project_id: str
    milestone_name: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    amount: float = 0.0

class MaterialConsumption(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    product_id: str
    product_name: str
    quantity_used: float
    consumption_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MaterialConsumptionCreate(BaseModel):
    project_id: str
    product_id: str
    quantity_used: float
    consumption_date: Optional[datetime] = None
    notes: Optional[str] = None

class GovernmentDocument(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    document_type: str  # subsidy_application, technical_approval, net_metering, completion_certificate
    document_name: str
    document_url: Optional[str] = None
    document_number: Optional[str] = None
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    status: str = "pending"  # pending, submitted, approved, rejected
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GovernmentDocumentCreate(BaseModel):
    project_id: str
    document_type: str
    document_name: str
    document_number: Optional[str] = None
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    status: str = "pending"
    notes: Optional[str] = None

class SubsidyTracking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    scheme_name: str = "PM Surya Ghar Yojana"
    applied_amount: float
    approved_amount: float = 0.0
    received_amount: float = 0.0
    application_date: Optional[datetime] = None
    approval_date: Optional[datetime] = None
    received_date: Optional[datetime] = None
    application_number: Optional[str] = None
    status: str = "pending"  # pending, approved, received, rejected
    remarks: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubsidyTrackingCreate(BaseModel):
    project_id: str
    applied_amount: float
    application_date: Optional[datetime] = None
    application_number: Optional[str] = None
    remarks: Optional[str] = None

# ============= AUTH HELPERS =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return User(**user_doc)

# ============= UTILITY FUNCTIONS =============

async def generate_invoice_number(business_id: str) -> str:
    """Generate auto-incremented invoice number"""
    last_invoice = await db.invoices.find_one(
        {"business_id": business_id},
        {"_id": 0, "invoice_number": 1},
        sort=[("created_at", -1)]
    )
    
    if last_invoice and last_invoice.get("invoice_number"):
        try:
            last_num = int(last_invoice["invoice_number"].split("-")[-1])
            return f"INV-{last_num + 1:05d}"
        except:
            pass
    
    return "INV-00001"

async def generate_expense_number(business_id: str) -> str:
    """Generate auto-incremented expense number"""
    last_expense = await db.expenses.find_one(
        {"business_id": business_id},
        {"_id": 0, "expense_number": 1},
        sort=[("created_at", -1)]
    )
    
    if last_expense and last_expense.get("expense_number"):
        try:
            last_num = int(last_expense["expense_number"].split("-")[-1])
            return f"EXP-{last_num + 1:05d}"
        except:
            pass
    
    return "EXP-00001"

async def generate_payment_number(business_id: str) -> str:
    """Generate auto-incremented payment number"""
    last_payment = await db.payments.find_one(
        {"business_id": business_id},
        {"_id": 0, "payment_number": 1},
        sort=[("created_at", -1)]
    )
    
    if last_payment and last_payment.get("payment_number"):
        try:
            last_num = int(last_payment["payment_number"].split("-")[-1])
            return f"PAY-{last_num + 1:05d}"
        except:
            pass
    
    return "PAY-00001"

# ============= ROUTES =============

@api_router.get("/")
async def root():
    return {"message": "Bill Book & Expense Management API"}

# AUTH ROUTES
@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        mobile=user_data.mobile
    )
    
    user_doc = user.model_dump()
    user_doc['password'] = hashed_password
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_access_token({"sub": user.id, "email": user.email})
    
    return {"user": user, "token": token}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password'})
    
    # Create token
    token = create_access_token({"sub": user.id, "email": user.email})
    
    return {"user": user, "token": token}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# BUSINESS ROUTES
@api_router.post("/businesses", response_model=Business)
async def create_business(business_data: BusinessCreate, current_user: User = Depends(get_current_user)):
    business = Business(**business_data.model_dump(), owner_id=current_user.id)
    
    doc = business.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.businesses.insert_one(doc)
    
    # Update user's business_id
    await db.users.update_one({"id": current_user.id}, {"$set": {"business_id": business.id}})
    
    return business

@api_router.get("/businesses", response_model=List[Business])
async def get_businesses(current_user: User = Depends(get_current_user)):
    businesses = await db.businesses.find({"owner_id": current_user.id}, {"_id": 0}).to_list(100)
    return businesses

@api_router.get("/businesses/{business_id}", response_model=Business)
async def get_business(business_id: str, current_user: User = Depends(get_current_user)):
    business = await db.businesses.find_one({"id": business_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business

@api_router.put("/businesses/{business_id}", response_model=Business)
async def update_business(business_id: str, business_data: BusinessCreate, current_user: User = Depends(get_current_user)):
    result = await db.businesses.update_one(
        {"id": business_id, "owner_id": current_user.id},
        {"$set": business_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business not found")
    
    business = await db.businesses.find_one({"id": business_id}, {"_id": 0})
    return business

# CUSTOMER ROUTES
@api_router.post("/customers", response_model=Customer)
async def create_customer(customer_data: CustomerCreate, current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="Please create a business first")
    
    customer = Customer(**customer_data.model_dump(), business_id=current_user.business_id)
    
    doc = customer.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.customers.insert_one(doc)
    return customer

@api_router.get("/customers", response_model=List[Customer])
async def get_customers(current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        return []
    
    customers = await db.customers.find({"business_id": current_user.business_id}, {"_id": 0}).to_list(1000)
    return customers

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@api_router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer_data: CustomerCreate, current_user: User = Depends(get_current_user)):
    result = await db.customers.update_one(
        {"id": customer_id, "business_id": current_user.business_id},
        {"$set": customer_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    return customer

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    result = await db.customers.delete_one({"id": customer_id, "business_id": current_user.business_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}

# VENDOR ROUTES
@api_router.post("/vendors", response_model=Vendor)
async def create_vendor(vendor_data: VendorCreate, current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="Please create a business first")
    
    vendor = Vendor(**vendor_data.model_dump(), business_id=current_user.business_id)
    
    doc = vendor.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.vendors.insert_one(doc)
    return vendor

@api_router.get("/vendors", response_model=List[Vendor])
async def get_vendors(current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        return []
    
    vendors = await db.vendors.find({"business_id": current_user.business_id}, {"_id": 0}).to_list(1000)
    return vendors

@api_router.get("/vendors/{vendor_id}", response_model=Vendor)
async def get_vendor(vendor_id: str, current_user: User = Depends(get_current_user)):
    vendor = await db.vendors.find_one({"id": vendor_id}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

@api_router.put("/vendors/{vendor_id}", response_model=Vendor)
async def update_vendor(vendor_id: str, vendor_data: VendorCreate, current_user: User = Depends(get_current_user)):
    result = await db.vendors.update_one(
        {"id": vendor_id, "business_id": current_user.business_id},
        {"$set": vendor_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    vendor = await db.vendors.find_one({"id": vendor_id}, {"_id": 0})
    return vendor

@api_router.delete("/vendors/{vendor_id}")
async def delete_vendor(vendor_id: str, current_user: User = Depends(get_current_user)):
    result = await db.vendors.delete_one({"id": vendor_id, "business_id": current_user.business_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor deleted successfully"}

# PRODUCT ROUTES
@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="Please create a business first")
    
    product = Product(**product_data.model_dump(), business_id=current_user.business_id)
    
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.products.insert_one(doc)
    return product

@api_router.get("/products", response_model=List[Product])
async def get_products(current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        return []
    
    products = await db.products.find({"business_id": current_user.business_id}, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str, current_user: User = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    result = await db.products.update_one(
        {"id": product_id, "business_id": current_user.business_id},
        {"$set": product_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: User = Depends(get_current_user)):
    result = await db.products.delete_one({"id": product_id, "business_id": current_user.business_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# INVOICE ROUTES
@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice_data: InvoiceCreate, current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="Please create a business first")
    
    # Get customer
    customer = await db.customers.find_one({"id": invoice_data.customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Calculate totals
    subtotal = sum(item.amount for item in invoice_data.items)
    tax_amount = sum(item.amount * item.tax_rate / 100 for item in invoice_data.items)
    total = subtotal + tax_amount - invoice_data.discount
    
    # Generate invoice number
    invoice_number = await generate_invoice_number(current_user.business_id)
    
    invoice = Invoice(
        invoice_number=invoice_number,
        customer_id=invoice_data.customer_id,
        customer_name=customer['name'],
        business_id=current_user.business_id,
        invoice_date=invoice_data.invoice_date or datetime.now(timezone.utc),
        due_date=invoice_data.due_date,
        items=[item.model_dump() for item in invoice_data.items],
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount=invoice_data.discount,
        total=total,
        balance=total,
        notes=invoice_data.notes
    )
    
    doc = invoice.model_dump()
    doc['invoice_date'] = doc['invoice_date'].isoformat()
    if doc['due_date']:
        doc['due_date'] = doc['due_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.invoices.insert_one(doc)
    
    # Update product stock
    for item in invoice_data.items:
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"stock_quantity": -item.quantity}}
        )
    
    return invoice

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        return []
    
    invoices = await db.invoices.find({"business_id": current_user.business_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return invoices

@api_router.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str, current_user: User = Depends(get_current_user)):
    invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@api_router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str, current_user: User = Depends(get_current_user)):
    result = await db.invoices.delete_one({"id": invoice_id, "business_id": current_user.business_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": "Invoice deleted successfully"}

# EXPENSE CATEGORY ROUTES
@api_router.post("/expense-categories", response_model=ExpenseCategory)
async def create_expense_category(category_data: ExpenseCategoryCreate, current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="Please create a business first")
    
    category = ExpenseCategory(**category_data.model_dump(), business_id=current_user.business_id)
    
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.expense_categories.insert_one(doc)
    return category

@api_router.get("/expense-categories", response_model=List[ExpenseCategory])
async def get_expense_categories(current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        return []
    
    categories = await db.expense_categories.find({"business_id": current_user.business_id}, {"_id": 0}).to_list(100)
    return categories

# EXPENSE ROUTES
@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate, current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="Please create a business first")
    
    # Get category and vendor names
    category_name = None
    if expense_data.category_id:
        category = await db.expense_categories.find_one({"id": expense_data.category_id}, {"_id": 0})
        if category:
            category_name = category['name']
    
    vendor_name = None
    if expense_data.vendor_id:
        vendor = await db.vendors.find_one({"id": expense_data.vendor_id}, {"_id": 0})
        if vendor:
            vendor_name = vendor['name']
    
    # Generate expense number
    expense_number = await generate_expense_number(current_user.business_id)
    
    total = expense_data.amount + expense_data.tax_amount
    
    expense = Expense(
        expense_number=expense_number,
        category_id=expense_data.category_id,
        category_name=category_name,
        vendor_id=expense_data.vendor_id,
        vendor_name=vendor_name,
        business_id=current_user.business_id,
        amount=expense_data.amount,
        tax_amount=expense_data.tax_amount,
        total=total,
        expense_date=expense_data.expense_date or datetime.now(timezone.utc),
        description=expense_data.description,
        payment_method=expense_data.payment_method
    )
    
    doc = expense.model_dump()
    doc['expense_date'] = doc['expense_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.expenses.insert_one(doc)
    return expense

@api_router.get("/expenses", response_model=List[Expense])
async def get_expenses(current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        return []
    
    expenses = await db.expenses.find({"business_id": current_user.business_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return expenses

@api_router.get("/expenses/{expense_id}", response_model=Expense)
async def get_expense(expense_id: str, current_user: User = Depends(get_current_user)):
    expense = await db.expenses.find_one({"id": expense_id}, {"_id": 0})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, current_user: User = Depends(get_current_user)):
    result = await db.expenses.delete_one({"id": expense_id, "business_id": current_user.business_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}

# PAYMENT ROUTES
@api_router.post("/payments", response_model=Payment)
async def create_payment(payment_data: PaymentCreate, current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="Please create a business first")
    
    # Generate payment number
    payment_number = await generate_payment_number(current_user.business_id)
    
    payment = Payment(
        payment_number=payment_number,
        invoice_id=payment_data.invoice_id,
        customer_id=payment_data.customer_id,
        business_id=current_user.business_id,
        amount=payment_data.amount,
        payment_date=payment_data.payment_date or datetime.now(timezone.utc),
        payment_method=payment_data.payment_method,
        reference=payment_data.reference,
        notes=payment_data.notes
    )
    
    doc = payment.model_dump()
    doc['payment_date'] = doc['payment_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.payments.insert_one(doc)
    
    # Update invoice if payment is linked
    if payment_data.invoice_id:
        invoice = await db.invoices.find_one({"id": payment_data.invoice_id}, {"_id": 0})
        if invoice:
            new_paid = invoice['paid_amount'] + payment_data.amount
            new_balance = invoice['total'] - new_paid
            new_status = "paid" if new_balance <= 0 else ("partial" if new_paid > 0 else "unpaid")
            
            await db.invoices.update_one(
                {"id": payment_data.invoice_id},
                {"$set": {"paid_amount": new_paid, "balance": new_balance, "status": new_status}}
            )
    
    return payment

@api_router.get("/payments", response_model=List[Payment])
async def get_payments(current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        return []
    
    payments = await db.payments.find({"business_id": current_user.business_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return payments

# REPORTS & DASHBOARD
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        return {}
    
    business_id = current_user.business_id
    
    # Total Sales
    invoices = await db.invoices.find({"business_id": business_id}, {"_id": 0, "total": 1}).to_list(10000)
    total_sales = sum(inv.get('total', 0) for inv in invoices)
    
    # Total Expenses
    expenses = await db.expenses.find({"business_id": business_id}, {"_id": 0, "total": 1}).to_list(10000)
    total_expenses = sum(exp.get('total', 0) for exp in expenses)
    
    # Outstanding
    outstanding_invoices = await db.invoices.find(
        {"business_id": business_id, "status": {"$ne": "paid"}},
        {"_id": 0, "balance": 1}
    ).to_list(10000)
    total_outstanding = sum(inv.get('balance', 0) for inv in outstanding_invoices)
    
    # Counts
    customers_count = await db.customers.count_documents({"business_id": business_id})
    invoices_count = len(invoices)
    products_count = await db.products.count_documents({"business_id": business_id})
    
    # Recent invoices
    recent_invoices = await db.invoices.find(
        {"business_id": business_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    # Recent expenses
    recent_expenses = await db.expenses.find(
        {"business_id": business_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    # Low stock products
    low_stock = await db.products.find(
        {"business_id": business_id, "$expr": {"$lte": ["$stock_quantity", "$low_stock_alert"]}},
        {"_id": 0}
    ).limit(5).to_list(5)
    
    return {
        "total_sales": total_sales,
        "total_expenses": total_expenses,
        "profit": total_sales - total_expenses,
        "total_outstanding": total_outstanding,
        "customers_count": customers_count,
        "invoices_count": invoices_count,
        "products_count": products_count,
        "recent_invoices": recent_invoices,
        "recent_expenses": recent_expenses,
        "low_stock_products": low_stock
    }

@api_router.get("/reports/sales")
async def get_sales_report(current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        return {}
    
    invoices = await db.invoices.find(
        {"business_id": current_user.business_id},
        {"_id": 0}
    ).sort("invoice_date", -1).to_list(1000)
    
    total_sales = sum(inv.get('total', 0) for inv in invoices)
    total_tax = sum(inv.get('tax_amount', 0) for inv in invoices)
    total_paid = sum(inv.get('paid_amount', 0) for inv in invoices)
    total_outstanding = sum(inv.get('balance', 0) for inv in invoices)
    
    return {
        "invoices": invoices,
        "summary": {
            "total_sales": total_sales,
            "total_tax": total_tax,
            "total_paid": total_paid,
            "total_outstanding": total_outstanding,
            "invoice_count": len(invoices)
        }
    }

@api_router.get("/reports/expenses")
async def get_expense_report(current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        return {}
    
    expenses = await db.expenses.find(
        {"business_id": current_user.business_id},
        {"_id": 0}
    ).sort("expense_date", -1).to_list(1000)
    
    total_amount = sum(exp.get('total', 0) for exp in expenses)
    
    # Group by category
    category_totals = {}
    for exp in expenses:
        cat = exp.get('category_name', 'Uncategorized')
        category_totals[cat] = category_totals.get(cat, 0) + exp.get('total', 0)
    
    return {
        "expenses": expenses,
        "summary": {
            "total_amount": total_amount,
            "expense_count": len(expenses),
            "category_breakdown": category_totals
        }
    }

# ============= SOLAR BUSINESS ROUTES =============

async def generate_project_number(business_id: str) -> str:
    """Generate auto-incremented project number"""
    last_project = await db.solar_projects.find_one(
        {"business_id": business_id},
        {"_id": 0, "project_number": 1},
        sort=[("created_at", -1)]
    )
    
    if last_project and last_project.get("project_number"):
        try:
            last_num = int(last_project["project_number"].split("-")[-1])
            return f"SOLAR-{last_num + 1:05d}"
        except:
            pass
    
    return "SOLAR-00001"

@api_router.post("/solar/projects", response_model=SolarProject)
async def create_solar_project(project_data: SolarProjectCreate, current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        raise HTTPException(status_code=400, detail="Please create a business first")
    
    # Get customer
    customer = await db.customers.find_one({"id": project_data.customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Generate project number
    project_number = await generate_project_number(current_user.business_id)
    
    project = SolarProject(
        project_number=project_number,
        customer_id=project_data.customer_id,
        customer_name=customer['name'],
        business_id=current_user.business_id,
        **project_data.model_dump()
    )
    
    doc = project.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc['start_date']:
        doc['start_date'] = doc['start_date'].isoformat()
    if doc.get('completion_date'):
        doc['completion_date'] = doc['completion_date'].isoformat()
    
    await db.solar_projects.insert_one(doc)
    return project

@api_router.get("/solar/projects", response_model=List[SolarProject])
async def get_solar_projects(current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        return []
    
    projects = await db.solar_projects.find(
        {"business_id": current_user.business_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    return projects

@api_router.get("/solar/projects/{project_id}", response_model=SolarProject)
async def get_solar_project(project_id: str, current_user: User = Depends(get_current_user)):
    project = await db.solar_projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@api_router.put("/solar/projects/{project_id}", response_model=SolarProject)
async def update_solar_project(project_id: str, project_data: SolarProjectCreate, current_user: User = Depends(get_current_user)):
    result = await db.solar_projects.update_one(
        {"id": project_id, "business_id": current_user.business_id},
        {"$set": project_data.model_dump(exclude_unset=True)}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = await db.solar_projects.find_one({"id": project_id}, {"_id": 0})
    return project

@api_router.delete("/solar/projects/{project_id}")
async def delete_solar_project(project_id: str, current_user: User = Depends(get_current_user)):
    result = await db.solar_projects.delete_one({"id": project_id, "business_id": current_user.business_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

# MILESTONE ROUTES
@api_router.post("/solar/milestones", response_model=ProjectMilestone)
async def create_milestone(milestone_data: ProjectMilestoneCreate, current_user: User = Depends(get_current_user)):
    milestone = ProjectMilestone(**milestone_data.model_dump())
    
    doc = milestone.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('due_date'):
        doc['due_date'] = doc['due_date'].isoformat()
    if doc.get('completion_date'):
        doc['completion_date'] = doc['completion_date'].isoformat()
    
    await db.project_milestones.insert_one(doc)
    return milestone

@api_router.get("/solar/milestones/{project_id}", response_model=List[ProjectMilestone])
async def get_project_milestones(project_id: str, current_user: User = Depends(get_current_user)):
    milestones = await db.project_milestones.find(
        {"project_id": project_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    return milestones

@api_router.put("/solar/milestones/{milestone_id}")
async def update_milestone_status(milestone_id: str, status: str, current_user: User = Depends(get_current_user)):
    completion_date = datetime.now(timezone.utc).isoformat() if status == "completed" else None
    update_data = {"status": status}
    if completion_date:
        update_data["completion_date"] = completion_date
    
    result = await db.project_milestones.update_one(
        {"id": milestone_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return {"message": "Milestone updated successfully"}

# MATERIAL CONSUMPTION ROUTES
@api_router.post("/solar/materials", response_model=MaterialConsumption)
async def create_material_consumption(material_data: MaterialConsumptionCreate, current_user: User = Depends(get_current_user)):
    # Get product details
    product = await db.products.find_one({"id": material_data.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    consumption = MaterialConsumption(
        **material_data.model_dump(),
        product_name=product['name'],
        consumption_date=material_data.consumption_date or datetime.now(timezone.utc)
    )
    
    doc = consumption.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['consumption_date'] = doc['consumption_date'].isoformat()
    
    await db.material_consumption.insert_one(doc)
    
    # Update product stock
    await db.products.update_one(
        {"id": material_data.product_id},
        {"$inc": {"stock_quantity": -material_data.quantity_used}}
    )
    
    return consumption

@api_router.get("/solar/materials/{project_id}", response_model=List[MaterialConsumption])
async def get_project_materials(project_id: str, current_user: User = Depends(get_current_user)):
    materials = await db.material_consumption.find(
        {"project_id": project_id},
        {"_id": 0}
    ).sort("consumption_date", -1).to_list(1000)
    return materials

# GOVERNMENT DOCUMENTS ROUTES
@api_router.post("/solar/documents", response_model=GovernmentDocument)
async def create_government_document(doc_data: GovernmentDocumentCreate, current_user: User = Depends(get_current_user)):
    document = GovernmentDocument(**doc_data.model_dump())
    
    doc = document.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('issue_date'):
        doc['issue_date'] = doc['issue_date'].isoformat()
    if doc.get('expiry_date'):
        doc['expiry_date'] = doc['expiry_date'].isoformat()
    
    await db.government_documents.insert_one(doc)
    return document

@api_router.get("/solar/documents/{project_id}", response_model=List[GovernmentDocument])
async def get_project_documents(project_id: str, current_user: User = Depends(get_current_user)):
    documents = await db.government_documents.find(
        {"project_id": project_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return documents

@api_router.put("/solar/documents/{document_id}")
async def update_document_status(document_id: str, status: str, current_user: User = Depends(get_current_user)):
    result = await db.government_documents.update_one(
        {"id": document_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document updated successfully"}

# SUBSIDY TRACKING ROUTES
@api_router.post("/solar/subsidies", response_model=SubsidyTracking)
async def create_subsidy_tracking(subsidy_data: SubsidyTrackingCreate, current_user: User = Depends(get_current_user)):
    subsidy = SubsidyTracking(**subsidy_data.model_dump())
    
    doc = subsidy.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('application_date'):
        doc['application_date'] = doc['application_date'].isoformat()
    if doc.get('approval_date'):
        doc['approval_date'] = doc['approval_date'].isoformat()
    if doc.get('received_date'):
        doc['received_date'] = doc['received_date'].isoformat()
    
    await db.subsidy_tracking.insert_one(doc)
    return subsidy

@api_router.get("/solar/subsidies/{project_id}", response_model=List[SubsidyTracking])
async def get_project_subsidies(project_id: str, current_user: User = Depends(get_current_user)):
    subsidies = await db.subsidy_tracking.find(
        {"project_id": project_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return subsidies

@api_router.put("/solar/subsidies/{subsidy_id}")
async def update_subsidy_status(
    subsidy_id: str,
    status: str,
    approved_amount: Optional[float] = None,
    received_amount: Optional[float] = None,
    current_user: User = Depends(get_current_user)
):
    update_data = {"status": status}
    
    if status == "approved" and approved_amount is not None:
        update_data["approved_amount"] = approved_amount
        update_data["approval_date"] = datetime.now(timezone.utc).isoformat()
    
    if status == "received" and received_amount is not None:
        update_data["received_amount"] = received_amount
        update_data["received_date"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.subsidy_tracking.update_one(
        {"id": subsidy_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subsidy record not found")
    return {"message": "Subsidy updated successfully"}

# SOLAR DASHBOARD & REPORTS
@api_router.get("/solar/dashboard")
async def get_solar_dashboard(current_user: User = Depends(get_current_user)):
    if not current_user.business_id:
        return {}
    
    business_id = current_user.business_id
    
    # Total projects
    total_projects = await db.solar_projects.count_documents({"business_id": business_id})
    
    # Projects by status
    all_projects = await db.solar_projects.find({"business_id": business_id}, {"_id": 0}).to_list(1000)
    
    status_counts = {}
    total_capacity = 0
    total_revenue = 0
    total_subsidy = 0
    
    for proj in all_projects:
        status = proj.get('installation_status', 'planning')
        status_counts[status] = status_counts.get(status, 0) + 1
        total_capacity += proj.get('system_capacity_kw', 0)
        total_revenue += proj.get('estimated_cost', 0)
        total_subsidy += proj.get('subsidy_amount', 0)
    
    # Pending subsidies
    pending_subsidies = await db.subsidy_tracking.find(
        {"status": "pending"},
        {"_id": 0}
    ).to_list(100)
    
    return {
        "total_projects": total_projects,
        "projects_by_status": status_counts,
        "total_capacity_kw": total_capacity,
        "total_estimated_revenue": total_revenue,
        "total_subsidy_amount": total_subsidy,
        "pending_subsidies_count": len(pending_subsidies),
        "recent_projects": all_projects[:5]
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
