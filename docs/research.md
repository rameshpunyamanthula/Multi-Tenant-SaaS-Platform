# Research Document

## 1. Multi-Tenancy Analysis

Multi-tenancy is a core architectural concept in Software as a Service (SaaS) applications, where a single application instance serves multiple organizations (tenants) while ensuring strict data isolation, security, and performance. Choosing the right multi-tenancy approach is critical because it directly impacts scalability, cost, operational complexity, and security. Broadly, multi-tenant systems can be designed using three common approaches: shared database with shared schema, shared database with separate schema, and separate database per tenant. Each approach has its own advantages and trade-offs.

### Shared Database with Shared Schema (Using tenant_id)

In the shared database with shared schema approach, all tenants share the same database and the same set of tables. Tenant data is distinguished using a `tenant_id` column present in every tenant-specific table, such as users, projects, and tasks. Every database query is scoped using this `tenant_id` to ensure that tenants can only access their own data.

This approach is widely used in modern SaaS platforms due to its simplicity and cost efficiency. Since all tenants share the same schema, database migrations and schema updates are straightforward and need to be applied only once. Infrastructure costs are significantly lower because only a single database instance is required regardless of the number of tenants.

However, this approach requires strict discipline at the application layer to enforce data isolation. Every query must include tenant-level filtering, and mistakes in query construction can potentially lead to data leakage between tenants. These risks are mitigated through API-level authorization, centralized query handling, middleware-based tenant validation, and audit logging. When implemented correctly, this approach scales efficiently and is suitable for SaaS platforms with a large number of tenants.

### Shared Database with Separate Schema (Per Tenant)

In the shared database with separate schema approach, all tenants share the same database instance, but each tenant has its own dedicated schema. For example, one tenant’s data may reside in `tenant1.users` and `tenant1.projects`, while another tenant’s data exists in `tenant2.users` and `tenant2.projects`. This provides stronger logical isolation compared to a shared schema approach.

This approach reduces the risk of accidental cross-tenant data access because schemas act as natural boundaries. It also allows limited schema-level customization for tenants if required. However, schema management becomes complex as the number of tenants increases. Database migrations must be applied to every tenant schema, which introduces operational overhead and increases the chances of migration failures. This model is more suitable for applications with a moderate number of tenants.

### Separate Database per Tenant

In the separate database per tenant approach, each tenant is allocated its own independent database. This provides the strongest form of isolation, as tenant data is completely separated at the database level. Security risks due to accidental cross-tenant access are minimal, and per-tenant database tuning and compliance requirements can be handled independently.

Despite its security advantages, this approach introduces significant operational and infrastructure costs. Managing multiple databases requires automated provisioning, monitoring, backups, and migrations. As the number of tenants grows, this model becomes difficult to scale and maintain. It is typically used in enterprise or compliance-heavy systems where strict isolation is mandatory.

### Comparison of Multi-Tenancy Approaches

| Approach | Pros | Cons | Use Cases |
|--------|------|------|----------|
| Shared Database + Shared Schema | Low infrastructure cost, easy migrations, high scalability, simple Docker setup | Requires strict tenant_id enforcement, risk if queries are not scoped properly | Large-scale SaaS platforms |
| Shared Database + Separate Schema | Better logical isolation, reduced accidental data access | Complex schema management, difficult migrations | Medium-scale SaaS applications |
| Separate Database per Tenant | Strongest isolation, high security, per-tenant customization | High cost, operational complexity, difficult to scale | Enterprise or compliance-driven systems |

### Chosen Approach and Justification

For this project, the **Shared Database with Shared Schema (using tenant_id)** approach has been selected.

This approach best aligns with the goal of building a scalable, production-ready multi-tenant SaaS application while keeping infrastructure costs low. It simplifies Docker-based deployment, database migrations, and seed data loading, all of which are mandatory requirements for this task.

Data isolation is enforced at the application and API layers by associating every record with a `tenant_id` and ensuring all database queries are tenant-scoped. Role-based access control further strengthens security by ensuring users can only access resources permitted within their tenant context. The use of audit logging and consistent query validation reduces the risk of cross-tenant data leakage.

Additionally, this approach supports horizontal scalability and is ideal for subscription-based SaaS models where multiple tenants operate under a uniform schema. Considering the evaluation requirements, containerization constraints, and long-term scalability needs, the shared database with shared schema approach provides the best balance between performance, maintainability, cost efficiency, and security.


## 2. Technology Stack Justification

Choosing the right technology stack is a critical aspect of building a production-ready multi-tenant SaaS application. The selected technologies must support scalability, security, maintainability, and seamless containerized deployment. For this project, each layer of the stack has been carefully chosen to align with the functional requirements, Docker constraints, and evaluation criteria.

### Backend Framework

The backend of this application is built using **Node.js with the Express framework**. Node.js is well-suited for building scalable network applications due to its non-blocking, event-driven architecture. Express provides a lightweight and flexible framework for creating RESTful APIs, making it ideal for handling authentication, authorization, and multi-tenant business logic.

Express allows fine-grained control over middleware, which is essential for enforcing tenant isolation, JWT authentication, role-based access control, and audit logging at the API level. Its simplicity also makes it easier to structure the application cleanly and maintain consistent error handling across all 19 API endpoints.

Alternatives such as **Django (Python)** and **Spring Boot (Java)** were considered. While Django offers strong security features and Spring Boot provides enterprise-grade capabilities, both introduce additional complexity and heavier runtime overhead. Node.js with Express was chosen for its balance of performance, simplicity, and strong ecosystem support.

### Frontend Framework

The frontend is built using **React**, a popular JavaScript library for building user interfaces. React’s component-based architecture makes it easy to create reusable UI components and manage complex state, which is essential for role-based UI rendering and protected routes.

React integrates well with modern authentication patterns and works seamlessly with REST APIs secured using JWT. It also supports responsive design practices, ensuring the application works smoothly on both desktop and mobile devices. The extensive React ecosystem provides libraries for routing, form handling, and API communication, which accelerates development.

Alternatives such as **Angular** and **Vue.js** were evaluated. Angular offers a full-fledged framework but comes with a steeper learning curve, while Vue.js is lightweight but has a comparatively smaller enterprise adoption. React was selected due to its wide industry usage, flexibility, and strong community support.

### Database

The application uses **PostgreSQL** as the relational database. PostgreSQL is a powerful, open-source database known for its reliability, ACID compliance, and advanced features such as indexing, foreign key constraints, and transaction management. These features are essential for maintaining data consistency and integrity in a multi-tenant system.

PostgreSQL handles complex queries efficiently and supports indexing on `tenant_id`, which improves query performance for tenant-scoped operations. It also integrates smoothly with Docker and supports automated migrations and seed data loading.

Alternatives such as **MySQL** and **MongoDB** were considered. While MySQL is widely used, PostgreSQL offers more advanced features and better support for complex relational data. MongoDB, being a NoSQL database, was not ideal for enforcing strong relational constraints required in this project.

### Authentication Method

The application uses **JWT (JSON Web Token) based authentication**. JWT enables stateless authentication, which aligns well with RESTful API design and containerized deployments. Tokens carry user identity and role information, allowing the backend to enforce authorization without maintaining server-side sessions.

JWT is particularly suitable for multi-tenant applications because tenant context and user roles can be embedded in the token payload and validated on every request. Tokens are configured with a 24-hour expiry to balance security and usability.

Alternatives such as **session-based authentication** and **OAuth** were considered. Session-based authentication introduces server-side state management, which complicates scaling, while OAuth is more complex than required for this application. JWT provides the right balance of simplicity, security, and scalability.

### Deployment & Containerization

The application is deployed using **Docker and Docker Compose**, which is a mandatory requirement for this task. Docker ensures consistent environments across development and evaluation by packaging the database, backend, and frontend into isolated containers.

Docker Compose allows all three services to be started using a single command, ensuring ease of setup and reproducibility. Fixed service names and ports enable reliable inter-service communication within the Docker network.

Alternatives such as traditional VM-based deployment or cloud-managed services were considered, but Docker was chosen because it guarantees environment consistency and aligns perfectly with the evaluation process.

Overall, this technology stack provides a robust, scalable, and secure foundation for building a production-ready multi-tenant SaaS application while meeting all functional and non-functional requirements of the task.


## 3. Security Considerations

### Key Security Measures in Multi-Tenant Systems
(Write here)

### Data Isolation Strategy
(Write here)

### Authentication & Authorization
(Write here)

### Password Hashing Strategy
(Write here)

### API Security Measures
(Write here)
