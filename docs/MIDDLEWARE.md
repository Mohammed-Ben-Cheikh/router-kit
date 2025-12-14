# Router-Kit - Middleware Guide

**Version:** 2.0.0  
**Author:** Mohammed Ben Cheikh  
**License:** MIT  
**Repository:** [github.com/Mohammed-Ben-Cheikh/router-kit](https://github.com/Mohammed-Ben-Cheikh/router-kit)

---

## 📑 Table of Contents

1. [Introduction](#introduction)
2. [What is Middleware?](#what-is-middleware)
3. [Chain of Responsibility Pattern](#chain-of-responsibility-pattern)
4. [Getting Started](#getting-started)
5. [Middleware API](#middleware-api)
6. [Built-in Middleware Helpers](#built-in-middleware-helpers)
7. [Advanced Usage](#advanced-usage)
8. [Best Practices](#best-practices)
9. [Examples](#examples)
10. [TypeScript Support](#typescript-support)

---

## Introduction

**Middleware** in Router-Kit provides a powerful way to intercept and process route navigation using the **Chain of Responsibility** pattern. Middleware functions execute sequentially before route guards and can perform authentication checks, data fetching, logging, analytics, and more.

### Key Features

- 🔗 **Chain of Responsibility**: Process requests through a chain of middleware functions
- ⚡ **Async Support**: Full support for async/await operations including fetch
- 🛡️ **Route Protection**: Redirect or block navigation based on conditions
- 📊 **Data Prefetching**: Fetch data before route components render
- 🔄 **Composable**: Combine multiple middleware functions easily
- 📝 **Logging & Analytics**: Track route access and user behavior
- 🎯 **Type-Safe**: Full TypeScript support with proper types

---

## What is Middleware?

Middleware functions are executed **before** route guards and component rendering. They receive a context object with route information and can:

1. **Continue** to the next middleware or route guard
2. **Redirect** to another route
3. **Block** the navigation entirely

Middleware runs in the order they are defined, creating a processing pipeline.

### Execution Order

```
Request → Middleware 1 → Middleware 2 → ... → Guard → Component
```

Each middleware can:

- Pass control to the next middleware (`continue`)
- Stop the chain and redirect (`redirect`)
- Stop the chain and block navigation (`block`)

---

## Chain of Responsibility Pattern

Router-Kit implements the **Chain of Responsibility** design pattern for middleware. This pattern allows you to:

- **Decouple** request handling logic
- **Compose** multiple middleware functions
- **Control** the flow of request processing
- **Reuse** middleware across different routes

### How It Works

```typescript
// Middleware chain execution
Middleware 1 → Middleware 2 → Middleware 3 → Route Guard → Component

// Each middleware can:
// 1. Call next() to continue
// 2. Return redirect to stop and redirect
// 3. Return block to stop and prevent navigation
```

---

## Getting Started

### Basic Middleware Example

```tsx
import { createRouter, RouterProvider, type Middleware } from "router-kit";

// Define a simple logging middleware
const loggingMiddleware: Middleware = async (context, next) => {
  console.log(`Accessing: ${context.pathname}`);
  return next(); // Continue to next middleware
};

// Define an authentication middleware
const authMiddleware: Middleware = async (context, next) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return { type: "redirect", to: "/login" };
  }

  return next(); // Continue if authenticated
};

// Use middleware in routes
const routes = createRouter([
  {
    path: "/dashboard",
    component: <Dashboard />,
    middleware: [loggingMiddleware, authMiddleware],
  },
]);

function App() {
  return <RouterProvider routes={routes} />;
}
```

---

## Middleware API

### Middleware Type

```typescript
type Middleware = (
  context: MiddlewareContext,
  next: () => Promise<MiddlewareResult>
) => MiddlewareResult | Promise<MiddlewareResult>;
```

### MiddlewareContext

```typescript
interface MiddlewareContext {
  pathname: string; // Current route pathname
  params: Record<string, string>; // Route parameters
  search: string; // Query string (with "?")
  request?: Request; // Fetch Request object (for API calls)
  signal?: AbortSignal; // AbortSignal for cancellation
}
```

### MiddlewareResult

```typescript
type MiddlewareResult =
  | { type: "continue" } // Continue to next middleware
  | { type: "redirect"; to: string } // Redirect to another route
  | { type: "block" }; // Block navigation
```

### Route Configuration

```typescript
interface Route {
  // ... other route properties
  middleware?: Middleware[]; // Array of middleware functions
  errorElement?: JSX.Element; // Error boundary element for this route
}
```

---

## Built-in Middleware Helpers

Router-Kit provides several helper functions to create common middleware patterns.

### createAuthMiddleware

Creates an authentication middleware that redirects unauthenticated users.

```tsx
import { createAuthMiddleware } from "router-kit";

const authMiddleware = createAuthMiddleware({
  checkAuth: async (context) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    // Verify token with server
    const response = await fetch("/api/verify-token", {
      headers: { Authorization: `Bearer ${token}` },
      signal: context.signal,
    });

    return response.ok;
  },
  redirectTo: "/login", // Optional, defaults to "/login"
});

const routes = createRouter([
  {
    path: "/dashboard",
    component: <Dashboard />,
    middleware: [authMiddleware],
  },
]);
```

### createRoleMiddleware

Creates a role-based access control middleware.

```tsx
import { createRoleMiddleware } from "router-kit";

const adminMiddleware = createRoleMiddleware({
  checkRole: async (context) => {
    const user = await getCurrentUser();
    return user?.role === "admin";
  },
  redirectTo: "/unauthorized",
});

const routes = createRouter([
  {
    path: "/admin",
    component: <AdminPanel />,
    middleware: [adminMiddleware],
  },
]);
```

### createDataMiddleware

Fetches data before route rendering and stores it for use in components.

```tsx
import { createDataMiddleware } from "router-kit";

// Store for middleware data
const middlewareDataStore = new Map<string, any>();

const userDataMiddleware = createDataMiddleware({
  fetchData: async (context) => {
    const response = await fetch(`/api/users/${context.params.id}`, {
      signal: context.signal,
    });
    return response.json();
  },
  onData: (data, context) => {
    // Store data for component access
    middlewareDataStore.set(context.pathname, data);
  },
  onError: (error, context) => {
    console.error(`Failed to fetch user data:`, error);
  },
});

const routes = createRouter([
  {
    path: "users/:id",
    component: <UserProfile />,
    middleware: [userDataMiddleware],
  },
]);
```

### createLoggingMiddleware

Creates a logging middleware for analytics and debugging.

```tsx
import { createLoggingMiddleware } from "router-kit";

const analyticsMiddleware = createLoggingMiddleware({
  log: async (context) => {
    // Send analytics event
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathname: context.pathname,
        params: context.params,
        timestamp: Date.now(),
      }),
      signal: context.signal,
    });
  },
});

const routes = createRouter([
  {
    path: "/",
    component: <Home />,
    middleware: [analyticsMiddleware],
  },
]);
```

---

## Advanced Usage

### Custom Middleware with Fetch

Middleware can use the `request` and `signal` from context to make API calls:

```tsx
const apiMiddleware: Middleware = async (context, next) => {
  try {
    // Use context.request for reference or create new requests
    const response = await fetch(`/api/check-permission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathname: context.pathname,
        params: context.params,
      }),
      signal: context.signal, // Supports cancellation
    });

    if (!response.ok) {
      return { type: "redirect", to: "/unauthorized" };
    }

    const data = await response.json();

    // Store permission data
    if (data.allowed) {
      return next();
    } else {
      return { type: "block" };
    }
  } catch (error) {
    if (error.name === "AbortError") {
      // Request was cancelled, don't process
      return { type: "block" };
    }
    console.error("Middleware error:", error);
    return { type: "redirect", to: "/error" };
  }
};
```

### Composing Multiple Middleware

Combine multiple middleware functions for complex scenarios:

```tsx
// Individual middleware functions
const loggingMiddleware: Middleware = async (context, next) => {
  console.log(`[${new Date().toISOString()}] ${context.pathname}`);
  return next();
};

const authMiddleware: Middleware = async (context, next) => {
  const token = localStorage.getItem("token");
  return token ? next() : { type: "redirect", to: "/login" };
};

const rateLimitMiddleware: Middleware = async (context, next) => {
  const key = `rate_limit_${context.pathname}`;
  const count = parseInt(localStorage.getItem(key) || "0");

  if (count > 10) {
    return { type: "redirect", to: "/rate-limit-exceeded" };
  }

  localStorage.setItem(key, String(count + 1));
  return next();
};

// Compose middleware
const routes = createRouter([
  {
    path: "/api",
    component: <ApiDashboard />,
    middleware: [
      loggingMiddleware, // 1. Log access
      authMiddleware, // 2. Check authentication
      rateLimitMiddleware, // 3. Check rate limits
    ],
  },
]);
```

### Conditional Middleware

Create middleware that conditionally executes:

```tsx
const conditionalMiddleware: Middleware = async (context, next) => {
  // Only run in production
  if (process.env.NODE_ENV === "production") {
    await sendAnalytics(context);
  }

  return next();
};

// Or based on route parameters
const paramBasedMiddleware: Middleware = async (context, next) => {
  if (context.params.id === "admin") {
    // Special handling for admin routes
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return { type: "redirect", to: "/unauthorized" };
    }
  }

  return next();
};
```

### Middleware with State Management

Integrate middleware with state management libraries:

```tsx
import { store } from "./store";

const stateMiddleware: Middleware = async (context, next) => {
  // Update global state before navigation
  store.dispatch({
    type: "SET_CURRENT_ROUTE",
    payload: {
      pathname: context.pathname,
      params: context.params,
    },
  });

  return next();
};
```

### Error Handling in Middleware

Handle errors gracefully in middleware:

```tsx
const errorHandlingMiddleware: Middleware = async (context, next) => {
  try {
    // Your middleware logic
    const result = await someAsyncOperation(context);

    if (result.error) {
      // Handle specific errors
      return { type: "redirect", to: `/error?code=${result.error}` };
    }

    return next();
  } catch (error) {
    // Log error and redirect to error page
    console.error("Middleware error:", error);
    return { type: "redirect", to: "/error" };
  }
};
```

---

## Best Practices

### 1. Order Matters

Place middleware in the correct order:

```tsx
// ✅ Good: Logging first, then auth, then data fetching
middleware: [
  loggingMiddleware, // 1. Log first
  authMiddleware, // 2. Authenticate before fetching
  dataMiddleware, // 3. Fetch data last
];

// ❌ Bad: Fetching before authentication
middleware: [
  dataMiddleware, // Wastes resources if not authenticated
  authMiddleware,
];
```

### 2. Use AbortSignal

Always use `context.signal` for cancellable operations:

```tsx
// ✅ Good: Supports cancellation
const response = await fetch(url, {
  signal: context.signal,
});

// ❌ Bad: Cannot be cancelled
const response = await fetch(url);
```

### 3. Handle Errors

Always handle errors in middleware:

```tsx
// ✅ Good: Error handling
const safeMiddleware: Middleware = async (context, next) => {
  try {
    await riskyOperation();
    return next();
  } catch (error) {
    console.error(error);
    return { type: "redirect", to: "/error" };
  }
};
```

### 4. Keep Middleware Focused

Each middleware should have a single responsibility:

```tsx
// ✅ Good: Single responsibility
const authMiddleware = createAuthMiddleware({ ... });
const loggingMiddleware = createLoggingMiddleware({ ... });
const dataMiddleware = createDataMiddleware({ ... });

// ❌ Bad: Multiple responsibilities
const complexMiddleware: Middleware = async (context, next) => {
  // Auth logic
  // Logging logic
  // Data fetching logic
  // Too much!
};
```

### 5. Reuse Middleware

Create reusable middleware functions:

```tsx
// ✅ Good: Reusable middleware
export const authMiddleware = createAuthMiddleware({ ... });

// Use in multiple routes
const routes = createRouter([
  { path: "/dashboard", middleware: [authMiddleware], ... },
  { path: "/profile", middleware: [authMiddleware], ... },
  { path: "/settings", middleware: [authMiddleware], ... },
]);
```

### 6. Type Safety

Use TypeScript for type-safe middleware:

```tsx
// ✅ Good: Typed middleware
const typedMiddleware: Middleware = async (context, next) => {
  // context is fully typed
  const { pathname, params, signal } = context;
  return next();
};
```

---

## Examples

### Complete Authentication Flow

```tsx
import {
  createRouter,
  RouterProvider,
  createAuthMiddleware,
  createRoleMiddleware,
} from "router-kit";

// Authentication middleware
const authMiddleware = createAuthMiddleware({
  checkAuth: async (context) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const response = await fetch("/api/verify", {
        headers: { Authorization: `Bearer ${token}` },
        signal: context.signal,
      });
      return response.ok;
    } catch {
      return false;
    }
  },
  redirectTo: "/login",
});

// Role-based middleware
const adminMiddleware = createRoleMiddleware({
  checkRole: async (context) => {
    const user = await getCurrentUser();
    return user?.role === "admin";
  },
  redirectTo: "/unauthorized",
});

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "login", component: <Login /> },
  {
    path: "dashboard",
    component: <Dashboard />,
    middleware: [authMiddleware],
  },
  {
    path: "admin",
    component: <AdminPanel />,
    middleware: [authMiddleware, adminMiddleware],
  },
]);
```

### Analytics & Logging

```tsx
import { createLoggingMiddleware } from "router-kit";

const analyticsMiddleware = createLoggingMiddleware({
  log: async (context) => {
    // Track page views
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "GA_MEASUREMENT_ID", {
        page_path: context.pathname,
      });
    }

    // Send custom analytics
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "page_view",
        pathname: context.pathname,
        params: context.params,
        timestamp: Date.now(),
      }),
      signal: context.signal,
    });
  },
});

const routes = createRouter([
  {
    path: "/",
    component: <Home />,
    middleware: [analyticsMiddleware],
  },
]);
```

### Data Prefetching

```tsx
import { createDataMiddleware } from "router-kit";

// Global data store
const prefetchStore = new Map<string, any>();

const userPrefetchMiddleware = createDataMiddleware({
  fetchData: async (context) => {
    const userId = context.params.id;
    const response = await fetch(`/api/users/${userId}`, {
      signal: context.signal,
    });

    if (!response.ok) {
      throw new Error("User not found");
    }

    return response.json();
  },
  onData: (user, context) => {
    prefetchStore.set(`user_${context.params.id}`, user);
  },
  onError: (error) => {
    console.error("Failed to prefetch user:", error);
  },
});

// Component can access prefetched data
function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(prefetchStore.get(`user_${id}`));

  useEffect(() => {
    if (!user) {
      // Fallback if prefetch failed
      fetchUser(id).then(setUser);
    }
  }, [id, user]);

  if (!user) return <Loading />;

  return <div>{user.name}</div>;
}
```

### Error Handling with errorElement

```tsx
import { createRouter, RouterProvider } from "router-kit";

// Middleware that might throw errors
const apiMiddleware: Middleware = async (context, next) => {
  try {
    const response = await fetch("/api/check-permission", {
      signal: context.signal,
    });

    if (!response.ok) {
      throw new Error("API permission check failed");
    }

    return next();
  } catch (error) {
    // Re-throw to trigger errorElement
    throw error;
  }
};

// Error component
function ErrorPage() {
  return (
    <div>
      <h1>Something went wrong</h1>
      <p>Please try again later</p>
      <button onClick={() => window.location.reload()}>Reload Page</button>
    </div>
  );
}

// Routes with errorElement
const routes = createRouter([
  {
    path: "/protected",
    component: <ProtectedPage />,
    middleware: [apiMiddleware],
    errorElement: <ErrorPage />,
  },
  {
    path: "/dashboard",
    component: <Dashboard />,
    middleware: [apiMiddleware],
    errorElement: <ErrorPage />, // Same error element for multiple routes
  },
]);
```

### Rate Limiting

```tsx
const rateLimitMiddleware: Middleware = async (context, next) => {
  const key = `rate_limit_${context.pathname}`;
  const now = Date.now();
  const stored = localStorage.getItem(key);

  if (stored) {
    const { count, resetAt } = JSON.parse(stored);

    if (now < resetAt) {
      if (count >= 10) {
        return { type: "redirect", to: "/rate-limit" };
      }

      localStorage.setItem(key, JSON.stringify({ count: count + 1, resetAt }));
    } else {
      // Reset counter
      localStorage.setItem(
        key,
        JSON.stringify({ count: 1, resetAt: now + 60000 })
      );
    }
  } else {
    localStorage.setItem(
      key,
      JSON.stringify({ count: 1, resetAt: now + 60000 })
    );
  }

  return next();
};
```

### Feature Flags

```tsx
const featureFlagMiddleware: Middleware = async (context, next) => {
  // Check if feature is enabled
  const featureEnabled = await checkFeatureFlag(
    context.pathname,
    context.signal
  );

  if (!featureEnabled) {
    return { type: "redirect", to: "/feature-unavailable" };
  }

  return next();
};
```

---

## TypeScript Support

Router-Kit provides full TypeScript support for middleware.

### Type Imports

```tsx
import type {
  Middleware,
  MiddlewareContext,
  MiddlewareResult,
} from "router-kit";
```

### Typed Middleware

```tsx
import type { Middleware, MiddlewareContext } from "router-kit";

// Fully typed middleware
const typedMiddleware: Middleware = async (
  context: MiddlewareContext,
  next: () => Promise<MiddlewareResult>
): Promise<MiddlewareResult> => {
  // context.pathname is string
  // context.params is Record<string, string>
  // context.signal is AbortSignal | undefined

  if (context.params.id) {
    // TypeScript knows params.id exists
    console.log(context.params.id);
  }

  return next();
};
```

### Custom Context Extension

```tsx
// Extend middleware context with custom data
interface CustomMiddlewareContext extends MiddlewareContext {
  customData?: string;
}

// Note: You'll need to pass custom data through route configuration
// This is a conceptual example
```

---

## Comparison with Guards

Middleware and Guards serve similar but distinct purposes:

| Feature             | Middleware                           | Guards                         |
| ------------------- | ------------------------------------ | ------------------------------ |
| **Execution Order** | Before guards                        | After middleware               |
| **Chain Support**   | ✅ Yes (Chain of Responsibility)     | ❌ No (single function)        |
| **Composability**   | ✅ Multiple functions                | ❌ Single function             |
| **Use Cases**       | Logging, analytics, data prefetching | Authentication, authorization  |
| **Return Types**    | `continue`, `redirect`, `block`      | `boolean`, `string` (redirect) |

### When to Use Middleware

- ✅ Multiple processing steps needed
- ✅ Logging and analytics
- ✅ Data prefetching
- ✅ Rate limiting
- ✅ Feature flags
- ✅ Cross-cutting concerns

### When to Use Guards

- ✅ Simple authentication checks
- ✅ Single authorization check
- ✅ Route-level protection
- ✅ Simple redirects

### Combining Both

```tsx
const routes = createRouter([
  {
    path: "/dashboard",
    component: <Dashboard />,
    middleware: [
      loggingMiddleware, // Log access
      analyticsMiddleware, // Track analytics
    ],
    guard: authGuard, // Simple auth check
  },
]);
```

---

## Troubleshooting

### Middleware Not Executing

**Problem:** Middleware functions are not being called.

**Solution:** Ensure middleware is defined in the route configuration:

```tsx
// ✅ Correct
const routes = createRouter([
  {
    path: "/dashboard",
    component: <Dashboard />,
    middleware: [myMiddleware], // Defined here
  },
]);
```

### Infinite Redirect Loop

**Problem:** Middleware causes infinite redirects.

**Solution:** Add conditions to prevent redirect loops:

```tsx
const authMiddleware: Middleware = async (context, next) => {
  // Prevent redirect loop
  if (context.pathname === "/login") {
    return next();
  }

  const token = localStorage.getItem("token");
  if (!token) {
    return { type: "redirect", to: "/login" };
  }

  return next();
};
```

### AbortSignal Errors

**Problem:** Fetch requests fail with AbortError.

**Solution:** Handle AbortError gracefully:

```tsx
const dataMiddleware: Middleware = async (context, next) => {
  try {
    const response = await fetch(url, { signal: context.signal });
    // Process response
    return next();
  } catch (error) {
    if (error.name === "AbortError") {
      // Request was cancelled, block navigation
      return { type: "block" };
    }
    throw error;
  }
};
```

---

## Summary

Middleware in Router-Kit provides a powerful, flexible way to process route navigation using the Chain of Responsibility pattern. Key takeaways:

- ✅ **Chain of Responsibility**: Process requests through middleware chains
- ✅ **Async Support**: Full async/await support with fetch
- ✅ **Composable**: Combine multiple middleware functions
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Built-in Helpers**: Ready-to-use middleware creators
- ✅ **Flexible**: Continue, redirect, or block navigation

For more information, see:

- [Complete Documentation](./DOCUMENTATION.md)
- [API Reference](./API_REFERENCE.md)
- [Quick Reference](./QUICK_REFERENCE.md)

---

Made with ❤️ by Mohammed Ben Cheikh
