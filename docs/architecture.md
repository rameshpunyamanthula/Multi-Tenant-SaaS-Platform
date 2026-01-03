# Architecture Document

## 1. Introduction

This document describes the system architecture for the Multi-Tenant SaaS Platform – Project & Task Management System. It provides a high-level overview of the system components, their interactions, database design, and API architecture. The architecture is designed to support multi-tenancy, scalability, security, and ease of deployment using containerization.

---

## 2. System Architecture Overview

The application follows a three-tier architecture pattern consisting of:
- **Presentation Layer (Frontend)** - React-based single-page application
- **Application Layer (Backend)** - Node.js/Express REST API
- **Data Layer (Database)** - PostgreSQL relational database

### High-Level Architecture Diagram

┌─────────────────────────────────────────────────────────────────┐
│ CLIENT LAYER │
│ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Browser │ │ Mobile │ │ Tablet │ │
│ │ (Desktop) │ │ Device │ │ Device │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
│ │ │ │ │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
│ │ │
└──────────────────┴──────────────────┘
│
HTTPS / HTTP
│
┌─────────────────────────▼─────────────────────────────────────┐
│ PRESENTATION LAYER │
│ │
│ ┌────────────────────────────┐ │
│ │ React Frontend (SPA) │ │
│ │ - Components & Pages │ │
│ │ - React Router │ │
│ │ - Context API (Auth) │ │
│ │ - Axios (API Client) │ │
│ └────────────┬───────────────┘ │
│ │ │
└───────────────────────────┼────────────────────────────────────┘
│
REST API Calls
(JWT Token)
│
┌───────────────────────────▼────────────────────────────────────┐
│ APPLICATION LAYER │
│ │
│ ┌────────────────────────────┐ │
│ │ Node.js/Express Backend │ │
│ │ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ Authentication │ │ │
│ │ │ Middleware │ │ │
│ │ └──────────────────────┘ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ Authorization │ │ │
│ │ │ Middleware │ │ │
│ │ └──────────────────────┘ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ Tenant Isolation │ │ │
│ │ │ Middleware │ │ │
│ │ └──────────────────────┘ │ │
│ │ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ Controllers │ │ │
│ │ └──────────────────────┘ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ Services │ │ │
│ │ └──────────────────────┘ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ Models/Repository │ │ │
│ │ └──────────┬───────────┘ │ │
│ └─────────────┼─────────────┘ │
│ │ │
└────────────────────────────┼──────────────────────────────────┘
│
SQL Queries
│
┌────────────────────────────▼──────────────────────────────────┐
│ DATA LAYER │
│ │
│ ┌────────────────────────────┐ │
│ │ PostgreSQL Database │ │
│ │ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ tenants │ │ │
│ │ └──────────────────────┘ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ users │ │ │
│ │ └──────────────────────┘ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ projects │ │ │
│ │ └──────────────────────┘ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ tasks │ │ │
│ │ └──────────────────────┘ │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ audit_logs │ │ │
│ │ └──────────────────────┘ │ │
│ └────────────────────────────┘ │
│ │
└───────────────────────────────────────────────────────────────┘

### Component Descriptions

#### **Frontend (React SPA)**
- Single-page application built with React
- Handles user interface and interactions
- Manages client-side routing using React Router
- Stores JWT tokens in localStorage for authentication
- Makes API calls to backend using Axios
- Implements role-based UI rendering

#### **Backend (Node.js/Express API)**
- RESTful API server handling business logic
- Authenticates users using JWT tokens
- Enforces role-based access control
- Implements tenant isolation at the application layer
- Validates inputs and formats responses
- Logs critical actions to audit tables

#### **Database (PostgreSQL)**
- Stores all application data
- Enforces referential integrity through foreign keys
- Uses indexes for query performance optimization
- Provides ACID guarantees for data consistency

---

## 3. Authentication Flow

The authentication flow ensures secure user login and token-based session management.

┌────────────┐ ┌────────────┐
│ │ 1. POST /api/auth/login │ │
│ │ (email, password, subdomain) │ │
│ Client ├──────────────────────────────────►│ Backend │
│ (React) │ │ (Express) │
│ │ │ │
└────────────┘ └──────┬─────┘
▲ │
│ │ 2. Verify tenant exists
│ │ 3. Validate user credentials
│ │ 4. Hash password comparison
│ │
│ ▼
│ ┌─────────────┐
│ │ PostgreSQL │
│ │ Database │
│ └─────────────┘
│ │
│ │
│ 6. Return JWT Token + User Data │ 5. Query users/tenants
│ {token, user, expiresIn} │ tables
│◄─────────────────────────────────────────────────┘
│
│ 7. Store token in localStorage
│
│
│ 8. Include token in subsequent requests
│ Authorization: Bearer <token>
│


**Authentication Steps:**
1. User submits email, password, and tenant subdomain
2. Backend verifies tenant exists and is active
3. Backend validates user belongs to that tenant
4. Backend compares password hash using bcrypt
5. Backend generates JWT token with user ID, tenant ID, and role
6. Backend returns token with 24-hour expiration
7. Frontend stores token in localStorage
8. Frontend includes token in Authorization header for all protected API calls

---

## 4. Authorization and Tenant Isolation

### Role-Based Access Control (RBAC)

The system implements three user roles with different permission levels:

| Role | Permissions |
|------|-------------|
| **super_admin** | - Manage all tenants<br>- View system-wide audit logs<br>- Update subscription plans<br>- Access all API endpoints |
| **tenant_admin** | - Manage users within their tenant<br>- Create/edit/delete projects<br>- Create/edit/delete tasks<br>- View tenant-specific audit logs |
| **user** | - View projects<br>- Create/edit tasks<br>- Update task status<br>- View own profile |

### Tenant Isolation Strategy

Every tenant-specific database record includes a `tenant_id` column. API middleware automatically:
1. Extracts tenant context from JWT token
2. Validates tenant ownership of requested resources
3. Injects tenant_id filter into all database queries
4. Prevents cross-tenant data access

**Example SQL Query Pattern:**
-- Without tenant isolation (UNSAFE)
SELECT * FROM projects WHERE id = ?;

-- With tenant isolation (SAFE)
SELECT * FROM projects WHERE id = ? AND tenant_id = ?;


---

## 5. Database Schema Design

### Entity Relationship Diagram (ERD)

┌─────────────────────────────────────────────────────────────────────┐
│ TENANTS TABLE │
├─────────────────────────────────────────────────────────────────────┤
│ PK: id (UUID) │
│ name (VARCHAR) │
│ subdomain (VARCHAR) [UNIQUE] │
│ status (ENUM: active, suspended, trial) │
│ subscription_plan (ENUM: free, pro, enterprise) │
│ max_users (INTEGER) │
│ max_projects (INTEGER) │
│ created_at, updated_at (TIMESTAMP) │
└────────────────────────────┬────────────────────────────────────────┘
│
│ 1:N
│
┌────────────────────┼────────────────────┐
│ │ │
▼ ▼ ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ USERS TABLE │ │ PROJECTS TABLE │ │ AUDIT_LOGS TABLE │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ PK: id (UUID) │ │ PK: id (UUID) │ │ PK: id (UUID) │
│ FK: tenant_id │ │ FK: tenant_id │ │ FK: tenant_id │
│ email │ │ FK: created_by │ │ FK: user_id │
│ password_hash│ │ name │ │ action │
│ full_name │ │ description │ │ entity_type │
│ role │ │ status │ │ entity_id │
│ is_active │ │ created_at │ │ ip_address │
│ created_at │ │ updated_at │ │ created_at │
│ updated_at │ └────────┬─────────┘ └──────────────────┘
└────────┬─────────┘ │
│ │ 1:N
│ │
│ ▼
│ ┌──────────────────┐
│ │ TASKS TABLE │
│ ├──────────────────┤
│ │ PK: id (UUID) │
│ │ FK: project_id │
│ │ FK: tenant_id │
│ │ FK: assigned_to │─────┐
│ │ title │ │
│ │ description │ │
│ │ status │ │
│ │ priority │ │
│ │ due_date │ │
│ │ created_at │ │
│ │ updated_at │ │
│ └──────────────────┘ │
│ │
└────────────────────────────────────┘
(assigned_to → users.id)


### Table Relationships

1. **Tenants → Users** (1:N)
   - One tenant can have many users
   - Foreign key: `users.tenant_id → tenants.id`
   - Cascade delete: Deleting a tenant removes all associated users

2. **Tenants → Projects** (1:N)
   - One tenant can have many projects
   - Foreign key: `projects.tenant_id → tenants.id`
   - Cascade delete: Deleting a tenant removes all projects

3. **Users → Projects** (1:N) via created_by
   - One user can create many projects
   - Foreign key: `projects.created_by → users.id`
   - Set null on delete: If user is deleted, created_by becomes null

4. **Projects → Tasks** (1:N)
   - One project can have many tasks
   - Foreign key: `tasks.project_id → projects.id`
   - Cascade delete: Deleting a project removes all tasks

5. **Users → Tasks** (1:N) via assigned_to
   - One user can be assigned many tasks
   - Foreign key: `tasks.assigned_to → users.id`
   - Set null on delete: If user is deleted, assigned_to becomes null

6. **Tenants → Audit Logs** (1:N)
   - One tenant generates many audit log entries
   - Foreign key: `audit_logs.tenant_id → tenants.id`

### Key Indexes for Performance

-- Tenant isolation queries
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);

-- Project-task relationship queries
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- User assignment queries
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Unique constraint for subdomain
CREATE UNIQUE INDEX idx_tenants_subdomain ON tenants(subdomain);

-- Composite unique constraint for email per tenant
CREATE UNIQUE INDEX idx_users_tenant_email ON users(tenant_id, email);


---

---

## 6. API Architecture

The backend exposes 19 RESTful API endpoints organized into 5 modules.

### API Endpoint Summary

| Module | Endpoint | Method | Auth Required | Roles Allowed | Description |
|--------|----------|--------|---------------|---------------|-------------|
| **Authentication** | `/api/auth/register-tenant` | POST | No | Public | Register new tenant with admin user |
| | `/api/auth/login` | POST | No | Public | Login with email, password, subdomain |
| | `/api/auth/me` | GET | Yes | All | Get current user profile and tenant info |
| | `/api/auth/logout` | POST | Yes | All | Logout and invalidate session |
| **Tenant Management** | `/api/tenants` | GET | Yes | super_admin | List all tenants with pagination |
| | `/api/tenants/:tenantId` | GET | Yes | super_admin, tenant_admin | Get tenant details with statistics |
| | `/api/tenants/:tenantId` | PUT | Yes | super_admin, tenant_admin | Update tenant information |
| **User Management** | `/api/tenants/:tenantId/users` | POST | Yes | tenant_admin | Create new user in tenant |
| | `/api/tenants/:tenantId/users` | GET | Yes | All (same tenant) | List all users in tenant |
| | `/api/users/:userId` | PUT | Yes | tenant_admin, self | Update user profile or role |
| | `/api/users/:userId` | DELETE | Yes | tenant_admin | Delete user from tenant |
| **Project Management** | `/api/projects` | POST | Yes | All | Create new project |
| | `/api/projects` | GET | Yes | All | List all projects in tenant |
| | `/api/projects/:projectId` | GET | Yes | All (same tenant) | Get project details |
| | `/api/projects/:projectId` | PUT | Yes | tenant_admin, creator | Update project |
| | `/api/projects/:projectId` | DELETE | Yes | tenant_admin, creator | Delete project |
| **Task Management** | `/api/projects/:projectId/tasks` | POST | Yes | All | Create task in project |
| | `/api/projects/:projectId/tasks` | GET | Yes | All (same tenant) | List all tasks in project |
| | `/api/tasks/:taskId` | PUT | Yes | All (same tenant) | Update task details |
| | `/api/tasks/:taskId/status` | PATCH | Yes | All (same tenant) | Update task status only |

### API Request/Response Patterns

All API responses follow a consistent structure:

**Success Response:**
{
"success": true,
"message": "Operation completed successfully",
"data": {
// Response payload
}
}

**Error Response:**
{
"success": false,
"message": "Error description",
"errors": [
{
"field": "email",
"message": "Invalid email format"
}
]
}

### Middleware Chain for Protected Routes

Protected API endpoints execute the following middleware chain:

Request → authMiddleware → roleMiddleware → tenantMiddleware → Controller → Response


1. **authMiddleware**: Validates JWT token and extracts user context
2. **roleMiddleware**: Checks if user has required role for the endpoint
3. **tenantMiddleware**: Validates tenant ownership of resources
4. **Controller**: Executes business logic
5. **Response**: Returns formatted JSON response

---

## 7. Deployment Architecture

The application is containerized using Docker and orchestrated with Docker Compose.

### Docker Compose Architecture

┌─────────────────────────────────────────────────────────────┐
│ Docker Compose Network │
│ │
│ ┌────────────────────┐ ┌────────────────────┐ │
│ │ Frontend Container│ │ Backend Container │ │
│ │ │ │ │ │
│ │ - React App │ │ - Node.js/Express │ │
│ │ - Nginx Server │ │ - Port: 5000 │ │
│ │ - Port: 3000 │ │ │ │
│ │ │ │ Environment: │ │
│ │ Volumes: │ │ - DATABASE_URL │ │
│ │ - Build artifacts │ │ - JWT_SECRET │ │
│ └────────────────────┘ └──────────┬─────────┘ │
│ │ │ │
│ │ │ │
│ │ API Calls │ SQL Queries │
│ │ (http://backend:5000) │ │
│ │ │ │
│ │ ▼ │
│ │ ┌────────────────────┐ │
│ │ │ Database Container │ │
│ │ │ │ │
│ │ │ - PostgreSQL 15 │ │
│ │ │ - Port: 5432 │ │
│ │ │ │ │
│ │ │ Volumes: │ │
│ │ │ - pgdata (persist)│ │
│ │ │ - migrations │ │
│ │ │ - seed data │ │
│ │ └────────────────────┘ │
│ │ │
└───────────┼──────────────────────────────────────────────────┘
│
│ Port Mapping
│ (Host → Container)
│
▼
┌─────────────────┐
│ Host Machine │
│ │
│ localhost:3000 │ → Frontend
│ localhost:5000 │ → Backend API
└─────────────────┘


### Docker Compose Configuration

**Key Configuration Points:**
- All services run in a shared Docker network
- Services communicate using container names as hostnames
- Database data persists using named volumes
- Environment variables configured via `.env` or docker-compose.yml
- Health checks ensure services start in correct order
- Migrations run automatically on backend container startup

### Container Startup Sequence

Database Container Starts
↓

Wait for database to be ready (health check)
↓

Backend Container Starts
↓

Run database migrations
↓

Load seed data
↓

Start Express server
↓

Frontend Container Starts
↓

Build React application
↓

Serve via Nginx
↓

Application Ready


---

## 8. Security Architecture

### Security Layers

┌─────────────────────────────────────────────────────────────┐
│ Security Layer 1: Network │
│ - HTTPS encryption (production) │
│ - CORS policy enforcement │
│ - Rate limiting (optional) │
└───────────────────────────┬─────────────────────────────────┘
│
┌───────────────────────────▼─────────────────────────────────┐
│ Security Layer 2: Authentication │
│ - JWT token validation │
│ - Token expiration (24 hours) │
│ - Secure password hashing (bcrypt) │
└───────────────────────────┬─────────────────────────────────┘
│
┌───────────────────────────▼─────────────────────────────────┐
│ Security Layer 3: Authorization │
│ - Role-based access control │
│ - Tenant ownership validation │
│ - Resource permission checks │
└───────────────────────────┬─────────────────────────────────┘
│
┌───────────────────────────▼─────────────────────────────────┐
│ Security Layer 4: Data Isolation │
│ - Automatic tenant_id filtering │
│ - Query-level tenant validation │
│ - Foreign key constraints │
└───────────────────────────┬─────────────────────────────────┘
│
┌───────────────────────────▼─────────────────────────────────┐
│ Security Layer 5: Audit Logging │
│ - All critical actions logged │
│ - IP address tracking │
│ - Timestamp and user tracking │
└─────────────────────────────────────────────────────────────┘


### Key Security Measures

1. **Password Security**
   - Passwords hashed using bcrypt with 10 salt rounds
   - Never stored or transmitted in plain text
   - Minimum 8 character requirement enforced

2. **Token Security**
   - JWT tokens contain: userId, tenantId, role
   - Tokens expire after 24 hours
   - Tokens validated on every protected request
   - No server-side session storage required

3. **Input Validation**
   - All inputs validated before processing
   - SQL injection prevented through parameterized queries
   - XSS protection through input sanitization

4. **Tenant Isolation**
   - Every query filtered by tenant_id
   - Middleware automatically injects tenant context
   - Cross-tenant access attempts logged and rejected

5. **Audit Trail**
   - Critical actions logged to audit_logs table
   - Includes: action type, entity, user, timestamp, IP
   - Provides forensic evidence for security investigations

---

## 9. Scalability Considerations

### Horizontal Scaling Strategy

The architecture supports horizontal scaling through:

1. **Stateless Backend**
   - JWT-based authentication (no server sessions)
   - Load balancer can distribute requests to any backend instance
   - No sticky sessions required

2. **Database Replication**
   - Read replicas for query-heavy operations
   - Write operations directed to master database
   - Connection pooling for efficient resource usage

3. **Caching Layer** (Future Enhancement)
   - Redis for frequently accessed data
   - Session storage if needed
   - Query result caching

4. **CDN for Frontend** (Future Enhancement)
   - Static assets served via CDN
   - Reduced load on frontend servers
   - Improved global performance

### Performance Optimization

- **Database Indexes**: All foreign keys and tenant_id columns indexed
- **Query Optimization**: Efficient SQL queries with proper joins
- **Pagination**: Large result sets paginated to reduce payload size
- **Lazy Loading**: Frontend components loaded on demand

---

## 10. Conclusion

This architecture document provides a comprehensive overview of the Multi-Tenant SaaS Platform's system design. The architecture prioritizes:

- **Security**: Multi-layered security with JWT authentication, role-based access control, and tenant isolation
- **Scalability**: Stateless design supporting horizontal scaling
- **Maintainability**: Clear separation of concerns with modular code structure
- **Performance**: Optimized database queries and efficient API design
- **Deployability**: Containerized architecture with simple Docker Compose orchestration

The architecture successfully implements a production-ready multi-tenant system that enforces strict data isolation while maintaining high performance and scalability.