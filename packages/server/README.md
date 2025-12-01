# TaskFlow Server

Backend API server for the TaskFlow application - a task management system with user authentication.

## 🚀 Tech Stack

- **Runtime:** Node.js (ES2022+)
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.x
- **Database:** MongoDB (with official driver)
- **Authentication:** [Better Auth](https://better-auth.com) with Expo plugin
- **Logging:** Winston
- **Security:** Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** (Atlas or local instance)

## 📦 Installation

```bash
# Navigate to server package
cd packages/server

# Install dependencies
npm install
```

## ⚙️ Environment Configuration

Create a `.env` file in the server root by copying the example:

```bash
cp .env.example .env
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `3000` |
| `BASE_URL` | Server base URL (used by Better Auth) | `http://localhost:3000` |
| `AUTH_SECRET_USER` | Secret key for user authentication (min 32 chars) | Generate with `openssl rand -base64 32` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,taskflow://` |
| `TRUSTED_ORIGINS` | Comma-separated trusted origins for auth | `http://localhost:5173,taskflow://` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:<PASSWORD>@cluster.mongodb.net` |
| `MONGO_PASSWORD` | MongoDB password (if URI contains `<PASSWORD>`) | Your database password |
| `MONGODB_DB_NAME` | Database name | `TASKFLOW` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_SERVER_SELECTION_TIMEOUT_MS` | Server selection timeout | `30000` |
| `MONGO_CONNECT_TIMEOUT_MS` | Initial connection timeout | `10000` |
| `MONGO_HEARTBEAT_FREQUENCY_MS` | Heartbeat check frequency | `10000` |

## 🏃 Running the Server

### Development Mode

```bash
npm run dev
```

This starts the server with hot-reload using `tsx watch`.

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
server/
├── src/
│   ├── controllers/       # Request handlers
│   │   └── task.controller.ts
│   ├── lib/               # Core libraries
│   │   ├── auth.ts        # Better Auth configuration
│   │   └── db.ts          # MongoDB connection
│   ├── middleware/        # Express middleware
│   │   └── user.middleware.ts
│   ├── models/            # Data models & types
│   │   └── task.model.ts
│   ├── repos/             # Data access layer
│   │   └── task.repo.ts
│   ├── routes/            # API route definitions
│   │   └── v1/
│   │       └── task.routes.ts
│   ├── types/             # TypeScript type definitions
│   │   └── express.d.ts
│   ├── utils/             # Utility functions
│   │   └── logger.ts
│   ├── app.ts             # Express app configuration
│   └── server.ts          # Entry point
├── logs/                  # Log files (production only)
├── .env                   # Environment variables (not committed)
├── .env.example           # Environment template
├── package.json
└── tsconfig.json
```

## 🔌 API Reference

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication Endpoints

Authentication is handled by Better Auth at `/api/v1/user/auth/*`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/user/auth/sign-up/email` | Register new user |
| `POST` | `/user/auth/sign-in/email` | Login with email/password |
| `POST` | `/user/auth/sign-out` | Logout current session |
| `GET` | `/user/auth/session` | Get current session |

### Task Endpoints

All task endpoints require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/user/tasks` | Get all tasks for authenticated user |
| `GET` | `/user/tasks/:id` | Get single task by ID |
| `POST` | `/user/tasks` | Create new task |
| `PUT` | `/user/tasks/:id` | Update existing task |
| `DELETE` | `/user/tasks/:id` | Delete task |
| `GET` | `/user/tasks/stats` | Get task statistics |

### Query Parameters

**GET /user/tasks**

| Parameter | Type | Description |
|-----------|------|-------------|
| `completed` | `boolean` | Filter by completion status |
| `search` | `string` | Search in title and description |

### Request/Response Examples

#### Create Task

```bash
POST /api/v1/user/tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs for the server package"
}
```

**Response (201 Created):**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "user_123",
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs for the server package",
  "completed": false,
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

#### Update Task

```bash
PUT /api/v1/user/tasks/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "completed": true
}
```

#### Get Tasks with Filters

```bash
GET /api/v1/user/tasks?completed=false&search=documentation
```

#### Get Task Statistics

```bash
GET /api/v1/user/tasks/stats
```

**Response:**

```json
{
  "total": 10,
  "active": 7,
  "completed": 3
}
```

### Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing the issue"
}
```

| Status Code | Description |
|-------------|-------------|
| `400` | Bad Request - Invalid input or missing required fields |
| `401` | Unauthorized - Authentication required |
| `404` | Not Found - Resource doesn't exist |
| `500` | Internal Server Error |

### Validation Rules

**Task Title:**
- Required
- Minimum 3 characters
- Maximum 100 characters

**Task Description:**
- Required
- Minimum 10 characters
- Maximum 500 characters

## 🏗️ Architecture

### Design Patterns

**Repository Pattern**
- `task.repo.ts` handles all database operations
- Abstracts MongoDB queries from business logic
- Enables easier testing and database swapping

**Controller Pattern**
- `task.controller.ts` handles HTTP request/response
- Validates input and calls repository methods
- Returns appropriate status codes and responses

**Middleware Pattern**
- `user.middleware.ts` handles authentication
- Attaches user object to request for downstream handlers

### Database Connection

The MongoDB connection (`db.ts`) includes:

- **Automatic Reconnection:** Exponential backoff retry logic
- **Event Monitoring:** Logs connection state changes
- **Graceful Shutdown:** Properly closes connections on SIGTERM/SIGINT
- **Connection Pooling:** Uses MongoDB driver defaults

### Authentication

Better Auth is configured with:

- Email/password authentication
- Session management (7-day expiry)
- Cookie caching for Expo mobile support
- Rate limiting on auth endpoints
- Admin plugin for role-based access

### Logging

Winston logger provides:

- **Development:** Colorized console output with debug level
- **Production:** JSON format with file transport
- Request/response logging middleware
- Error tracking with stack traces

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 🔒 Security Features

- **Helmet:** Sets security HTTP headers
- **CORS:** Configurable origin whitelist
- **Rate Limiting:** 100 requests per 15 minutes on `/api/` routes
- **Input Validation:** Request body validation in controllers
- **Authentication:** Session-based with Better Auth

## 🐳 Docker

The server can be run in Docker using the provided Dockerfile in the `docker/` directory:

```bash
# From project root
cd docker
docker-compose -f docker-compose.dev.yml up server
```

See `docker/README.md` for detailed Docker instructions.

## 🧪 Development Tips

### Path Aliases

TypeScript path aliases are configured for cleaner imports:

```typescript
// Instead of
import { logger } from '../../../utils/logger.js'

// Use
import { logger } from '@/utils/logger.js'
```

### Adding New Endpoints

1. Create model in `src/models/`
2. Create repository in `src/repos/`
3. Create controller in `src/controllers/`
4. Add routes in `src/routes/v1/`
5. Register routes in `src/app.ts`

### Database Indexes

Indexes are automatically created on server startup via `taskRepo.createIndexes()`:

- `userId` - For user-specific queries
- `userId, completed` - For filtered queries
- `userId, createdAt` - For sorted queries

## 📝 License

Private - All rights reserved

---

**Related Packages:**
- [Web Client](../web/README.md) - React web application
- [Mobile App](../mobile/README.md) - Expo React Native app