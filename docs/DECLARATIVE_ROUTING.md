# Declarative Routing with Router and Route Components

Router-Kit supports declarative routing using JSX components, providing an alternative to the programmatic `createRouter` approach. This method is more intuitive and familiar to developers coming from React Router.

## Basic Usage

### Import Components

```tsx
import { Router, Route } from "router-kit";
```

### Define Routes Declaratively

```tsx
function App() {
  return (
    <Router>
      <Route path="/" component={<Home />} />
      <Route path="/about" component={<About />} />
      <Route path="/contact" component={<Contact />} />
      <Route path="/404" component={<NotFound />} />
    </Router>
  );
}
```

## Router Props

```tsx
interface RouterProps {
  children: ReactNode; // Route children as JSX
  basename?: string; // Base path for all routes (e.g., "/app")
  fallback?: ReactNode; // Fallback during lazy loading/suspense
}
```

### Example with All Props

```tsx
<Router basename="/my-app" fallback={<Loading />}>
  <Route path="/" component={<Home />} />
</Router>
```

## Route Props

```tsx
interface RouteProps {
  path: string | string[]; // Path pattern(s)
  component: ReactElement; // Component to render
  children?: ReactElement<RouteProps>[]; // Nested routes
  index?: boolean; // Index route flag
  lazy?: LazyExoticComponent<ComponentType>; // Lazy-loaded component
  loader?: RouteLoader; // Data fetching function
  errorElement?: ReactElement; // Error boundary element
  redirectTo?: string; // Redirect destination
  guard?: RouteGuard; // Route protection function
  meta?: RouteMeta; // Route metadata
  caseSensitive?: boolean; // Case-sensitive matching
}
```

## Advanced Features

### Dynamic Routes with Parameters

```tsx
<Router>
  <Route path="/users/:id" component={<UserProfile />} />
  <Route path="/posts/:category/:slug" component={<BlogPost />} />
</Router>
```

### Multiple Path Aliases

```tsx
<Router>
  <Route path={["/about", "/about-us", "/info"]} component={<About />} />
</Router>
```

### Catch-All Routes

```tsx
<Router>
  <Route path="/" component={<Home />} />
  <Route path="/about" component={<About />} />
  <Route path="*" component={<NotFound />} />
</Router>
```

### Nested Routes

```tsx
<Router>
  <Route path="/dashboard" component={<DashboardLayout />}>
    <Route path="overview" component={<Overview />} />
    <Route path="settings" component={<Settings />} />
    <Route path="profile" component={<Profile />} />
  </Route>
</Router>
```

### Route Guards (Authentication)

```tsx
const requireAuth = ({ pathname }) => {
  return isAuthenticated() || "/login";
};

<Router>
  <Route path="/login" component={<Login />} />
  <Route path="/dashboard" component={<Dashboard />} guard={requireAuth} />
  <Route
    path="/admin"
    component={<Admin />}
    guard={() => isAdmin() || "/unauthorized"}
  />
</Router>;
```

### Route Loaders (Data Fetching)

```tsx
<Router>
  <Route
    path="/user/:id"
    component={<UserProfile />}
    loader={async ({ params, signal }) => {
      const response = await fetch(`/api/users/${params.id}`, { signal });
      return response.json();
    }}
  />
</Router>;

// In UserProfile component
function UserProfile() {
  const user = useLoaderData();
  return <div>{user.name}</div>;
}
```

### Route Metadata

```tsx
<Router>
  <Route
    path="/about"
    component={<About />}
    meta={{
      title: "About Us",
      description: "Learn about our company",
      requiresAuth: false,
    }}
  />
</Router>;

// In component
function About() {
  const meta = useRouteMeta();

  useEffect(() => {
    if (meta?.title) document.title = meta.title;
  }, [meta]);

  return <div>About page</div>;
}
```

### Redirects

```tsx
<Router>
  <Route path="/old-page" redirectTo="/new-page" />
  <Route path="/new-page" component={<NewPage />} />
</Router>
```

### Complex Nested Structure

```tsx
<Router>
  <Route path="/admin" component={<AdminLayout />}>
    <Route path="users" component={<UserManagement />}>
      <Route path=":id" component={<UserDetails />} />
      <Route path=":id/edit" component={<EditUser />} />
    </Route>
    <Route path="settings" component={<AdminSettings />}>
      <Route path="general" component={<GeneralSettings />} />
      <Route path="security" component={<SecuritySettings />} />
    </Route>
  </Route>
</Router>
```

## Complete Example

```tsx
import React, { lazy, Suspense } from "react";
import {
  Router,
  Route,
  Link,
  NavLink,
  useParams,
  useRouter,
  useLoaderData,
} from "router-kit";

// Lazy loaded components
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Components
const Home = () => (
  <div>
    <h1>Welcome</h1>
    <nav>
      <NavLink to="/" activeClassName="active" end>
        Home
      </NavLink>
      <NavLink to="/about" activeClassName="active">
        About
      </NavLink>
      <NavLink to="/users/123" activeClassName="active">
        User 123
      </NavLink>
      <NavLink to="/dashboard" activeClassName="active">
        Dashboard
      </NavLink>
    </nav>
  </div>
);

const About = () => (
  <div>
    <h1>About Us</h1>
    <Link to="/">Home</Link>
  </div>
);

const UserProfile = () => {
  const { id } = useParams();
  const user = useLoaderData(); // Data from loader

  return (
    <div>
      <h1>User Profile: {id}</h1>
      {user && <p>Name: {user.name}</p>}
      <Link to="/">Home</Link>
    </div>
  );
};

const Settings = () => (
  <div>
    <h2>Settings</h2>
    <Link to="/dashboard">Back</Link>
  </div>
);

const NotFound = () => (
  <div>
    <h1>404 - Not Found</h1>
    <Link to="/">Home</Link>
  </div>
);

const Loading = () => <div>Loading...</div>;

// Auth guard
const requireAuth = () => localStorage.getItem("token") || "/login";

// App with declarative routing
function App() {
  return (
    <Router fallback={<Loading />}>
      <Route path="/" component={<Home />} />
      <Route path="/about" component={<About />} meta={{ title: "About Us" }} />
      <Route
        path="/users/:id"
        component={<UserProfile />}
        loader={async ({ params }) => {
          const res = await fetch(`/api/users/${params.id}`);
          return res.json();
        }}
      />

      <Route path="/dashboard" component={<Dashboard />} guard={requireAuth}>
        <Route path="settings" component={<Settings />} />
      </Route>

      <Route path="*" component={<NotFound />} />
    </Router>
  );
}

export default App;
```

## Comparison: Programmatic vs Declarative

### Programmatic Approach

```tsx
import { createRouter, RouterProvider } from "router-kit";

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "/about", component: <About />, meta: { title: "About" } },
  {
    path: "/dashboard",
    component: <Dashboard />,
    guard: () => isAuthenticated() || "/login",
    children: [{ path: "settings", component: <Settings /> }],
  },
]);

function App() {
  return <RouterProvider routes={routes} />;
}
```

### Declarative Approach

```tsx
import { Router, Route } from "router-kit";

function App() {
  return (
    <Router>
      <Route path="/" component={<Home />} />
      <Route path="/about" component={<About />} meta={{ title: "About" }} />

      <Route
        path="/dashboard"
        component={<Dashboard />}
        guard={() => isAuthenticated() || "/login"}
      >
        <Route path="settings" component={<Settings />} />
      </Route>
    </Router>
  );
}
```

## When to Use Each Approach

### Use Declarative Routing When

- You prefer JSX-based syntax
- You have deeply nested routes
- You want visual route hierarchy in code
- Coming from React Router background

### Use Programmatic Routing When

- Routes are generated dynamically
- You need to manipulate routes as data
- Building configuration-driven UIs
- Need type inference on route configs

## TypeScript Support

The declarative routing components are fully typed:

```tsx
import type {
  RouteProps,
  RouteMeta,
  RouteGuard,
  RouteLoader,
} from "router-kit";

// RouteProps interface is available for custom implementations
const customMeta: RouteMeta = {
  title: "Custom Page",
  description: "A custom page",
};

const customGuard: RouteGuard = ({ pathname, params }) => {
  return isAuthenticated() || "/login";
};

const customLoader: RouteLoader = async ({ params, signal }) => {
  const response = await fetch(`/api/data/${params.id}`, { signal });
  return response.json();
};
```

## Best Practices

1. **Organize routes logically**:

```tsx
<Router>
  {/* Public routes */}
  <Route path="/" component={<Home />} />
  <Route path="/about" component={<About />} />

  {/* Protected routes */}
  <Route path="/dashboard" component={<Dashboard />} guard={requireAuth}>
    <Route path="settings" component={<Settings />} />
  </Route>

  {/* Catch-all */}
  <Route path="*" component={<NotFound />} />
</Router>
```

2. **Use route metadata for SEO**:

```tsx
<Route
  path="/about"
  component={<About />}
  meta={{
    title: "About Us - My App",
    description: "Learn about our company",
  }}
/>
```

3. **Use guards for authentication**:

```tsx
const requireAuth = () => isLoggedIn() || "/login";
const requireAdmin = () => isAdmin() || "/unauthorized";

<Router>
  <Route path="/profile" component={<Profile />} guard={requireAuth} />
  <Route path="/admin" component={<Admin />} guard={requireAdmin} />
</Router>;
```

4. **Use loaders for data fetching**:

```tsx
<Route
  path="/user/:id"
  component={<UserProfile />}
  loader={async ({ params }) => fetchUser(params.id)}
/>
```

## Compatibility

- ✅ Fully compatible with all hooks (`useRouter`, `useParams`, `useNavigate`, etc.)
- ✅ Fully compatible with navigation components (`Link`, `NavLink`)
- ✅ Can be used alongside the programmatic approach
- ✅ Same routing engine under the hood
- ✅ Full TypeScript support and error handling

Both approaches use the same underlying routing system, so you can choose the one that best fits your development style and project requirements.
