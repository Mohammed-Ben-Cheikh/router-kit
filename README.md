# Router-Kit

A professional React routing library with guards, loaders, loading components, middlewares, and navigation blocking.

**Version:** 2.1.0 | **License:** MIT

---

## ✨ Features

- 🛡️ **Route Guards** - Authentication & authorization
- 📦 **Data Loaders** - Pre-fetch route data
- 🚫 **Navigation Blocking** - Protect unsaved changes
- 📜 **Scroll Restoration** - Auto scroll management
- ⚡ **Lazy Loading** - Code splitting support
- 🎯 **TypeScript** - Full type safety
- 🎭 **Outlet** - Professional nested layouts
- 🪝 **10 Hooks** - Complete routing control

---

## 📦 Installation

```bash
npm install router-kit
```

---

## 🚀 Quick Start

### Programmatic Approach

```tsx
import {
  createRouter,
  RouterProvider,
  Link,
  useNavigate,
  useParams,
} from "router-kit";

const Home = () => <h1>Home</h1>;
const User = () => {
  const { id } = useParams();
  return <h1>User {id}</h1>;
};

const routes = createRouter([
  { path: "/", component: <Home />, meta: { title: "Home" } },
  { path: "users/:id", component: <User /> },
  { path: "/404", component: <h1>Not Found</h1> },
]);

function App() {
  return <RouterProvider routes={routes} />;
}
```

### Declarative Approach

```tsx
import { Router, Route, Link } from "router-kit";

function App() {
  return (
    <Router>
      <Route path="/" component={<Home />} />
      <Route path="/users/:id" component={<User />} />
      <Route path="/404" component={<NotFound />} />
    </Router>
  );
}
```

---

## 🛡️ Route Guards

```tsx
const authGuard = async () => {
  const isAuth = await checkAuth();
  return isAuth || "/login";
};

const routes = createRouter([
  {
    path: "dashboard",
    component: <Dashboard />,
    guard: authGuard,
  },
]);
```

---

## 📦 Data Loaders

```tsx
const routes = createRouter([
  {
    path: "users/:id",
    component: <UserProfile />,
    loader: async ({ params }) => {
      return fetch(`/api/users/${params.id}`).then((r) => r.json());
    },
  },
]);

function UserProfile() {
  const user = useLoaderData();
  return <h1>{user.name}</h1>;
}
```

---

## 🪝 Hooks

```tsx
const navigate = useNavigate(); // Navigation
const { id } = useParams(); // Route params
const { page } = useQuery(); // Query params
const location = useLocation(); // Location object
const matches = useMatches(); // Route matches
const data = useLoaderData(); // Loader data
const blocker = useBlocker(isDirty); // Block navigation
const outlet = useOutlet(); // Child route element
const ctx = useOutletContext(); // Outlet context
```

---

## 🎭 Outlet (Nested Layouts)

```tsx
import { useState } from "react";
import { Outlet, useOutletContext } from "router-kit";

// Parent layout with Outlet
function DashboardLayout() {
  const [user] = useState({ name: "John" });

  return (
    <div className="dashboard">
      <Sidebar />
      <main>
        <Outlet context={{ user, theme: "dark" }} />
      </main>
    </div>
  );
}

// Child route accesses context
function Settings() {
  const { user, theme } = useOutletContext<{ user: User; theme: string }>();
  return <div className={theme}>Settings for {user.name}</div>;
}
```

### Programmatic Config

```tsx
const routes = createRouter([
  {
    path: "dashboard",
    component: <DashboardLayout />,
    children: [
      { index: true, component: <Overview /> },
      { path: "settings", component: <Settings /> },
      { path: "profile", component: <Profile /> },
    ],
  },
]);
```

### Declarative Config

```tsx
<Router>
  <Route path="dashboard" component={<DashboardLayout />}>
    <Route index component={<Overview />} />
    <Route path="settings" component={<Settings />} />
    <Route path="profile" component={<Profile />} />
  </Route>
</Router>
```

---

## 📚 Documentation

| Document                                 | Description       |
| ---------------------------------------- | ----------------- |
| [Documentation](./docs/DOCUMENTATION.md) | Complete guide    |
| [API Reference](./docs/API_REFERENCE.md) | Full API docs     |
| [Architecture](./docs/ARCHITECTURE.md)   | Technical details |
| [Changelog](./docs/CHANGELOG.md)         | Version history   |

---

## 🔗 Links

- **GitHub:** [github.com/Mohammed-Ben-Cheikh/router-kit](https://github.com/Mohammed-Ben-Cheikh/router-kit)
- **Author:** [Mohammed Ben Cheikh](https://mohammedbencheikh.com/)

---

Made with ❤️ by Mohammed Ben Cheikh
