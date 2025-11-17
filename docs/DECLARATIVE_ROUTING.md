# Declarative Routing with Router and Route Components

Router-Kit now supports declarative routing using JSX components, providing an alternative to the programmatic `createRouter` approach. This method is more intuitive and familiar to developers coming from React Router.

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
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/404" element={<NotFound />} />
    </Router>
  );
}
```

## Advanced Features

### Dynamic Routes with Parameters

```tsx
<Router>
  <Route path="/users/:id" element={<UserProfile />} />
  <Route path="/posts/:category/:slug" element={<BlogPost />} />
</Router>
```

### Multiple Path Aliases

```tsx
<Router>
  <Route path={["/about", "/about-us", "/info"]} element={<About />} />
</Router>
```

### Nested Routes

```tsx
<Router>
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route path="overview" element={<Overview />} />
    <Route path="settings" element={<Settings />} />
    <Route path="profile" element={<Profile />} />
  </Route>
</Router>
```

### Complex Nested Structure

```tsx
<Router>
  <Route path="/admin" element={<AdminLayout />}>
    <Route path="users" element={<UserManagement />}>
      <Route path=":id" element={<UserDetails />} />
      <Route path=":id/edit" element={<EditUser />} />
    </Route>
    <Route path="settings" element={<AdminSettings />}>
      <Route path="general" element={<GeneralSettings />} />
      <Route path="security" element={<SecuritySettings />} />
    </Route>
  </Route>
</Router>
```

## Complete Example

```tsx
import React from "react";
import { Router, Route, Link, useParams, useRouter } from "router-kit";

// Components
const Home = () => (
  <div>
    <h1>Welcome</h1>
    <nav>
      <Link to="/about">About</Link> |<Link to="/users/123">User 123</Link> |
      <Link to="/dashboard">Dashboard</Link>
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
  return (
    <div>
      <h1>User Profile: {id}</h1>
      <Link to="/">Home</Link>
    </div>
  );
};

const Dashboard = () => {
  const { navigate } = useRouter();
  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => navigate("/dashboard/settings")}>Settings</button>
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

// App with declarative routing
function App() {
  return (
    <Router>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/users/:id" element={<UserProfile />} />

      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
    </Router>
  );
}

export default App;
```

## Comparison: Programmatic vs Declarative

### Programmatic Approach (Existing)

```tsx
import { createRouter, RouterProvider } from "router-kit";

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "/about", component: <About /> },
  {
    path: "/dashboard",
    component: <Dashboard />,
    children: [{ path: "settings", component: <Settings /> }],
  },
]);

function App() {
  return <RouterProvider routes={routes} />;
}
```

### Declarative Approach (New)

```tsx
import { Router, Route } from "router-kit";

function App() {
  return (
    <Router>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />

      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="settings" element={<Settings />} />
      </Route>
    </Router>
  );
}
```

## When to Use Each Approach

### Use Declarative Routing When:

- You prefer JSX-based syntax
- You have deeply nested routes
- You want visual hierarchy in your route definitions
- You're familiar with React Router
- You need better readability for complex routing structures

### Use Programmatic Routing When:

- You need to generate routes dynamically
- You prefer explicit programmatic control
- You have simple routing requirements
- You want more compact code for basic applications

## API Reference

### Router Component

```tsx
interface RouterProps {
  children: ReactNode; // Route components
}
```

### Route Component

```tsx
interface RouteProps {
  path: string | string[]; // Path pattern(s) to match
  element: ReactElement; // Component to render
  children?: ReactElement[]; // Nested Route components
}
```

## Migration Guide

To migrate from programmatic to declarative routing:

1. **Replace RouterProvider with Router**:

   ```tsx
   // Before
   <RouterProvider routes={routes} />

   // After
   <Router>
     {/* Route components */}
   </Router>
   ```

2. **Convert route objects to Route components**:

   ```tsx
   // Before
   { path: "/about", component: <About /> }

   // After
   <Route path="/about" element={<About />} />
   ```

3. **Convert nested routes**:

   ```tsx
   // Before
   {
     path: "/dashboard",
     component: <Dashboard />,
     children: [
       { path: "settings", component: <Settings /> }
     ]
   }

   // After
   <Route path="/dashboard" element={<Dashboard />}>
     <Route path="settings" element={<Settings />} />
   </Route>
   ```

## TypeScript Support

The declarative routing components are fully typed:

```tsx
import type { RouteProps } from "router-kit";

// RouteProps interface is available for custom implementations
const customRoute: RouteProps = {
  path: "/custom",
  element: <CustomComponent />,
};
```

## Best Practices

1. **Organize routes logically**:

   ```tsx
   <Router>
     {/* Public routes */}
     <Route path="/" element={<Home />} />
     <Route path="/about" element={<About />} />

     {/* User routes */}
     <Route path="/users/:id" element={<UserProfile />} />

     {/* Admin routes */}
     <Route path="/admin" element={<AdminLayout />}>
       <Route path="users" element={<UserManagement />} />
       <Route path="settings" element={<AdminSettings />} />
     </Route>

     {/* Error routes */}
     <Route path="/404" element={<NotFound />} />
   </Router>
   ```

2. **Use meaningful component names**:

   ```tsx
   // Good
   <Route path="/products/:id" element={<ProductDetails />} />

   // Avoid
   <Route path="/products/:id" element={<Component1 />} />
   ```

3. **Group related routes**:
   ```tsx
   <Route path="/dashboard" element={<DashboardLayout />}>
     <Route path="overview" element={<Overview />} />
     <Route path="analytics" element={<Analytics />} />
     <Route path="settings" element={<Settings />} />
   </Route>
   ```

## Compatibility

- ✅ **Fully compatible** with existing hooks (`useRouter`, `useParams`, etc.)
- ✅ **Fully compatible** with existing components (`Link`, `NavLink`)
- ✅ **Can be used alongside** the programmatic approach
- ✅ **Same routing engine** under the hood
- ✅ **Same TypeScript support** and error handling

Both approaches use the same underlying routing system, so you can choose the one that best fits your development style and project requirements.
