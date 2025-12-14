# Router-Kit Quick Reference

One-page reference for Router-Kit v2.1.0

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
import { createRouter, RouterProvider, RouterContext } from "router-kit";

// Components
import { Link, NavLink, Router, Route } from "router-kit";

// Hooks - Core Navigation
import {
  useRouter,
  useNavigate,
  useLocation,
  useResolvedPath,
} from "router-kit";

// Hooks - Route Data
import {
  useParams,
  useParam,
  useQuery,
  useSearchParams,
  useMatches,
  useMatch,
  useMatchPath,
} from "router-kit";

// Hooks - Advanced
import {
  useDynamicComponents,
  useBlocker,
  usePrompt,
  useLoaderData,
  useRouteMeta,
  useIsNavigating,
} from "router-kit";

// Types
import type {
  Route as RouteType,
  RouteProps,
  RouterContextType,
  RouterProviderProps,
  NavigateOptions,
  NavigateFunction,
  Location,
  RouteMatch,
  RouteMeta,
  RouteLoader,
  RouteGuard,
  LoaderArgs,
  GuardArgs,
  Blocker,
  BlockerFunction,
  LinkProps,
  NavLinkProps,
} from "router-kit";

// Errors
import { RouterErrors, RouterErrorCode, createRouterError } from "router-kit";
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

// Catch-all route
{ path: "*", component: <NotFound /> }

// Nested routes
{
  path: "dashboard",
  component: <Dashboard />,
  children: [
    { path: "settings", component: <Settings /> }
  ]
}

// With route guard
{
  path: "admin",
  component: <Admin />,
  guard: ({ pathname }) => isAuthenticated() || '/login'
}

// With loader
{
  path: "user/:id",
  component: <UserProfile />,
  loader: async ({ params }) => fetchUser(params.id)
}

// With metadata
{
  path: "about",
  component: <About />,
  meta: { title: "About Us", description: "Learn about us" }
}

// With redirect
{ path: "old-path", redirectTo: "/new-path" }

// 404 page
{ path: "/404", component: <NotFound /> }
```

---

## Navigation

### Link Component

```tsx
<Link to="/about">About</Link>
<Link to="/users/123" className="btn">View User</Link>
<Link to="/profile" replace state={{ from: 'home' }}>Profile</Link>
<Link to="https://example.com" target="_blank">External</Link>
```

### NavLink Component

```tsx
<NavLink to="/" activeClassName="active" end>Home</NavLink>
<NavLink to="/users" activeClassName="active">Users</NavLink>
<NavLink
  to="/dashboard"
  activeStyle={{ fontWeight: 'bold' }}
  isActive={(match, location) => location.pathname.startsWith('/dashboard')}
>
  Dashboard
</NavLink>
```

### Programmatic Navigation

```tsx
const navigate = useNavigate();
// or
const { navigate, back, forward } = useRouter();

// Basic navigation
navigate("/dashboard");

// Replace history
navigate("/login", { replace: true });

// With state
navigate("/profile", { state: { from: "/settings" } });

// Prevent scroll reset
navigate("/next-section", { preventScrollReset: true });

// Go back/forward
navigate(-1); // Go back
navigate(1); // Go forward
back(); // Go back
forward(); // Go forward
```

---

## Hooks

### useRouter()

```tsx
const {
  pathname, // Current path
  pattern, // Matched pattern (e.g., /users/:id)
  search, // Query string
  hash, // URL hash
  state, // History state
  params, // Route params
  matches, // Route match chain
  navigate, // Navigate function
  back, // Go back
  forward, // Go forward
  isNavigating, // Navigation in progress
  loaderData, // Data from loader
  meta, // Route metadata
} = useRouter();
```

### useNavigate()

```tsx
const navigate = useNavigate();
navigate("/home");
navigate(-1); // Go back
```

### useParams()

```tsx
// Route: /users/:id
// URL: /users/123

const params = useParams();
console.log(params.id); // "123"

// Or with single param
const id = useParam("id");
```

### useQuery() & useSearchParams()

```tsx
// URL: /search?q=react&page=2

// Simple object access
const query = useQuery();
console.log(query.q); // "react"
console.log(query.page); // "2"

// Full URLSearchParams API
const [searchParams, setSearchParams] = useSearchParams();
console.log(searchParams.get("q")); // "react"

// Update search params
setSearchParams({ q: "vue", page: "1" });
setSearchParams((prev) => ({ ...Object.fromEntries(prev), page: "3" }));
```

### useLocation()

```tsx
const location = useLocation();

console.log(location.pathname); // "/products"
console.log(location.search); // "?category=tech"
console.log(location.hash); // "#reviews"
console.log(location.state); // { from: "/home" }
console.log(location.key); // "abc123"
```

### useMatches()

```tsx
const matches = useMatches();
// Array of matched routes from root to current

const currentMatch = useMatch();
// Current (leaf) route match

const isActive = useMatchPath("/users", { end: false });
// Check if path matches
```

### useLoaderData()

```tsx
// Route with loader
{ path: "user/:id", component: <User />, loader: ({ params }) => fetchUser(params.id) }

// In component
const user = useLoaderData();
```

### useRouteMeta()

```tsx
// Route with meta
{ path: "about", component: <About />, meta: { title: "About" } }

// In component
const meta = useRouteMeta();
console.log(meta?.title); // "About"
```

### useBlocker()

```tsx
const blocker = useBlocker(
  ({ currentLocation, nextLocation }) => hasUnsavedChanges
);

if (blocker.state === "blocked") {
  // Show confirmation dialog
  blocker.proceed(); // Allow navigation
  blocker.reset(); // Cancel navigation
}
```

### usePrompt()

```tsx
usePrompt("You have unsaved changes!", hasUnsavedChanges);
```

### useDynamicComponents()

```tsx
// Route: /dashboard/:view

const views = {
  overview: <Overview />,
  analytics: <Analytics />,
};

const component = useDynamicComponents(views, "view");
// With fallback
const component = useDynamicComponents(views, "view", {
  fallback: <DefaultView />,
  throwOnNotFound: false,
});
```

---

## Declarative Routing

```tsx
import { Router, Route } from "router-kit";

<Router basename="/app" fallback={<Loading />}>
  <Route path="/" component={<Home />} />
  <Route path="/about" component={<About />} />
  <Route
    path="/admin"
    component={<Admin />}
    guard={() => isAdmin() || "/login"}
    loader={async () => fetchAdminData()}
    meta={{ title: "Admin Panel" }}
  />
  <Route path="/dashboard" component={<Dashboard />}>
    <Route path="settings" component={<Settings />} />
  </Route>
  <Route path="*" component={<NotFound />} />
</Router>;
```

---

## Common Patterns

### Protected Route

```tsx
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
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
