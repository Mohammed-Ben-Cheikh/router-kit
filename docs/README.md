# Documentation Index

Complete documentation for Router-Kit v1.3.1

---

## 📚 Documentation Structure

This directory contains comprehensive documentation for Router-Kit. Choose the documentation that best fits your needs:

### For Users

- **[Quick Start Guide](#quick-start-guide)** - Get up and running in 5 minutes
- **[Complete Documentation](./DOCUMENTATION.md)** - Full feature guide with examples
- **[API Reference](./API_REFERENCE.md)** - Detailed API documentation
- **[Examples](./EXAMPLES.md)** - Real-world usage examples

### For Developers

- **[Architecture](./ARCHITECTURE.md)** - Internal implementation details
- **[Contributing Guide](#contributing)** - How to contribute to Router-Kit

---

## Quick Start Guide

### Installation

```bash
npm install router-kit
```

### Basic Setup

```tsx
import React from "react";
import { createRouter, RouterProvider, Link } from "router-kit";

// 1. Define your components
const Home = () => <h1>Home Page</h1>;
const About = () => <h1>About Page</h1>;

// 2. Create routes
const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "about", component: <About /> },
]);

// 3. Wrap your app with RouterProvider
function App() {
  return <RouterProvider routes={routes} />;
}

export default App;
```

### Navigation

```tsx
import { Link, NavLink } from "router-kit";

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <NavLink to="/about" activeClassName="active">
        About
      </NavLink>
    </nav>
  );
}
```

### Dynamic Routes

```tsx
import { useParams } from "router-kit";

// Route: /users/:id
const routes = createRouter([
  { path: "users/:id", component: <UserProfile /> },
]);

function UserProfile() {
  const { id } = useParams();
  return <h1>User {id}</h1>;
}
```

### Programmatic Navigation

```tsx
import { useRouter } from "router-kit";

function LoginForm() {
  const { navigate } = useRouter();

  const handleLogin = () => {
    // After successful login
    navigate("/dashboard");
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

---

## Documentation Files

### [DOCUMENTATION.md](./DOCUMENTATION.md)

**Complete user guide covering:**

- Introduction and key features
- Installation instructions
- Core concepts explained
- API reference with examples
- Advanced usage patterns
- Error handling strategies
- TypeScript support
- Best practices
- Migration guide from other routers
- Real-world examples

**Best for:** Learning Router-Kit from scratch, understanding concepts, and finding usage examples.

### [API_REFERENCE.md](./API_REFERENCE.md)

**Comprehensive API documentation including:**

- `createRouter()` function
- `RouterProvider` component
- `Link` and `NavLink` components
- `useRouter()` hook
- `useParams()` hook
- `useQuery()` hook
- `useLocation()` hook
- `useDynamicComponents()` hook
- Type definitions
- Error system reference

**Best for:** Looking up specific APIs, understanding function signatures, and exploring available options.

### [EXAMPLES.md](./EXAMPLES.md)

**Practical examples featuring:**

- Basic routing examples
- E-commerce application
- Blog platform
- Dashboard application
- Multi-language website
- Authentication flow
- Advanced patterns (lazy loading, modals, breadcrumbs, animations)

**Best for:** Finding real-world implementation patterns and copy-paste solutions.

### [ARCHITECTURE.md](./ARCHITECTURE.md)

**Technical implementation details including:**

- System architecture overview
- Core component implementations
- Route matching algorithm
- History management
- Context system
- Error handling system
- Type system
- Performance considerations
- Build and distribution

**Best for:** Understanding internals, contributing to the project, or debugging complex issues.

---

## Common Use Cases

### Simple Website

```tsx
const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "about", component: <About /> },
  { path: "contact", component: <Contact /> },
  { path: "/404", component: <NotFound /> },
]);
```

📖 **See:** [Basic Examples in EXAMPLES.md](./EXAMPLES.md#basic-examples)

### Blog or CMS

```tsx
const routes = createRouter([
  { path: "/", component: <BlogHome /> },
  { path: "posts/:category/:slug", component: <BlogPost /> },
  { path: "author/:username", component: <AuthorProfile /> },
]);
```

📖 **See:** [Blog Platform in EXAMPLES.md](./EXAMPLES.md#blog-platform)

### Dashboard Application

```tsx
const routes = createRouter([
  { path: "dashboard/:view", component: <Dashboard /> },
]);

function Dashboard() {
  const views = {
    overview: <OverviewView />,
    analytics: <AnalyticsView />,
    settings: <SettingsView />,
  };

  return useDynamicComponents(views, "view");
}
```

📖 **See:** [Dashboard Application in EXAMPLES.md](./EXAMPLES.md#dashboard-application)

### E-commerce Site

```tsx
const routes = createRouter([
  { path: "/", component: <HomePage /> },
  { path: "products", component: <ProductList /> },
  { path: "products/:id", component: <ProductDetail /> },
  { path: "cart", component: <Cart /> },
  { path: "checkout", component: <Checkout /> },
]);
```

📖 **See:** [E-commerce Application in EXAMPLES.md](./EXAMPLES.md#e-commerce-application)

### Protected Routes

```tsx
const routes = createRouter([
  { path: "/", component: <PublicHome /> },
  {
    path: "dashboard",
    component: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);
```

📖 **See:** [Authentication Flow in EXAMPLES.md](./EXAMPLES.md#authentication-flow)

---

## Feature Matrix

| Feature               | Status | Documentation                                    |
| --------------------- | ------ | ------------------------------------------------ |
| Static Routes         | ✅     | [Docs](./DOCUMENTATION.md#routes)                |
| Dynamic Routes        | ✅     | [Docs](./DOCUMENTATION.md#useparams)             |
| Nested Routes         | ✅     | [Docs](./DOCUMENTATION.md#nested-routes)         |
| Multiple Path Aliases | ✅     | [Docs](./DOCUMENTATION.md#multiple-path-aliases) |
| Query Parameters      | ✅     | [Docs](./DOCUMENTATION.md#usequery)              |
| Navigation State      | ✅     | [Docs](./DOCUMENTATION.md#navigation-state)      |
| Custom 404 Pages      | ✅     | [Docs](./DOCUMENTATION.md#custom-404-pages)      |
| TypeScript Support    | ✅     | [Docs](./DOCUMENTATION.md#typescript-support)    |
| Error Handling        | ✅     | [Docs](./DOCUMENTATION.md#error-handling)        |
| Dynamic Components    | ✅     | [Docs](./API_REFERENCE.md#usedynamiccomponents)  |
| Hash Routing          | ⏳     | Planned                                          |
| Regex Routes          | ⏳     | Planned                                          |

---

## Quick Reference

### Imports

```tsx
// Core
import { createRouter, RouterProvider } from "router-kit";

// Components
import { Link, NavLink } from "router-kit";

// Hooks
import {
  useRouter,
  useParams,
  useQuery,
  useLocation,
  useDynamicComponents,
} from "router-kit";

// Types
import type {
  Route,
  RouterContextType,
  NavigateOptions,
  Location,
  RouterKitError,
} from "router-kit";

// Error System
import { RouterErrorCode, RouterErrors, createRouterError } from "router-kit";
```

### Route Patterns

```tsx
// Static route
{ path: "about", component: <About /> }

// Dynamic parameter
{ path: "users/:id", component: <UserProfile /> }

// Multiple parameters
{ path: "posts/:category/:slug", component: <BlogPost /> }

// Multiple paths
{ path: ["about", "about-us"], component: <About /> }

// Nested routes
{
  path: "dashboard",
  component: <Dashboard />,
  children: [
    { path: "settings", component: <Settings /> }
  ]
}

// 404 page
{ path: "/404", component: <NotFound /> }
```

### Hook Usage

```tsx
// Get router context
const { path, navigate } = useRouter();

// Get route parameters
const { id, slug } = useParams();

// Get query parameters
const { search, page } = useQuery();

// Get location details
const { pathname, search, hash, state } = useLocation();

// Dynamic components
const component = useDynamicComponents(viewsObject, "paramName");
```

---

## Version Information

- **Current Version:** 1.3.1
- **React Version:** >=16 <20
- **TypeScript:** >=5.2.0
- **License:** MIT

---

## Support & Community

- **GitHub Repository:** [github.com/Mohammed-Ben-Cheikh/router-kit](https://github.com/Mohammed-Ben-Cheikh/router-kit)
- **Issues:** [Report bugs or request features](https://github.com/Mohammed-Ben-Cheikh/router-kit/issues)
- **Author:** Mohammed Ben Cheikh
- **Email:** mohammed.bencheikh.dev@gmail.com
- **Website:** [mohammedbencheikh.com](https://mohammedbencheikh.com/)

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests and type checks:** `npm run typecheck`
5. **Commit your changes:** `git commit -m 'Add amazing feature'`
6. **Push to your fork:** `git push origin feature/amazing-feature`
7. **Open a Pull Request**

**See:** [ARCHITECTURE.md](./ARCHITECTURE.md) for implementation details.

---

## Changelog

### v1.3.1 (Current)

- Full TypeScript support with comprehensive types
- Enhanced error handling system with detailed context
- New `useDynamicComponents` hook
- New `useLocation` hook with state support
- Improved type exports
- Better error messages

### Previous Versions

See [GitHub Releases](https://github.com/Mohammed-Ben-Cheikh/router-kit/releases) for full changelog.

---

## FAQ

### How does Router-Kit compare to React Router?

Router-Kit is simpler and lighter. It's perfect for small to medium projects that don't need the full complexity of React Router.

📖 **See:** [Migration Guide in DOCUMENTATION.md](./DOCUMENTATION.md#migration-guide)

### Can I use Router-Kit with TypeScript?

Yes! Router-Kit is written in TypeScript and provides full type definitions.

📖 **See:** [TypeScript Support in DOCUMENTATION.md](./DOCUMENTATION.md#typescript-support)

### How do I handle authentication?

Use the ProtectedRoute pattern with useRouter and useLocation hooks.

📖 **See:** [Authentication Flow in EXAMPLES.md](./EXAMPLES.md#authentication-flow)

### How do I create nested routes?

Use the `children` property in route configuration.

📖 **See:** [Nested Routes in DOCUMENTATION.md](./DOCUMENTATION.md#nested-routes)

### What about 404 pages?

Add a route with `path: "/404"` and Router-Kit will use it automatically.

📖 **See:** [Custom 404 Pages in DOCUMENTATION.md](./DOCUMENTATION.md#custom-404-pages)

---

## Learn More

Ready to dive deeper? Start with the [Complete Documentation](./DOCUMENTATION.md) or explore specific topics:

- New to Router-Kit? → [DOCUMENTATION.md](./DOCUMENTATION.md)
- Need API details? → [API_REFERENCE.md](./API_REFERENCE.md)
- Want examples? → [EXAMPLES.md](./EXAMPLES.md)
- Curious about internals? → [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Happy Routing! 🚀**
