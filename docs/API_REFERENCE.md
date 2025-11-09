# Router-Kit API Reference

Complete API documentation for Router-Kit v1.3.1

---

## Table of Contents

- [Core Functions](#core-functions)
- [Components](#components)
- [Hooks](#hooks)
- [Types](#types)
- [Error System](#error-system)
- [Utilities](#utilities)

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

#### Behavior

1. **Path Normalization**: Removes leading slashes from all paths
2. **Multiple Paths**: Joins array of paths with `|` delimiter
3. **Recursive Processing**: Processes children routes recursively
4. **Path Preservation**: Maintains original component and children references

#### Examples

**Basic Usage:**

```typescript
import { createRouter } from "router-kit";

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "about", component: <About /> },
]);
```

**Multiple Path Aliases:**

```typescript
const routes = createRouter([
  {
    path: ["about", "about-us", "/info"],
    component: <About />,
  },
]);
// Result: path becomes "about|about-us|info"
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

**With Dynamic Parameters:**

```typescript
const routes = createRouter([
  { path: "users/:id", component: <UserProfile /> },
  { path: "posts/:category/:slug", component: <BlogPost /> },
]);
```

#### Notes

- Paths starting with `/` are normalized to remove the leading slash
- Empty strings are preserved for nested default routes
- The function does not validate component types
- Order of routes matters for matching (static before dynamic)

---

## Components

### RouterProvider

Main routing component that provides routing context and renders matched components.

#### Props

```typescript
interface RouterProviderProps {
  routes: Route[];
}
```

| Prop   | Type    | Required | Description                      |
| ------ | ------- | -------- | -------------------------------- |
| routes | Route[] | Yes      | Routes array from createRouter() |

#### Context Value

```typescript
interface RouterContextType {
  path: string;
  fullPathWithParams: string;
  navigate: (to: string, options?: NavigateOptions) => void;
}
```

#### Behavior

1. **Initial Render**: Matches current URL to routes
2. **History Patching**: Patches `pushState` and `replaceState`
3. **Event Listening**: Listens to `popstate` and custom `locationchange` events
4. **Route Matching**: Prioritizes static routes over dynamic routes
5. **404 Handling**: Renders custom 404 or default error page
6. **Context Provision**: Provides routing context to all children

#### Example

```tsx
import { createRouter, RouterProvider } from "router-kit";

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "/404", component: <NotFound /> },
]);

function App() {
  return <RouterProvider routes={routes} />;
}
```

#### Internal State

- `path`: Current window.location.pathname
- `fullPathWithParams`: Matched route pattern (e.g., `/users/:id`)
- Route matching cache for performance

#### Error Handling

- Validates URL format before navigation
- Throws `RouterKitError` for invalid routes
- Logs navigation errors to console

---

### Link

Navigation component that renders an anchor tag with client-side routing.

#### Props

```typescript
interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}
```

| Prop      | Type      | Required | Default   | Description      |
| --------- | --------- | -------- | --------- | ---------------- |
| to        | string    | Yes      | -         | Destination path |
| children  | ReactNode | Yes      | -         | Link content     |
| className | string    | No       | undefined | CSS class name   |

#### Behavior

1. Prevents default anchor click behavior
2. Calls `navigate(to)` from RouterContext
3. Updates browser history
4. Triggers component re-render

#### Example

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
```

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
