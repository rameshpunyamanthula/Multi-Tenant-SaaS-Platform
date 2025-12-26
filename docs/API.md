# API Documentation – Multi-Tenant SaaS Platform

Base URL (Docker):
http://localhost:5000/api

All APIs follow a consistent response format:
json
Copy code
{
  "success": true,
  "message": "optional",
  "data": {}
}
Authentication is done using JWT tokens.
Pass the token in request headers:

makefile
Copy code
Authorization: Bearer <JWT_TOKEN>
🔐 AUTHENTICATION APIs
API-1: Register Tenant
POST /auth/register-tenant
Auth: ❌ Public

Request

json
Copy code
{
  "tenantName": "Test Company",
  "subdomain": "testcompany",
  "adminEmail": "admin@test.com",
  "adminPassword": "Test@123",
  "adminFullName": "Test Admin"
}
Response

json
Copy code
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "uuid",
    "subdomain": "testcompany"
  }
}
API-2: Login
POST /auth/login
Auth: ❌ Public

Request

json
Copy code
{
  "email": "admin@demo.com",
  "password": "Demo@123",
  "tenantSubdomain": "demo"
}
Response

json
Copy code
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@demo.com",
      "role": "tenant_admin",
      "tenantId": "uuid"
    },
    "token": "jwt-token",
    "expiresIn": 86400
  }
}
API-3: Get Current User
GET /auth/me
Auth: ✅ Required

Response

json
Copy code
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@demo.com",
    "role": "tenant_admin",
    "tenant": {
      "name": "Demo Company",
      "subscriptionPlan": "pro"
    }
  }
}
API-4: Logout
POST /auth/logout
Auth: ✅ Required

Response

json
Copy code
{
  "success": true,
  "message": "Logged out successfully"
}
🏢 TENANT MANAGEMENT APIs
API-5: Get Tenant Details
GET /tenants/:tenantId
Auth: ✅ Required
Role: tenant_admin / super_admin

API-6: Update Tenant
PUT /tenants/:tenantId
Auth: ✅ Required
Role: tenant_admin (limited) / super_admin

API-7: List All Tenants
GET /tenants
Auth: ✅ Required
Role: super_admin only

👤 USER MANAGEMENT APIs
API-8: Add User
POST /tenants/:tenantId/users
Auth: ✅ Required
Role: tenant_admin

API-9: List Users
GET /tenants/:tenantId/users
Auth: ✅ Required

API-10: Update User
PUT /users/:userId
Auth: ✅ Required
Role: tenant_admin or self

API-11: Delete User
DELETE /users/:userId
Auth: ✅ Required
Role: tenant_admin

📁 PROJECT MANAGEMENT APIs
API-12: Create Project
POST /projects
Auth: ✅ Required

API-13: List Projects
GET /projects
Auth: ✅ Required

API-14: Update Project
PUT /projects/:projectId
Auth: ✅ Required
Role: tenant_admin or creator

API-15: Delete Project
DELETE /projects/:projectId
Auth: ✅ Required
Role: tenant_admin or creator

📝 TASK MANAGEMENT APIs
API-16: Create Task
POST /projects/:projectId/tasks
Auth: ✅ Required

API-17: List Project Tasks
GET /projects/:projectId/tasks
Auth: ✅ Required

API-18: Update Task Status
PATCH /tasks/:taskId/status
Auth: ✅ Required

Request

json
Copy code
{
  "status": "completed"
}
API-19: Update Task
PUT /tasks/:taskId
Auth: ✅ Required

🔎 AUTHORIZATION RULES SUMMARY
Role	Access
super_admin	All tenants, system-wide
tenant_admin	Full access within own tenant
user	Limited access within own tenant

Tenant isolation is enforced using tenantId from JWT.
Client-provided tenant IDs are never trusted.

🩺 HEALTH CHECK API
Health Check

GET /health
Auth: ❌ Public

Response

{
  "status": "ok",
  "database": "connected"
}