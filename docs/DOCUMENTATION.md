# Router-Kit - Complete Documentation

**Version:** 1.3.1  
**Author:** Mohammed Ben Cheikh  
**License:** MIT  
**Repository:** [github.com/Mohammed-Ben-Cheikh/router-kit](https://github.com/Mohammed-Ben-Cheikh/router-kit)

---

## 📑 Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Core Concepts](#core-concepts)
5. [API Reference](#api-reference)
6. [Advanced Usage](#advanced-usage)
7. [Error Handling](#error-handling)
8. [TypeScript Support](#typescript-support)
9. [Best Practices](#best-practices)
10. [Migration Guide](#migration-guide)
11. [Examples](#examples)
12. [Contributing](#contributing)

---

## Introduction

**Router-Kit** is a lightweight, minimal, and powerful client-side routing library for React applications. It provides a simple yet flexible way to handle routing in your React apps without the overhead of larger routing libraries.

### Key Features

- ✨ **Lightweight**: Minimal dependencies (only `react`, `react-dom`, and `url-join`)
- 🚀 **Simple API**: Easy to learn and use
- 🎯 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🔄 **Dynamic Routes**: Support for route parameters (`:id`, `:slug`, etc.)
- 🌳 **Nested Routes**: Build complex route hierarchies
- 🔗 **Navigation Components**: Built-in `Link` and `NavLink` components
- 🪝 **Powerful Hooks**: Access routing state with React hooks
- 🎨 **Custom 404 Pages**: Easy error page configuration
- 🔀 **Multiple Path Aliases**: Support for multiple paths per route
- 📦 **Dynamic Components**: Conditional component rendering based on route params
- ⚠️ **Error System**: Comprehensive error handling with detailed context

### Why Router-Kit?

Router-Kit was designed to be a simpler alternative to complex routing libraries while still providing all the essential features you need:

- No complex configuration files
- No route configuration DSL to learn
- Direct component rendering (JSX elements, not lazy imports)
- Straightforward programmatic navigation
- Perfect for small to medium-sized applications

---

## Installation

### npm

```bash
npm install router-kit
```

### yarn

```bash
yarn add router-kit
```

### pnpm

```bash
pnpm add router-kit
```

### Peer Dependencies

Router-Kit requires React 16 or higher:

```json
{
  "react": ">=16 <20",
  "react-dom": ">=16 <20"
}
```

---

## Quick Start

Here's a minimal example to get you started:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider, Link } from "router-kit";

// Define your page components
const Home = () => (
  <div>
    <h1>Home Page</h1>
    <Link to="/about">Go to About</Link>
  </div>
);

const About = () => (
  <div>
    <h1>About Page</h1>
    <Link to="/">Go to Home</Link>
  </div>
);

const NotFound = () => <div>404 - Page Not Found</div>;

// Create your routes
const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "about", component: <About /> },
  { path: "/404", component: <NotFound /> },
]);

// Render your app
function App() {
  return <RouterProvider routes={routes} />;
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
```

---

## Core Concepts

### Routes

A route is an object that maps a URL path to a React component:

```typescript
interface Route {
  path: string | string[]; // The URL path(s) to match
  component: JSX.Element; // The component to render
  children?: Route[]; // Nested child routes
}
```

### Router Provider

The `RouterProvider` is the main component that:

- Listens to URL changes
- Matches the current URL to a route
- Renders the appropriate component
- Provides routing context to child components

### Navigation

Router-Kit provides multiple ways to navigate:

1. **Link Component**: Declarative navigation with anchor tags
2. **NavLink Component**: Link with active state styling
3. **navigate() Function**: Programmatic navigation via the `useRouter` hook

### Route Matching

Routes are matched using the following rules:

1. **Static Routes**: Exact path matching (e.g., `/about`, `/contact`)
2. **Dynamic Routes**: Parameters prefixed with `:` (e.g., `/users/:id`)
3. **Multiple Paths**: Routes can have multiple path aliases using arrays
4. **Nested Routes**: Child routes inherit parent paths
5. **Priority**: Static routes are matched before dynamic routes

---

## API Reference

### createRouter(routes)

Creates and normalizes a route configuration.

**Parameters:**

- `routes`: `Route[]` - Array of route objects

**Returns:** `Route[]` - Normalized routes

**Features:**

- Removes leading slashes from paths
- Handles multiple path aliases
- Recursively processes nested routes

**Example:**

```tsx
const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: ["about", "about-us"], component: <About /> },
  {
    path: "users",
    component: <Users />,
    children: [{ path: ":id", component: <UserDetail /> }],
  },
  { path: "/404", component: <NotFound /> },
]);
```

---

### RouterProvider

The main routing component that wraps your application.

**Props:**

- `routes`: `Route[]` - The routes created by `createRouter()`

**Context Provided:**

- `path`: Current pathname
- `fullPathWithParams`: Route pattern with parameters (e.g., `/users/:id`)
- `navigate`: Function to programmatically navigate

**Example:**

```tsx
function App() {
  return <RouterProvider routes={routes} />;
}
```

**Important:** All Router-Kit hooks and components must be used inside `RouterProvider`.

---

### Link Component

A navigation component that renders an anchor tag without full page reload.

**Props:**

- `to`: `string` - Destination path (required)
- `children`: `ReactNode` - Link content (required)
- `className?`: `string` - CSS class name (optional)

**Example:**

```tsx
import { Link } from "router-kit";

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about" className="nav-link">
        About
      </Link>
      <Link to="/users/123">User Profile</Link>
    </nav>
  );
}
```

---

### NavLink Component

Similar to `Link` but adds an active class when the current route matches.

**Props:**

- `to`: `string` - Destination path (required)
- `children`: `ReactNode` - Link content (required)
- `className?`: `string` - CSS class name (optional)
- `activeClassName?`: `string` - Class when route is active (default: `"active"`)

**Example:**

```tsx
import { NavLink } from "router-kit";

function Navigation() {
  return (
    <nav>
      <NavLink to="/" activeClassName="active">
        Home
      </NavLink>
      <NavLink to="/about" activeClassName="selected">
        About
      </NavLink>
      <NavLink to="/contact">Contact</NavLink>
    </nav>
  );
}
```

**Styling:**

```css
.nav-link {
  color: #333;
  text-decoration: none;
}

.nav-link.active {
  color: #007bff;
  font-weight: bold;
}
```

---

### useRouter()

Hook to access the router context.

**Returns:**

```typescript
{
  path: string;                    // Current pathname
  fullPathWithParams: string;      // Route pattern with params
  navigate: (to: string, options?: NavigateOptions) => void;
}
```

**Example:**

```tsx
import { useRouter } from "router-kit";

function MyComponent() {
  const { path, navigate } = useRouter();

  return (
    <div>
      <p>Current path: {path}</p>
      <button onClick={() => navigate("/home")}>Go Home</button>
    </div>
  );
}
```

**Navigate Options:**

```typescript
interface NavigateOptions {
  replace?: boolean; // Replace history entry instead of push
  state?: any; // State to pass with navigation
}
```

**Example with options:**

```tsx
// Replace current history entry
navigate("/login", { replace: true });

// Pass state data
navigate("/dashboard", {
  state: { from: "/login" },
});
```

---

### useParams()

Hook to extract dynamic route parameters.

**Returns:** `{ [key: string]: string }` - Object with parameter key-value pairs

**Example:**

```tsx
import { useParams } from "router-kit";

// Route: /users/:id
// URL: /users/123

function UserProfile() {
  const params = useParams();

  console.log(params.id); // "123"

  return <div>User ID: {params.id}</div>;
}
```

**Multiple Parameters:**

```tsx
// Route: /posts/:category/:id
// URL: /posts/tech/456

function PostDetail() {
  const { category, id } = useParams();

  return (
    <div>
      <p>Category: {category}</p> {/* "tech" */}
      <p>Post ID: {id}</p> {/* "456" */}
    </div>
  );
}
```

---

### useQuery()

Hook to parse URL query parameters.

**Returns:** `{ [key: string]: string }` - Object with query parameter key-value pairs

**Example:**

```tsx
import { useQuery } from "router-kit";

// URL: /search?q=react&sort=recent&page=2

function SearchResults() {
  const query = useQuery();

  console.log(query.q); // "react"
  console.log(query.sort); // "recent"
  console.log(query.page); // "2"

  return (
    <div>
      <h2>Search: {query.q}</h2>
      <p>Sort: {query.sort}</p>
      <p>Page: {query.page}</p>
    </div>
  );
}
```

**Server-Side Rendering:**

Returns an empty object `{}` when `window` is undefined (SSR-safe).

---

### useLocation()

Hook to access the current location details.

**Returns:**

```typescript
{
  pathname: string; // Current path
  search: string; // Query string (including "?")
  hash: string; // Hash fragment (including "#")
  state: any; // State passed via navigate()
}
```

**Example:**

```tsx
import { useLocation } from "router-kit";

function LocationInfo() {
  const location = useLocation();

  return (
    <div>
      <p>Path: {location.pathname}</p>
      <p>Search: {location.search}</p>
      <p>Hash: {location.hash}</p>
      <pre>{JSON.stringify(location.state, null, 2)}</pre>
    </div>
  );
}
```

**URL:** `/products?category=electronics#reviews`

**Output:**

```json
{
  "pathname": "/products",
  "search": "?category=electronics",
  "hash": "#reviews",
  "state": null
}
```

---

### useDynamicComponents()

Hook for conditional component rendering based on route parameters.

**Signature:**

```typescript
useDynamicComponents(
  dynamicComponentsObject: Record<string, JSX.Element>,
  variationParam: string
): JSX.Element
```

**Parameters:**

- `dynamicComponentsObject`: Object mapping parameter values to components
- `variationParam`: The route parameter name to check

**Returns:** `JSX.Element` - The matched component

**Example:**

```tsx
import { useDynamicComponents, useParams } from "router-kit";

// Route: /dashboard/:view
// URL: /dashboard/analytics

const views = {
  analytics: <AnalyticsView />,
  reports: <ReportsView />,
  settings: <SettingsView />,
};

function Dashboard() {
  const component = useDynamicComponents(views, "view");
  return <div className="dashboard">{component}</div>;
}
```

**Error Handling:**

The hook throws detailed errors if:

- Parameter is not defined
- Parameter is not a string
- Parameter is an empty string
- Component variation is not found

---

## Advanced Usage

### Nested Routes

Create hierarchical route structures:

```tsx
const routes = createRouter([
  {
    path: "dashboard",
    component: <DashboardLayout />,
    children: [
      { path: "", component: <DashboardHome /> },
      { path: "analytics", component: <Analytics /> },
      { path: "reports", component: <Reports /> },
      {
        path: "settings",
        component: <Settings />,
        children: [
          { path: "profile", component: <ProfileSettings /> },
          { path: "security", component: <SecuritySettings /> },
        ],
      },
    ],
  },
]);
```

**Resulting URLs:**

- `/dashboard` → `<DashboardHome />`
- `/dashboard/analytics` → `<Analytics />`
- `/dashboard/settings/profile` → `<ProfileSettings />`

---

### Multiple Path Aliases

Define multiple paths for the same route:

```tsx
const routes = createRouter([
  {
    path: ["about", "about-us", "info"],
    component: <About />,
  },
  {
    path: ["contact", "get-in-touch"],
    component: <Contact />,
  },
]);
```

All these URLs render the same component:

- `/about` → `<About />`
- `/about-us` → `<About />`
- `/info` → `<About />`

---

### Custom 404 Pages

Define a custom 404 page by using the path `"/404"` or `"404"`:

```tsx
const NotFound = () => (
  <div className="error-page">
    <h1>404</h1>
    <p>Page not found</p>
    <Link to="/">Go Home</Link>
  </div>
);

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "/404", component: <NotFound /> },
]);
```

Router-Kit automatically displays this component when no route matches.

**Default 404 Page:**

If you don't provide a custom 404 route, Router-Kit uses a built-in styled 404 page with:

- Large "404" heading
- "Page Not Found" message
- "Go Back Home" button
- Professional styling

---

### Programmatic Navigation

Navigate from anywhere using the `useRouter` hook:

```tsx
import { useRouter } from "router-kit";

function LoginForm() {
  const { navigate } = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(credentials);

    if (success) {
      // Redirect to dashboard
      navigate("/dashboard");

      // Or replace history entry
      navigate("/dashboard", { replace: true });

      // Or pass state
      navigate("/dashboard", {
        state: { from: "/login", user: userData },
      });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

### Protected Routes

Create protected routes with authentication:

```tsx
import { useRouter } from "router-kit";
import { useAuth } from "./auth";

function ProtectedRoute({ children }) {
  const { navigate } = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return children;
}

// Usage
const routes = createRouter([
  { path: "/login", component: <Login /> },
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

---

### Layout Components

Share layouts across multiple routes:

```tsx
function MainLayout({ children }) {
  return (
    <div className="layout">
      <Header />
      <aside>
        <Sidebar />
      </aside>
      <main>{children}</main>
      <Footer />
    </div>
  );
}

const routes = createRouter([
  {
    path: "",
    component: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
  },
  {
    path: "about",
    component: (
      <MainLayout>
        <About />
      </MainLayout>
    ),
  },
  {
    path: "admin",
    component: (
      <AdminLayout>
        <AdminPanel />
      </AdminLayout>
    ),
  },
]);
```

---

### Route Guards

Implement route guards for authorization:

```tsx
function AdminGuard({ children, requiredRole }) {
  const { navigate } = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== requiredRole) {
      navigate("/unauthorized", { replace: true });
    }
  }, [user, requiredRole, navigate]);

  return user?.role === requiredRole ? children : null;
}

// Usage
const routes = createRouter([
  {
    path: "admin",
    component: (
      <AdminGuard requiredRole="admin">
        <AdminDashboard />
      </AdminGuard>
    ),
  },
]);
```

---

### Scroll Restoration

Restore scroll position on navigation:

```tsx
import { useEffect } from "react";
import { useLocation } from "router-kit";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <RouterProvider routes={routes}>
      <ScrollToTop />
      {/* Rest of your app */}
    </RouterProvider>
  );
}
```

---

### Navigation State

Pass and access state during navigation:

```tsx
// Component A - Sending state
function ProductList() {
  const { navigate } = useRouter();

  const handleViewProduct = (product) => {
    navigate(`/products/${product.id}`, {
      state: {
        productName: product.name,
        from: "/products",
      },
    });
  };

  return <button onClick={() => handleViewProduct(product)}>View</button>;
}

// Component B - Receiving state
function ProductDetail() {
  const { state } = useLocation();
  const params = useParams();

  return (
    <div>
      <h1>{state?.productName || "Product"}</h1>
      <p>ID: {params.id}</p>
      {state?.from && <Link to={state.from}>Go Back</Link>}
    </div>
  );
}
```

---

## Error Handling

Router-Kit provides a comprehensive error handling system with detailed error codes and context.

### RouterKitError Class

All Router-Kit errors extend the `RouterKitError` class:

```typescript
class RouterKitError extends Error {
  code: RouterErrorCode;
  context?: Record<string, any>;

  toConsoleMessage(): string;
}
```

### Error Codes

```typescript
enum RouterErrorCode {
  ROUTER_NOT_INITIALIZED = "ROUTER_NOT_INITIALIZED",
  PARAM_NOT_DEFINED = "PARAM_NOT_DEFINED",
  PARAM_INVALID_TYPE = "PARAM_INVALID_TYPE",
  PARAM_EMPTY_STRING = "PARAM_EMPTY_STRING",
  COMPONENT_NOT_FOUND = "COMPONENT_NOT_FOUND",
  NAVIGATION_ABORTED = "NAVIGATION_ABORTED",
  INVALID_ROUTE = "INVALID_ROUTE",
}
```

### Catching Errors

```tsx
import { RouterKitError, RouterErrorCode } from "router-kit";

try {
  const component = useDynamicComponents(views, "view");
} catch (error) {
  if (error instanceof RouterKitError) {
    console.log("Error code:", error.code);
    console.log("Context:", error.context);

    switch (error.code) {
      case RouterErrorCode.COMPONENT_NOT_FOUND:
        // Show fallback component
        return <DefaultView />;
      case RouterErrorCode.PARAM_NOT_DEFINED:
        // Redirect to error page
        navigate("/error");
        break;
    }
  }
}
```

### Common Errors

**1. Router Not Initialized**

Thrown when hooks/components are used outside `RouterProvider`:

```tsx
// ❌ Wrong
function App() {
  const { navigate } = useRouter(); // Error!
  return <RouterProvider routes={routes} />;
}

// ✅ Correct
function Navigation() {
  const { navigate } = useRouter(); // OK
  return <nav>...</nav>;
}

function App() {
  return (
    <RouterProvider routes={routes}>
      <Navigation />
    </RouterProvider>
  );
}
```

**2. Component Not Found**

Thrown when a dynamic component variation doesn't exist:

```tsx
const views = {
  analytics: <Analytics />,
  reports: <Reports />,
};

// URL: /dashboard/settings
// Error: Component not found for variation "settings"
useDynamicComponents(views, "view");
```

**3. Parameter Not Defined**

Thrown when accessing undefined route parameters:

```tsx
// Route: /users/:id
// URL: /users/123

function UserProfile() {
  const params = useParams();
  console.log(params.userId); // undefined
  // Using useDynamicComponents with "userId" will throw error
}
```

---

## TypeScript Support

Router-Kit is written in TypeScript and provides full type definitions.

### Type Imports

```tsx
import type {
  Route,
  RouterContextType,
  NavigateOptions,
  Location,
  RouterKitError,
  DynamicComponents,
  GetComponent,
  Routes,
} from "router-kit";
```

### Typed Routes

```tsx
import type { Route } from "router-kit";

const routes: Route[] = [
  { path: "/", component: <Home /> },
  { path: "about", component: <About /> },
];
```

### Typed Context

```tsx
import type { RouterContextType } from "router-kit";
import { useRouter } from "router-kit";

function MyComponent() {
  const router: RouterContextType = useRouter();

  router.navigate("/home");
}
```

### Custom Type Extensions

```tsx
// Extend Location type with custom state
interface CustomLocationState {
  from?: string;
  user?: { id: string; name: string };
}

function MyComponent() {
  const location = useLocation();
  const state = location.state as CustomLocationState;

  if (state?.from) {
    console.log("Came from:", state.from);
  }
}
```

---

## Best Practices

### 1. Route Organization

Keep routes in a separate file:

```tsx
// routes.tsx
import { createRouter } from "router-kit";
import { Home, About, Contact, UserProfile } from "./pages";

export const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "about", component: <About /> },
  { path: "contact", component: <Contact /> },
  { path: "users/:id", component: <UserProfile /> },
  { path: "/404", component: <NotFound /> },
]);

// App.tsx
import { RouterProvider } from "router-kit";
import { routes } from "./routes";

function App() {
  return <RouterProvider routes={routes} />;
}
```

### 2. Navigation Functions

Create reusable navigation functions:

```tsx
// navigation.ts
import { NavigateOptions } from "router-kit";

export const navigationHelpers = (
  navigate: (to: string, options?: NavigateOptions) => void
) => ({
  goToHome: () => navigate("/"),
  goToProfile: (userId: string) => navigate(`/users/${userId}`),
  goBack: () => window.history.back(),
  replaceWithLogin: () => navigate("/login", { replace: true }),
});

// Usage
function MyComponent() {
  const { navigate } = useRouter();
  const nav = navigationHelpers(navigate);

  return <button onClick={nav.goToHome}>Home</button>;
}
```

### 3. Route Constants

Use constants for route paths:

```tsx
// routes/constants.ts
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  USER_PROFILE: "/users/:id",
  DASHBOARD: "/dashboard",
} as const;

// Usage
import { ROUTES } from "./routes/constants";

<Link to={ROUTES.HOME}>Home</Link>
<Link to={ROUTES.ABOUT}>About</Link>

navigate(ROUTES.HOME);
```

### 4. Error Boundaries

Wrap routes with error boundaries:

```tsx
import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider routes={routes} />
    </ErrorBoundary>
  );
}
```

### 5. Loading States

Handle loading states during navigation:

```tsx
function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleEnd = () => setLoading(false);

    window.addEventListener("locationchange", handleStart);

    const timer = setTimeout(handleEnd, 100);

    return () => {
      window.removeEventListener("locationchange", handleStart);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {loading && <LoadingBar />}
      <RouterProvider routes={routes} />
    </>
  );
}
```

### 6. Meta Tags Management

Update document title and meta tags:

```tsx
import { useEffect } from "react";
import { useLocation } from "router-kit";

const routeTitles: Record<string, string> = {
  "/": "Home - My App",
  "/about": "About Us - My App",
  "/contact": "Contact - My App",
};

function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = routeTitles[pathname] || "My App";
  }, [pathname]);

  return null;
}
```

---

## Migration Guide

### From React Router

**React Router:**

```tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Router-Kit:**

```tsx
import {
  createRouter,
  RouterProvider,
  Link,
  useRouter,
  useParams,
} from "router-kit";

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "about", component: <About /> },
  { path: "users/:id", component: <UserProfile /> },
]);

function App() {
  return <RouterProvider routes={routes} />;
}
```

**Key Differences:**

| React Router              | Router-Kit                                  |
| ------------------------- | ------------------------------------------- |
| `useNavigate()`           | `useRouter().navigate`                      |
| `<Outlet />`              | Not needed (components render directly)     |
| `element={<Component />}` | `component={<Component />}`                 |
| `<Route path="*" />`      | `{ path: "/404", component: <NotFound /> }` |

---

## Examples

### Complete E-commerce App

```tsx
import {
  createRouter,
  RouterProvider,
  NavLink,
  useParams,
  useRouter,
} from "router-kit";

// Pages
const Home = () => (
  <div>
    <h1>Welcome to Our Store</h1>
    <NavLink to="/products">Browse Products</NavLink>
  </div>
);

const ProductList = () => {
  const products = [
    { id: 1, name: "Product 1" },
    { id: 2, name: "Product 2" },
  ];

  return (
    <div>
      <h1>Products</h1>
      {products.map((p) => (
        <NavLink key={p.id} to={`/products/${p.id}`}>
          {p.name}
        </NavLink>
      ))}
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const { navigate } = useRouter();

  const addToCart = () => {
    // Add logic
    navigate("/cart");
  };

  return (
    <div>
      <h1>Product {id}</h1>
      <button onClick={addToCart}>Add to Cart</button>
    </div>
  );
};

const Cart = () => (
  <div>
    <h1>Shopping Cart</h1>
  </div>
);

// Routes
const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "products", component: <ProductList /> },
  { path: "products/:id", component: <ProductDetail /> },
  { path: "cart", component: <Cart /> },
  { path: "/404", component: <div>404 Not Found</div> },
]);

function App() {
  return <RouterProvider routes={routes} />;
}
```

### Blog with Categories

```tsx
const routes = createRouter([
  { path: "/", component: <BlogHome /> },
  { path: "posts/:category/:slug", component: <BlogPost /> },
  { path: "author/:username", component: <AuthorProfile /> },
]);

function BlogPost() {
  const { category, slug } = useParams();
  const query = useQuery();

  return (
    <article>
      <p>Category: {category}</p>
      <p>Slug: {slug}</p>
      {query.ref && <p>Referred from: {query.ref}</p>}
    </article>
  );
}
```

### Dashboard with Tabs

```tsx
const views = {
  overview: <Overview />,
  analytics: <Analytics />,
  reports: <Reports />,
  settings: <Settings />,
};

function Dashboard() {
  const component = useDynamicComponents(views, "tab");

  return (
    <div className="dashboard">
      <nav>
        <NavLink to="/dashboard/overview">Overview</NavLink>
        <NavLink to="/dashboard/analytics">Analytics</NavLink>
        <NavLink to="/dashboard/reports">Reports</NavLink>
        <NavLink to="/dashboard/settings">Settings</NavLink>
      </nav>
      <main>{component}</main>
    </div>
  );
}

const routes = createRouter([
  { path: "dashboard/:tab", component: <Dashboard /> },
]);
```

---

## Contributing

Contributions are welcome! Here's how you can help:

### Development Setup

1. Clone the repository:

```bash
git clone https://github.com/Mohammed-Ben-Cheikh/router-kit.git
cd router-kit
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Watch mode for development:

```bash
npm run build:watch
```

### Scripts

- `npm run clean` - Remove dist folder
- `npm run build` - Compile TypeScript
- `npm run typecheck` - Type check without emitting files
- `npm run pack:verify` - Verify package contents
- `npm audit` - Check for vulnerabilities

### Contribution Guidelines

1. **Fork the repository** and create a feature branch
2. **Write clear commit messages** following conventional commits
3. **Add tests** for new features
4. **Update documentation** for API changes
5. **Ensure TypeScript types** are correct
6. **Test thoroughly** before submitting PR

### Feature Requests

- Hash-based routing (`#/path`)
- Regex route matching
- Wildcard routes
- Route middleware
- Lazy loading support
- Animated transitions
- More comprehensive test suite

---

## License

MIT License - Copyright (c) 2025 Mohammed Ben Cheikh

See [LICENSE](../LICENSE) file for details.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/Mohammed-Ben-Cheikh/router-kit/issues)
- **Email:** mohammed.bencheikh.dev@gmail.com
- **Website:** [mohammedbencheikh.com](https://mohammedbencheikh.com/)

---

**Made with ❤️ by Mohammed Ben Cheikh**
