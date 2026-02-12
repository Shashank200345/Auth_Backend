# Task Manager - Full Stack Application

A full-stack task management application with JWT authentication, role-based access control (RBAC), and a modern React frontend. Built as a REST API with Express.js and PostgreSQL.

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** PostgreSQL
- **ORM:** Prisma v6
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcryptjs
- **Validation:** Zod v4
- **API Docs:** Swagger (swagger-jsdoc + swagger-ui-express)

### Frontend
- **Library:** React v19
- **Build Tool:** Vite v7
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast

---

## Project Structure

```
backend_assignment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (User, Task models)
│   │   └── migrations/            # Database migration history
│   ├── src/
│   │   ├── app.js                 # Express app entry point
│   │   ├── config/
│   │   │   ├── db.js              # Prisma client instance
│   │   │   └── env.js             # Environment variables
│   │   ├── docs/
│   │   │   └── swagger.js         # Swagger/OpenAPI configuration
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js  # JWT authentication & role checks
│   │   │   ├── error.middleware.js # Global error handler
│   │   │   └── validate.middleware.js # Zod schema validation
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js  # Register & login logic
│   │   │   │   ├── auth.routes.js      # Auth endpoints
│   │   │   │   └── auth.validation.js  # Auth input schemas
│   │   │   └── tasks/
│   │   │       ├── tasks.controller.js # Task CRUD logic
│   │   │       ├── tasks.routes.js     # User task endpoints
│   │   │       ├── tasks.validation.js # Task input schemas
│   │   │       └── admin.routes.js     # Admin-only endpoints
│   │   └── utils/
│   │       ├── AppError.js        # Custom error class
│   │       ├── jwt.js             # Token generation & verification
│   │       └── response.js        # Standardized API responses
│   ├── package.json
│   └── .env                       # Environment variables (not committed)
├── frontend/
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Routes & auth guards
│   │   ├── index.css              # Global styles (dark theme)
│   │   ├── api/
│   │   │   ├── axios.js           # Axios instance with interceptors
│   │   │   ├── auth.js            # Auth API calls
│   │   │   └── tasks.js           # Task API calls
│   │   └── pages/
│   │       ├── Login.jsx          # Login page with quick-fill demo
│   │       ├── Register.jsx       # Register page with role selector
│   │       └── Dashboard.jsx      # Task dashboard with admin view
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Database Schema

### User
| Field     | Type     | Details                    |
|-----------|----------|----------------------------|
| id        | UUID     | Primary key, auto-generated |
| email     | String   | Unique                     |
| password  | String   | Hashed with bcrypt         |
| role      | Enum     | `USER` (default) or `ADMIN` |
| createdAt | DateTime | Auto-generated             |

### Task
| Field       | Type     | Details                             |
|-------------|----------|-------------------------------------|
| id          | UUID     | Primary key, auto-generated          |
| title       | String   | Required                            |
| description | String   | Optional                            |
| status      | Enum     | `TODO` (default), `IN_PROGRESS`, `DONE` |
| userId      | UUID     | Foreign key to User                 |
| createdAt   | DateTime | Auto-generated                      |
| updatedAt   | DateTime | Auto-updated on changes             |

---

## API Endpoints

### Authentication

| Method | Endpoint               | Description          | Auth Required |
|--------|------------------------|----------------------|---------------|
| POST   | `/api/v1/auth/register` | Create a new account | No            |
| POST   | `/api/v1/auth/login`    | Login & get JWT      | No            |

**Register Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "USER"
}
```
- `role` is optional, defaults to `USER`. Set to `ADMIN` for admin access.

**Login Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Auth Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "USER",
      "createdAt": "2026-02-12T..."
    }
  }
}
```

### Tasks (Authenticated - User Scoped)

All task routes require the `Authorization: Bearer <token>` header.

| Method | Endpoint             | Description               | Auth Required |
|--------|----------------------|---------------------------|---------------|
| GET    | `/api/v1/tasks`       | Get your tasks (paginated) | Yes           |
| GET    | `/api/v1/tasks/:id`   | Get a single task by ID    | Yes           |
| POST   | `/api/v1/tasks`       | Create a new task          | Yes           |
| PUT    | `/api/v1/tasks/:id`   | Update your task           | Yes           |
| DELETE | `/api/v1/tasks/:id`   | Delete your task           | Yes           |

**Query Parameters (GET /tasks):**
- `status` - Filter by `TODO`, `IN_PROGRESS`, or `DONE`
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Create Task Body:**
```json
{
  "title": "Complete assignment",
  "description": "Build the REST API",
  "status": "TODO"
}
```
- `description` and `status` are optional.

**Update Task Body (partial update):**
```json
{
  "status": "DONE"
}
```

### Admin (Admin Role Only)

| Method | Endpoint              | Description                  | Auth Required |
|--------|-----------------------|------------------------------|---------------|
| GET    | `/api/v1/admin/tasks`  | Get all tasks from all users | Yes (Admin)   |

Returns tasks with the owner's email attached. Supports the same `status`, `page`, and `limit` query parameters.

### Other

| Method | Endpoint       | Description        |
|--------|----------------|--------------------|
| GET    | `/api/health`  | Health check       |
| GET    | `/api/docs`    | Swagger UI         |

---

## Role-Based Access Control

| Action                  | USER | ADMIN |
|-------------------------|------|-------|
| Register / Login        | Yes  | Yes   |
| Create own tasks        | Yes  | Yes   |
| View own tasks          | Yes  | Yes   |
| Update own tasks        | Yes  | Yes   |
| Delete own tasks        | Yes  | Yes   |
| View all users' tasks   | No   | Yes   |
| Delete any user's task  | No   | Yes   |

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database (local or cloud via [Prisma Data Platform](https://console.prisma.io))

### 1. Clone the repository

```bash
git clone https://github.com/Shashank200345/Auth_Backend.git
cd Auth_Backend
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager"
JWT_SECRET="your-secret-key-here"
PORT=5000
NODE_ENV=development
```

> For cloud PostgreSQL, use the connection string from your provider (e.g. Prisma Data Platform, Supabase, Neon).

Run database migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

Start the backend server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be running at `http://localhost:5173`.

---

## Available Scripts

### Backend

| Script          | Command                  | Description                    |
|-----------------|--------------------------|--------------------------------|
| `npm run dev`   | `nodemon src/app.js`     | Start with auto-reload         |
| `npm start`     | `node src/app.js`        | Start for production           |
| `npm run migrate` | `npx prisma migrate dev` | Run database migrations      |
| `npm run generate` | `npx prisma generate` | Generate Prisma client        |
| `npm run studio` | `npx prisma studio`     | Open Prisma database browser  |

### Frontend

| Script          | Command         | Description              |
|-----------------|-----------------|--------------------------|
| `npm run dev`   | `vite`          | Start dev server         |
| `npm run build` | `vite build`    | Build for production     |
| `npm run preview` | `vite preview` | Preview production build |

---

## Environment Variables

| Variable      | Description                          | Required |
|---------------|--------------------------------------|----------|
| `DATABASE_URL` | PostgreSQL connection string        | Yes      |
| `JWT_SECRET`   | Secret key for signing JWT tokens   | Yes      |
| `PORT`         | Server port (default: 5000)         | No       |
| `NODE_ENV`     | `development` or `production`       | No       |

---

## Security Features

- **Password Hashing** - All passwords are hashed with bcrypt (10 salt rounds) before storage
- **JWT Authentication** - Stateless authentication with 7-day token expiry
- **Input Validation** - All request data validated with Zod schemas; unknown fields are stripped
- **Email Enumeration Prevention** - Login returns the same error for wrong email and wrong password
- **Ownership Checks** - Users can only access and modify their own tasks
- **Role Guards** - Admin endpoints are protected with middleware-level role verification
- **Error Handling** - Prisma errors (duplicate records, not found) are caught and returned as clean API responses; stack traces are hidden in production

---

## Scalability Considerations

This application is designed with scalability in mind:

- **Modular Architecture** - Feature-based folder structure (`modules/auth`, `modules/tasks`) makes it easy to add new modules without touching existing code
- **Middleware Pipeline** - Authentication, validation, and error handling are decoupled from business logic and can be reused across any route
- **Pagination** - All list endpoints support pagination out of the box, preventing unbounded queries
- **Database Indexing** - Prisma auto-creates indexes on primary keys and unique fields; additional indexes can be added in the schema as data grows
- **Stateless Auth** - JWT tokens require no server-side session storage, making horizontal scaling straightforward
- **Environment Config** - All configuration is externalized via environment variables for easy deployment across environments
- **ORM Migrations** - Prisma migrations provide version-controlled schema changes for safe production deployments

---

## License

ISC
