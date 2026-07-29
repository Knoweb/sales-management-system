# Sales Management System

Internal Workflow and Sales Management System. This project will eventually manage the complete process from client inquiry to project delivery.

## Overview

Currently, this repository is configured for local development and contains the foundational project structure.

### Current Capabilities
- **Backend:** Spring Boot 3 + Java 21 REST API
- **Frontend:** React 19 + TypeScript + Vite SPA
- **Database:** Local PostgreSQL with automatic database creation and Flyway migrations
- **Authentication:** JWT-based stateless Auth with HttpOnly refresh cookies
- **Security:** Role-Based Access Control (RBAC) and permissions
- **User Management:** Admin UI for managing users, statuses, and roles

### Project Structure
- `backend/`: Spring Boot REST API
- `frontend/`: React single-page application

## Local Setup Instructions

### Prerequisites
- Java 21
- Node.js 20+
- PostgreSQL 16+
- Maven (included via Wrapper)

### 1. Database Configuration
1. Ensure your local PostgreSQL server is installed and running.
2. The database is automatically created during backend startup. Manual database creation is no longer required!
3. **Note:** The configured PostgreSQL user (`DB_USERNAME`) needs the `CREATEDB` permission (the default `postgres` superuser has this).
4. Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
5. Update the credentials in `.env` to match your local PostgreSQL setup.

### 2. Backend Setup
1. Open a terminal (e.g. Windows PowerShell) and navigate to the `backend` directory.
2. Provide the environment variables and run the application. (The early initializer will create the database if it doesn't exist, and Flyway will then run schema migrations against it).
   ```powershell
   $env:DB_HOST="localhost"
   $env:DB_PORT="5432"
   $env:DB_NAME="sales_management"
   $env:DB_USERNAME="postgres"
   $env:DB_PASSWORD="your_postgresql_password"
   $env:DB_ADMIN_DATABASE="postgres"

   cd backend
   .\mvnw.cmd spring-boot:run
   ```
   *The backend will be available at `http://localhost:8080`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`. API requests to `/api/*` are automatically proxied to the backend.*

## Phases
- **Phase 1**: Project Foundation and Local Development Setup (Completed)
- **Future Phases**: Authentication, Users, Leads, Projects, and Dashboards.
