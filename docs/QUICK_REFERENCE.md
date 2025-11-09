# Router-Kit Quick Reference

One-page reference for Router-Kit v1.3.1

---

## Installation

```bash
npm install router-kit
```

---

## Basic Setup

```tsx
import { createRouter, RouterProvider } from "router-kit";

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "about", component: <About /> },
]);

function App() {
  return <RouterProvider routes={routes} />;
}
```

---

## Imports

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
} from "router-kit";

// Errors
import { RouterErrors, RouterErrorCode } from "router-kit";
```

---

## Route Patterns

```tsx
// Static route
{ path: "about", component: <About /> }

// Dynamic parameter
{ path: "users/:id", component: <User /> }

// Multiple parameters
{ path: "posts/:category/:slug", component: <Post /> }

// Multiple paths (aliases)
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

---

## Navigation

### Link Component

```tsx
<Link to="/about">About</Link>
<Link to="/users/123" className="btn">View User</Link>
```

### NavLink Component

```tsx
<NavLink to="/" activeClassName="active">
  Home
</NavLink>
```

### Programmatic Navigation

```tsx
const { navigate } = useRouter();

// Basic navigation
navigate("/dashboard");

// Replace history
navigate("/login", { replace: true });

// With state
navigate("/profile", {
  state: { from: "/settings" },
});
```

---

## Hooks

### useRouter()

```tsx
const { path, fullPathWithParams, navigate } = useRouter();

console.log(path); // "/users/123"
console.log(fullPathWithParams); // "/users/:id"
navigate("/home");
```

### useParams()

```tsx
// Route: /users/:id
// URL: /users/123

const { id } = useParams();
console.log(id); // "123"
```

### useQuery()

```tsx
// URL: /search?q=react&page=2

const query = useQuery();
console.log(query.q); // "react"
console.log(query.page); // "2"
```

### useLocation()

```tsx
const location = useLocation();

console.log(location.pathname); // "/products"
console.log(location.search); // "?category=tech"
console.log(location.hash); // "#reviews"
console.log(location.state); // { from: "/home" }
```

### useDynamicComponents()

```tsx
// Route: /dashboard/:view

const views = {
  overview: <Overview />,
  analytics: <Analytics />,
};

const component = useDynamicComponents(views, "view");
```

---

## Common Patterns

### Protected Route

```tsx
function ProtectedRoute({ children }) {
  const { navigate } = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
}

// Usage
{
  path: "dashboard",
  component: (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
```

### Layout Wrapper

```tsx
function Layout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

// Usage
{
  path: "about",
  component: <Layout><About /></Layout>
}
```

### Scroll to Top

```tsx
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
```

---

## Error Handling

### Catching Errors

```tsx
import { RouterKitError, RouterErrorCode } from "router-kit";

try {
  const component = useDynamicComponents(views, "view");
} catch (error) {
  if (error instanceof RouterKitError) {
    console.log(error.code);
    console.log(error.context);

    if (error.code === RouterErrorCode.COMPONENT_NOT_FOUND) {
      return <DefaultView />;
    }
  }
}
```

### Error Codes

- `ROUTER_NOT_INITIALIZED` - Hook used outside provider
- `PARAM_NOT_DEFINED` - Route param doesn't exist
- `PARAM_INVALID_TYPE` - Param type is wrong
- `PARAM_EMPTY_STRING` - Param is empty
- `COMPONENT_NOT_FOUND` - Dynamic component not found
- `NAVIGATION_ABORTED` - Navigation failed
- `INVALID_ROUTE` - Invalid route config

---

## TypeScript Types

```tsx
interface Route {
  path: string | string[];
  component: JSX.Element;
  children?: Route[];
}

interface RouterContextType {
  path: string;
  fullPathWithParams: string;
  navigate: (to: string, options?: NavigateOptions) => void;
}

interface NavigateOptions {
  replace?: boolean;
  state?: any;
}

interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: any;
}
```

---

## Tips & Tricks

### 1. Route Constants

```tsx
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  USER: (id: string) => `/users/${id}`,
} as const;
```

### 2. Navigation Helper

```tsx
export const nav = (navigate) => ({
  toHome: () => navigate(ROUTES.HOME),
  toUser: (id) => navigate(ROUTES.USER(id)),
  goBack: () => window.history.back(),
});
```

### 3. Active Route Check

```tsx
const { path } = useRouter();
const isActive = path === "/about";
```

### 4. Query String Builder

```tsx
const buildQuery = (params: Record<string, string>) => {
  const query = new URLSearchParams(params).toString();
  return query ? `?${query}` : "";
};

navigate(`/search${buildQuery({ q: "react", page: "1" })}`);
```

### 5. State Persistence

```tsx
// Send state
navigate("/details", {
  state: { scrollPosition: window.scrollY },
});

// Receive state
const location = useLocation();
useEffect(() => {
  if (location.state?.scrollPosition) {
    window.scrollTo(0, location.state.scrollPosition);
  }
}, []);
```

---

## URL Structure

```
https://example.com/products/electronics/123?sort=price#reviews
                    └─pathname──────────┘ └─search─┘ └hash┘

pathname: "/products/electronics/123"
search:   "?sort=price"
hash:     "#reviews"
```

---

## Performance Tips

1. **Memoize routes:** Create routes outside component
2. **Use React.memo:** For expensive components
3. **Code splitting:** Use React.lazy with Suspense
4. **Prefetch:** Preload next likely route
5. **Virtual scrolling:** For long lists

```tsx
// Bad: Creates new routes on every render
function App() {
  const routes = createRouter([...]);
  return <RouterProvider routes={routes} />;
}

// Good: Routes created once
const routes = createRouter([...]);
function App() {
  return <RouterProvider routes={routes} />;
}
```

---

## Debugging

### Check Current Route

```tsx
const { path, fullPathWithParams } = useRouter();
console.log("Current:", path);
console.log("Pattern:", fullPathWithParams);
```

### Log Navigation

```tsx
const { navigate } = useRouter();

const loggedNavigate = (to, options) => {
  console.log("Navigating to:", to, options);
  navigate(to, options);
};
```

### Error Logging

```tsx
window.addEventListener("error", (e) => {
  if (e.error instanceof RouterKitError) {
    console.error(e.error.toConsoleMessage());
  }
});
```

---

## Common Mistakes

### ❌ Using hooks outside provider

```tsx
function App() {
  const { navigate } = useRouter(); // ERROR!
  return <RouterProvider routes={routes} />;
}
```

### ✅ Correct usage

```tsx
function Navigation() {
  const { navigate } = useRouter(); // OK
  return <button onClick={() => navigate("/")}>Home</button>;
}

function App() {
  return (
    <RouterProvider routes={routes}>
      <Navigation />
    </RouterProvider>
  );
}
```

### ❌ Creating routes in render

```tsx
function App() {
  const routes = createRouter([...]); // Bad: Creates new routes every render
  return <RouterProvider routes={routes} />;
}
```

### ✅ Create routes once

```tsx
const routes = createRouter([...]); // Good: Created once

function App() {
  return <RouterProvider routes={routes} />;
}
```

---

## Resources

- **Documentation:** [/docs/README.md](./README.md)
- **API Reference:** [/docs/API_REFERENCE.md](./API_REFERENCE.md)
- **Examples:** [/docs/EXAMPLES.md](./EXAMPLES.md)
- **GitHub:** [github.com/Mohammed-Ben-Cheikh/router-kit](https://github.com/Mohammed-Ben-Cheikh/router-kit)

---

## Version

Router-Kit v1.3.1 | MIT License | Mohammed Ben Cheikh
