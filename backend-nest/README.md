# Prayukti vLAB — Enterprise Backend

> NestJS + Fastify + PostgreSQL + Redis + BullMQ + Drizzle ORM + Docker

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-red)](https://nestjs.com/)
[![Fastify](https://img.shields.io/badge/Fastify-5-black)](https://fastify.dev/)
[![Redis](https://img.shields.io/badge/Redis-7-red)](https://redis.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

---

## 📦 Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| HTTP Adapter | Fastify 5 |
| Language | TypeScript 5.7 (strict) |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Cache / Pub-Sub | Redis 7 (IORedis) |
| Queue | BullMQ |
| Logging | Pino (pretty dev / JSON prod) |
| Docs | Swagger / OpenAPI |
| Container | Docker + Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 22
- Docker + Docker Compose v2
- `npm` (or `pnpm`)

---

### 1. Clone & Install

```bash
cd backend-nest
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

**Required variables:**
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT` — Redis connection
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — Must be ≥32 chars

### 3. Start Infrastructure (Dev)

```bash
# Start only Postgres + Redis locally
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 4. Run Migrations

```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations to your database
npm run db:migrate

# Or push schema directly (dev only)
npm run db:push
```

### 5. Start Development Server

```bash
npm run start:dev
```

Server starts at **http://localhost:5000/api/v1**

Swagger UI at **http://localhost:5000/api/docs**

---

## 🐳 Docker Commands

### Full Production Stack

```bash
# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f backend

# Stop all services
docker compose down

# Stop and remove volumes (DESTRUCTIVE)
docker compose down -v
```

### Individual Services

```bash
# Only start infrastructure
docker compose up -d postgres redis

# Rebuild backend only
docker compose up --build -d backend

# Check health
docker compose ps
```

### Database Management

```bash
# Access Postgres shell
docker compose exec postgres psql -U prayukti -d prayukti_vlab

# Dump database
docker compose exec postgres pg_dump -U prayukti prayukti_vlab > backup.sql

# Restore database
docker compose exec -T postgres psql -U prayukti prayukti_vlab < backup.sql
```

### Redis Management

```bash
# Redis CLI
docker compose exec redis redis-cli

# Monitor Redis commands in real time
docker compose exec redis redis-cli monitor

# Flush all keys (DESTRUCTIVE)
docker compose exec redis redis-cli flushall
```

---

## 📁 Project Structure

```
src/
├── main.ts                    # Application bootstrap (Fastify, plugins, global middleware)
├── app.module.ts              # Root module
│
├── config/                   # Typed configuration
│   ├── configuration.ts       # Config factories (app, db, redis, jwt, email)
│   ├── config.validation.ts   # Joi validation schema
│   └── index.ts
│
├── redis/                    # Redis infrastructure
│   ├── redis.module.ts        # Global Redis module
│   ├── redis.service.ts       # Full typed Redis API
│   ├── redis.constants.ts     # Namespaces, tokens, TTLs
│   └── index.ts
│
├── bull/                     # BullMQ queue infrastructure
│   ├── bull.module.ts         # Global queue module
│   ├── bull.constants.ts      # Queue names, job defaults
│   ├── queues/                # Producers
│   │   ├── email.producer.ts
│   │   ├── notifications.producer.ts
│   │   ├── ai.producer.ts
│   │   ├── video.producer.ts
│   │   ├── analytics.producer.ts
│   │   └── certificate.producer.ts
│   ├── workers/               # Workers
│   │   ├── email.worker.ts
│   │   ├── notifications.worker.ts
│   │   ├── ai.worker.ts
│   │   ├── video.worker.ts
│   │   ├── analytics.worker.ts
│   │   ├── certificate.worker.ts
│   │   └── workers.module.ts
│   └── index.ts
│
├── database/                 # Database infrastructure
│   ├── database.module.ts     # Global DB module (async Drizzle factory)
│   ├── drizzle/
│   │   ├── schema.ts          # Drizzle schema (users, institutions, subjects, experiments)
│   │   └── drizzle.connection.ts
│   └── index.ts
│
├── common/                   # Shared utilities
│   ├── filters/
│   │   └── global-exception.filter.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts    # Request ID, method, URL, status, duration
│   │   ├── response.interceptor.ts   # Envelope wrapper
│   │   └── timeout.interceptor.ts    # 30s default timeout
│   ├── guards/
│   │   └── roles.guard.ts            # RBAC
│   ├── decorators/
│   │   ├── current-user.decorator.ts # @CurrentUser()
│   │   ├── public.decorator.ts       # @Public()
│   │   ├── roles.decorator.ts        # @Roles()
│   │   └── timeout.decorator.ts      # @Timeout(ms)
│   └── index.ts
│
├── logger/                   # Pino logger
│   ├── app.logger.ts          # NestLoggerService implementation
│   └── logger.module.ts
│
└── health/                   # Health checks
    ├── health.controller.ts   # GET /api/v1/health
    ├── health.service.ts      # Redis + Postgres health probes
    ├── health.types.ts        # Response types
    └── health.module.ts
```

---

## 🔌 API Endpoints

All routes prefixed with `/api/v1`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/health` | System health status | Public |
| GET | `/api/docs` | Swagger UI | Dev only |

---

## 🗃️ Redis Key Namespaces

```
prayukti:auth:otp:{email}          # OTP codes
prayukti:auth:blacklist:{token}    # JWT blacklist
prayukti:session:{userId}          # User sessions
prayukti:cache:subjects            # Subjects cache
prayukti:cache:dashboard           # Dashboard cache
prayukti:cache:experiments         # Experiments cache
prayukti:experiment:{id}           # Individual experiment cache
prayukti:lock:{resource}           # Distributed locks
prayukti:ratelimit:{ip}            # Rate limiting
```

---

## 📬 BullMQ Queues

| Queue | Concurrency | Purpose |
|---|---|---|
| `email` | 5 | Transactional emails, OTP |
| `notifications` | 10 | Push, in-app, SMS |
| `ai` | 3 | Code analysis, AI feedback |
| `video` | 2 | Transcoding, thumbnails |
| `analytics` | 20 | Event tracking |
| `certificate` | 5 | PDF generation, delivery |

**Retry strategy:** Exponential backoff (1s base, 3 attempts)  
**Failed job retention:** 7 days  
**Completed job retention:** 24 hours (max 1000)

---

## 🔐 Security Features

- **Helmet** — Secure HTTP headers
- **Rate Limiting** — 100 req/min per IP (configurable)
- **CORS** — Configurable origins with credentials
- **Request ID** — UUID traced end-to-end
- **Timeout** — 30s default (overridable per route)
- **Input Validation** — class-validator + whitelist
- **RBAC** — Role-based access control guards
- **JWT** — Access token (15m) + Refresh token (7d)
- **Bcrypt** — Password hashing
- **Cookie Security** — Signed cookies via @fastify/cookie

---

## 🏥 Health Check Response

```json
GET /api/v1/health

{
  "status": "ok",
  "backend": "ok",
  "postgres": {
    "status": "ok",
    "latencyMs": 2
  },
  "redis": {
    "status": "ok",
    "latencyMs": 1
  },
  "uptime": "0d 2h 15m 32s",
  "memory": {
    "heapUsedMb": 48.5,
    "heapTotalMb": 72.0,
    "rssMb": 120.4,
    "externalMb": 3.2
  },
  "timestamp": "2026-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## 📊 API Response Envelope

### Success

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": { ... },
  "timestamp": "2026-01-01T00:00:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Error

```json
{
  "success": false,
  "statusCode": 400,
  "error": "BadRequestException",
  "message": "Validation failed",
  "errors": ["email must be a valid email"],
  "path": "/api/v1/auth/login",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 🚢 Production Deployment

### Environment Variables

Ensure all required env vars are set in `.env`:

```bash
NODE_ENV=production
JWT_SECRET=<min-32-char-secret>
JWT_REFRESH_SECRET=<min-32-char-secret>
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_HOST=redis-host
REDIS_PASSWORD=strong-password
CORS_ORIGIN=https://yourdomain.com
```

### Deploy with Docker Compose

```bash
# Pull latest
git pull

# Build and restart
docker compose up --build -d

# Verify health
curl https://yourdomain.com/api/v1/health
```

### Horizontal Scaling

The backend is stateless — scale with multiple replicas behind a load balancer:

```bash
docker compose up --scale backend=3 -d
```

Redis is used for:
- Session storage (all replicas share state)
- Distributed locks (one lock across all instances)
- BullMQ (workers compete fairly across replicas)

---

## 🛠️ Development Workflow

```bash
# Start dev server with hot reload
npm run start:dev

# Type check without building
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format

# Run tests
npm test

# Generate Drizzle migration
npm run db:generate

# Open Drizzle Studio (GUI)
npm run db:studio
```

---

## 📝 Adding a New Feature Module

1. Create directory `src/modules/<feature>/`
2. Create `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`
3. Add the module to `app.module.ts` imports
4. Add Swagger tag in `main.ts`

Example skeleton:

```typescript
// src/modules/subjects/subjects.module.ts
@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
```

---

## 📄 License

MIT © Prayukti Team
