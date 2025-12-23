## 2. Database Architecture and Schema Design

The database architecture is designed to support a multi-tenant SaaS environment with strict data isolation, referential integrity, and scalability. A relational database model is used to clearly define relationships between tenants, users, projects, and tasks while enforcing constraints at the database level.

The system follows a **shared database with shared schema** approach. All tenant-specific data is stored in common tables, and tenant isolation is achieved through the use of a `tenant_id` column in all relevant tables.

---

### 2.1 Tenants Table

The `tenants` table stores information about each organization registered on the platform. Each tenant represents a logically isolated organization within the system.

Key characteristics:
- Each tenant has a unique identifier.
- A unique subdomain is associated with every tenant and is used during login.
- Subscription-related fields define usage limits for users and projects.
- Tenant status determines whether the tenant is active or suspended.

This table acts as the root entity for all tenant-scoped data in the system.

---

### 2.2 Users Table

The `users` table stores all user accounts in the system, including super admins, tenant admins, and regular users.

Key characteristics:
- Users are associated with tenants using a `tenant_id` foreign key.
- Super admin users are a special case and have `tenant_id` set to NULL.
- Email addresses are unique per tenant, enforced using a composite unique constraint.
- User roles determine authorization and access control across the platform.

The users table is central to authentication, authorization, and audit tracking.

---

### 2.3 Projects Table

The `projects` table stores projects created within a tenant. Each project belongs to exactly one tenant and is created by a specific user.

Key characteristics:
- Each project includes a `tenant_id` to enforce tenant-level isolation.
- A foreign key links the project to the user who created it.
- Project status indicates whether the project is active, archived, or completed.

Projects act as containers for tasks and provide structure for organizing work within a tenant.

---

### 2.4 Tasks Table

The `tasks` table stores individual tasks associated with projects. Tasks represent the smallest unit of work in the system.

Key characteristics:
- Each task belongs to a specific project and tenant.
- Tasks include status, priority, assignment, and due date attributes.
- The assigned user must belong to the same tenant as the task and project.
- Tenant isolation is enforced by deriving the `tenant_id` from the associated project.

This design ensures strong data consistency and prevents cross-tenant task creation or assignment.

---

### 2.5 Audit Logs Table

The `audit_logs` table records all critical actions performed within the system for security and traceability purposes.

Key characteristics:
- Audit logs capture actions such as user creation, updates, deletions, and authentication events.
- Each log entry records the tenant context, acting user, affected entity, and timestamp.
- Audit logs are immutable and used for monitoring and investigation.

This table is essential for compliance, debugging, and security audits.

---

### 2.6 Relationships and Data Integrity

The database schema enforces relationships using foreign key constraints with cascading behavior where appropriate. When a tenant is deleted, all associated users, projects, and tasks are automatically removed. Similarly, when a project is deleted, its associated tasks are removed.

Indexes are applied to `tenant_id` columns to optimize query performance, especially for tenant-scoped data retrieval. Composite indexes are used where necessary to support efficient filtering and searching.

---

### 2.7 Entity Relationship Diagram (ERD)

The Entity Relationship Diagram (ERD) visually represents the relationships between tenants, users, projects, tasks, and audit logs. It highlights primary keys, foreign keys, and tenant identifiers used for isolation.

The ERD diagram will be included as an image file at:

## 3. API Architecture

The backend exposes a set of RESTful API endpoints that enable authentication, tenant management, user management, project management, and task management. All APIs follow a consistent response structure and enforce authentication, authorization, and tenant isolation rules at the middleware level.

Public endpoints are limited to tenant registration and user login. All other endpoints require a valid JWT token and appropriate role-based authorization.

---

### 3.1 Authentication APIs

| Method | Endpoint | Authentication | Role |
|------|----------|----------------|------|
| POST | /api/auth/register-tenant | No | Public |
| POST | /api/auth/login | No | Public |
| GET | /api/auth/me | Yes | All authenticated users |
| POST | /api/auth/logout | Yes | All authenticated users |

---

### 3.2 Tenant Management APIs

| Method | Endpoint | Authentication | Role |
|------|----------|----------------|------|
| GET | /api/tenants/:tenantId | Yes | Tenant Admin, Super Admin |
| PUT | /api/tenants/:tenantId | Yes | Tenant Admin (limited), Super Admin |
| GET | /api/tenants | Yes | Super Admin only |

---

### 3.3 User Management APIs

| Method | Endpoint | Authentication | Role |
|------|----------|----------------|------|
| POST | /api/tenants/:tenantId/users | Yes | Tenant Admin |
| GET | /api/tenants/:tenantId/users | Yes | Tenant Users |
| PUT | /api/users/:userId | Yes | Tenant Admin, Self |
| DELETE | /api/users/:userId | Yes | Tenant Admin |

---

### 3.4 Project Management APIs

| Method | Endpoint | Authentication | Role |
|------|----------|----------------|------|
| POST | /api/projects | Yes | Tenant Users |
| GET | /api/projects | Yes | Tenant Users |
| PUT | /api/projects/:projectId | Yes | Tenant Admin, Project Creator |
| DELETE | /api/projects/:projectId | Yes | Tenant Admin, Project Creator |

---

### 3.5 Task Management APIs

| Method | Endpoint | Authentication | Role |
|------|----------|----------------|------|
| POST | /api/projects/:projectId/tasks | Yes | Tenant Users |
| GET | /api/projects/:projectId/tasks | Yes | Tenant Users |
| PATCH | /api/tasks/:taskId/status | Yes | Tenant Users |
| PUT | /api/tasks/:taskId | Yes | Tenant Users |

---

### 3.6 Health Check API

| Method | Endpoint | Authentication | Role |
|------|----------|----------------|------|
| GET | /api/health | No | Public |

The health check endpoint is used by Docker and evaluation scripts to verify that the backend service is running correctly and that the database connection is established.

---
