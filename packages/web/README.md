# TaskFlow Web Application

A modern, responsive task management web application built with React, TypeScript, and Vite. Part of the TaskFlow monorepo.

## 🚀 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| TypeScript | 5.9.3 | Type Safety |
| Vite | 7.2.2 | Build Tool & Dev Server |
| React Router | 7.9.6 | Client-side Routing |
| TailwindCSS | 3.4.17 | Utility-first CSS |
| Better Auth | 1.3.34 | Authentication |
| Lucide React | 0.554.0 | Icon Library |

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (Brand, ThemeToggle, etc.)
│   └── ui/              # Base UI components (Button, Card, Input, etc.)
├── contexts/            # React Context providers
│   ├── ThemeContext.tsx # Theme state management
│   └── UserAuthContext.tsx # Authentication state
├── features/            # Feature-based modules
│   ├── auth/           # Authentication (Login, SignUp)
│   ├── NotFound/       # 404 page
│   ├── public/         # Public pages (Home, Layout)
│   └── user/           # Protected user features (Tasks)
├── guards/              # Route protection components
│   ├── PublicRoute.tsx # Redirect authenticated users
│   └── UserProtectedRoute.tsx # Require authentication
├── lib/                 # External service clients
│   ├── api-client.ts   # HTTP client wrapper
│   └── auth-client.ts  # Better Auth client
├── routes/              # Router configuration
│   └── index.tsx       # Route definitions
├── styles/              # Global styles and themes
│   ├── theme/          # Light/Dark theme CSS variables
│   └── globals.css     # Base styles
├── utils/               # Utility functions
│   ├── avatar.util.ts  # Avatar generation
│   ├── cn.util.ts      # Class name merging
│   ├── theme.util.ts   # Theme helpers
│   └── validation.util.ts # Form validation
├── App.tsx              # Root application component
└── main.tsx             # Application entry point
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 22.x or higher
- npm 10.x or higher
- Running backend server (see `packages/server`)

### Installation

```bash
# From the web package directory
cd packages/web

# Install dependencies
npm install
```

### Environment Setup

The web application uses Vite's proxy for API requests. The proxy is configured in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

No `.env` file is required for development - all API calls are proxied to the backend.

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |
| `npm run format` | Format code with Prettier |

## 🎨 Theme System

TaskFlow uses a CSS variable-based theme system with full dark mode support.

### Theme Variables

Themes are defined in `src/styles/theme/`:

- `light.css` - Light theme variables
- `dark.css` - Dark theme variables

### Available Colors

```css
/* Core */
--color-primary       /* Brand primary color */
--color-on-primary    /* Text on primary */
--color-secondary     /* Secondary accent */

/* Surfaces */
--color-bg            /* Page background */
--color-surface-1     /* Card/container background */
--color-surface-2     /* Elevated surface */
--color-surface-hover-1  /* Hover state */
--color-surface-hover-2  /* Secondary hover */

/* Text */
--color-text          /* Body text */
--color-headline      /* Headings */
--color-muted         /* Secondary text */

/* UI Elements */
--color-border        /* Border color */
--color-divider       /* Divider lines */

/* Feedback */
--color-success       /* Success states */
--color-warning       /* Warning states */
--color-error         /* Error states */
--color-info          /* Info states */
```

### Using Theme Colors

With TailwindCSS:

```jsx
<div className="bg-surface-1 text-text border-border">
  <h1 className="text-headline">Title</h1>
  <p className="text-muted">Description</p>
  <button className="bg-primary text-on-primary">Action</button>
</div>
```

### Theme Toggle

Use the `useTheme` hook:

```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { theme, setTheme, isDark } = useTheme()
  
  return (
    <button onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  )
}
```

## 🔐 Authentication

Authentication is handled via Better Auth with the `UserAuthContext`.

### Using Authentication

```tsx
import { useUserAuth } from '@/contexts/UserAuthContext'

function MyComponent() {
  const { 
    user,           // Current user object
    isAuthenticated, // Boolean auth state
    isLoading,      // Loading state
    login,          // Login function
    logout,         // Logout function
  } = useUserAuth()

  if (isLoading) return <LoadingSpinner />
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <div>Welcome, {user?.name}</div>
}
```

### Route Protection

Routes are protected using guard components:

```tsx
// Public routes - redirect authenticated users to /tasks
<Route element={<PublicRoute />}>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
</Route>

// Protected routes - redirect unauthenticated users to /
<Route element={<UserProtectedRoute />}>
  <Route path="/tasks" element={<Tasks />} />
</Route>
```

## 🧩 UI Components

### Component Library

Located in `src/components/ui/`:

| Component | Description |
|-----------|-------------|
| `Alert` | Feedback messages with variants |
| `Button` | Primary, secondary, ghost, danger variants |
| `Card` | Container with padding and elevation options |
| `Dialog` | Modal dialogs with header, body, footer |
| `IconButton` | Icon-only buttons |
| `Input` | Form inputs with labels and error states |
| `LoadingSpinner` | Loading indicator |
| `Tabs` | Tab navigation component |
| `Toggle` | Switch toggle input |

### Button Example

```tsx
import Button from '@/components/ui/Button'
import { Plus } from 'lucide-react'

<Button 
  variant="primary"    // primary | secondary | ghost | danger
  size="md"           // sm | md | lg
  leftIcon={<Plus />}
  isLoading={false}
  disabled={false}
  onClick={() => {}}
>
  Create Task
</Button>
```

### Dialog Example

```tsx
import Dialog from '@/components/ui/Dialog'

<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Positioner>
    <Dialog.Backdrop />
    <Dialog.Content size="md">
      <Dialog.Header>
        <Dialog.Title>Dialog Title</Dialog.Title>
        <Dialog.CloseTrigger />
      </Dialog.Header>
      <Dialog.Body>
        Content here
      </Dialog.Body>
      <Dialog.Footer>
        <Button variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog.Root>
```

## 📡 API Client

The custom API client (`src/lib/api-client.ts`) provides:

- Automatic JSON serialization
- Request timeout handling
- Abort signal support for cancellation
- Credentials included for auth cookies
- Error handling with typed responses

### Usage

```tsx
import apiClient from '@/lib/api-client'

// GET request
const { data } = await apiClient.get<Task[]>('/api/v1/user/tasks')

// POST request
const { data } = await apiClient.post<Task>('/api/v1/user/tasks', {
  title: 'New Task',
  description: 'Task description'
})

// With abort signal
const controller = new AbortController()
const { data } = await apiClient.get('/api/v1/user/tasks', {
  signal: controller.signal
})
```

## ✅ Task Management

### Task Service

Located at `src/features/user/services/task.service.ts`:

```tsx
import { taskService } from '@/features/user/services/task.service'

// Get all tasks
const tasks = await taskService.getTasks({ status: 'active' })

// Create task
const newTask = await taskService.createTask({
  title: 'Task Title',
  description: 'Task description'
})

// Update task
const updated = await taskService.updateTask(id, { completed: true })

// Delete task
await taskService.deleteTask(id)

// Get statistics
const stats = await taskService.getTaskStats()
```

### Task Hooks

**useTasks** - Fetch and manage tasks:

```tsx
import { useTasks } from '@/features/user/hooks/useTasks'

const { 
  tasks,      // Task array
  stats,      // { total, active, completed }
  loading,    // Loading state
  error,      // Error message
  refetch,    // Refresh tasks
  toggleTask  // Toggle completion
} = useTasks({ status: 'all' })
```

**useTaskMutations** - Create, update, delete tasks:

```tsx
import { useTaskMutations } from '@/features/user/hooks/useTaskMutations'

const { 
  isSubmitting,
  createTask,
  updateTask,
  deleteTask 
} = useTaskMutations({
  onSuccess: (message) => showToast(message),
  onError: (message) => showError(message)
})
```

## 🛣️ Routing

Routes are defined in `src/routes/index.tsx`:

| Path | Component | Access |
|------|-----------|--------|
| `/` | Home | Public |
| `/login` | UserLogin | Public (redirects if authenticated) |
| `/signup` | UserSignUp | Public (redirects if authenticated) |
| `/tasks` | Tasks | Protected (requires authentication) |
| `*` | NotFound | Public |

## 🔧 Path Aliases

TypeScript path aliases are configured for cleaner imports:

```tsx
// Instead of relative paths
import Button from '../../../components/ui/Button'

// Use aliases
import Button from '@/components/ui/Button'
```

Configured in `tsconfig.app.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

## 📦 Building for Production

### Build Output

```bash
npm run build
```

Outputs to `dist/` directory:
- Minified JavaScript bundles
- Optimized CSS
- Static assets with content hashing

### Docker Deployment

The web app is containerized using the Dockerfile at `docker/Dockerfile.web`:

1. **Build stage**: Node.js builds the Vite application
2. **Production stage**: nginx serves static files and proxies API requests

See `docker/README.md` for deployment instructions.

## 🧪 Code Quality

### Linting

```bash
npm run lint
```

ESLint configuration includes:
- TypeScript-specific rules
- React Hooks rules
- React Refresh rules

### Formatting

```bash
npm run format
```

Prettier handles code formatting with project-specific configuration.

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Better Auth Documentation](https://better-auth.com/)
- [Lucide Icons](https://lucide.dev/icons/)

## 🤝 Contributing

1. Follow existing code patterns and conventions
2. Use TypeScript for all new files
3. Create feature-based modules in `src/features/`
4. Add reusable components to `src/components/ui/`
5. Run `npm run lint` and `npm run format` before committing

## 📄 License

This project is private and proprietary.