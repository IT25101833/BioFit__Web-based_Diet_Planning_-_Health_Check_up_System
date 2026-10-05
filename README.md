# BioFit

Full-stack **Health, Fitness, Nutrition & Wellness** SaaS for VitalLife Wellness — academic implementation of a web-based diet planning and health check-up system.

## Architecture

```
React (Vite)  →  REST API  →  Spring Boot  →  SQL Server / H2 (local)
                     ↑
              JWT + RBAC
```

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router |
| Backend | Spring Boot 4, Java 21, Spring Security, JPA |
| Database | SQL Server (production profile) · H2 (default local profile) |
| Auth | JWT access + refresh tokens, BCrypt passwords |

## Project structure

- [`frontend/`](frontend/) — multi-portal React UI (Client, Manager, Coach, Nutrition, Medical, Support, Admin)
- [`backend/`](backend/) — Spring Boot API (`com.biofit.backend`)

## Quick start

### 1. Backend

```bash
cd backend
# Optional: copy application-local.properties from the example and edit secrets
./mvnw spring-boot:run
```

Default profile uses **H2** (file DB) so the API starts without SQL Server.

API base: `http://localhost:8080`

SQL Server profile:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=sqlserver
```

Configure connection in `src/main/resources/application-sqlserver.properties` or env vars (see `.env.example`).

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

| Variable | Meaning |
|----------|---------|
| `VITE_API_URL` | Backend base URL (default `http://localhost:8080`) |
| `VITE_USE_MOCK` | Leave unset or `false`. The app uses the live API. |

## Accounts

The app does not create demo users on startup. Register a client from the sign-up page, or enable local bootstrap only on your machine (`BIOFIT_BOOTSTRAP_ACCOUNTS=true` and `BIOFIT_BOOTSTRAP_PASSWORD` in `backend/.env`). Roles are created by Flyway `V2__seed_roles.sql`.

## Auth API (current)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/users/me`
- `PATCH /api/users/me`

## Client health & dashboard API

- `GET /api/client/dashboard`
- `GET /api/client/health`
- `GET /api/client/health-alerts`
- `POST /api/client/health/metrics`
- `POST /api/client/health/goals`
- `PATCH /api/client/health/goals/{id}`

These endpoints are used by the live app.

Response envelope:

```json
{ "success": true, "data": {}, "error": null }
```

## Development approach

Portals remain available under existing routes and read the live API. Do not hard-code stakeholder personas.

## License

Academic / coursework use.
