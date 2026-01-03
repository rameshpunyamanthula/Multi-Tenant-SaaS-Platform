# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
Authorization: Bearer <jwt-token>

---

## 📑 Endpoints Summary

**Total: 19 API Endpoints**

1. Authentication APIs (4 endpoints)
2. Tenant APIs (1 endpoint)
3. User APIs (4 endpoints)
4. Project APIs (5 endpoints)
5. Task APIs (4 endpoints)
6. Health Check (1 endpoint)

---

## 🔐 Authentication APIs

### 1. Register New Tenant
**POST** `/auth/register-tenant`

**Request:**
```json
{
  "tenantName": "Acme Corporation",
  "subdomain": "acme",
  "adminEmail": "admin@acme.com",
  "adminPassword": "SecurePass@123",
  "adminFullName": "John Doe"
}
 Response (201):
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "uuid",
    "subdomain": "acme",
    "adminUser": {
      "id": "uuid",
      "email": "admin@acme.com",
      "fullName": "John Doe",
      "role": "tenant_admin"
    }
  }
}

2. Login
POST /auth/login

Request:
{
  "email": "admin@demo.com",
  "password": "Admin@123",
  "tenantSubdomain": "demo"
}

Note: For super admin, leave tenantSubdomain empty

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@demo.com",
      "fullName": "Demo Admin",
      "role": "tenant_admin",
      "tenantId": "uuid"
    },
    "token": "jwt-token",
    "expiresIn": 86400
  }
}


3. Get Current User
GET /auth/me

Auth Required: Yes

Response (200):

{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@demo.com",
    "fullName": "Demo Admin",
    "role": "tenant_admin",
    "isActive": true,
    "tenant": {
      "id": "uuid",
      "name": "Demo Company",
      "subdomain": "demo",
      "subscriptionPlan": "pro"
    }
  }
}


4. Logout
POST /auth/logout

Auth Required: Yes

Response (200):

{
  "success": true,
  "message": "Logged out successfully"
}

🏢 Tenant APIs
5. List All Tenants
GET /tenants

Auth Required: Yes (Super Admin only)

Query Parameters:

page (optional): Page number

limit (optional): Items per page

status (optional): Filter by status

Response (200):

{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "uuid",
        "name": "Demo Company",
        "subdomain": "demo",
        "status": "active",
        "subscriptionPlan": "pro"
      }
    ],
    "pagination": {
      "page": 1,
      "total": 1
    }
  }
}

👥 User APIs
6. List Users
GET /users

Auth Required: Yes (Tenant Admin)

Query Parameters:

page, limit, role

Response (200):

{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user1@demo.com",
        "fullName": "Demo User One",
        "role": "user",
        "isActive": true
      }
    ]
  }
}


7. Create User
POST /users

Auth Required: Yes (Tenant Admin)

Request:

{
  "email": "newuser@demo.com",
  "password": "SecurePass@123",
  "fullName": "New User",
  "role": "user"
}

Response (201):
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "newuser@demo.com",
    "role": "user"
  }
}

8. Update User
PATCH /users/:userId

Auth Required: Yes (Tenant Admin)

Request:
{
  "fullName": "Updated Name",
  "role": "tenant_admin"
}

Response (200):
{
  "success": true,
  "message": "User updated successfully"
}


9. Deactivate User
DELETE /users/:userId

Auth Required: Yes (Tenant Admin)

Response (200):
{
  "success": true,
  "message": "User deactivated successfully"
}
📁 Project APIs
10. List Projects
GET /projects

Auth Required: Yes

Query Parameters:

page, limit, status

Response (200):
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "name": "Website Redesign",
        "description": "Redesign company website",
        "status": "active"
      }
    ]
  }
}

11. Get Project Details
GET /projects/:projectId

Auth Required: Yes

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Website Redesign",
    "description": "Redesign company website",
    "status": "active",
    "taskCount": 5
  }
}



12. Create Project
POST /projects

Auth Required: Yes (Tenant Admin)

Request:
{
  "name": "Mobile App Development",
  "description": "Build mobile application"
}

Response (201):

{
  "success": true,
  "message": "Project created successfully"
}

13. Update Project
PATCH /projects/:projectId

Auth Required: Yes (Tenant Admin)

Request:
{
  "name": "Updated Project Name",
  "status": "active"
}


Response (200):
{
  "success": true,
  "message": "Project updated successfully"
}


14. Archive Project
DELETE /projects/:projectId

Auth Required: Yes (Tenant Admin)

Response (200):
{
  "success": true,
  "message": "Project archived successfully"
}

✅ Task APIs
15. List Tasks
GET /tasks

Auth Required: Yes

Query Parameters:

page, limit, projectId, status, priority, assignedTo

Response (200):

{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "title": "Create wireframes",
        "status": "todo",
        "priority": "high",
        "assignedTo": {
          "id": "uuid",
          "fullName": "User Name"
        }
      }
    ]
  }
}

16. Create Task
POST /tasks

Auth Required: Yes (Tenant Admin)

Request:
{
  "projectId": "uuid",
  "title": "Implement authentication",
  "description": "Add login functionality",
  "status": "todo",
  "priority": "high",
  "assignedTo": "uuid"
}

Response (201):
{
  "success": true,
  "message": "Task created successfully"
}


17. Update Task
PATCH /tasks/:taskId

Auth Required: Yes

Request:

{
  "status": "in_progress",
  "priority": "medium"
}

Response(200):
{
  "success": true,
  "message": "Task updated successfully"
}


18. Delete Task
DELETE /tasks/:taskId

Auth Required: Yes (Tenant Admin)

Response (200):
{
  "success": true,
  "message": "Task deleted successfully"
}
🏥 Health Check
19. Health Check
GET /health

Auth Required: No

Response (200):
{
  "success": true,
  "message": "System healthy",
  "database": "connected"
}
🔒 Error Responses
All endpoints may return these error codes:

400 Bad Request - Invalid input

401 Unauthorized - Missing or invalid token

403 Forbidden - Insufficient permissions

404 Not Found - Resource not found

409 Conflict - Duplicate resource

500 Internal Server Error - Server error
