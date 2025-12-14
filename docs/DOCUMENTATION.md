# Router-Kit - Complete Documentation

**Version:** 2.1.0  
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
   - [Components](#components)
   - [Hooks](#hooks)
   - [Types](#types)
6. [Advanced Usage](#advanced-usage)
   - [Route Guards](#route-guards)
   - [Middleware](#middleware)
   - [Data Loading](#data-loading)
   - [Navigation Blocking](#navigation-blocking)
   - [Scroll Restoration](#scroll-restoration)
   - [Lazy Loading](#lazy-loading)
7. [Error Handling](#error-handling)
8. [TypeScript Support](#typescript-support)
9. [Best Practices](#best-practices)
10. [Migration Guide](#migration-guide)
11. [Examples](#examples)
12. [Contributing](#contributing)

---

## Introduction

**Router-Kit** is a professional-grade, feature-rich client-side routing library for React applications. Version 2.0 brings React Router-like capabilities while maintaining a clean, intuitive API.

### Key Features

- ✨ **Lightweight**: Minimal dependencies with powerful features
- 🚀 **Simple API**: Easy to learn, familiar patterns from React Router
- 🎯 **Type-Safe**: Full TypeScript support with 25+ type definitions
- 🔄 **Dynamic Routes**: Support for route parameters (`:id`, `:slug`, etc.)
- 🌳 **Nested Routes**: Build complex route hierarchies
- 🔗 **Navigation Components**: Enhanced `Link` and `NavLink` with forwardRef
- 🪝 **Powerful Hooks**: 8 hooks for complete routing control
- 🛡️ **Route Guards**: Built-in authentication and authorization support
- 📦 **Data Loading**: Route-level data fetching with loaders
- 🚫 **Navigation Blocking**: Prevent accidental navigation with blockers
- 🎭 **Outlet**: Nested route rendering for professional layouts
- 📜 **Scroll Restoration**: Automatic scroll position management
- ⚡ **Lazy Loading**: Code splitting with React.lazy support
- 🎨 **Custom Error Pages**: Configurable 404 and error handling
- 📋 **Route Metadata**: SEO and document title management
- 🔀 **Multiple Path Aliases**: Support for multiple paths per route
- ⚠️ **Error System**: Comprehensive error handling with detailed context

### What's New in v2.0

- **Route Guards**: Async authentication/authorization with redirects
- **Data Loaders**: Fetch data before rendering routes
- **Navigation Blocking**: Block navigation with custom prompts
- **Scroll Restoration**: Auto/manual scroll position management
- **Outlet Component**: Professional nested layouts with `<Outlet />` and `useOutletContext`
- **New Hooks**: `useNavigate`, `useMatches`, `useBlocker`, `useLoaderData`, `useSearchParams`, `useOutlet`, `useOutletContext`
- **Enhanced Components**: ForwardRef support, external link detection
- **Basename Support**: Deploy to any subdirectory
- **Route Metadata**: Document titles and custom meta data
- **Lazy Loading**: Built-in code splitting support

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

Here's a minimal example to get you started with Router-Kit v2.0:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider, Link, useNavigate } from "router-kit";

// Define your page components
const Home = () => (
  <div>
    <h1>Home Page</h1>
    <Link to="/about">Go to About</Link>
  </div>
);

const About = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>About Page</h1>
      <button onClick={() => navigate("/")}>Go to Home</button>
    </div>
  );
};

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  return <div>User ID: {id}</div>;
};

const NotFound = () => <div>404 - Page Not Found</div>;

// Create your routes with guards and loaders
const routes = createRouter([
  {
    path: "/",
    component: <Home />,
    meta: { title: "Home - My App" },
  },
  {
    path: "about",
    component: <About />,
    meta: { title: "About - My App" },
  },
  {
    path: "users/:id",
    component: <UserProfile />,
    loader: async ({ params }) => {
      const res = await fetch(`/api/users/${params.id}`);
      return res.json();
    },
  },
  { path: "/404", component: <NotFound /> },
]);

// Render your app
function App() {
  return (
    <RouterProvider routes={routes} basename="/app" scrollRestoration="auto" />
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
```

---

## Core Concepts

### Routes

A route is an object that maps a URL path to a React component with optional configuration:

```typescript
interface Route {
  path: string | string[]; // URL path(s) to match
  component: JSX.Element; // Component to render
  children?: Route[]; // Nested child routes
  loader?: RouteLoader; // Data loading function
  guard?: RouteGuard; // Authentication/authorization
  meta?: RouteMeta; // Metadata (title, etc.)
  redirectTo?: string; // Redirect destination
  errorElement?: JSX.Element; // Error fallback component
  lazy?: () => Promise<{ default: ComponentType }>; // Lazy loading
  index?: boolean; // Index route flag
}
```

### Router Provider

The `RouterProvider` is the main component that:

- Listens to URL changes via History API
- Matches the current URL to routes
- Executes route guards and loaders
- Renders the appropriate component
- Provides routing context to all descendants
- Manages scroll restoration
- Handles navigation blocking

**Props:**

```typescript
interface RouterProviderProps {
  routes: Route[]; // Routes from createRouter
  basename?: string; // Base URL path (e.g., "/app")
  scrollRestoration?: "auto" | "manual"; // Scroll behavior
  fallback?: ReactNode; // Suspense fallback for lazy routes
}
```

### Navigation

Router-Kit provides multiple ways to navigate:

1. **Link Component**: Declarative navigation with enhanced features
2. **NavLink Component**: Link with active state styling and partial matching
3. **useNavigate Hook**: Programmatic navigation function
4. **useRouter Hook**: Full router context access

### Route Matching

Routes are matched using the following rules:

1. **Static Routes**: Exact path matching (e.g., `/about`, `/contact`)
2. **Dynamic Routes**: Parameters prefixed with `:` (e.g., `/users/:id`)
3. **Catch-all Routes**: Match remaining path segments
4. **Multiple Paths**: Routes can have multiple path aliases
5. **Nested Routes**: Child routes inherit parent paths
6. **Priority**: Static routes are matched before dynamic routes

---

## API Reference

### createRouter(routes)

Creates and normalizes a route configuration with validation.

**Parameters:**

- `routes`: `Route[]` - Array of route objects

**Returns:** `Route[]` - Normalized and validated routes

**Features:**

- Normalizes paths (removes leading slashes)
- Validates route configuration
- Handles multiple path aliases
- Recursively processes nested routes

**Example:**

```tsx
const routes = createRouter([
  {
    path: "/",
    component: <Home />,
    meta: { title: "Home" },
  },
  {
    path: ["about", "about-us"],
    component: <About />,
  },
  {
    path: "users",
    component: <Users />,
    guard: async () => {
      const isAuthenticated = await checkAuth();
      return isAuthenticated || { redirect: "/login" };
    },
    children: [{ path: ":id", component: <UserDetail /> }],
  },
  { path: "/404", component: <NotFound /> },
]);
```

---

### RouterProvider

The main routing component that wraps your application.

**Props:**

| Prop                | Type                 | Default  | Description                      |
| ------------------- | -------------------- | -------- | -------------------------------- |
| `routes`            | `Route[]`            | required | Routes from `createRouter()`     |
| `basename`          | `string`             | `""`     | Base URL path for all routes     |
| `scrollRestoration` | `"auto" \| "manual"` | `"auto"` | Scroll position management       |
| `fallback`          | `ReactNode`          | `null`   | Loading fallback for lazy routes |

**Example:**

```tsx
function App() {
  return (
    <RouterProvider
      routes={routes}
      basename="/my-app"
      scrollRestoration="auto"
      fallback={<LoadingSpinner />}
    />
  );
}
```

---

### Link Component

A navigation component with enhanced features including forwardRef support.

**Props:**

| Prop        | Type        | Default  | Description           |
| ----------- | ----------- | -------- | --------------------- |
| `to`        | `string`    | required | Destination path      |
| `children`  | `ReactNode` | required | Link content          |
| `className` | `string`    | -        | CSS class name        |
| `replace`   | `boolean`   | `false`  | Replace history entry |
| `state`     | `any`       | -        | Navigation state      |
| `target`    | `string`    | -        | Link target attribute |
| `rel`       | `string`    | -        | Link rel attribute    |

**Features:**

- **ForwardRef**: Access the underlying anchor element
- **External Links**: Automatically detects and handles external URLs
- **Security**: Adds `rel="noopener noreferrer"` for external links
- **Navigation Options**: Support for replace and state

**Example:**

```tsx
import { Link } from "router-kit";

function Navigation() {
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <nav>
      <Link to="/" ref={linkRef}>
        Home
      </Link>
      <Link to="/about" className="nav-link">
        About
      </Link>
      <Link to="/users/123" state={{ from: "nav" }}>
        User Profile
      </Link>
      <Link to="/login" replace>
        Login
      </Link>
      <Link to="https://external.com">External Link</Link>
    </nav>
  );
}
```

---

### NavLink Component

Similar to `Link` but with active state styling and partial matching support.

**Props:**

Inherits all Link props plus:

| Prop              | Type                                  | Default    | Description                   |
| ----------------- | ------------------------------------- | ---------- | ----------------------------- |
| `activeClassName` | `string`                              | `"active"` | Class when route matches      |
| `activeStyle`     | `CSSProperties`                       | -          | Style when route matches      |
| `end`             | `boolean`                             | `false`    | Exact match only (no partial) |
| `isActive`        | `(match, location) => boolean`        | -          | Custom active logic           |
| `children`        | `ReactNode \| ((props) => ReactNode)` | required   | Content or render function    |

**Features:**

- **Partial Matching**: `/users` is active for `/users/123`
- **Exact Matching**: Use `end` prop for exact matching only
- **Custom Active Logic**: Override with `isActive` function
- **Render Props**: Access `isActive` in children function

**Example:**

```tsx
import { NavLink } from "router-kit";

function Navigation() {
  return (
    <nav>
      {/* Exact match only for home */}
      <NavLink to="/" end activeClassName="active">
        Home
      </NavLink>

      {/* Partial matching for users section */}
      <NavLink
        to="/users"
        activeClassName="active"
        activeStyle={{ fontWeight: "bold" }}
      >
        Users
      </NavLink>

      {/* Custom active logic */}
      <NavLink
        to="/dashboard"
        isActive={(match, location) => {
          return location.pathname.startsWith("/dashboard");
        }}
      >
        Dashboard
      </NavLink>

      {/* Render props pattern */}
      <NavLink to="/settings">
        {({ isActive }) => (
          <span className={isActive ? "active" : ""}>
            ⚙️ Settings {isActive && "✓"}
          </span>
        )}
      </NavLink>
    </nav>
  );
}
```

---

### Route Component

Define routes declaratively with JSX.

**Props:**

| Prop           | Type                 | Description           |
| -------------- | -------------------- | --------------------- |
| `path`         | `string \| string[]` | URL path(s) to match  |
| `component`    | `JSX.Element`        | Component to render   |
| `children`     | `ReactNode`          | Nested Route elements |
| `loader`       | `RouteLoader`        | Data loading function |
| `guard`        | `RouteGuard`         | Guard function        |
| `meta`         | `RouteMeta`          | Route metadata        |
| `redirectTo`   | `string`             | Redirect destination  |
| `errorElement` | `JSX.Element`        | Error fallback        |
| `lazy`         | `() => Promise`      | Lazy loading function |
| `index`        | `boolean`            | Index route flag      |

**Example:**

```tsx
import { Router, Route } from "router-kit";

function App() {
  return (
    <Router fallback={<Loading />}>
      <Route path="/" component={<Home />} meta={{ title: "Home" }} />
      <Route path="users" component={<UsersLayout />} guard={authGuard}>
        <Route index component={<UsersList />} />
        <Route path=":id" component={<UserProfile />} loader={userLoader} />
      </Route>
      <Route path="/404" component={<NotFound />} />
    </Router>
  );
}
```

---

### Outlet Component

Renders the child route's element, if there is one. Used in parent route elements to render their child routes. This pattern enables nested layouts similar to React Router.

**Props:**

| Prop      | Type  | Default | Description                       |
| --------- | ----- | ------- | --------------------------------- |
| `context` | `any` | -       | Context value to pass to children |

**Features:**

- **Nested Layouts**: Build complex UI layouts with parent-child relationships
- **Context Passing**: Share data between parent and child routes
- **TypeScript Support**: Full generic types for context values
- **React Router Compatible**: Familiar API for React Router users

**Example - Basic Layout:**

```tsx
import { Outlet } from "router-kit";

// Parent layout component
function DashboardLayout() {
  return (
    <div className="dashboard">
      <header>Dashboard Header</header>
      <nav>
        <Link to="/dashboard">Overview</Link>
        <Link to="/dashboard/analytics">Analytics</Link>
        <Link to="/dashboard/settings">Settings</Link>
      </nav>
      <main>
        <Outlet /> {/* Child routes render here */}
      </main>
      <footer>Dashboard Footer</footer>
    </div>
  );
}

// Child components
const DashboardOverview = () => <h2>Overview</h2>;
const DashboardAnalytics = () => <h2>Analytics</h2>;
const DashboardSettings = () => <h2>Settings</h2>;

// Route configuration
const routes = createRouter([
  {
    path: "dashboard",
    component: <DashboardLayout />,
    children: [
      { index: true, component: <DashboardOverview /> },
      { path: "analytics", component: <DashboardAnalytics /> },
      { path: "settings", component: <DashboardSettings /> },
    ],
  },
]);
```

**Example - With Context:**

```tsx
import { Outlet, useOutletContext } from "router-kit";

// Parent passes context to children
function UserLayout() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchCurrentUser().then(setUser);
  }, []);

  return (
    <div className="user-layout">
      <UserSidebar user={user} />
      <main>
        {/* Pass user data to child routes */}
        <Outlet context={{ user, setUser }} />
      </main>
    </div>
  );
}

// Child accesses context
interface UserContext {
  user: User | null;
  setUser: (user: User | null) => void;
}

function UserProfile() {
  const { user, setUser } = useOutletContext<UserContext>();

  if (!user) return <Loading />;

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={() => setUser(null)}>Logout</button>
    </div>
  );
}
```

---

### useOutlet()

Hook to get the child route element. Returns `null` if there's no child route.

**Signature:**

```typescript
function useOutlet(): React.ReactElement | null;
```

**Example:**

```tsx
import { useOutlet } from "router-kit";

function Layout() {
  const outlet = useOutlet();

  return (
    <div>
      <Header />
      {outlet || <DefaultContent />}
      <Footer />
    </div>
  );
}
```

---

### useOutletContext()

Hook to access the context value passed from a parent route's `<Outlet context={...} />`.

**Signature:**

```typescript
function useOutletContext<T = any>(): T;
```

**Example:**

```tsx
import { useOutletContext } from "router-kit";

// Type-safe context access
interface DashboardContext {
  theme: "light" | "dark";
  toggleTheme: () => void;
  notifications: Notification[];
}

function ChildRoute() {
  const { theme, toggleTheme, notifications } =
    useOutletContext<DashboardContext>();

  return (
    <div className={`page theme-${theme}`}>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <span>Notifications: {notifications.length}</span>
    </div>
  );
}
```

---

### useRouter()

Hook to access the complete router context.

**Returns:**

```typescript
{
  path: string;                    // Current pathname
  fullPathWithParams: string;      // Route pattern with params
  params: Record<string, string>;  // Route parameters
  query: Record<string, string>;   // Query parameters
  location: Location;              // Full location object
  navigate: NavigateFunction;      // Navigation function
  matches: RouteMatch[];           // Matched route hierarchy
  loaderData: any;                 // Data from route loader
  basename: string;                // Router basename
}
```

**Example:**

```tsx
import { useRouter } from "router-kit";

function MyComponent() {
  const { path, params, query, navigate, loaderData } = useRouter();

  return (
    <div>
      <p>Current path: {path}</p>
      <p>User ID: {params.id}</p>
      <p>Search: {query.q}</p>
      <button onClick={() => navigate("/home")}>Go Home</button>
    </div>
  );
}
```

---

### useNavigate()

Hook for programmatic navigation.

**Returns:** `NavigateFunction`

```typescript
type NavigateFunction = {
  (to: string, options?: NavigateOptions): void;
  (delta: number): void; // History navigation
};

interface NavigateOptions {
  replace?: boolean; // Replace history entry
  state?: any; // Navigation state
}
```

**Example:**

```tsx
import { useNavigate } from "router-kit";

function LoginForm() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(credentials);

    if (success) {
      // Navigate forward
      navigate("/dashboard");

      // Replace current entry
      navigate("/dashboard", { replace: true });

      // With state
      navigate("/dashboard", {
        state: { from: "/login" },
      });

      // Go back
      navigate(-1);

      // Go forward
      navigate(1);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

### useParams()

Hook to extract dynamic route parameters with TypeScript generics support.

**Signature:**

```typescript
function useParams<
  T extends Record<string, string> = Record<string, string>
>(): T;
```

**Returns:** Object with parameter key-value pairs (memoized)

**Example:**

```tsx
import { useParams } from "router-kit";

// Route: /users/:id/posts/:postId
// URL: /users/123/posts/456

// Basic usage
function UserPost() {
  const params = useParams();
  console.log(params.id); // "123"
  console.log(params.postId); // "456"
  return <div>...</div>;
}

// With TypeScript generics
interface PostParams {
  id: string;
  postId: string;
}

function UserPostTyped() {
  const { id, postId } = useParams<PostParams>();
  // id and postId are typed as string
  return (
    <div>
      User {id}, Post {postId}
    </div>
  );
}
```

---

### useQuery() / useSearchParams()

Hooks to access and modify URL query parameters reactively.

**useQuery Returns:** `Record<string, string>` (reactive, memoized)

**useSearchParams Returns:** `[URLSearchParams, (params) => void]`

**Example:**

```tsx
import { useQuery, useSearchParams } from "router-kit";

// URL: /search?q=react&sort=recent&page=2

// Read-only access
function SearchDisplay() {
  const query = useQuery();

  return (
    <div>
      <h2>Search: {query.q}</h2>
      <p>Sort: {query.sort}</p>
      <p>Page: {query.page}</p>
    </div>
  );
}

// Read and write access
function SearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateSort = (sort: string) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      sort,
    });
  };

  const nextPage = () => {
    const current = Number(searchParams.get("page") || 1);
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: String(current + 1),
    });
  };

  return (
    <div>
      <select onChange={(e) => updateSort(e.target.value)}>
        <option value="recent">Recent</option>
        <option value="popular">Popular</option>
      </select>
      <button onClick={nextPage}>Next Page</button>
    </div>
  );
}
```

---

### useLocation()

Hook to access the current location details reactively using `useSyncExternalStore`.

**Returns:**

```typescript
interface Location {
  pathname: string; // Current path
  search: string; // Query string (with "?")
  hash: string; // Hash fragment (with "#")
  state: any; // Navigation state
  key: string; // Unique location key
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
      <p>Key: {location.key}</p>
      <pre>{JSON.stringify(location.state, null, 2)}</pre>
    </div>
  );
}
```

---

### useMatches()

Hook to access the matched route hierarchy.

**Returns:** `RouteMatch[]`

```typescript
interface RouteMatch {
  pathname: string; // Matched path
  params: Record<string, string>; // Route params
  route: Route; // Route configuration
  data: any; // Loader data
}
```

**Example:**

```tsx
import { useMatches } from "router-kit";

// URL: /dashboard/users/123
// Matches: [dashboard, users, :id]

function Breadcrumbs() {
  const matches = useMatches();

  return (
    <nav>
      {matches.map((match, i) => (
        <span key={match.pathname}>
          {i > 0 && " > "}
          <Link to={match.pathname}>
            {match.route.meta?.title || match.pathname}
          </Link>
        </span>
      ))}
    </nav>
  );
}
```

---

### useLoaderData()

Hook to access data returned by the route's loader function.

**Signature:**

```typescript
function useLoaderData<T = any>(): T;
```

**Example:**

```tsx
// Route configuration
const routes = createRouter([
  {
    path: "users/:id",
    component: <UserProfile />,
    loader: async ({ params }) => {
      const response = await fetch(`/api/users/${params.id}`);
      if (!response.ok) throw new Error("User not found");
      return response.json();
    },
  },
]);

// Component
interface User {
  id: string;
  name: string;
  email: string;
}

function UserProfile() {
  const user = useLoaderData<User>();

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

---

### useBlocker()

Hook to block navigation with custom logic.

**Signature:**

```typescript
function useBlocker(blocker: BlockerFunction | boolean): Blocker;

type BlockerFunction = (args: {
  currentLocation: Location;
  nextLocation: Location;
  action: "push" | "replace" | "pop";
}) => boolean;

interface Blocker {
  state: "blocked" | "unblocked" | "proceeding";
  proceed: () => void;
  reset: () => void;
  location?: Location;
}
```

**Example:**

```tsx
import { useBlocker } from "router-kit";

function FormWithUnsavedChanges() {
  const [isDirty, setIsDirty] = useState(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  return (
    <div>
      <form onChange={() => setIsDirty(true)}>
        <input name="title" />
        <textarea name="content" />
        <button type="submit">Save</button>
      </form>

      {blocker.state === "blocked" && (
        <dialog open>
          <p>You have unsaved changes. Leave anyway?</p>
          <button onClick={blocker.proceed}>Leave</button>
          <button onClick={blocker.reset}>Stay</button>
        </dialog>
      )}
    </div>
  );
}
```

---

### useDynamicComponents()

Hook for conditional component rendering based on route parameters.

**Signature:**

```typescript
function useDynamicComponents(
  components: Record<string, JSX.Element>,
  paramName: string
): JSX.Element;
```

**Example:**

```tsx
import { useDynamicComponents } from "router-kit";

// Route: /dashboard/:view

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

---

## Advanced Usage

### Route Guards

Route guards allow you to protect routes with authentication and authorization logic.

**Guard Function Signature:**

```typescript
type RouteGuard = (
  context: RouteGuardContext
) => boolean | { redirect: string } | Promise<boolean | { redirect: string }>;

interface RouteGuardContext {
  params: Record<string, string>;
  query: Record<string, string>;
  location: Location;
}
```

**Example: Authentication Guard**

```tsx
// guards/authGuard.ts
export const authGuard: RouteGuard = async ({ location }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return { redirect: `/login?returnTo=${location.pathname}` };
  }

  // Verify token with server
  const isValid = await verifyToken(token);
  return isValid || { redirect: "/login" };
};

// guards/roleGuard.ts
export const adminGuard: RouteGuard = async () => {
  const user = await getCurrentUser();
  return user?.role === "admin" || { redirect: "/unauthorized" };
};

// Usage
const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "login", component: <Login /> },
  {
    path: "dashboard",
    component: <Dashboard />,
    guard: authGuard,
    children: [
      { path: "", component: <DashboardHome /> },
      {
        path: "admin",
        component: <AdminPanel />,
        guard: adminGuard, // Nested guard
      },
    ],
  },
]);
```

---

### Middleware

Router-Kit supports middleware using the **Chain of Responsibility** pattern. Middleware functions execute before route guards and can perform authentication, data fetching, logging, and more.

**Key Features:**
- 🔗 Chain of Responsibility pattern
- ⚡ Full async/await support with fetch
- 🛡️ Route protection and redirection
- 📊 Data prefetching capabilities
- 🔄 Composable middleware chains

**Quick Example:**

```tsx
import {
  createRouter,
  RouterProvider,
  createAuthMiddleware,
  createLoggingMiddleware,
} from "router-kit";

const authMiddleware = createAuthMiddleware({
  checkAuth: async (context) => {
    const token = localStorage.getItem("token");
    return !!token;
  },
  redirectTo: "/login",
});

const loggingMiddleware = createLoggingMiddleware({
  log: async (context) => {
    console.log(`Accessing: ${context.pathname}`);
  },
});

const routes = createRouter([
  {
    path: "/dashboard",
    component: <Dashboard />,
    middleware: [loggingMiddleware, authMiddleware],
  },
]);
```

**For complete middleware documentation, see [Middleware Guide](./MIDDLEWARE.md).**

---

### Data Loading

Load data before rendering routes using loader functions.

**Loader Function Signature:**

```typescript
type RouteLoader<T = any> = (context: RouteLoaderContext) => T | Promise<T>;

interface RouteLoaderContext {
  params: Record<string, string>;
  query: Record<string, string>;
  signal: AbortSignal; // For cancellation
}
```

**Example: Data Loader**

```tsx
// loaders/userLoader.ts
export const userLoader: RouteLoader<User> = async ({ params, signal }) => {
  const response = await fetch(`/api/users/${params.id}`, { signal });

  if (!response.ok) {
    throw new Error("User not found");
  }

  return response.json();
};

// Route configuration
const routes = createRouter([
  {
    path: "users/:id",
    component: <UserProfile />,
    loader: userLoader,
    errorElement: <UserError />,
  },
]);

// Component
function UserProfile() {
  const user = useLoaderData<User>();

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

function UserError() {
  return <div>Failed to load user data</div>;
}
```

**Parallel Data Loading:**

```tsx
// Load multiple resources in parallel
const dashboardLoader: RouteLoader = async ({ signal }) => {
  const [stats, notifications, activities] = await Promise.all([
    fetch("/api/stats", { signal }).then((r) => r.json()),
    fetch("/api/notifications", { signal }).then((r) => r.json()),
    fetch("/api/activities", { signal }).then((r) => r.json()),
  ]);

  return { stats, notifications, activities };
};
```

---

### Navigation Blocking

Block navigation when users have unsaved changes.

**Example: Form Protection**

```tsx
import { useBlocker, useNavigate } from "router-kit";

function EditPostForm() {
  const [formData, setFormData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const navigate = useNavigate();

  // Block navigation when form is dirty
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsDirty(true);
  };

  const handleSave = async () => {
    await savePost(formData);
    setIsDirty(false);
    navigate("/posts");
  };

  return (
    <form>
      <input name="title" value={formData.title} onChange={handleChange} />
      <textarea
        name="content"
        value={formData.content}
        onChange={handleChange}
      />
      <button type="button" onClick={handleSave}>
        Save
      </button>

      {/* Confirmation Dialog */}
      {blocker.state === "blocked" && (
        <dialog open className="blocker-dialog">
          <h3>Unsaved Changes</h3>
          <p>You have unsaved changes. Are you sure you want to leave?</p>
          <div className="dialog-actions">
            <button onClick={blocker.reset}>Stay on Page</button>
            <button onClick={blocker.proceed}>Leave Without Saving</button>
          </div>
        </dialog>
      )}
    </form>
  );
}
```

---

### Scroll Restoration

Router-Kit provides automatic scroll position management.

**Configuration:**

```tsx
<RouterProvider
  routes={routes}
  scrollRestoration="auto" // or "manual"
/>
```

**Scroll Modes:**

- `"auto"`: Automatically restores scroll position on back/forward
- `"manual"`: You control scroll behavior completely

**Manual Scroll Control:**

```tsx
import { useLocation, useNavigate } from "router-kit";

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
}

// Scroll to element on hash change
function HashScroller() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      element?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  return null;
}
```

---

### Lazy Loading

Code split your routes with React.lazy for better performance.

**Example: Lazy Routes**

```tsx
import { lazy, Suspense } from "react";

// Define lazy components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

// Route configuration with lazy loading
const routes = createRouter([
  { path: "/", component: <Home /> },
  {
    path: "dashboard",
    lazy: () => import("./pages/Dashboard"),
    // Or use component with Suspense wrapper
    component: (
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    ),
  },
  {
    path: "admin",
    lazy: () => import("./pages/AdminPanel"),
    guard: adminGuard,
  },
]);

// With global fallback
function App() {
  return <RouterProvider routes={routes} fallback={<FullPageLoader />} />;
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
  LOADER_ERROR = "LOADER_ERROR",
  GUARD_ERROR = "GUARD_ERROR",
}
```

### Route-Level Error Handling

Use `errorElement` to handle errors per route:

```tsx
const routes = createRouter([
  {
    path: "users/:id",
    component: <UserProfile />,
    loader: userLoader,
    errorElement: <UserError />,
  },
]);

function UserError() {
  const error = useRouteError();

  return (
    <div className="error-page">
      <h1>Error Loading User</h1>
      <p>{error.message}</p>
      <Link to="/users">Back to Users</Link>
    </div>
  );
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
        return <DefaultView />;
      case RouterErrorCode.PARAM_NOT_DEFINED:
        navigate("/error");
        break;
    }
  }
}
```

### Common Errors

1. **Router Not Initialized**: Hooks used outside `RouterProvider`
2. **Component Not Found**: Dynamic component variation doesn't exist
3. **Parameter Not Defined**: Accessing undefined route parameters
4. **Loader Error**: Route loader function threw an error
5. **Guard Error**: Route guard function threw an error

---

## TypeScript Support

Router-Kit v2.0 provides comprehensive TypeScript support with 25+ type definitions.

### Type Imports

```tsx
import type {
  // Core Types
  Route,
  Routes,
  RouteMatch,

  // Context Types
  RouterContextType,
  Location,

  // Navigation Types
  NavigateFunction,
  NavigateOptions,

  // Guard & Loader Types
  RouteGuard,
  RouteGuardContext,
  RouteLoader,
  RouteLoaderContext,

  // Blocker Types
  Blocker,
  BlockerFunction,

  // Component Types
  LinkProps,
  NavLinkProps,
  RouteMeta,

  // Utility Types
  DynamicComponents,
  GetComponent,
} from "router-kit";
```

### Typed Params

```tsx
import { useParams } from "router-kit";

interface UserParams {
  id: string;
  tab?: string;
}

function UserProfile() {
  const { id, tab } = useParams<UserParams>();
  // id is typed as string
  // tab is typed as string | undefined
}
```

### Typed Loader Data

```tsx
import { useLoaderData } from "router-kit";

interface User {
  id: string;
  name: string;
  email: string;
}

function UserProfile() {
  const user = useLoaderData<User>();
  // user.name is typed as string
}
```

### Typed Route Configuration

```tsx
import type { Route, RouteGuard, RouteLoader } from "router-kit";

const authGuard: RouteGuard = async ({ location }) => {
  // Fully typed context
  return true;
};

const userLoader: RouteLoader<User> = async ({ params, signal }) => {
  // params is typed as Record<string, string>
  // signal is typed as AbortSignal
  return fetchUser(params.id, signal);
};

const routes: Route[] = [
  {
    path: "users/:id",
    component: <UserProfile />,
    guard: authGuard,
    loader: userLoader,
    meta: { title: "User Profile" },
  },
];
```

---

## Best Practices

### 1. Route Organization

Organize routes in a dedicated file with guards and loaders:

```tsx
// routes/index.tsx
import { createRouter } from "router-kit";
import { authGuard, adminGuard } from "./guards";
import { userLoader, postsLoader } from "./loaders";
import * as Pages from "../pages";

export const routes = createRouter([
  {
    path: "/",
    component: <Pages.Home />,
    meta: { title: "Home" },
  },
  {
    path: "dashboard",
    component: <Pages.Dashboard />,
    guard: authGuard,
    children: [
      { path: "", component: <Pages.DashboardHome /> },
      { path: "admin", component: <Pages.Admin />, guard: adminGuard },
    ],
  },
  { path: "/404", component: <Pages.NotFound /> },
]);

// App.tsx
import { RouterProvider } from "router-kit";
import { routes } from "./routes";

function App() {
  return <RouterProvider routes={routes} />;
}
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

**Key Differences (v2.0):**

| Feature       | React Router v6            | Router-Kit v2.0             |
| ------------- | -------------------------- | --------------------------- |
| Navigation    | `useNavigate()`            | `useNavigate()` ✅          |
| Params        | `useParams()`              | `useParams()` ✅            |
| Location      | `useLocation()`            | `useLocation()` ✅          |
| Search Params | `useSearchParams()`        | `useSearchParams()` ✅      |
| Loader Data   | `useLoaderData()`          | `useLoaderData()` ✅        |
| Route Blocker | `useBlocker()`             | `useBlocker()` ✅           |
| Route Element | `element={<Comp />}`       | `component={<Comp />}`      |
| Catch-all     | `path="*"`                 | `path="/404"`               |
| Basename      | `<BrowserRouter basename>` | `<RouterProvider basename>` |
| Lazy Loading  | `lazy()`                   | `lazy` prop ✅              |
| Route Guards  | Custom via loader          | `guard` prop ✅             |
| Nested Routes | `<Outlet />`               | Direct children ✅          |

---

## Examples

### Complete E-commerce App with Guards & Loaders

```tsx
import {
  createRouter,
  RouterProvider,
  NavLink,
  useParams,
  useNavigate,
  useLoaderData,
  useBlocker,
} from "router-kit";

// Guards
const authGuard = async () => {
  const token = localStorage.getItem("token");
  return token ? true : { redirect: "/login" };
};

// Loaders
const productLoader = async ({ params }) => {
  const res = await fetch(`/api/products/${params.id}`);
  return res.json();
};

// Pages
const Home = () => (
  <div>
    <h1>Welcome to Our Store</h1>
    <NavLink to="/products">Browse Products</NavLink>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const product = useLoaderData();
  const navigate = useNavigate();

  const addToCart = async () => {
    await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId: id }),
    });
    navigate("/cart");
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
      <button onClick={addToCart}>Add to Cart</button>
    </div>
  );
};

const Checkout = () => {
  const [isDirty, setIsDirty] = useState(false);
  const blocker = useBlocker(isDirty);

  return (
    <form onChange={() => setIsDirty(true)}>
      <h1>Checkout</h1>
      {blocker.state === "blocked" && (
        <dialog open>
          <p>Abandon checkout?</p>
          <button onClick={blocker.proceed}>Leave</button>
          <button onClick={blocker.reset}>Stay</button>
        </dialog>
      )}
    </form>
  );
};

// Routes
const routes = createRouter([
  {
    path: "/",
    component: <Home />,
    meta: { title: "Home - Store" },
  },
  {
    path: "products/:id",
    component: <ProductDetail />,
    loader: productLoader,
  },
  {
    path: "checkout",
    component: <Checkout />,
    guard: authGuard,
  },
  { path: "/404", component: <NotFound /> },
]);

function App() {
  return <RouterProvider routes={routes} scrollRestoration="auto" />;
}
```

### Dashboard with Role-Based Guards

```tsx
// Guards
const authGuard = async () => {
  const user = await getCurrentUser();
  return user ? true : { redirect: "/login" };
};

const adminGuard = async () => {
  const user = await getCurrentUser();
  return user?.role === "admin" || { redirect: "/unauthorized" };
};

// Routes with nested guards
const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "login", component: <Login /> },
  {
    path: "dashboard",
    component: <DashboardLayout />,
    guard: authGuard,
    children: [
      { path: "", component: <DashboardHome />, index: true },
      { path: "profile", component: <Profile />, loader: profileLoader },
      {
        path: "admin",
        component: <AdminPanel />,
        guard: adminGuard,
        children: [
          { path: "users", component: <ManageUsers /> },
          { path: "settings", component: <AdminSettings /> },
        ],
      },
    ],
  },
]);
```

### Blog with Dynamic Components

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
        <NavLink to="/dashboard/overview" end>
          Overview
        </NavLink>
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

Clone and set up the project:

```bash
git clone https://github.com/Mohammed-Ben-Cheikh/router-kit.git
cd router-kit
npm install
npm run build
npm run build:watch  # For development
```

### Scripts

- `npm run clean` - Remove dist folder
- `npm run build` - Compile TypeScript
- `npm run typecheck` - Type check without emitting files
- `npm run pack:verify` - Verify package contents
- `npm audit` - Check for vulnerabilities

### Contribution Guidelines

1. Fork the repository and create a feature branch
2. Write clear commit messages following conventional commits
3. Add tests for new features
4. Update documentation for API changes
5. Ensure TypeScript types are correct
6. Test thoroughly before submitting PR

---

## License

MIT License - Copyright (c) 2025 Mohammed Ben Cheikh

See [LICENSE](../LICENSE) file for details.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/Mohammed-Ben-Cheikh/router-kit/issues)
- **Website:** [mohammedbencheikh.com](https://mohammedbencheikh.com/)

---

Made with ❤️ by Mohammed Ben Cheikh
