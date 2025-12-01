# TaskFlow

A modern, cross-platform task management application built with React, React Native, and Express.js. TaskFlow provides a seamless experience across web and mobile platforms with real-time synchronization and robust authentication.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo)](https://expo.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)](https://www.mongodb.com/)

## 🎯 Features

- **Cross-Platform** - Web application and native mobile apps (iOS/Android)
- **Modern Authentication** - Secure session-based auth with Better Auth
- **Dark/Light Themes** - System-aware theming with manual toggle
- **Real-Time Sync** - Tasks synchronized across all devices
- **Offline Ready** - Mobile app optimized for connectivity patterns
- **Docker Deployment** - Production-ready containerization

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TaskFlow Platform                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   Web Client    │        │  Mobile Client  │        │   API Server    │
│                 │        │                 │        │                 │
│  React + Vite   │        │  Expo Router    │        │  Express.js     │
│  TailwindCSS    │        │  NativeWind     │        │  Better Auth    │
│  React Router   │        │  Better Auth    │        │  MongoDB        │
│                 │        │                 │        │                 │
│  Port: 5173     │        │  Expo Go App    │        │  Port: 3000     │
└────────┬────────┘        └────────┬────────┘        └────────┬────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  MongoDB Atlas  │
                          │   or Local DB   │
                          └─────────────────┘
```

## 📁 Project Structure

```
todo-app/
├── packages/
│   ├── web/                 # React web application
│   │   ├── src/
│   │   │   ├── components/  # UI component library
│   │   │   ├── contexts/    # React contexts (theme, auth)
│   │   │   ├── features/    # Feature modules
│   │   │   ├── lib/         # API client, auth client
│   │   │   ├── routes/      # React Router configuration
│   │   │   └── styles/      # Global styles and themes
│   │   └── package.json
│   │
│   ├── mobile/              # Expo React Native app
│   │   ├── app/             # Expo Router screens
│   │   ├── components/      # Native UI components
│   │   ├── contexts/        # Theme and auth contexts
│   │   ├── features/        # Feature modules
│   │   ├── lib/             # API and auth clients
│   │   └── package.json
│   │
│   └── server/              # Express.js API server
│       ├── src/
│       │   ├── controllers/ # Request handlers
│       │   ├── lib/         # Auth and DB configuration
│       │   ├── middleware/  # Express middleware
│       │   ├── models/      # Data models
│       │   ├── repos/       # Data access layer
│       │   └── routes/      # API route definitions
│       └── package.json
│
├── docker/                  # Docker deployment
│   ├── nginx/               # Reverse proxy config
│   ├── Dockerfile.server    # Server image
│   ├── Dockerfile.web       # Web image
│   ├── docker-compose.yml   # Production compose
│   └── docker-compose.dev.yml # Development compose
│
└── Makefile                 # Development commands
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22.x or higher
- **npm** 10.x or higher
- **MongoDB** (Atlas account or local instance)
- **Docker** (optional, for containerized deployment)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/todo-app.git
cd todo-app

# Install all dependencies
make install

# Or install individually
make install-web
make install-server
make install-mobile
```

### 2. Configure Environment

```bash
# Set up environment files from templates
make env-setup

# Edit server environment
nano packages/server/.env
```

**Required environment variables** (`packages/server/.env`):

```env
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# Generate with: openssl rand -base64 32
AUTH_SECRET_USER=your-secure-secret-minimum-32-characters

# MongoDB connection
MONGODB_URI=mongodb+srv://user:<PASSWORD>@cluster.mongodb.net
MONGO_PASSWORD=your-password
MONGODB_DB_NAME=taskflow

# CORS origins
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 3. Start Development

```bash
# Start web and server together
make dev

# Or start individually
make dev-server  # API server at http://localhost:3000
make dev-web     # Web app at http://localhost:5173
make dev-mobile  # Expo at exp://localhost:8081
```

## 📱 Mobile Development

### Running the Mobile App

```bash
# Start Expo development server
make dev-mobile

# Run on specific platform
make dev-mobile-ios      # iOS Simulator (macOS only)
make dev-mobile-android  # Android Emulator
make dev-mobile-web      # Web browser
```

### Mobile Configuration

Update `packages/mobile/app.json` with your backend URL:

```json
{
  "expo": {
    "extra": {
      "BETTER_AUTH_BASE_URL": "http://YOUR_LOCAL_IP:3000"
    }
  }
}
```

> **Note:** Use your machine's local IP address (not `localhost`) for physical device testing.

## 🐳 Docker Deployment

### Production (MongoDB Atlas)

```bash
# Configure environment
cd docker
cp .env.example .env
nano .env  # Add MongoDB Atlas credentials

# Build and start
make docker-build
make docker-up

# View logs
make docker-logs
```

Access the application at `http://localhost`

### Development (Local MongoDB)

```bash
# Start with local MongoDB
make docker-dev-up

# Access services:
# - Web: http://localhost
# - API: http://localhost:3000
# - Mongo Express: http://localhost:8081

# Stop and clean up
make docker-dev-down-v
```

## 📜 Available Commands

Run `make help` to see all available commands:

### Development

| Command | Description |
|---------|-------------|
| `make dev` | Start web and server in parallel |
| `make dev-web` | Start web development server |
| `make dev-server` | Start API server |
| `make dev-mobile` | Start Expo development server |

### Build

| Command | Description |
|---------|-------------|
| `make build` | Build web and server for production |
| `make build-web` | Build web application |
| `make build-server` | Build server |

### Docker

| Command | Description |
|---------|-------------|
| `make docker-up` | Start production containers |
| `make docker-down` | Stop production containers |
| `make docker-dev-up` | Start development containers |
| `make docker-logs` | View container logs |

### Code Quality

| Command | Description |
|---------|-------------|
| `make lint` | Lint all packages |
| `make format` | Format all packages |
| `make check` | Run all checks |

### Utilities

| Command | Description |
|---------|-------------|
| `make install` | Install all dependencies |
| `make clean` | Clean build artifacts |
| `make fresh` | Clean and reinstall everything |
| `make status` | Show project status |

## 🛠️ Tech Stack

### Web Application (`packages/web`)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| TypeScript | 5.9.3 | Type Safety |
| Vite | 7.2.2 | Build Tool |
| React Router | 7.9.6 | Client Routing |
| TailwindCSS | 3.4.17 | Styling |
| Better Auth | 1.3.34 | Authentication |
| Lucide React | 0.554.0 | Icons |

### Mobile Application (`packages/mobile`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Expo | SDK 54 | React Native Framework |
| Expo Router | 6.0.15 | File-based Navigation |
| NativeWind | 4.2.1 | Tailwind for RN |
| Better Auth | 1.4.3 | Authentication |
| React Native Reanimated | 4.1.1 | Animations |

### API Server (`packages/server`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.21.2 | Web Framework |
| TypeScript | 5.9.3 | Type Safety |
| MongoDB | 7.0.0 | Database Driver |
| Better Auth | 1.3.34 | Authentication |
| Winston | 3.18.3 | Logging |
| Helmet | 8.1.0 | Security |

## 🔐 Authentication

TaskFlow uses [Better Auth](https://www.better-auth.com/) for authentication:

- **Session-based authentication** with secure cookies
- **Email/password** sign-up and login
- **Cross-platform support** via Expo plugin for mobile
- **Automatic session refresh** on app focus

## 🎨 Theming

Consistent theming across web and mobile:

- **CSS Variables** define color palette
- **System-aware** dark/light mode detection
- **Manual toggle** for user preference
- **Shared theme files** between platforms

Available theme colors:
- `primary`, `on-primary` - Brand colors
- `bg`, `surface-1`, `surface-2` - Backgrounds
- `text`, `headline`, `muted` - Typography
- `border`, `divider` - UI elements
- `success`, `warning`, `error`, `info` - Feedback

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/user/auth/sign-up/email` | Register |
| POST | `/api/v1/user/auth/sign-in/email` | Login |
| POST | `/api/v1/user/auth/sign-out` | Logout |
| GET | `/api/v1/user/auth/session` | Get session |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/user/tasks` | List tasks |
| POST | `/api/v1/user/tasks` | Create task |
| GET | `/api/v1/user/tasks/:id` | Get task |
| PUT | `/api/v1/user/tasks/:id` | Update task |
| DELETE | `/api/v1/user/tasks/:id` | Delete task |
| GET | `/api/v1/user/tasks/stats` | Task statistics |

## 📚 Documentation

Detailed documentation for each package:

- [Web Application Documentation](./packages/web/README.md)
- [Mobile Application Documentation](./packages/mobile/README.md)
- [API Server Documentation](./packages/server/README.md)
- [Docker Deployment Guide](./docker/README.md)

## 🧪 Development Workflow

### Adding a New Feature

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Implement across packages** (if cross-platform)
   - Add API endpoint in `packages/server`
   - Implement UI in `packages/web`
   - Implement mobile UI in `packages/mobile`

3. **Test locally**
   ```bash
   make dev
   ```

4. **Run checks**
   ```bash
   make check
   make format
   ```

5. **Commit changes**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   git push origin feature/your-feature
   ```

### Code Style

- **TypeScript** for all source files
- **ESLint** for linting
- **Prettier** for formatting
- **Conventional Commits** for commit messages

## 🔒 Security

- **Helmet** middleware for HTTP security headers
- **CORS** with configurable origin whitelist
- **Rate limiting** on API endpoints
- **Input validation** on all endpoints
- **Secure session storage** (SecureStore on mobile)

## 🚢 Production Checklist

Before deploying to production:

- [ ] Generate strong `AUTH_SECRET_USER` (min 32 chars)
- [ ] Configure MongoDB Atlas with proper credentials
- [ ] Update `CORS_ORIGINS` and `TRUSTED_ORIGINS`
- [ ] Enable HTTPS/SSL for nginx
- [ ] Review and restrict MongoDB network access
- [ ] Set up monitoring and log aggregation
- [ ] Configure backup strategy for MongoDB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow existing code patterns
4. Write meaningful commit messages
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using React, React Native, and Express.js**