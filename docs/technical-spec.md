# Technical Specification

## 1. Overview

This document describes the technical structure and organization of the Multi-Tenant SaaS Platform – Project & Task Management System. It outlines the folder structure for both backend and frontend applications and explains the purpose of each major component. This structure is designed to support scalability, maintainability, and clear separation of concerns.
---
## 2. Backend Project Structure

The backend is implemented as a RESTful API using Node.js and Express. The folder structure follows a modular approach to keep the codebase clean and maintainable.


backend/
├── src/
│ ├── controllers/
│ ├── routes/
│ ├── models/
│ ├── middleware/
│ ├── services/
│ ├── utils/
│ ├── config/
│ ├── app.js
│ └── server.js
├── migrations/
├── seeders/
├── tests/
├── Dockerfile
├── package.json
└── .env

### Folder Descriptions

- **controllers/**  
  Contains request-handling logic for API endpoints. Controllers receive requests from routes, interact with services or models, and return formatted responses.

- **routes/**  
  Defines API routes and maps them to controller functions. Routes are organized by modules such as authentication, tenants, users, projects, and tasks.

- **models/**  
  Contains database models that represent tables such as tenants, users, projects, tasks, and audit_logs. These models define relationships and constraints.

- **middleware/**  
  Holds reusable middleware functions such as JWT authentication, role-based access control, tenant validation, and error handling.

- **services/**  
  Contains business logic that is independent of request/response handling. This layer helps keep controllers thin and improves testability.

- **utils/**  
  Utility functions such as password hashing, token generation, response formatting, and helper methods.

- **config/**  
  Configuration files for database connections, environment variables, and application settings.

- **app.js**  
  Initializes the Express application, applies middleware, and registers routes.

- **server.js**  
  Entry point for starting the backend server.

- **migrations/**  
  Database migration files used to create and modify database schema automatically on startup.

- **seeders/**  
  Contains seed scripts for inserting initial data such as super admin, tenants, users, projects, and tasks.

- **tests/**  
  Automated tests for API endpoints and core logic.

- **Dockerfile**  
  Defines the Docker image for the backend service.

---

## 3. Frontend Project Structure

The frontend is built using React and follows a component-based architecture to support reusable UI elements and role-based rendering.

frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── routes/
│ ├── services/
│ ├── hooks/
│ ├── utils/
│ ├── styles/
│ ├── App.js
│ └── index.js
├── public/
├── Dockerfile
├── package.json
└── .env


### Folder Descriptions

- **components/**  
  Reusable UI components such as buttons, forms, navigation bars, and cards.

- **pages/**  
  Page-level components representing screens such as Login, Registration, Dashboard, Projects List, Project Details, and Users List.

- **routes/**  
  Defines application routes and protected routes based on authentication and user roles.

- **services/**  
  Handles API communication with the backend, including authentication requests and data fetching.

- **hooks/**  
  Custom React hooks for authentication state, role checks, and reusable logic.

- **utils/**  
  Helper functions for token management, role checks, and common utilities.

- **styles/**  
  Contains global styles and theme-related files for consistent UI design.

- **App.js**  
  Root component that defines routing and layout structure.

- **index.js**  
  Entry point that renders the React application.

- **public/**  
  Static assets such as images and icons.

- **Dockerfile**  
  Defines the Docker image for the frontend service.

---
## 2. Development Setup Guide

This section explains how to set up and run the application in a development environment.

### 2.1 Prerequisites

- Node.js v18 or higher
- Docker and Docker Compose
- Git
- A modern web browser (Chrome, Firefox)

---

### 2.2 Environment Variables

Environment variables are required for configuring the backend and frontend services. All variables are provided using `.env` files or directly through Docker Compose.

**Backend (.env example):**
- DATABASE_URL
- JWT_SECRET
- PORT

**Frontend (.env example):**
- REACT_APP_API_URL

Only development or test values are used to ensure evaluation safety.

---

### 2.3 Installation Steps

1. Clone the GitHub repository:
   ```bash
   git clone https://github.com/pavanisri-hub/multi-tenant-saas-platform.git

2.4 How to Run the Application Locally

The entire application can be started using Docker Compose with a single command:

docker-compose up -d


This command starts:

PostgreSQL database

Backend API server

Frontend application

Database migrations and seed data are executed automatically during startup.

2.5 How to Run Tests

Backend tests can be executed using:

npm test


Tests validate API functionality, authentication, and authorization logic.

3. Conclusion

This technical specification provides a clear project structure and development setup guide that ensures consistency, scalability, and ease of deployment. The defined structure supports secure multi-tenancy and aligns with best practices for production-ready SaaS applications.


