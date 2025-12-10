# Router-Kit API Reference

Complete API documentation for Router-Kit v2.0.0

---

## Table of Contents

- [Core Functions](#core-functions)
- [Components](#components)
- [Hooks](#hooks)
- [Types](#types)
- [Error System](#error-system)

---

## Core Functions

### createRouter(routes)

Creates and normalizes a route configuration for use with RouterProvider.

#### Signature

```typescript
function createRouter(routes: Route[]): Route[];
```

#### Parameters

| Parameter | Type    | Required | Description                          |
| --------- | ------- | -------- | ------------------------------------ |
| routes    | Route[] | Yes      | Array of route configuration objects |

#### Returns

`Route[]` - Normalized array of routes with processed paths and children

#### Route Configuration

```typescript
interface Route {
  path: string | string[]; // Path pattern(s)
  component: JSX.Element; // Component to render
  children?: Route[]; // Nested routes
  index?: boolean; // Index route flag
  lazy?: LazyExoticComponent<ComponentType>; // Lazy-loaded component
  loader?: RouteLoader; // Data fetching function
  errorElement?: JSX.Element; // Error boundary element
  redirectTo?: string; // Redirect destination
  guard?: RouteGuard; // Route protection function
  meta?: RouteMeta; // Route metadata
}
```

#### Examples

**Basic Usage:**

```typescript
import { createRouter } from "router-kit";

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "about", component: <About /> },
]);
```

**With Route Guards:**

```typescript
const routes = createRouter([
  {
    path: "dashboard",
    component: <Dashboard />,
    guard: ({ pathname }) => isAuthenticated() || "/login",
  },
  {
    path: "admin",
    component: <Admin />,
    guard: () => isAdmin() || "/unauthorized",
  },
]);
```

**With Loaders:**

```typescript
const routes = createRouter([
  {
    path: "user/:id",
    component: <UserProfile />,
    loader: async ({ params, signal }) => {
      const response = await fetch(`/api/users/${params.id}`, { signal });
      return response.json();
    },
  },
]);
```

**With Metadata:**

```typescript
const routes = createRouter([
  {
    path: "about",
    component: <About />,
    meta: {
      title: "About Us",
      description: "Learn more about our company",
    },
  },
]);
```

**With Redirects:**

```typescript
const routes = createRouter([
  { path: "old-path", redirectTo: "/new-path" },
  { path: "new-path", component: <NewPage /> },
]);
```

**Nested Routes:**

```typescript
const routes = createRouter([
  {
    path: "dashboard",
    component: <DashboardLayout />,
    children: [
      { path: "", component: <DashboardHome /> },
      { path: "settings", component: <Settings /> },
    ],
  },
]);
```

**Catch-All Routes:**

```typescript
const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "*", component: <NotFound /> }, // Matches any unmatched path
]);
```

---

## Components

### RouterProvider

Main routing component that provides routing context and renders matched components.

#### Props

```typescript
interface RouterProviderProps {
  routes: Route[]; // Routes from createRouter()
  basename?: string; // Base path for all routes
  fallbackElement?: JSX.Element; // Fallback during suspense
}
```

| Prop            | Type        | Required | Description                      |
| --------------- | ----------- | -------- | -------------------------------- |
| routes          | Route[]     | Yes      | Routes array from createRouter() |
| basename        | string      | No       | Base path prefix for all routes  |
| fallbackElement | JSX.Element | No       | Suspense fallback element        |

#### Context Value

```typescript
interface RouterContextType {
  pathname: string; // Current path
  pattern: string; // Matched route pattern
  search: string; // Query string
  hash: string; // URL hash
  state: any; // History state
  params: Record<string, string>; // Route parameters
  matches: RouteMatch[]; // Route match chain
  navigate: NavigateFunction; // Navigation function
  back: () => void; // Go back in history
  forward: () => void; // Go forward in history
  isNavigating: boolean; // Navigation in progress
  loaderData: any; // Data from route loader
  meta: RouteMeta | null; // Route metadata

  // Legacy aliases
  path: string; // Alias for pathname
  fullPathWithParams: string; // Alias for pattern
}
```

#### Example

```tsx
import { createRouter, RouterProvider } from "router-kit";

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "/404", component: <NotFound /> },
]);

function App() {
  return <RouterProvider routes={routes} basename="/app" />;
}
```

---

### Router

Declarative routing component using JSX syntax.

#### Props

```typescript
interface RouterProps {
  children: ReactNode; // Route children as JSX
  basename?: string; // Base path for all routes
  fallback?: ReactNode; // Fallback during lazy loading
}
```

#### Example

```tsx
import { Router, Route } from "router-kit";

function App() {
  return (
    <Router basename="/app" fallback={<Loading />}>
      <Route path="/" component={<Home />} />
      <Route path="/about" component={<About />} />
      <Route path="/users/:id" component={<UserProfile />} />
    </Router>
  );
}
```

---

### Route

Declarative route definition component.

#### Props

```typescript
interface RouteProps {
  path: string | string[]; // Path pattern(s)
  component: ReactElement; // Component to render
  children?: ReactElement<RouteProps>[]; // Nested routes
  index?: boolean; // Index route flag
  lazy?: LazyExoticComponent<ComponentType>; // Lazy component
  loader?: RouteLoader; // Data loader
  errorElement?: ReactElement; // Error boundary
  redirectTo?: string; // Redirect path
  guard?: RouteGuard; // Route guard
  meta?: RouteMeta; // Metadata
  caseSensitive?: boolean; // Case-sensitive matching
}
```

#### Example

```tsx
<Route
  path="/user/:id"
  component={<UserProfile />}
  loader={async ({ params }) => fetchUser(params.id)}
  guard={() => isLoggedIn() || "/login"}
  meta={{ title: "User Profile" }}
/>
```

---

### Link

Navigation component with client-side routing.

#### Props

```typescript
interface LinkProps {
  to: string; // Destination path
  children: ReactNode; // Link content
  className?: string; // CSS class
  replace?: boolean; // Replace history entry
  state?: any; // Navigation state
  preventScrollReset?: boolean; // Keep scroll position
  target?: string; // Link target
  rel?: string; // Link rel attribute
  title?: string; // Link title
  onClick?: (event) => void; // Click handler
}
```

#### Examples

```tsx
import { Link } from "router-kit";

// Basic
<Link to="/about">About</Link>

// With state
<Link to="/profile" state={{ from: 'home' }}>Profile</Link>

// Replace history
<Link to="/login" replace>Login</Link>

// External link (automatic handling)
<Link to="https://example.com" target="_blank">External</Link>

// Custom click handler
<Link to="/page" onClick={(e) => console.log('clicked')}>Page</Link>
```

---

### NavLink

Enhanced Link with active state styling.

#### Props

```typescript
interface NavLinkProps extends LinkProps {
  activeClassName?: string; // Class when active (default: "active")
  activeStyle?: CSSProperties; // Style when active
  isActive?: (match, location) => boolean; // Custom active check
  end?: boolean; // Exact matching
  caseSensitive?: boolean; // Case-sensitive matching
}
```

#### Examples

```tsx
import { NavLink } from "router-kit";

// Basic
<NavLink to="/" activeClassName="active" end>Home</NavLink>

// With activeStyle
<NavLink to="/about" activeStyle={{ fontWeight: 'bold' }}>About</NavLink>

// Custom active logic
<NavLink
  to="/users"
  isActive={(match, location) => location.pathname.startsWith('/users')}
>
  Users
</NavLink>

// Render prop pattern
<NavLink to="/dashboard">
  {({ isActive }) => (
    <span className={isActive ? 'active' : ''}>
      Dashboard {isActive && '✓'}
    </span>
  )}
</NavLink>
```

---

### Outlet

Renders child route content within parent layouts. Essential for nested routing patterns.

#### Props

```typescript
interface OutletProps {
  context?: any; // Context to pass to child routes
}
```

#### Basic Usage

```tsx
import { Outlet } from "router-kit";

function Layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet /> {/* Child routes render here */}
      </main>
      <Footer />
    </div>
  );
}
```

#### With Context

```tsx
import { Outlet, useOutletContext } from "router-kit";

// Parent component passes context
function DashboardLayout() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <div>
      <Sidebar user={user} />
      <Outlet context={{ user, setUser }} />
    </div>
  );
}

// Child component receives context
interface DashboardContext {
  user: User | null;
  setUser: (user: User | null) => void;
}

function DashboardSettings() {
  const { user, setUser } = useOutletContext<DashboardContext>();
  return <UserSettings user={user} onSave={setUser} />;
}
```

---

## Hooks

### useRouter()

Access the full router context.

```typescript
const {
  pathname, // Current path
  pattern, // Matched pattern (e.g., /users/:id)
  search, // Query string
  hash, // URL hash
  state, // History state
  params, // Route parameters
  matches, // Route match chain
  navigate, // Navigate function
  back, // Go back
  forward, // Go forward
  isNavigating, // Navigation loading state
  loaderData, // Data from loader
  meta, // Route metadata
} = useRouter();
```

---

### useNavigate()

Get the navigation function.

```typescript
const navigate = useNavigate();

// Navigate to path
navigate("/dashboard");

// With options
navigate("/login", { replace: true, state: { from: pathname } });

// Go back/forward
navigate(-1); // Back
navigate(1); // Forward
navigate(-2); // Back 2 steps
```

---

### useLocation()

Access the current location.

```typescript
const location = useLocation();

console.log(location.pathname); // "/users/123"
console.log(location.search); // "?tab=profile"
console.log(location.hash); // "#section1"
console.log(location.state); // { from: "/home" }
console.log(location.key); // "abc123"
```

---

### useResolvedPath()

Resolve relative paths.

```typescript
const resolvePath = useResolvedPath();

// Current path: /users/123
console.log(resolvePath("../settings")); // "/users/settings"
console.log(resolvePath("./edit")); // "/users/123/edit"
console.log(resolvePath("/home")); // "/home"
```

---

### useParams()

Extract route parameters.

```typescript
// Route: /users/:userId/posts/:postId
// URL: /users/123/posts/456

const params = useParams();
console.log(params.userId); // "123"
console.log(params.postId); // "456"

// With TypeScript generics
const { userId, postId } = useParams<"userId" | "postId">();
```

---

### useParam()

Get a single parameter.

```typescript
const userId = useParam("userId");
```

---

### useQuery()

Get query parameters as an object.

```typescript
// URL: /search?q=react&page=2

const query = useQuery();
console.log(query.q); // "react"
console.log(query.page); // "2"
```

---

### useSearchParams()

Full control over search parameters.

```typescript
const [searchParams, setSearchParams] = useSearchParams();

// Read
console.log(searchParams.get("q")); // "react"

// Update
setSearchParams({ q: "vue", page: "1" });

// Functional update
setSearchParams((prev) => ({
  ...Object.fromEntries(prev),
  page: "3",
}));

// Replace instead of push
setSearchParams({ q: "angular" }, { replace: true });
```

---

### useMatches()

Get all route matches from root to current.

```typescript
const matches = useMatches();

matches.forEach((match) => {
  console.log(match.pathname); // Matched pathname
  console.log(match.params); // Route params
  console.log(match.pattern); // Route pattern
  console.log(match.route.meta); // Route metadata
});
```

---

### useMatch()

Get the current (leaf) route match.

```typescript
const match = useMatch();

if (match) {
  console.log(match.params);
  console.log(match.pattern);
}
```

---

### useMatchPath()

Check if a path matches current location.

```typescript
const isUsersActive = useMatchPath("/users");
const isExactHome = useMatchPath("/", { end: true });
const isCaseSensitive = useMatchPath("/Users", { caseSensitive: true });
```

---

### useLoaderData()

Access data from route loader.

```typescript
// Route config
{
  path: "user/:id",
  component: <User />,
  loader: ({ params }) => fetchUser(params.id)
}

// In component
function User() {
  const user = useLoaderData<User>();
  return <div>{user.name}</div>;
}
```

---

### useRouteMeta()

Access route metadata.

```typescript
// Route config
{
  path: "about",
  component: <About />,
  meta: { title: "About Us" }
}

// In component
function About() {
  const meta = useRouteMeta();

  useEffect(() => {
    if (meta?.title) document.title = meta.title;
  }, [meta]);
}
```

---

### useIsNavigating()

Check if navigation is in progress.

```typescript
const isNavigating = useIsNavigating();

return (
  <div>
    {isNavigating && <LoadingBar />}
    <Content />
  </div>
);
```

---

### useBlocker()

Block navigation with confirmation.

```typescript
const blocker = useBlocker(({ currentLocation, nextLocation }) => {
  return (
    hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );
});

if (blocker.state === "blocked") {
  return (
    <Modal>
      <p>You have unsaved changes!</p>
      <button onClick={blocker.proceed}>Leave</button>
      <button onClick={blocker.reset}>Stay</button>
    </Modal>
  );
}
```

---

### usePrompt()

Simple navigation prompt.

```typescript
usePrompt("You have unsaved changes!", hasUnsavedChanges);
```

---

### useDynamicComponents()

Select component based on route parameter.

```typescript
// Route: /dashboard/:tab

const tabs = {
  overview: <Overview />,
  analytics: <Analytics />,
  settings: <Settings />,
};

// Basic usage
const TabComponent = useDynamicComponents(tabs, "tab");

// With fallback
const TabComponent = useDynamicComponents(tabs, "tab", {
  fallback: <DefaultTab />,
  throwOnNotFound: false,
});
```

---

### useOutlet()

Get the child route element directly.

```typescript
const outlet = useOutlet();

// Returns the child route element or null
function Layout() {
  const outlet = useOutlet();

  return (
    <div>
      <Header />
      {outlet || <EmptyState message="Select a page" />}
      <Footer />
    </div>
  );
}
```

---

### useOutletContext()

Access context passed from parent route's `<Outlet context={...} />`.

```typescript
// Type-safe context access
interface AppContext {
  theme: "light" | "dark";
  user: User | null;
  toggleTheme: () => void;
}

function ChildRoute() {
  const { theme, user, toggleTheme } = useOutletContext<AppContext>();

  return (
    <div className={`theme-${theme}`}>
      <p>Welcome, {user?.name}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

---

## Types

### Route Types

```typescript
interface Route {
  path: string | string[];
  component: JSX.Element;
  children?: Route[];
  index?: boolean;
  lazy?: LazyExoticComponent<ComponentType<any>>;
  loader?: RouteLoader;
  errorElement?: JSX.Element;
  redirectTo?: string;
  guard?: RouteGuard;
  meta?: RouteMeta;
}

type RouteLoader<T = any> = (args: LoaderArgs) => Promise<T> | T;

interface LoaderArgs {
  params: Record<string, string>;
  request: Request;
  signal: AbortSignal;
}

type RouteGuard = (args: GuardArgs) => boolean | Promise<boolean> | string;

interface GuardArgs {
  pathname: string;
  params: Record<string, string>;
  search: string;
}

interface RouteMeta {
  title?: string;
  description?: string;
  [key: string]: any;
}

interface RouteMatch {
  route: Route;
  params: Record<string, string>;
  pathname: string;
  pathnameBase: string;
  pattern: string;
}
```

### Navigation Types

```typescript
interface NavigateOptions {
  replace?: boolean;
  state?: any;
  preventScrollReset?: boolean;
  relative?: "route" | "path";
}

type NavigateFunction = {
  (to: string, options?: NavigateOptions): void;
  (delta: number): void;
};
```

### Location Types

```typescript
interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: any;
  key: string;
}

type HistoryAction = "POP" | "PUSH" | "REPLACE";
```

### Blocker Types

```typescript
type BlockerFunction = (args: {
  currentLocation: Location;
  nextLocation: Location;
  action: HistoryAction;
}) => boolean;

interface Blocker {
  state: "blocked" | "proceeding" | "unblocked";
  proceed: () => void;
  reset: () => void;
  location?: Location;
}
```

---

## Error System

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

### Error Helpers

```typescript
import { RouterErrors, createRouterError, RouterErrorCode } from "router-kit";

// Pre-defined error throwers
RouterErrors.routerNotInitialized();
RouterErrors.paramNotDefined("userId", ["id", "name"]);
RouterErrors.invalidRoute("/bad-path", "Invalid characters");

// Custom error creation
const error = createRouterError(
  RouterErrorCode.NAVIGATION_ABORTED,
  "Navigation cancelled by user"
);
```

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

````

#### Accessibility

- Maintains semantic HTML with `<a>` tag
- Preserves `href` attribute for accessibility
- Compatible with screen readers

#### Notes

- Must be used within RouterProvider
- Throws error if used outside RouterContext
- Does not support external URLs (use regular `<a>` tag)

---

### NavLink

Enhanced Link component with active state styling.

#### Props

```typescript
interface NavLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}
````

| Prop            | Type      | Required | Default   | Description                |
| --------------- | --------- | -------- | --------- | -------------------------- |
| to              | string    | Yes      | -         | Destination path           |
| children        | ReactNode | Yes      | -         | Link content               |
| className       | string    | No       | undefined | Base CSS class             |
| activeClassName | string    | No       | "active"  | Class when route is active |

#### Active State

Route is considered active when:

- Current `path` exactly matches `to` prop
- Comparison is strict (no partial matching)

#### Behavior

1. Checks if current route matches `to` prop
2. Combines `className` and `activeClassName` when active
3. Prevents default click behavior
4. Navigates using router context

#### Example

```tsx
import { NavLink } from "router-kit";

function Navigation() {
  return (
    <nav>
      <NavLink to="/" activeClassName="selected">
        Home
      </NavLink>
      <NavLink to="/about" className="link" activeClassName="active">
        About
      </NavLink>
    </nav>
  );
}
```

#### CSS Example

```css
.link {
  color: #666;
  text-decoration: none;
}

.link.active {
  color: #007bff;
  font-weight: bold;
  border-bottom: 2px solid #007bff;
}
```

#### Notes

- Active class is added in addition to base className
- Multiple classes are space-separated
- Active state updates on route change

---

## Hooks

### useRouter()

Hook to access router context with navigation capabilities.

#### Signature

```typescript
function useRouter(): RouterContextType;
```

#### Returns

```typescript
interface RouterContextType {
  path: string;
  fullPathWithParams: string;
  navigate: (to: string, options?: NavigateOptions) => void;
}
```

| Property           | Type     | Description                           |
| ------------------ | -------- | ------------------------------------- |
| path               | string   | Current pathname from window.location |
| fullPathWithParams | string   | Matched route pattern with parameters |
| navigate           | function | Function to navigate programmatically |

#### Navigate Function

```typescript
navigate(to: string, options?: NavigateOptions): void
```

**Options:**

```typescript
interface NavigateOptions {
  replace?: boolean; // Use replaceState instead of pushState
  state?: any; // State object to pass with navigation
}
```

#### Examples

**Basic Navigation:**

```tsx
import { useRouter } from "router-kit";

function MyComponent() {
  const { path, navigate } = useRouter();

  return (
    <div>
      <p>Current: {path}</p>
      <button onClick={() => navigate("/home")}>Home</button>
    </div>
  );
}
```

**With Replace Option:**

```tsx
function LoginForm() {
  const { navigate } = useRouter();

  const handleLogin = async () => {
    await authenticateUser();
    // Replace history entry (no back button to login)
    navigate("/dashboard", { replace: true });
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

**With State:**

```tsx
function ProductCard({ product }) {
  const { navigate } = useRouter();

  const viewDetails = () => {
    navigate(`/products/${product.id}`, {
      state: {
        productName: product.name,
        from: "/products",
      },
    });
  };

  return <button onClick={viewDetails}>View</button>;
}
```

#### Error Handling

Throws `RouterKitError` with code `ROUTER_NOT_INITIALIZED` if:

- Used outside RouterProvider
- RouterContext is undefined

#### Notes

- Must be used within RouterProvider
- `fullPathWithParams` includes `:param` placeholders
- Navigate validates URL format before navigation

---

### useParams()

Hook to extract dynamic route parameters from the current URL.

#### Signature

```typescript
function useParams(): Record<string, string>;
```

#### Returns

Object with parameter name-value pairs:

```typescript
{
  [key: string]: string
}
```

#### Behavior

1. Gets `path` and `fullPathWithParams` from router context
2. Splits both paths into segments
3. Matches segments starting with `:` as parameters
4. Extracts corresponding values from current path

#### Examples

**Single Parameter:**

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
// Route: /posts/:category/:slug
// URL: /posts/tech/react-hooks

function BlogPost() {
  const { category, slug } = useParams();

  return (
    <article>
      <p>Category: {category}</p> {/* "tech" */}
      <p>Slug: {slug}</p> {/* "react-hooks" */}
    </article>
  );
}
```

**Nested Parameters:**

```tsx
// Route: /dashboard/:section/:id
// URL: /dashboard/users/456

function DashboardDetail() {
  const params = useParams();

  console.log(params.section); // "users"
  console.log(params.id); // "456"

  return (
    <div>
      {params.section} - {params.id}
    </div>
  );
}
```

#### Notes

- Returns empty object `{}` if no parameters defined
- Parameter values are always strings
- Missing segments result in empty string values
- Must be used within RouterProvider

---

### useQuery()

Hook to parse URL query parameters (search string).

#### Signature

```typescript
function useQuery(): Record<string, string>;
```

#### Returns

Object with query parameter key-value pairs:

```typescript
{
  [key: string]: string
}
```

#### Behavior

1. Accesses `window.location.search`
2. Uses `URLSearchParams` API to parse
3. Converts all parameters to object entries
4. Returns empty object in SSR environment

#### Examples

**Basic Query Parameters:**

```tsx
import { useQuery } from "router-kit";

// URL: /search?q=react&sort=recent

function SearchPage() {
  const query = useQuery();

  console.log(query.q); // "react"
  console.log(query.sort); // "recent"

  return (
    <div>
      <h1>Search: {query.q}</h1>
      <p>Sort by: {query.sort}</p>
    </div>
  );
}
```

**With Default Values:**

```tsx
function ProductList() {
  const query = useQuery();
  const page = query.page || "1";
  const limit = query.limit || "10";

  return <div>Page {page} of products</div>;
}
```

**Multiple Values (Arrays):**

```tsx
// URL: /filter?tag=react&tag=typescript

function FilteredContent() {
  const query = useQuery();

  // URLSearchParams only returns last value for duplicate keys
  console.log(query.tag); // "typescript"

  // For array support, access URLSearchParams directly
  const params = new URLSearchParams(window.location.search);
  const tags = params.getAll("tag"); // ["react", "typescript"]

  return <div>Tags: {tags.join(", ")}</div>;
}
```

**Number Conversion:**

```tsx
function Pagination() {
  const query = useQuery();
  const currentPage = parseInt(query.page || "1", 10);
  const itemsPerPage = parseInt(query.limit || "20", 10);

  return <div>Page {currentPage}</div>;
}
```

#### SSR Compatibility

```typescript
// Returns empty object {} when window is undefined
if (typeof window === "undefined") return {};
```

#### Notes

- All values are returned as strings
- Empty query string returns empty object
- URL encoding is handled automatically
- No automatic type conversion (use parseInt, parseFloat, etc.)

---

### useLocation()

Hook to access current location details including pathname, search, hash, and state.

#### Signature

```typescript
function useLocation(): Location;
```

#### Returns

```typescript
interface Location {
  pathname: string; // Current path
  search: string; // Query string (includes "?")
  hash: string; // Hash fragment (includes "#")
  state: any; // State object passed via navigate()
}
```

#### Examples

**Basic Usage:**

```tsx
import { useLocation } from "router-kit";

function LocationInfo() {
  const location = useLocation();

  return (
    <div>
      <p>Path: {location.pathname}</p>
      <p>Search: {location.search}</p>
      <p>Hash: {location.hash}</p>
      <p>State: {JSON.stringify(location.state)}</p>
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

**Accessing Navigation State:**

```tsx
// Component A - Sending state
function ProductList() {
  const { navigate } = useRouter();

  const viewProduct = (id: string) => {
    navigate(`/products/${id}`, {
      state: { from: "/products", timestamp: Date.now() },
    });
  };

  return <button onClick={() => viewProduct("123")}>View</button>;
}

// Component B - Receiving state
function ProductDetail() {
  const location = useLocation();
  const { from, timestamp } = location.state || {};

  return (
    <div>
      {from && <Link to={from}>← Back to {from}</Link>}
      <p>Opened at: {new Date(timestamp).toLocaleString()}</p>
    </div>
  );
}
```

**Scroll to Hash:**

```tsx
import { useEffect } from "react";
import { useLocation } from "router-kit";

function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);

  return null;
}
```

#### SSR Compatibility

Returns default values when `window` is undefined:

```typescript
{
  pathname: "",
  search: "",
  hash: "",
  state: null
}
```

#### Notes

- Updates reactively when location changes
- `search` includes the leading `?` character
- `hash` includes the leading `#` character
- `state` persists only for current history entry

---

### useDynamicComponents()

Hook for conditional component rendering based on route parameters.

#### Signature

```typescript
function useDynamicComponents(
  dynamicComponentsObject: Record<string, JSX.Element>,
  variationParam: string
): JSX.Element;
```

#### Parameters

| Parameter               | Type                        | Required | Description                               |
| ----------------------- | --------------------------- | -------- | ----------------------------------------- |
| dynamicComponentsObject | Record<string, JSX.Element> | Yes      | Object mapping param values to components |
| variationParam          | string                      | Yes      | Name of the route parameter to check      |

#### Returns

`JSX.Element` - The matched component from the mapping object

#### Behavior

1. Extracts `variationParam` from route params using `useParams()`
2. Validates parameter existence and type
3. Looks up component in `dynamicComponentsObject`
4. Returns matched component or throws error

#### Examples

**Dashboard Views:**

```tsx
import { useDynamicComponents } from "router-kit";

// Route: /dashboard/:view

const dashboardViews = {
  overview: <OverviewView />,
  analytics: <AnalyticsView />,
  reports: <ReportsView />,
  settings: <SettingsView />,
};

function Dashboard() {
  const component = useDynamicComponents(dashboardViews, "view");

  return (
    <div className="dashboard">
      <Sidebar />
      <main>{component}</main>
    </div>
  );
}
```

**Content Types:**

```tsx
// Route: /content/:type/:id

const contentRenderers = {
  article: <ArticleRenderer />,
  video: <VideoPlayer />,
  gallery: <ImageGallery />,
  podcast: <AudioPlayer />,
};

function ContentPage() {
  const content = useDynamicComponents(contentRenderers, "type");
  const { id } = useParams();

  return (
    <div>
      <h1>Content ID: {id}</h1>
      {content}
    </div>
  );
}
```

**With Context:**

```tsx
const viewComponents = {
  grid: <GridView />,
  list: <ListView />,
  table: <TableView />,
};

function ProductCatalog() {
  const ViewComponent = useDynamicComponents(viewComponents, "layout");

  return (
    <div>
      <ViewSelector />
      {ViewComponent}
    </div>
  );
}
```

#### Error Handling

Throws `RouterKitError` in the following cases:

**1. Parameter Not Defined:**

```typescript
// Error Code: PARAM_NOT_DEFINED
// URL: /dashboard (missing :view)
RouterErrors.paramNotDefined("view", ["id", "slug"]);
```

**2. Invalid Parameter Type:**

```typescript
// Error Code: PARAM_INVALID_TYPE
// Param is not a string (should never happen in normal use)
RouterErrors.paramInvalidType("view", "string", "number");
```

**3. Empty Parameter:**

```typescript
// Error Code: PARAM_EMPTY_STRING
// URL: /dashboard/ (empty view parameter)
RouterErrors.paramEmptyString("view");
```

**4. Component Not Found:**

```typescript
// Error Code: COMPONENT_NOT_FOUND
// URL: /dashboard/invalid
RouterErrors.componentNotFound("invalid", ["overview", "analytics"]);
```

#### Error Recovery

```tsx
function SafeDashboard() {
  const dashboardViews = {
    overview: <OverviewView />,
    analytics: <AnalyticsView />,
  };

  try {
    const component = useDynamicComponents(dashboardViews, "view");
    return component;
  } catch (error) {
    if (error instanceof RouterKitError) {
      if (error.code === RouterErrorCode.COMPONENT_NOT_FOUND) {
        return <DefaultView />;
      }
    }
    throw error;
  }
}
```

#### Notes

- Must be used within RouterProvider
- Parameter values are case-sensitive
- Components are pre-rendered (not lazy loaded)
- Errors provide detailed context for debugging

---

## Types

### Route

Defines the structure of a route configuration.

```typescript
interface Route {
  path: string | string[];
  component: JSX.Element;
  children?: Route[];
}
```

| Property  | Type               | Required | Description          |
| --------- | ------------------ | -------- | -------------------- |
| path      | string \| string[] | Yes      | URL path(s) to match |
| component | JSX.Element        | Yes      | Component to render  |
| children  | Route[]            | No       | Nested child routes  |

---

### RouterContextType

Type definition for the router context value.

```typescript
interface RouterContextType {
  path: string;
  fullPathWithParams: string;
  navigate: (to: string, options?: NavigateOptions) => void;
}
```

---

### NavigateOptions

Options for programmatic navigation.

```typescript
interface NavigateOptions {
  replace?: boolean;
  state?: any;
}
```

| Property | Type    | Default   | Description                           |
| -------- | ------- | --------- | ------------------------------------- |
| replace  | boolean | false     | Use replaceState instead of pushState |
| state    | any     | undefined | State object to pass with navigation  |

---

### Location

Location object structure returned by `useLocation()`.

```typescript
interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: any;
}
```

---

### RouterError

Error interface for router-specific errors.

```typescript
interface RouterError extends Error {
  code: "NAVIGATION_ABORTED" | "ROUTER_NOT_FOUND" | "INVALID_ROUTE";
}
```

---

### DynamicComponents

Type for the `useDynamicComponents` hook function signature.

```typescript
interface DynamicComponents {
  (
    dynamicComponentsObject: Record<string, JSX.Element>,
    variationParam: string
  ): JSX.Element;
}
```

---

## Error System

### RouterKitError

Custom error class for all Router-Kit errors.

```typescript
class RouterKitError extends Error {
  public readonly code: RouterErrorCode;
  public readonly context?: Record<string, any>;

  constructor(
    code: RouterErrorCode,
    message: string,
    context?: Record<string, any>
  );

  toConsoleMessage(): string;
}
```

#### Properties

| Property | Type                | Description                  |
| -------- | ------------------- | ---------------------------- |
| code     | RouterErrorCode     | Standardized error code      |
| message  | string              | Human-readable error message |
| context  | Record<string, any> | Additional error context     |
| name     | string              | Always "RouterKitError"      |

#### Methods

**toConsoleMessage()**: Returns formatted error message for console output

```typescript
const error = new RouterKitError(
  RouterErrorCode.PARAM_NOT_DEFINED,
  "Parameter 'id' not defined",
  { paramName: "id", availableParams: ["slug"] }
);

console.log(error.toConsoleMessage());
// Output:
// [router-kit] PARAM_NOT_DEFINED: Parameter 'id' not defined
//
// Context: {
//   "paramName": "id",
//   "availableParams": ["slug"]
// }
```

---

### RouterErrorCode

Enum of all possible error codes.

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

---

### createRouterError()

Factory function to create RouterKitError instances.

```typescript
function createRouterError(
  code: RouterErrorCode,
  message: string,
  context?: Record<string, any>
): RouterKitError;
```

#### Example

```typescript
const error = createRouterError(
  RouterErrorCode.INVALID_ROUTE,
  "Route path is invalid",
  { path: "/invalid/route" }
);
```

---

### RouterErrors

Pre-configured error creators for common scenarios.

```typescript
const RouterErrors = {
  routerNotInitialized(additionalInfo?: string): never;
  paramNotDefined(paramName: string, availableParams?: string[]): never;
  paramInvalidType(paramName: string, expectedType: string, receivedType: string): never;
  paramEmptyString(paramName: string): never;
  componentNotFound(variation: string, availableVariations: string[]): never;
  navigationAborted(reason: string): never;
  invalidRoute(path: string, reason?: string): never;
}
```

#### Methods

**routerNotInitialized()**

Thrown when hooks/components used outside RouterProvider.

```typescript
RouterErrors.routerNotInitialized();
// Throws: Router context is not initialized...
```

**paramNotDefined()**

Thrown when required route parameter doesn't exist.

```typescript
RouterErrors.paramNotDefined("userId", ["id", "slug"]);
// Throws: Parameter "userId" is not defined in route params
```

**paramInvalidType()**

Thrown when parameter type is incorrect.

```typescript
RouterErrors.paramInvalidType("view", "string", "number");
// Throws: Parameter "view" must be a string, got number
```

**paramEmptyString()**

Thrown when parameter is an empty string.

```typescript
RouterErrors.paramEmptyString("category");
// Throws: Parameter "category" cannot be an empty string
```

**componentNotFound()**

Thrown when dynamic component variation doesn't exist.

```typescript
RouterErrors.componentNotFound("settings", ["overview", "analytics"]);
// Throws: Component not found for variation "settings"...
```

**navigationAborted()**

Thrown when navigation is interrupted.

```typescript
RouterErrors.navigationAborted("Invalid URL format");
// Throws: Navigation aborted: Invalid URL format
```

**invalidRoute()**

Thrown when route configuration is invalid.

```typescript
RouterErrors.invalidRoute("/invalid", "Missing component");
// Throws: Invalid route "/invalid": Missing component
```

---

## Utilities

### Path Validation

Internal utility for validating URL paths.

```typescript
const validateUrl = (url: string): boolean => {
  try {
    new URL(url, window.location.origin);
    return true;
  } catch {
    return false;
  }
};
```

---

### Path Matching

Internal utility for matching route patterns to current path.

```typescript
const pathValidation = (
  routeFullPath: string,
  currentPath: string
): string | false
```

**Behavior:**

- Splits route paths by `|` for multiple aliases
- Compares segment by segment
- Treats segments starting with `:` as wildcards
- Returns matched pattern or `false`

---

### History Patching

Internal utility to intercept browser history changes.

```typescript
const patchHistory = (method: "pushState" | "replaceState") => {
  const original = window.history[method];
  return function (
    this: History,
    state: any,
    title: string,
    url?: string | URL | null
  ) {
    const result = original.apply(this, [state, title, url]);
    window.dispatchEvent(new Event("locationchange"));
    return result;
  };
};
```

**Purpose:**

- Detects programmatic navigation
- Triggers component re-renders
- Enables `navigate()` function

---

## Version History

### v1.3.1 (Current)

- Full TypeScript support
- Comprehensive error system
- Dynamic components hook
- Location hook with state support
- Enhanced type exports

---

**Last Updated:** November 9, 2025  
**Maintained by:** Mohammed Ben Cheikh
