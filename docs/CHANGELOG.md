# Changelog

All notable changes to Router-Kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2025-01-XX

### Added

#### New Components

- **Outlet**: Professional nested layout component for child route rendering
  - Matches React Router API for familiarity
  - Context prop for passing data to child routes
  - Perfect for dashboard layouts, tabbed interfaces, and nested UIs

#### New Hooks

- **useNavigate**: Programmatic navigation hook matching React Router API
  - Supports string paths and numeric history navigation
  - Options for `replace` and `state`
- **useMatches**: Access matched route hierarchy for breadcrumbs
- **useBlocker**: Block navigation with custom logic for unsaved changes
- **useLoaderData**: Access data from route loaders
- **useSearchParams**: Read and write URL search parameters
- **useOutlet**: Get child route element directly (returns element or null)
- **useOutletContext**: Access context from parent `<Outlet context={...} />`

#### Route Guards

- Async route guard support with `guard` prop
- Guard context includes `params`, `query`, and `location`
- Redirect support via `{ redirect: "/path" }` return value
- Nested route guards inheritance

#### Data Loaders

- Route-level data loading with `loader` prop
- Loader context includes `params`, `query`, and `signal`
- AbortSignal support for cancellation
- Error handling with `errorElement`

#### Navigation Blocking

- Block navigation when users have unsaved changes
- Blocker states: `blocked`, `unblocked`, `proceeding`
- `proceed()` and `reset()` methods for user confirmation

#### Enhanced Components

- **Link**: ForwardRef support, external link detection, security attributes
- **NavLink**: Partial matching with `end` prop, `activeStyle`, render props pattern
- **Route**: New props - `loader`, `guard`, `meta`, `redirectTo`, `errorElement`, `lazy`, `index`
- **Router**: Enhanced with `basename`, `fallback`, `scrollRestoration`

#### Route Metadata

- Document title management via `meta.title`
- Custom metadata support

#### Scroll Restoration

- `scrollRestoration` prop: `"auto"` | `"manual"`
- Automatic scroll position management

#### Basename Support

- Deploy to subdirectories with `basename` prop
- Automatic path prefixing

#### Lazy Loading

- Built-in lazy loading with `lazy` prop
- Suspense fallback via `fallback` prop

### Changed

- **RouterProvider**: Extended with `basename`, `scrollRestoration`, `fallback` props
- **RouterContext**: Now includes `params`, `query`, `location`, `matches`, `loaderData`, `basename`
- **useParams**: Now supports TypeScript generics and memoized results
- **useQuery**: Reactive updates using `useSyncExternalStore`
- **useLocation**: Reactive updates using `useSyncExternalStore`
- **useRouter**: Returns complete context including all new features

### Improved

- TypeScript support with 25+ type definitions
- Route validation and normalization
- Error handling with detailed error codes

---

## [1.3.1] - Previous Version

### Features

- Basic routing with `RouterProvider` and `createRouter`
- `Link` and `NavLink` components
- `useRouter`, `useParams`, `useQuery`, `useLocation` hooks
- `useDynamicComponents` for conditional rendering
- Multiple path aliases
- Nested routes
- Custom 404 pages
- Error handling system

---

## Migration from 1.x to 2.0

### Breaking Changes

None - v2.0 is fully backward compatible.

### New Features to Adopt

1. **Replace manual auth checks with guards:**

```tsx
// Before (1.x)
function ProtectedRoute({ children }) {
  const { navigate } = useRouter();
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, []);
  return isAuthenticated ? children : null;
}

// After (2.0)
const routes = createRouter([
  {
    path: "dashboard",
    component: <Dashboard />,
    guard: async () => isAuthenticated || { redirect: "/login" },
  },
]);
```

2. **Use useNavigate instead of useRouter().navigate:**

```tsx
// Before (1.x)
const { navigate } = useRouter();

// After (2.0) - Both work, but useNavigate is preferred
const navigate = useNavigate();
```

3. **Add loaders for data fetching:**

```tsx
// After (2.0)
const routes = createRouter([
  {
    path: "users/:id",
    component: <UserProfile />,
    loader: ({ params }) => fetch(`/api/users/${params.id}`),
  },
]);

function UserProfile() {
  const user = useLoaderData();
  return <h1>{user.name}</h1>;
}
```

4. **Use blockers for form protection:**

```tsx
function EditForm() {
  const [isDirty, setIsDirty] = useState(false);
  const blocker = useBlocker(isDirty);

  return (
    <form>
      {blocker.state === "blocked" && (
        <ConfirmDialog onConfirm={blocker.proceed} onCancel={blocker.reset} />
      )}
    </form>
  );
}
```
