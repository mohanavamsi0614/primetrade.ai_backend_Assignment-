# TaskFlow – Scalable REST API with JWT Auth & RBAC

A production-ready full-stack application built for the Backend Developer Intern assignment. Features a **Node.js/Express/TypeScript** REST API with JWT authentication, role-based access control, full CRUD, Swagger documentation, and a **React/Vite** frontend.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express.js 4 |
| Language | TypeScript 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Auth | bcryptjs + JWT |
| Validation | Zod |
| API Docs | Swagger UI (OpenAPI 3.0) |
| Logging | Morgan |
| Frontend | React 18 + Vite 5 |
| HTTP Client | Axios |
| Containerisation | Docker + docker-compose |

---

## 📁 Project Structure

```
backend_ass_2.0/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # DB schema (User, Task)
│   ├── src/
│   │   ├── config/               # database.ts, swagger.ts
│   │   ├── controllers/          # auth, task, user
│   │   ├── middleware/           # auth, role, validate, error
│   │   ├── routes/v1/            # auth, task, user routes
│   │   ├── validators/           # Zod schemas
│   │   ├── app.ts                # Express app factory
│   │   └── server.ts             # Entry point
│   ├── Dockerfile
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── context/              # AuthContext.tsx
│   │   ├── lib/                  # api.ts (Axios)
│   │   ├── pages/                # Login, Register, Dashboard, Users
│   │   ├── components/           # ProtectedRoute.tsx
│   │   ├── App.tsx               # Router
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Full design system
│   └── package.json
└── docker-compose.yml
```

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | (see .env.example) |
| `JWT_SECRET` | Secret for signing JWTs | **Change in prod!** |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `FRONTEND_URL` | CORS-allowed origin | `http://localhost:5173` |

---

## 🚀 Local Setup (Without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 16 running locally

### 1. Clone & Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy env
cp .env.example .env
# Edit .env – set your DATABASE_URL

# Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start dev server (hot-reload)
npm run dev
```

API will be available at `http://localhost:5000`
Swagger UI at `http://localhost:5000/api/v1/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend at `http://localhost:5173`

---

## 🐳 Docker Setup (Recommended)

```bash
# From the project root
docker-compose up --build
```

This starts:
- **PostgreSQL** on port `5432`
- **API** on port `5000` (auto-migrates on startup)
- **pgAdmin** on port `5050` (admin@admin.com / admin)

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api/v1`  
**Interactive docs:** [`http://localhost:5000/api/v1/docs`](http://localhost:5000/api/v1/docs)

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register a new user | ❌ |
| POST | `/auth/login` | Login & get JWT | ❌ |
| GET | `/auth/me` | Get current user profile | ✅ |

### Tasks (CRUD)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/tasks` | List tasks (user: own; admin: all) | ✅ | USER/ADMIN |
| POST | `/tasks` | Create a task | ✅ | USER/ADMIN |
| GET | `/tasks/:id` | Get task by ID | ✅ | Owner/ADMIN |
| PUT | `/tasks/:id` | Update task | ✅ | Owner/ADMIN |
| DELETE | `/tasks/:id` | Delete task | ✅ | Owner/ADMIN |

**Query params:** `?page=1&limit=10&status=TODO`

### Users (Admin Only)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/users` | List all users | ✅ | ADMIN |
| DELETE | `/users/:id` | Delete user | ✅ | ADMIN |

### Response Format

All responses follow this shape:
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

---

## 🔒 Security Practices

- **Password hashing**: bcrypt with salt rounds = 12
- **JWT**: Signed with HS256, verified on every protected request. User existence re-verified in DB.
- **Rate limiting**: 100 req / 15 min per IP on all `/api` routes
- **Helmet**: Secure HTTP headers
- **CORS**: Restricted to `FRONTEND_URL` origin
- **Input validation**: All request bodies validated with Zod before hitting controllers
- **Error messages**: Generic messages for auth failures (no user enumeration)

---

## 📈 Scalability Notes

### Horizontal Scaling
- The API is **stateless** (JWT-based auth). Multiple instances can run behind a load balancer (e.g., AWS ALB, NGINX) without shared session state.
- Use **sticky sessions** only if adding WebSocket features.

### Database
- Prisma supports read replicas via connection string configuration.
- Add **indexes** on frequently queried fields: `tasks.userId`, `tasks.status`, `users.email` (already `@unique`).
- For write-heavy workloads, introduce a **CQRS** pattern with separate read/write models.

### Caching (Redis)
- Cache hot routes: `GET /tasks` (short TTL ~30s), user profiles, admin dashboards.
- Invalidate on writes. Library: `ioredis` or `upstash`.

### Microservices Path
If the system grows, split into:
- **Auth Service** – registration, login, token validation
- **Task Service** – CRUD for tasks
- **Notification Service** – email/push on task updates
- Use an **API Gateway** (Kong, AWS API Gateway) to route and enforce auth centrally.

### Logging & Observability
- Replace `morgan` with **Winston** + structured JSON logs
- Ship to **Datadog / ELK Stack** for alerting
- Add **OpenTelemetry** tracing for distributed requests

### Docker / Kubernetes
- Dockerfile uses a **multi-stage build** (builder + slim runner) for minimal image size.
- Ready for Kubernetes deployment – set `NODE_ENV=production`, use Kubernetes Secrets for env vars.

---

## 🧪 Running a Quick API Test

```bash
# 1. Register
curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"Secret123!"}' | jq

# 2. Login → copy the token
curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Secret123!"}' | jq

# 3. Create task (replace TOKEN)
curl -s -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My first task","description":"Hello World","status":"TODO"}' | jq

# 4. List tasks
curl -s http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer TOKEN" | jq
```

---

## 🎨 Frontend Features

- **Register / Login** pages with field-level validation errors from Zod
- **Protected Dashboard** – requires valid JWT (stored in `localStorage`)
- **Task board** – create, edit, delete tasks with status color-coding
- **Stats grid** – total / TODO / in-progress / done counts
- **Search & filter** by title/description and status
- **Pagination** support
- **Admin panel** – Users page (list all users, delete)
- **Auto-logout** on 401 responses via Axios interceptor
- **Dark mode** premium design with Inter font and smooth animations

---

## 📬 Postman Collection

Import `TaskFlow.postman_collection.json` (included in repo root) for pre-configured requests.
#   p r i m e t r a d e . a i _ b a c k e n d _ A s s i g n m e n t -  
 