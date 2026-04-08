# ClanCarAuction

Монорепозиторий платформы учета автомобилей с пробегом и аукционных процессов.

## Содержание
- [Что внутри](#что-внутри)
- [Технологии](#технологии)
- [Требования](#требования)
- [Быстрый старт](#быстрый-старт)
- [Переменные окружения](#переменные-окружения)
- [Команды](#команды)
- [Локальные URL](#локальные-url)
- [Структура репозитория](#структура-репозитория)
- [Рабочий процесс API](#рабочий-процесс-api)

## Что внутри
- `apps/frontend` — Next.js 15 + React 19 (рабочий интерфейс)
- `apps/backend` — NestJS + Prisma (API и инфраструктурные модули)
- `packages/api-client` — генерируемый API-клиент из OpenAPI-схемы backend
- `infra/docker` — локальная инфраструктура (`PostgreSQL`, `Redis`, `MinIO`, `Prisma Studio`)

## Технологии
### Frontend
- Next.js 15 (App Router)
- React 19
- Zustand
- SCSS Modules
- Hugeicons

### Backend
- NestJS 10
- Prisma
- PostgreSQL
- Redis
- S3-compatible storage (MinIO локально)
- Swagger/OpenAPI

### Workspace
- pnpm workspaces
- Turborepo

## Требования
- Node.js `24.12.0` (см. `.nvmrc`)
- pnpm `10.26.1` (см. `packageManager` в корневом `package.json`)
- Docker + Docker Compose

## Быстрый старт
1. Установите зависимости:

```bash
pnpm install
```

2. Подготовьте env-файлы:

```bash
cp apps/backend/.env.example apps/backend/.env
cp infra/docker/.env.example infra/docker/.env
```

3. Поднимите инфраструктуру:

```bash
pnpm dev:infra
```

4. (Опционально) пересоберите OpenAPI и API-клиент:

```bash
pnpm openapi:export
pnpm generate:api
```

5. Запустите приложения:

```bash
pnpm dev
```

## Переменные окружения
Ниже шаблоны, которые можно использовать как основу.

### `apps/backend/.env`
```env
NODE_ENV=development
PORT=8000
API_PREFIX=api

DATABASE_URL=postgresql://clancar:clancar@localhost:5432/clancar
REDIS_URL=redis://localhost:6380

S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minio
S3_SECRET_KEY=miniosecret
S3_BUCKET=clancar-dev
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_BASE_URL=http://localhost:9000/clancar-dev
```

### `infra/docker/.env`
```env
POSTGRES_USER=clancar
POSTGRES_PASSWORD=clancar
POSTGRES_DB=clancar
POSTGRES_PORT=5432

REDIS_PORT=6380

MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=miniosecret
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001

PRISMA_STUDIO_PORT=5555

DATABASE_URL=postgresql://clancar:clancar@localhost:5432/clancar?schema=public
REDIS_URL=redis://localhost:6380

S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minio
S3_SECRET_KEY=miniosecret
S3_BUCKET=clancar-dev
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_BASE_URL=http://localhost:9000/clancar-dev

API_PREFIX=api
PORT=3001
```

## Команды
### Корень
```bash
pnpm dev
pnpm dev:stop
pnpm dev:stop:all
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm dev:infra
pnpm dev:infra:down
pnpm openapi:export
pnpm generate:api
```

### Frontend
```bash
pnpm --filter @clancar/frontend dev
pnpm --filter @clancar/frontend build
pnpm --filter @clancar/frontend start
pnpm --filter @clancar/frontend lint
pnpm --filter @clancar/frontend typecheck
```

### Backend
```bash
pnpm --filter @clancar/backend dev
pnpm --filter @clancar/backend build
pnpm --filter @clancar/backend start
pnpm --filter @clancar/backend lint
pnpm --filter @clancar/backend typecheck
pnpm --filter @clancar/backend test
pnpm --filter @clancar/backend openapi:export
```

### API Client
```bash
pnpm --filter @clancar/api-client generate
pnpm --filter @clancar/api-client build
pnpm --filter @clancar/api-client typecheck
```

## Локальные URL
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`
- Swagger UI: `http://localhost:8000/api/docs`
- OpenAPI JSON: `http://localhost:8000/api/openapi.json`
- Health: `http://localhost:8000/api/health`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`
- Prisma Studio: `http://localhost:5555`

## Структура репозитория
```text
.
├── apps
│   ├── backend
│   └── frontend
├── infra
│   └── docker
├── packages
│   └── api-client
├── scripts
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

## Рабочий процесс API
При изменениях backend API:
1. Обновите backend-контракты.
2. Экспортируйте OpenAPI:
   ```bash
   pnpm openapi:export
   ```
3. Перегенерируйте shared клиент:
   ```bash
   pnpm generate:api
   ```
