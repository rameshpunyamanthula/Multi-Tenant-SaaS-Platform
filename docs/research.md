# Multi-Tenant SaaS Platform – Research Document

## 1. Multi-Tenancy Architecture Analysis

Multi-tenancy is a foundational architectural concept in Software-as-a-Service (SaaS) systems, where a single application instance serves multiple independent organizations, known as tenants. Each tenant represents a separate organization with its own users, projects, and data. Despite sharing the same application and infrastructure, tenants must experience complete isolation, ensuring that their data, configurations, and operations are not accessible to any other tenant.

The primary goal of multi-tenancy architecture is to balance scalability, cost efficiency, maintainability, and security. A well-designed multi-tenant system allows the platform provider to serve many organizations using shared resources while guaranteeing strict data isolation and controlled access. Choosing the correct multi-tenancy approach is critical because it directly impacts database design, application complexity, operational overhead, and long-term scalability.

There are three widely recognized architectural approaches to implementing multi-tenancy in modern SaaS platforms:  
1. Shared Database with Shared Schema  
2. Shared Database with Separate Schema  
3. Separate Database per Tenant  

Each approach has its own advantages, disadvantages, and suitable use cases. The following sections analyze these approaches in detail.

---

### 1.1 Shared Database with Shared Schema

In the shared database with shared schema approach, all tenants use the same database and the same set of tables. Tenant data is differentiated using a `tenant_id` column that exists in every tenant-specific table. This `tenant_id` acts as a logical boundary between tenants, and all database queries must include it as a filtering condition.

This model is one of the most commonly used multi-tenancy patterns, especially for early-stage and mid-scale SaaS applications. It is highly cost-effective because it requires only a single database instance and a single schema, which significantly reduces infrastructure and maintenance costs. Schema migrations are straightforward because changes are applied once and affect all tenants simultaneously.

From a scalability perspective, this approach performs well when combined with proper indexing strategies. Indexing the `tenant_id` column allows the database to efficiently retrieve tenant-specific data even when tables grow large. Modern relational databases such as PostgreSQL are optimized for this pattern and can handle high data volumes when queries are well-structured.

However, this approach places a strong responsibility on the application layer. Data isolation is enforced entirely through application logic, meaning that every query must correctly apply tenant-based filtering. A missing or incorrect `tenant_id` filter could potentially lead to data leakage across tenants. To mitigate this risk, systems typically implement centralized tenant isolation middleware that automatically injects tenant filters into all queries based on the authenticated user's context.

Despite this risk, the shared database with shared schema approach remains the preferred choice for many SaaS platforms due to its simplicity, efficiency, and ease of automation.

---

### 1.2 Shared Database with Separate Schema

In the shared database with separate schema approach, all tenants share the same database instance, but each tenant has its own dedicated database schema. Each schema contains its own set of tables, effectively providing a stronger logical separation between tenants compared to a shared schema model.

This approach improves data isolation because accidental cross-tenant queries are less likely; accessing another tenant’s data would require explicitly querying a different schema. It also allows limited customization per tenant, such as schema-level extensions or tenant-specific optimizations.

However, this model introduces additional complexity in schema management. Every new tenant requires the creation of a new schema, and database migrations must be executed across all existing schemas whenever the application evolves. As the number of tenants grows, managing migrations, backups, and monitoring becomes increasingly complex and error-prone.

From an operational standpoint, this approach is more difficult to automate in containerized environments, especially when tenants are created dynamically at runtime. It also complicates seed data loading and evaluation automation, making it less suitable for environments where reproducibility and simplicity are critical.

---

### 1.3 Separate Database per Tenant

The separate database per tenant approach provides the highest level of data isolation by assigning an independent database instance to each tenant. In this model, tenants do not share any database resources, eliminating the risk of cross-tenant data leakage at the database level.

This approach is commonly used in enterprise-grade systems with strict regulatory or compliance requirements, such as financial or healthcare platforms. It allows complete customization, independent scaling, and isolated backups for each tenant.

Despite its strong isolation guarantees, this model comes with significant drawbacks. Infrastructure costs increase substantially because each tenant requires its own database instance. Operational complexity also increases, as the platform must manage multiple database connections, perform migrations per tenant, and monitor each database individually.

In containerized and evaluation-driven environments, this approach is often impractical. Automated setup, migrations, and seeding become more complex, and the risk of misconfiguration grows as the number of tenants increases.

---

### 1.4 Comparative Analysis of Multi-Tenancy Approaches

| Approach | Advantages | Disadvantages |
|--------|------------|---------------|
| Shared DB + Shared Schema | Cost-effective, simple migrations, easy automation, scalable with indexing | High reliance on application logic for isolation |
| Shared DB + Separate Schema | Better logical isolation, reduced risk of accidental data leaks | Complex migrations, harder automation, schema management overhead |
| Separate Database per Tenant | Strongest isolation, independent scaling, compliance-friendly | High cost, operational complexity, difficult automation |

---

### 1.5 Chosen Approach and Justification

For this project, the **Shared Database with Shared Schema** approach has been selected as the multi-tenancy architecture. This decision aligns with the project’s requirements for scalability, simplicity, and automation. The approach enables efficient use of resources while supporting strict tenant isolation through consistent application-level enforcement.

This model is particularly well-suited for containerized deployments using Docker and Docker Compose, as it simplifies database initialization, migrations, and seed data loading. It also aligns with industry-standard SaaS design practices and provides a clear path for future scaling and optimization.

Tenant isolation in this system will be enforced by ensuring that every tenant-specific table includes a `tenant_id` column and that all database queries are automatically filtered based on the authenticated user’s tenant context. Super admin users will be treated as a special case, with no associated `tenant_id`, allowing them to access system-wide data in a controlled manner.

## 2. Technology Stack Justification

Selecting the right technology stack is critical for building a production-ready multi-tenant SaaS platform. The chosen technologies must support scalability, security, maintainability, and seamless containerization. This project prioritizes proven, industry-standard tools that are well-supported, easy to deploy using Docker, and suitable for both development and automated evaluation environments.

The technology stack has been selected with a focus on simplicity, reliability, and alignment with modern full-stack development practices.

---

### 2.1 Backend Technologies

**Node.js** has been chosen as the backend runtime environment due to its non-blocking, event-driven architecture, which is well-suited for building scalable APIs. Node.js has a mature ecosystem and excellent support for RESTful services, authentication mechanisms, and database integrations. Its fast startup time and lightweight nature also make it ideal for containerized environments.

**Express.js** is used as the backend framework because of its simplicity and flexibility. Express provides a minimalistic structure that allows full control over middleware, routing, and request handling. This is particularly important for implementing custom middleware for authentication, authorization, tenant isolation, and audit logging. Express is widely adopted, well-documented, and easy to reason about during evaluation and code reviews.

Alternative backend frameworks such as NestJS and Django were considered. While NestJS offers a more opinionated structure, Express was selected to maintain simplicity and avoid unnecessary abstraction. Django, although powerful, introduces heavier conventions and is less flexible for fine-grained middleware control in a JavaScript-based full-stack environment.

---

### 2.2 Frontend Technologies

**React.js** has been selected for building the frontend user interface. React’s component-based architecture allows the application to be broken down into reusable, manageable pieces, which is ideal for complex interfaces such as dashboards, project views, and role-based user management pages. React also has strong community support and a rich ecosystem of libraries.

**React Router** is used to manage client-side routing, enabling protected routes and role-based navigation. This allows the application to restrict access to authenticated users and display different UI elements based on user roles such as super admin, tenant admin, and regular users.

**Axios** is chosen for handling API communication between the frontend and backend. Axios provides a clean and consistent API for making HTTP requests and supports request and response interceptors. These interceptors are useful for automatically attaching JWT tokens to requests and handling global error responses such as unauthorized access.

Alternative frontend frameworks such as Angular and Vue.js were considered. React was selected due to its widespread industry adoption, flexibility, and familiarity, which simplifies both development and evaluation.

---

### 2.3 Database Selection

**PostgreSQL** has been chosen as the relational database for this project. PostgreSQL is a robust, open-source database known for its strong support for relational integrity, indexing, and transactional consistency. These features are essential for enforcing foreign key constraints, cascading deletes, and ensuring data consistency in a multi-tenant environment.

PostgreSQL handles complex queries efficiently and supports advanced indexing strategies, which are necessary for optimizing tenant-based queries using `tenant_id`. Its compatibility with Docker and availability as an official Docker image make it ideal for automated database initialization, migrations, and seeding.

Other databases such as MySQL and MongoDB were considered. MySQL offers similar relational features but PostgreSQL provides more advanced capabilities and stricter compliance with SQL standards. MongoDB, being a NoSQL database, was not chosen due to the strong relational nature of the system’s data model.

---

### 2.4 Authentication Strategy

**JSON Web Tokens (JWT)** are used for stateless authentication. JWTs allow the backend to authenticate requests without maintaining server-side session state, which simplifies scalability and container orchestration. Each token contains only essential information such as user ID, tenant ID, and role, ensuring minimal exposure of sensitive data.

JWT-based authentication integrates seamlessly with frontend applications and works well in distributed systems. A fixed token expiry of 24 hours ensures a balance between security and usability. Password hashing is handled separately using a secure hashing algorithm, ensuring credentials are never stored in plain text.

Session-based authentication was considered but ultimately not selected because it introduces additional complexity in distributed and containerized environments. JWT-only authentication aligns better with modern REST API design principles.

---

### 2.5 Deployment and Containerization

**Docker** is used to containerize the database, backend, and frontend services. Containerization ensures consistency across development, testing, and evaluation environments. It also simplifies dependency management and eliminates issues related to environment-specific configurations.

**Docker Compose** is used to orchestrate multiple services with a single command. By defining the database, backend, and frontend services in a single `docker-compose.yml` file, the entire application can be started using `docker-compose up -d`. Fixed port mappings and service naming ensure predictable behavior during automated evaluation.

Alternative deployment approaches such as manual setup or cloud-specific services were intentionally avoided. Docker-based deployment provides a reproducible and evaluator-friendly environment that aligns with the project’s mandatory requirements.


## 3. Security Considerations

Security is a critical concern in any multi-tenant SaaS application because a single vulnerability can potentially expose data across multiple organizations. This project adopts a defense-in-depth approach, combining secure authentication, strict authorization, data isolation mechanisms, and audit logging to minimize risk and ensure tenant-level security.

The security design focuses on preventing unauthorized access, enforcing role-based permissions, protecting sensitive data, and maintaining accountability through detailed activity tracking.

---

### 3.1 Data Isolation Strategy

Data isolation is the most important security requirement in a multi-tenant system. In this platform, isolation is enforced at the application and database query levels using a strict tenant-based access model. Every tenant-specific table includes a `tenant_id` column, which is used to logically separate data between tenants.

The application never trusts client-provided tenant identifiers. Instead, the `tenant_id` is derived exclusively from the authenticated user’s JWT token. This ensures that even if a malicious user attempts to manipulate request parameters, they cannot access data belonging to another tenant.

For super admin users, the `tenant_id` is intentionally set to `NULL`, allowing controlled access across tenants. Authorization middleware ensures that only users with the `super_admin` role can bypass tenant filtering, while all other roles are strictly restricted to their own tenant’s data.

---

### 3.2 Authentication and Authorization

Authentication is implemented using JSON Web Tokens (JWT), providing stateless and secure user verification. Upon successful login, the backend issues a signed JWT containing only essential, non-sensitive claims: user ID, tenant ID, and role. The token is validated on every request to protected endpoints.

Authorization is enforced through role-based access control (RBAC). The system defines three roles: super admin, tenant admin, and regular user. Each API endpoint specifies the minimum required role, and middleware validates whether the authenticated user has sufficient permissions to perform the requested action.

This separation of authentication and authorization ensures that users are not only authenticated but also restricted to actions appropriate to their role and tenant context.

---

### 3.3 Password Security

User passwords are never stored in plain text. The system uses a strong, industry-standard hashing algorithm such as bcrypt to securely hash passwords before storing them in the database. Salting is automatically applied during the hashing process to protect against rainbow table and brute-force attacks.

During login, password verification is performed using a secure comparison function provided by the hashing library. At no point is the original password exposed or reversible. This approach aligns with modern security best practices and ensures that credential data remains protected even in the event of a database breach.

---

### 3.4 API Security Measures

All backend APIs are protected using authentication and authorization middleware, except for explicitly public endpoints such as tenant registration and login. Input validation is enforced on all request payloads to prevent malformed data, injection attacks, and unexpected behavior.

The system uses appropriate HTTP status codes to avoid leaking sensitive information and provides consistent error responses. CORS is configured to allow requests only from the authorized frontend origin, preventing unauthorized cross-origin access.

Sensitive configuration values such as database credentials and JWT secrets are managed using environment variables and are never hard-coded into the application. This approach supports secure configuration management and simplifies deployment across different environments.

---

### 3.5 Audit Logging and Monitoring

Audit logging is implemented to maintain accountability and traceability across the system. All critical actions, including user creation, updates, deletions, project modifications, task changes, and authentication events, are recorded in an `audit_logs` table.

Each audit log entry captures relevant metadata such as tenant ID, user ID, action type, affected entity, and timestamp. This information is essential for security audits, incident investigations, and compliance requirements.

By maintaining a comprehensive audit trail, the system ensures transparency and provides a mechanism to detect and investigate suspicious or unauthorized activities.


