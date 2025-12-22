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

## 4. Environment Configuration

Both backend and frontend applications use environment variables for configuration. These variables are defined in `.env` files or directly in the Docker Compose configuration. Only development and test values are used, ensuring security and reproducibility during evaluation.

---

## 5. Conclusion

This technical specification defines a clear and scalable project structure that supports modular development, secure multi-tenancy, and containerized deployment. The separation of concerns between backend and frontend ensures maintainability and aligns with best practices for production-ready SaaS applications.
