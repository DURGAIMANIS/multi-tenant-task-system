# TenantFlow - Multi-Tenant Task Management System

A multi-tenant SaaS task management system where multiple companies can manage their own tasks with strict data isolation and role-based access control.

---

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Passport.js (Google OAuth)
- Docker

---

## Features

- Multi-tenant architecture with dynamic database per company
- Role-based access control (Admin, Manager, Employee)
- JWT authentication with login and registration
- Google OAuth login
- Task management with status, priority, search, pagination
- Team presence tracking (online/offline)
- Audit logging (task and user actions)
- Forgot and reset password
- Docker containerization

---

## Roles and Permissions

| Permission       | Admin | Manager | Employee |
|------------------|-------|---------|----------|
| Create task      | Yes   | Yes     | Yes      |
| View all tasks   | Yes   | Yes     | Yes      |
| Edit any task    | Yes   | Yes     | No       |
| Edit own task    | Yes   | Yes     | Yes      |
| Delete any task  | Yes   | Yes     | No       |
| Delete own task  | Yes   | Yes     | Yes      |
| View team status | Yes   | Yes     | No       |
| View audit logs  | Yes   | No      | No       |

---

## Getting Started

1. Install dependencies
```
npm install
```

2. Configure environment
```
copy .env.example .env
```

3. Run the app
```
npm run dev
```

4. Open browser
```
http://localhost:5000
```

---

## Run with Docker

```
docker-compose up --build
```

---

## API Endpoints

| Method | Endpoint                        | Access        |
|--------|---------------------------------|---------------|
| POST   | /api/auth/company/register      | Public        |
| POST   | /api/auth/login                 | Public        |
| POST   | /api/auth/logout                | Auth          |
| POST   | /api/auth/forgot-password       | Public        |
| POST   | /api/auth/reset-password/:token | Public        |
| GET    | /api/auth/google                | Public        |
| POST   | /api/tasks                      | Auth          |
| GET    | /api/tasks                      | Auth          |
| GET    | /api/tasks/:id                  | Auth          |
| PUT    | /api/tasks/:id                  | Auth + RBAC   |
| DELETE | /api/tasks/:id                  | Auth + RBAC   |
| GET    | /api/users                      | Admin/Manager |
| GET    | /api/users/status               | Admin/Manager |
| GET    | /api/users/me                   | Auth          |
| GET    | /api/logs                       | Admin only    |

---

## Author

DURGAI MANI S
