# Multi-Tenant SaaS Platform

A production-ready, fully containerized multi-tenant SaaS application built with Node.js, React, and PostgreSQL. Features role-based access control, tenant isolation, and automated Docker deployment.

## 🚀 Features

### Core Functionality
- **Multi-Tenancy**: Complete tenant isolation with subdomain-based routing
- **Role-Based Access Control (RBAC)**: Super Admin, Tenant Admin, and User roles
- **Authentication & Authorization**: JWT-based secure authentication
- **Project Management**: Create and manage projects within tenant scope
- **Task Management**: Assign and track tasks across projects
- **Audit Logging**: Track all critical system actions

### Technical Highlights
- **Fully Dockerized**: Single-command deployment with Docker Compose
- **Automatic Database Setup**: Migrations and seed data run automatically
- **Health Monitoring**: Built-in health check endpoints
- **Production-Ready**: Environment-based configuration, CORS, security headers

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

- **Docker**: 20.10 or higher
- **Docker Compose**: 2.0 or higher
- **Node.js**: 20.x (for local development only)
- **Git**: Latest version

## 🎯 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd multi-tenant-saas-platform
2. Start All Services
bash
docker-compose up -d
This single command will:

Start PostgreSQL database

Run database migrations automatically

Load seed data

Start backend API server

Start frontend React application

3. Access the Application
Frontend: http://localhost:3000

Backend API: http://localhost:5000

Health Check: http://localhost:5000/api/health

4. Login with Test Credentials
See Test Credentials section below.

🏗️ Architecture
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT BROWSER │
│ (Multi-Tenant Frontend) │
└────────────────────────────┬────────────────────────────────────┘
│
HTTP/HTTPS (REST API)
│
┌────────────────────────────▼────────────────────────────────────┐
│ API GATEWAY / BACKEND │
│ (Node.js + Express.js) │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Authentication Middleware │ │
│ │ (JWT Validation + Tenant Context) │ │
│ └──────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌──────────────┬───────────┴───────────┬──────────────┐ │
│ │ │ │ │ │
│ ▼ ▼ ▼ ▼ │
│ ┌────┐ ┌────────┐ ┌─────────┐ ┌────────┐ │
│ │Auth│ │Tenants │ │Projects │ │ Tasks │ │
│ │API │ │ API │ │ API │ │ API │ │
│ └────┘ └────────┘ └─────────┘ └────────┘ │
│ │ │ │ │ │
│ │ └───────────┬───────────┘ │ │
│ │ │ │ │
│ ▼ ┌───────────▼───────────┐ ▼ │
│ ┌────┐ │ Users API │ ┌────────┐ │
│ │Audit └───────────┬───────────┘ │ RBAC │ │
│ │Logs│ │ │Check │ │
│ └────┘ │ └────────┘ │
└─────────────────────────────┼──────────────────────────────────┘
│
PostgreSQL Connection
│
┌─────────────────────────────▼────────────────────────────────────┐
│ DATABASE LAYER │
│ (PostgreSQL 16) │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Tenants │ │ Users │ │ Projects │ │ Tasks │ │
│ │ Table │ │ Table │ │ Table │ │ Table │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Audit Logs Table │ │
│ └──────────────────────────────────────────────────────┘ │
│ │
│ 🔒 Row-Level Tenant Isolation via tenant_id Foreign Key │
└──────────────────────────────────────────────────────────────────┘

📦 DOCKER CONTAINERIZATION
┌─────────────────────────────────────────────────────────────────┐
│ Container 1: frontend (React) - Port 3000 │
│ Container 2: backend (Node.js) - Port 5000 │
│ Container 3: database (PostgreSQL) - Port 5432 │
└─────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘


### Multi-Tenancy Implementation

**Tenant Isolation Strategy:**
- Each tenant has a unique `subdomain` (e.g., `demo`, `acme`, `startup`)
- All data tables include `tenant_id` foreign key (except super_admin users)
- Authentication middleware automatically filters all queries by `tenant_id`
- Cross-tenant access is blocked at the database query level

**Request Flow:**
1. User logs in with email + password + tenant subdomain
2. Backend validates credentials and generates JWT with `userId`, `tenantId`, `role`
3. All subsequent API requests include JWT in Authorization header
4. Middleware extracts `tenantId` from JWT and adds to request context
5. All database queries automatically filter by `tenant_id`
6. Super Admin (with `tenant_id = NULL`) can access all tenants


## 🛠️ Technology Stack

### Frontend
- **React**: 18.x
- **React Router**: 6.x
- **Axios**: 1.x
- **CSS3**: Modern styling

### Backend
- **Node.js**: 20.x
- **Express.js**: 4.x
- **PostgreSQL**: 16.x
- **bcryptjs**: 2.x (Password hashing)
- **jsonwebtoken**: 9.x (JWT authentication)
- **pg**: 8.x (PostgreSQL client)

### DevOps & Deployment
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Multi-stage builds** for optimization

### Development Tools
- **Git**: Version control
- **VS Code**: Recommended IDE


📁 Project Structure

multi-tenant-saas-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database connection
│   │   ├── controllers/
│   │   │   ├── authController.js     # Authentication logic
│   │   │   ├── tenantController.js   # Tenant management
│   │   │   ├── userController.js     # User management
│   │   │   ├── projectController.js  # Project management
│   │   │   └── taskController.js     # Task management
│   │   ├── middleware/
│   │   │   └── authMiddleware.js     # JWT verification
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── tenantRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   └── taskRoutes.js
│   │   ├── app.js                    # Express app setup
│   │   └── server.js                 # Server entry point
│   ├── migrations/                   # SQL migration files
│   │   ├── 001_create_tenants.sql
│   │   ├── 002_create_users.sql
│   │   ├── 003_create_projects.sql
│   │   ├── 004_create_tasks.sql
│   │   └── 005_create_audit_logs.sql
│   ├── seeds/
│   │   └── seed_data.sql             # Initial seed data
│   ├── scripts/
│   │   └── init-db.sh                # Database initialization script
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Tasks.jsx
│   │   │   └── Users.jsx
│   │   ├── services/
│   │   │   └── api.js                # API client
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml                # Multi-container orchestration
├── submission.json                   # Test credentials & metadata
└── README.md                         # This file
## 🔌 API Documentation

Complete API documentation is available in [docs/API.md](./docs/API.md)

**Quick Reference:**
- 19 RESTful API endpoints
- Authentication: JWT-based
- 4 Authentication endpoints
- 1 Tenant management endpoint
- 4 User management endpoints
- 5 Project management endpoints
- 4 Task management endpoints
- 1 Health check endpoint

For detailed request/response examples, request bodies, and authentication requirements, see the [full API documentation](./docs/API.md).


Authentication Endpoints
Register New Tenant

POST /api/auth/register-tenant
Content-Type: application/json

{
  "tenantName": "Company Name",
  "subdomain": "company",
  "adminEmail": "admin@company.com",
  "adminPassword": "SecurePass123",
  "adminFullName": "Admin Name"
}

Login

POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@demo.com",
  "password": "Admin@123",
  "tenantSubdomain": "demo"
}
Note: For super admin login, leave tenantSubdomain empty.

Get Current User

GET /api/auth/me
Authorization: Bearer <jwt-token>

Logout

POST /api/auth/logout
Authorization: Bearer <jwt-token>

Tenant Endpoints
GET /api/tenants              # List all tenants (Super Admin only)
User Endpoints
GET /api/users                # List users in tenant
POST /api/users               # Create new user (Admin only)
PATCH /api/users/:id          # Update user (Admin only)
DELETE /api/users/:id         # Deactivate user (Admin only)

Project Endpoints
GET /api/projects             # List projects in tenant
POST /api/projects            # Create new project
GET /api/projects/:id         # Get project details
PATCH /api/projects/:id       # Update project
DELETE /api/projects/:id      # Archive project

Task Endpoints
GET /api/tasks                # List tasks in tenant
POST /api/tasks               # Create new task
PATCH /api/tasks/:id          # Update task
DELETE /api/tasks/:id         # Delete task


Health Check
GET /api/health

Response:
{
  "success": true,
  "message": "System healthy",
  "database": "connected"
}

🗄️ Database Schema
Key Tables
tenants
id (UUID, Primary Key)

name (VARCHAR)

subdomain (VARCHAR, Unique)

status (ENUM: active, suspended, inactive)

subscription_plan (VARCHAR)

max_users (INTEGER)

max_projects (INTEGER)

Timestamps

users
id (UUID, Primary Key)

tenant_id (UUID, Foreign Key, NULL for super_admin)

email (VARCHAR, Unique)

password_hash (VARCHAR)

full_name (VARCHAR)

role (ENUM: super_admin, tenant_admin, user)

is_active (BOOLEAN)

Timestamps

projects
id (UUID, Primary Key)

tenant_id (UUID, Foreign Key)

name (VARCHAR)

description (TEXT)

status (ENUM: active, archived)

created_by (UUID, Foreign Key)

Timestamps

tasks
id (UUID, Primary Key)

project_id (UUID, Foreign Key)

tenant_id (UUID, Foreign Key)

title (VARCHAR)

description (TEXT)

status (ENUM: todo, in_progress, completed)

priority (ENUM: low, medium, high)

assigned_to (UUID, Foreign Key)

due_date (DATE, Optional)

Timestamps

audit_logs
id (UUID, Primary Key)

tenant_id (UUID, Foreign Key, Nullable)

user_id (UUID, Foreign Key)

action (VARCHAR)

entity_type (VARCHAR)

entity_id (UUID, Nullable)

ip_address (INET, Nullable)

Timestamps

🧪 Testing
Test Credentials
All passwords are hashed with bcrypt. Default password for seeded users: Admin@123

Super Admin
Email: superadmin@system.com
Password: Admin@123
Tenant Subdomain: (leave empty)

Tenant Admin (Demo Company)
Email: admin@demo.com
Password: Admin@123
Tenant Subdomain: demo

Regular Users (Demo Company)
User 1:
  Email: user1@demo.com
  Password: Admin@123
  Tenant Subdomain: demo

User 2:
  Email: user2@demo.com
  Password: Admin@123
  Tenant Subdomain: demo

Regular Users (Demo Company)
User 1:
  Email: user1@demo.com
  Password: Admin@123
  Tenant Subdomain: demo

User 2:
  Email: user2@demo.com
  Password: Admin@123
  Tenant Subdomain: demo

Manual Testing
1 Health Check:
curl http://localhost:5000/api/health

2. Login Test:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Admin@123",
    "tenantSubdomain": "demo"
  }'

3. Verify All Services :
docker-compose ps

All services should show status "Up".

🚀 Deployment
Current Setup (Docker)
The application runs completely in Docker containers:
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Clean restart (removes database data)
docker-compose down -v
docker-compose up -d
Production Deployment Options
The application is production-ready and can be deployed to:

Backend Options
Render: Node.js service with PostgreSQL addon

Railway: Full-stack deployment with managed PostgreSQL

AWS EC2: Docker-based deployment with RDS PostgreSQL

Heroku: Container registry with Heroku Postgres

Frontend Options
Vercel: Automatic React deployment with HTTPS

Netlify: Static site hosting with CDN

AWS S3 + CloudFront: Static hosting with edge distribution

Database Options
AWS RDS: Managed PostgreSQL with automatic backups

DigitalOcean Managed Databases: Simple PostgreSQL hosting

Supabase: PostgreSQL with built-in features

Production Checklist
 Update JWT_SECRET to a strong random value

 Use managed PostgreSQL service (not Docker)

 Configure HTTPS for both frontend and backend

 Set up environment variables in hosting platform

 Enable database backups

 Configure CORS for production frontend URL

 Set up monitoring and logging

 Configure rate limiting for API endpoints

 Review and update security headers

⚙️ Environment Variables
Backend (.env or docker-compose.yml)
# Database
DB_HOST=database
DB_PORT=5432
DB_NAME=partnr_db
DB_USER=partnr_user
DB_PASSWORD=partnr_pass

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://frontend:3000

Frontend Environment
REACT_APP_API_BASE_URL=http://backend:5000/api

Note: In Docker, use service names (e.g., backend, frontend, database). For local development without Docker, use localhost.

🐛 Troubleshooting
Services won't start
# Check if ports are already in use
docker ps
lsof -i :3000
lsof -i :5000
lsof -i :5432

# Clean restart
docker-compose down -v
docker-compose up -d

Database connection errors
# Check database logs
docker-compose logs database

# Verify database is running
docker-compose exec database psql -U partnr_user -d partnr_db -c "SELECT 1;"
Frontend can't reach backend
    *Verify CORS settings in backend/src/app.js

    *Check REACT_APP_API_BASE_URL environment variable

    *Ensure backend health check returns 200

Login fails
# Check backend logs
docker-compose logs backend

# Verify seed data loaded
docker-compose exec database psql -U partnr_user -d partnr_db -c "SELECT email, role FROM users;"
Migrations don't run
# Check init script logs
docker-compose logs backend | grep -i migration

# Manually run migrations
docker-compose exec backend sh
cd /app
psql postgresql://partnr_user:partnr_pass@database:5432/partnr_db -f migrations/001_create_tenants.sql

## ✨ Key Features

1. **Multi-Tenant Architecture** - Complete tenant isolation with subdomain-based routing
2. **Role-Based Access Control (RBAC)** - Super Admin, Tenant Admin, and User roles with granular permissions
3. **Secure Authentication** - JWT-based authentication with bcrypt password hashing
4. **Tenant Management** - Create and manage multiple isolated tenant organizations
5. **User Management** - Add, update, and deactivate users within tenant scope
6. **Project Management** - Create, update, and archive projects per tenant
7. **Task Management** - Assign and track tasks with priority levels and status updates
8. **Audit Logging** - Comprehensive activity tracking for security and compliance
9. **Automated Docker Deployment** - Single-command deployment with automatic database setup
10. **Health Monitoring** - Built-in health check endpoints for monitoring service status
11. **Data Isolation** - Complete data separation between tenants at the database level
12. **Responsive UI** - Modern, clean interface that works on all devices


📝 License
This project is created as part of the Global Placement Program assignment.

👤 Author
Pavani Sri 

Email: pavanisripamu@gmail.com 
