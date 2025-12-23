# Technical Specification
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. Project Structure

The project is organized into clearly separated directories to maintain modularity, readability, and scalability. Each major component of the system has its own dedicated folder, ensuring a clean separation of concerns.

---

### 1.1 Backend Structure

The backend follows a modular, layered architecture designed to support scalability, security, and maintainability.

backend/
├── src/
│ ├── controllers/
│ ├── routes/
│ ├── models/
│ ├── middleware/
│ ├── services/
│ ├── utils/
│ ├── config/
│ └── app.js
│
├── migrations/
├── seeds/
├── Dockerfile
└── .env


**Folder Descriptions:**

- **controllers/**  
  Contains request handler logic for each API endpoint. Controllers process validated input and coordinate with services to perform business operations.

- **routes/**  
  Defines API routes and maps them to corresponding controller functions.

- **models/**  
  Contains database models and schema definitions used to interact with the relational database.

- **middleware/**  
  Includes authentication, authorization, tenant isolation, validation, and error-handling middleware.

- **services/**  
  Encapsulates business logic such as user management, tenant registration, subscription enforcement, and audit logging.

- **utils/**  
  Utility functions including JWT handling, password hashing, and helper methods.

- **config/**  
  Centralized configuration for database connections, environment variables, and application settings.

- **app.js**  
  Entry point of the backend application that initializes middleware, routes, and server configuration.

- **migrations/**  
  Contains database migration scripts executed automatically during startup.

- **seeds/**  
  Contains seed scripts to populate initial data such as super admin, tenants, users, projects, and tasks.

---

### 1.2 Frontend Structure

The frontend is a single-page application built using a component-based architecture to support reusable UI elements and clean routing.

frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── services/
│ ├── routes/
│ ├── context/
│ ├── hooks/
│ ├── styles/
│ └── App.js
│
├── public/
├── Dockerfile
└── package.json


**Folder Descriptions:**

- **components/**  
  Reusable UI components such as navigation bars, forms, modals, and tables.

- **pages/**  
  Page-level components corresponding to application routes such as Login, Dashboard, Projects, and Users.

- **services/**  
  Centralized API service layer for communicating with backend endpoints.

- **routes/**  
  Defines client-side routing and protected route logic.

- **context/**  
  Global state management for authentication and user context.

- **hooks/**  
  Custom React hooks for reusable logic such as API calls and authentication checks.

- **styles/**  
  CSS or styling-related files for layout and responsiveness.

- **App.js**  
  Root component that initializes routing and global providers.

## 2. Development and Setup Guide

This section describes the prerequisites, configuration, and steps required to run the multi-tenant SaaS platform in a local or containerized environment.

---

### 2.1 Prerequisites

The following tools must be installed before running the application:

- Docker (version 20 or higher)
- Docker Compose (version 2 or higher)
- Git
- A modern web browser (Chrome, Firefox, or Edge)

No additional runtime dependencies are required on the host system, as all services are containerized.

---

### 2.2 Environment Variables

The application uses environment variables to manage configuration and sensitive data. These variables are provided through `.env` files or directly via `docker-compose.yml`.

#### Backend Environment Variables

- `DB_HOST` – Database host (use service name `database` in Docker)
- `DB_PORT` – Database port (5432)
- `DB_NAME` – Database name
- `DB_USER` – Database username
- `DB_PASSWORD` – Database password
- `JWT_SECRET` – Secret key used to sign JWT tokens
- `JWT_EXPIRES_IN` – JWT token expiration duration
- `PORT` – Backend server port
- `FRONTEND_URL` – Allowed frontend origin for CORS

#### Frontend Environment Variables

- `REACT_APP_API_URL` – Base URL for backend API requests

All environment variables are documented and included in the repository using development or test values to support automated evaluation.

---

### 2.3 Running the Application with Docker

The application is fully containerized and can be started using Docker Compose. The Docker setup defines three services: database, backend, and frontend. Each service runs in its own container and communicates with others using Docker’s internal network.

The database service initializes the PostgreSQL instance. The backend service automatically runs database migrations and seed scripts during startup. The frontend service serves the user interface and communicates with the backend through the internal service network.

Once started, the services are accessible on fixed ports:
- Database: `5432`
- Backend API: `5000`
- Frontend Application: `3000`

The application is designed to start all services with a single command using Docker Compose, ensuring a consistent and reproducible setup across environments.

---

### 2.4 Health Check and Verification

The backend exposes a health check endpoint used to verify system readiness and database connectivity. This endpoint is accessed by Docker health checks and evaluation scripts to ensure the application is ready for use.

After startup, verification includes:
- Confirming all Docker containers are running
- Accessing the health check endpoint to verify backend and database connectivity
- Opening the frontend application in a browser to confirm UI availability
- Logging in using seeded credentials documented in the submission file

---


