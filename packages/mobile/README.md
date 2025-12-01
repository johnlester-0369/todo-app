# TaskFlow Mobile

A React Native mobile application built with Expo, featuring task management with authentication, dark/light theme support, and a modern UI powered by NativeWind.

## 📱 Overview

TaskFlow Mobile is the mobile client for the TaskFlow ecosystem, providing:

- **User Authentication** - Secure login/signup with session persistence
- **Task Management** - Create, read, update, and delete tasks
- **Theme Support** - System-aware dark/light mode with manual toggle
- **Offline-Ready Architecture** - Optimized for mobile connectivity patterns

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| [Expo](https://expo.dev/) (SDK 54) | React Native framework & tooling |
| [Expo Router](https://docs.expo.dev/router/introduction/) | File-based navigation |
| [NativeWind](https://www.nativewind.dev/) v4 | Tailwind CSS for React Native |
| [Better Auth](https://www.better-auth.com/) | Authentication with Expo plugin |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | Smooth animations |

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher (or yarn/pnpm)
- **Expo CLI** (installed globally or via npx)
- **iOS Simulator** (macOS only) or **Android Emulator**
- **Expo Go** app on physical device (for development)

## 🚀 Getting Started

### 1. Install Dependencies

From the project root:

```bash
# Using the Makefile (recommended)
make install-mobile

# Or directly
cd packages/mobile
npm install
```

### 2. Configure Environment

Update the `BETTER_AUTH_BASE_URL` in `app.json` to point to your backend:

```json
{
  "expo": {
    "extra": {
      "BETTER_AUTH_BASE_URL": "http://YOUR_LOCAL_IP:3000"
    }
  }
}
```

> **Note:** Use your machine's local IP address (not `localhost`) for physical device testing. Find it with `ipconfig` (Windows) or `ifconfig` (macOS/Linux).

### 3. Start Development Server

```bash
# Using Makefile
make dev-mobile

# Or directly
cd packages/mobile
npm start
```

### 4. Run on Device/Simulator

```bash
# iOS Simulator (macOS only)
npm run ios
# or
make dev-mobile-ios

# Android Emulator
npm run android
# or
make dev-mobile-android

# Web (for testing)
npm run web
# or
make dev-mobile-web
```

## 📁 Project Structure

```
mobile/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigator group
│   │   ├── task/                 # Task screens
│   │   │   ├── [id].tsx          # Edit task screen
│   │   │   └── new.tsx           # Create task screen
│   │   ├── _layout.tsx           # Tab layout configuration
│   │   ├── index.tsx             # Tasks list (home tab)
│   │   └── me.tsx                # Profile tab
│   ├── _layout.tsx               # Root layout with auth guard
│   ├── index.tsx                 # Login screen
│   └── signup.tsx                # Registration screen
│
├── assets/                       # Static assets
│   ├── images/                   # App icons and images
│   └── svg/                      # SVG logo files
│
├── components/                   # Reusable components
│   ├── common/                   # Shared components
│   │   └── Brand.tsx             # Logo and branding
│   └── ui/                       # UI component library
│       ├── Accordion.tsx
│       ├── Alert.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Checkbox.tsx
│       ├── Dialog.tsx
│       ├── FloatingActionButton.tsx
│       ├── IconButton.tsx
│       ├── Input.tsx
│       ├── LoadingSpinner.tsx
│       ├── Tabs.tsx
│       └── Toggle.tsx
│
├── contexts/                     # React Context providers
│   ├── ThemeContext.tsx          # Theme management
│   └── UserAuthContext.tsx       # Authentication state
│
├── features/                     # Feature modules
│   ├── auth/                     # Authentication feature
│   │   ├── components/           # Auth-specific components
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignUpForm.tsx
│   │   ├── hooks/                # Auth hooks
│   │   │   └── useAuthForm.ts
│   │   └── index.ts              # Feature exports
│   └── tasks/                    # Tasks feature
│       ├── components/           # Task-specific components
│       │   ├── CompletedAccordion.tsx
│       │   └── TaskItem.tsx
│       ├── hooks/                # Task hooks
│       │   ├── useTaskMutations.ts
│       │   └── useTasks.ts
│       └── services/             # API services
│           └── task.service.ts
│
├── lib/                          # Core libraries
│   ├── api-client.ts             # HTTP client with auth
│   └── auth-client.ts            # Better Auth configuration
│
├── scripts/                      # Build scripts
│   └── generate-theme-vars.js    # CSS to JS theme extraction
│
├── styles/                       # Styling
│   ├── theme/                    # Theme definitions
│   │   ├── dark.css              # Dark mode variables
│   │   └── light.css             # Light mode variables
│   ├── global.css                # Global styles
│   └── themeVars.ts              # Generated theme JS (auto)
│
├── types/                        # TypeScript declarations
│   └── svg.d.ts                  # SVG module types
│
├── utils/                        # Utility functions
│   ├── avatar.util.ts            # Avatar helpers
│   ├── cn.util.ts                # Class name utilities
│   ├── theme-colors.util.ts      # Color conversion
│   └── validation.util.ts        # Form validation
│
├── app.json                      # Expo configuration
├── babel.config.js               # Babel configuration
├── metro.config.js               # Metro bundler config
├── tailwind.config.js            # NativeWind/Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies and scripts
```

## 🎨 Theming

### How Themes Work

TaskFlow uses a CSS-variable-based theming system compatible with both web and mobile:

1. **Theme Variables** are defined in `styles/theme/light.css` and `styles/theme/dark.css`
2. **Build Script** (`scripts/generate-theme-vars.js`) extracts CSS variables to TypeScript
3. **NativeWind** uses these variables for Tailwind classes
4. **ThemeContext** provides programmatic access for native components

### Using Theme Colors

**In NativeWind classes (recommended):**
```tsx
<View className="bg-surface-1 border-border">
  <Text className="text-headline">Title</Text>
  <Text className="text-muted">Subtitle</Text>
</View>
```

**For native components (icons, spinners):**
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { getColor, isDark } = useTheme();
  
  return (
    <Ionicons 
      name="home" 
      size={24} 
      color={getColor('primary')} 
    />
  );
}
```

### Available Colors

| Color Key | Usage |
|-----------|-------|
| `primary` | Primary brand color |
| `on-primary` | Text on primary color |
| `bg` | Page background |
| `surface-1` | Card/elevated surfaces |
| `surface-2` | Higher elevation surfaces |
| `text` | Body text |
| `headline` | Headings |
| `muted` | Secondary text |
| `border` | Borders |
| `divider` | Divider lines |
| `success` | Success states |
| `warning` | Warning states |
| `error` | Error states |
| `info` | Info states |

### Regenerating Theme Variables

When you modify theme CSS files:

```bash
npm run generate:theme
# or
make generate-theme
```

This updates `styles/themeVars.ts` automatically.

## 🔐 Authentication Architecture

### Flow Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Login/Signup  │────▶│  Better Auth     │────▶│  SecureStore    │
│     Screens     │     │  Client          │     │  (Tokens)       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │  Auth Guard      │
                        │  (_layout.tsx)   │
                        └──────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                                   ▼
    ┌─────────────────┐                 ┌─────────────────┐
    │  Public Routes  │                 │  Protected      │
    │  (/, /signup)   │                 │  Routes (tabs)  │
    └─────────────────┘                 └─────────────────┘
```

### Key Points

1. **Centralized Auth Guard** - All auth redirects happen in `app/_layout.tsx` via `useProtectedRoute()` hook
2. **Session Persistence** - Better Auth uses `expo-secure-store` for token storage
3. **Auto-Refresh** - Sessions are checked on app focus

### Using Auth in Components

```tsx
import { useUserAuth } from '@/contexts/UserAuthContext';

function MyComponent() {
  const { 
    user,           // Current user object
    isAuthenticated,// Boolean auth status
    isLoading,      // Auth check in progress
    login,          // Login function
    logout,         // Logout function
  } = useUserAuth();
  
  // ...
}
```

## 📡 API Integration

### API Client

The `lib/api-client.ts` provides authenticated HTTP requests:

```tsx
import apiClient from '@/lib/api-client';

// GET request
const { data } = await apiClient.get('/api/v1/user/tasks');

// POST request
const { data } = await apiClient.post('/api/v1/user/tasks', {
  title: 'New Task',
  description: 'Task description'
});

// With options
const { data } = await apiClient.get('/api/v1/user/tasks', {
  params: { status: 'active' },
  silent: true, // Suppress error logging
});
```

### Features
- Automatic auth header injection
- Request timeout handling
- Error response parsing
- Abort signal support

## 🧩 Component Library

### UI Components

All UI components are in `components/ui/` and follow consistent patterns:

```tsx
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import Dialog from '@/components/ui/Dialog';

// Button variants
<Button variant="primary" size="lg" onPress={handlePress}>
  Submit
</Button>

// Card compound component
<Card.Root variant="elevated" padding="lg">
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Body>Content</Card.Body>
</Card.Root>

// Dialog compound component
<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Confirm</Dialog.Title>
        <Dialog.CloseTrigger />
      </Dialog.Header>
      <Dialog.Body>Are you sure?</Dialog.Body>
      <Dialog.Footer>
        <Button onPress={handleConfirm}>Yes</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android emulator/device |
| `npm run ios` | Run on iOS simulator/device |
| `npm run web` | Run in web browser |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run generate:theme` | Regenerate theme variables |

## 🔧 Configuration Files

### `app.json` - Expo Configuration

Key settings:
- `scheme: "taskflow"` - Deep linking scheme
- `extra.BETTER_AUTH_BASE_URL` - Backend API URL
- `plugins` - Expo plugins (router, splash screen, secure-store)

### `metro.config.js` - Metro Bundler

Configured for:
- SVG transformer support
- NativeWind CSS processing
- Better Auth package exports resolution

### `tailwind.config.js` - NativeWind

- Custom color palette using CSS variables
- Extended spacing and border radius
- NativeWind preset integration

## 🐛 Troubleshooting

### Common Issues

#### "Network request failed" on physical device

**Cause:** Using `localhost` instead of local IP

**Solution:**
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (macOS/Linux)
2. Update `app.json`:
   ```json
   "BETTER_AUTH_BASE_URL": "http://192.168.x.x:3000"
   ```

#### Authentication not persisting

**Cause:** Metro bundler not resolving Better Auth exports

**Solution:** Ensure `metro.config.js` has:
```javascript
resolver: {
  unstable_enablePackageExports: true,
}
```

#### Theme colors not updating

**Cause:** Theme variables not regenerated after CSS changes

**Solution:**
```bash
npm run generate:theme
```

#### "Cannot find module" errors

**Solution:**
```bash
# Clear Metro cache
npx expo start --clear

# Or full reset
rm -rf node_modules
rm -rf .expo
npm install
```

#### iOS Simulator not opening

**Solution:**
```bash
# Install iOS Simulator (macOS only)
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept
```

### Debug Mode

Enable verbose logging:
```tsx
// In any component
if (__DEV__) {
  console.log('Debug info:', data);
}
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Better Auth Expo Plugin](https://www.better-auth.com/docs/integrations/expo)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

## 🤝 Related Packages

- **[Server](/packages/server)** - Express.js backend API
- **[Web](/packages/web)** - React web application

## 📄 License

This project is private and proprietary.