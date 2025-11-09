# Router-Kit Architecture & Implementation

Technical documentation for Router-Kit v1.3.1

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Route Matching Algorithm](#route-matching-algorithm)
4. [History Management](#history-management)
5. [Context System](#context-system)
6. [Error Handling System](#error-handling-system)
7. [Type System](#type-system)
8. [Performance Considerations](#performance-considerations)

---

## Architecture Overview

### System Design

Router-Kit follows a **provider-context pattern** where the `RouterProvider` acts as the central hub for routing state and navigation logic.

```
┌─────────────────────────────────────────────────────┐
│                    Application                       │
│  ┌───────────────────────────────────────────────┐  │
│  │            RouterProvider                     │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │        RouterContext                    │ │  │
│  │  │  • path: string                         │ │  │
│  │  │  • fullPathWithParams: string           │ │  │
│  │  │  • navigate: (to, options) => void      │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  │                                               │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │      Route Matching Engine              │ │  │
│  │  │  • Static route priority                │ │  │
│  │  │  • Dynamic route matching               │ │  │
│  │  │  • Nested route resolution              │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  │                                               │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │      History Patching                   │ │  │
│  │  │  • pushState interception               │ │  │
│  │  │  • replaceState interception            │ │  │
│  │  │  • popstate event handling              │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (Click Link / navigate())
         │
         ▼
   History API Update
   (pushState/replaceState)
         │
         ▼
   'locationchange' Event
         │
         ▼
   RouterProvider Updates State
   (setPath, setFullPathWithParams)
         │
         ▼
   Route Matching Algorithm
   (getComponent function)
         │
         ▼
   Component Rendered
         │
         ▼
   Context Updated
   (Children can access via hooks)
```

---

## Core Components

### createRouter Function

**Location:** `src/core/createRouter.tsx`

**Purpose:** Normalizes route configurations for consistent processing

**Implementation:**

```typescript
function normalizeRoutes(inputRoutes: Route[]): Route[] {
  return inputRoutes.map((route) => {
    // Handle array or single path
    const pathArray = Array.isArray(route.path) ? route.path : [route.path];

    // Normalize: remove leading slashes, join with |
    const normalizedPath = pathArray
      .map((path) =>
        path?.startsWith("/") ? path.replace(/^\/+/, "") : path ?? ""
      )
      .join("|");

    const normalized: Route = {
      ...route,
      path: normalizedPath,
    };

    // Recursively normalize children
    if (route.children) {
      normalized.children = normalizeRoutes(route.children);
    }

    return normalized;
  });
}
```

**Key Features:**

1. **Path Normalization:** Removes leading slashes for consistent matching
2. **Multiple Paths:** Joins array of paths with `|` delimiter
3. **Recursive Processing:** Handles nested route structures
4. **Immutability:** Creates new objects without modifying input

**Example Transformation:**

```typescript
// Input
[
  { path: "/home", component: <Home /> },
  { path: ["about", "/about-us"], component: <About /> },
][
  // Output
  ({ path: "home", component: <Home /> },
  { path: "about|about-us", component: <About /> })
];
```

---

### RouterProvider Component

**Location:** `src/context/RouterProvider.tsx`

**Purpose:** Main routing component that manages state and renders matched components

**State Management:**

```typescript
const [path, setPath] = useState<string>("");
const [fullPathWithParams, setFullPathWithParams] = useState<string>("");
```

- `path`: Current window.location.pathname
- `fullPathWithParams`: Matched route pattern with `:param` placeholders

**Lifecycle:**

1. **Initialization:**

   - Sets initial path from `window.location.pathname`
   - Patches `history.pushState` and `history.replaceState`
   - Registers event listeners for `popstate` and `locationchange`

2. **Update:**

   - Listens for location changes
   - Runs route matching algorithm
   - Updates state and re-renders

3. **Cleanup:**
   - Restores original history methods
   - Removes event listeners

**Route Matching Priority:**

```typescript
// 1. Separate static and dynamic routes
for (const route of routesList) {
  if (hasDynamicParams) {
    dynamicRoutes.push(route);
  } else {
    staticRoutes.push(route);
  }
}

// 2. Match static routes first
for (const route of staticRoutes) {
  const matchedPath = pathValidation(fullPath, currentPath);
  if (matchedPath) return route.component;
}

// 3. Then match dynamic routes
for (const route of dynamicRoutes) {
  const matchedPath = pathValidation(fullPath, currentPath);
  if (matchedPath) return route.component;
}

// 4. Return 404 if no match
return null;
```

---

### Link Component

**Location:** `src/components/Link.tsx`

**Purpose:** Navigation component with client-side routing

**Implementation:**

```typescript
function Link({ to, children, className }) {
  const { navigate } = useRouter();

  return (
    <a
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      className={className}
      href={to}
    >
      {children}
    </a>
  );
}
```

**Key Features:**

1. **Prevents Default:** Stops full page reload
2. **Context Access:** Uses `useRouter` hook for navigation
3. **Semantic HTML:** Maintains `<a>` tag for accessibility
4. **href Preservation:** Keeps href for right-click/middle-click support

---

### NavLink Component

**Location:** `src/components/NavLink.tsx`

**Purpose:** Navigation link with active state

**Implementation:**

```typescript
function NavLink({ to, children, className, activeClassName = "active" }) {
  const { navigate, path } = useRouter();
  const isActive = path === to;

  const combinedClass = [className, isActive ? activeClassName : null]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      className={combinedClass}
      href={to}
    >
      {children}
    </a>
  );
}
```

**Active State Logic:**

- Compares current `path` with `to` prop
- **Strict equality** (no partial matching)
- Combines base className with activeClassName

---

## Route Matching Algorithm

### Path Validation Function

**Purpose:** Determines if a route pattern matches the current path

**Algorithm:**

```typescript
const pathValidation = (
  routeFullPath: string,
  currentPath: string
): string | false => {
  // Split by | for multiple path aliases
  const routePaths = routeFullPath.split("|");

  for (const routePath of routePaths) {
    // Split into segments
    const routeParts = routePath.split("/").filter(Boolean);
    const pathParts = currentPath.split("/").filter(Boolean);

    // Length must match
    if (routeParts.length !== pathParts.length) continue;

    let isMatch = true;
    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const pathPart = pathParts[i];

      // Skip dynamic segments (start with :)
      if (routePart.startsWith(":")) continue;

      // Static segments must match exactly
      if (routePart !== pathPart) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) return routePath;
  }

  return false;
};
```

**Examples:**

```typescript
// Static route
pathValidation("about", "/about");
// Returns: "about"

// Dynamic route
pathValidation("users/:id", "/users/123");
// Returns: "users/:id"

// Multiple paths
pathValidation("about|about-us", "/about-us");
// Returns: "about-us"

// Nested route
pathValidation("dashboard/settings", "/dashboard/settings");
// Returns: "dashboard/settings"

// No match
pathValidation("users/:id", "/posts/123");
// Returns: false
```

### Nested Route Resolution

**Algorithm:**

```typescript
const getComponent: GetComponent = (
  routesList,
  currentPath,
  parentPath = "/"
) => {
  for (const route of staticRoutes) {
    // Build full path with parent
    const fullPath = join(parentPath, `/${route.path}`);

    const matchedPath = pathValidation(fullPath, currentPath);
    if (matchedPath) {
      setFullPathWithParams(matchedPath);
      return route.component;
    }

    // Recursively check children
    if (route.children) {
      const childMatch = getComponent(route.children, currentPath, fullPath);
      if (childMatch) return childMatch;
    }
  }

  // Repeat for dynamic routes...
};
```

**Example Nested Resolution:**

```typescript
// Routes
[
  {
    path: "dashboard",
    component: <DashboardLayout />,
    children: [{ path: "settings", component: <Settings /> }],
  },
];

// URL: /dashboard/settings

// Step 1: Check "dashboard" (no match, has children)
// Step 2: Build child path: "dashboard/settings"
// Step 3: Match found! Return <Settings />
```

---

## History Management

### History API Patching

**Purpose:** Intercept programmatic navigation to trigger re-renders

**Implementation:**

```typescript
const patchHistory = (method: "pushState" | "replaceState") => {
  const original = window.history[method];

  return function (
    this: History,
    state: any,
    title: string,
    url?: string | URL | null
  ) {
    // Call original method
    const result = original.apply(this, [state, title, url]);

    // Dispatch custom event
    window.dispatchEvent(new Event("locationchange"));

    return result;
  };
};

// Apply patches
window.history.pushState = patchHistory("pushState");
window.history.replaceState = patchHistory("replaceState");
```

**Why This Works:**

1. Browser's `pushState`/`replaceState` don't trigger events
2. We patch these methods to dispatch custom `locationchange` event
3. RouterProvider listens to this event
4. State updates trigger re-render with new route

### Event Handling

```typescript
useEffect(() => {
  const handleLocationChange = () => {
    setPath(window.location.pathname);
  };

  // Listen to browser back/forward
  window.addEventListener("popstate", handleLocationChange);

  // Listen to our custom event
  window.addEventListener("locationchange", handleLocationChange);

  return () => {
    window.removeEventListener("popstate", handleLocationChange);
    window.removeEventListener("locationchange", handleLocationChange);
  };
}, []);
```

---

## Context System

### RouterContext

**Location:** `src/context/RouterContext.tsx`

**Implementation:**

```typescript
const RouterContext = createContext<RouterContextType | undefined>(undefined);

interface RouterContextType {
  path: string;
  fullPathWithParams: string;
  navigate: (to: string, options?: NavigateOptions) => void;
}
```

### useRouter Hook

**Location:** `src/hooks/useRouter.ts`

**Implementation:**

```typescript
export function useRouter(): RouterContextType {
  const ctx = useContext(RouterContext);

  if (!ctx) {
    RouterErrors.routerNotInitialized();
  }

  return ctx as RouterContextType;
}
```

**Error Protection:**

- Throws error if used outside RouterProvider
- Ensures type safety with non-null assertion
- Provides clear error message for debugging

---

## Error Handling System

### Error Class Hierarchy

```
Error (Native)
  │
  └── RouterKitError
        │
        ├── Code: ROUTER_NOT_INITIALIZED
        ├── Code: PARAM_NOT_DEFINED
        ├── Code: PARAM_INVALID_TYPE
        ├── Code: PARAM_EMPTY_STRING
        ├── Code: COMPONENT_NOT_FOUND
        ├── Code: NAVIGATION_ABORTED
        └── Code: INVALID_ROUTE
```

### RouterKitError Implementation

**Location:** `src/utils/error/errors.ts`

```typescript
export class RouterKitError extends Error {
  public readonly code: RouterErrorCode;
  public readonly context?: Record<string, any>;

  constructor(
    code: RouterErrorCode,
    message: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = "RouterKitError";
    this.code = code;
    this.context = context;

    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, RouterKitError);
    }
  }

  toConsoleMessage(): string {
    const contextStr = this.context
      ? `\n\nContext: ${JSON.stringify(this.context, null, 2)}`
      : "";
    return `[router-kit] ${this.code}: ${this.message}${contextStr}`;
  }
}
```

### Error Creator Pattern

```typescript
export const RouterErrors = {
  routerNotInitialized: (additionalInfo?: string) =>
    throwRouterError(
      RouterErrorCode.ROUTER_NOT_INITIALIZED,
      `Router context is not initialized. ${additionalInfo || "..."}`
    ),

  paramNotDefined: (paramName: string, availableParams?: string[]) =>
    throwRouterError(
      RouterErrorCode.PARAM_NOT_DEFINED,
      `Parameter "${paramName}" is not defined in route params`,
      availableParams ? { paramName, availableParams } : { paramName }
    ),

  // ... more error creators
};
```

**Benefits:**

1. **Consistency:** All errors follow same pattern
2. **Context:** Rich debugging information
3. **Type Safety:** Enum-based error codes
4. **Discoverability:** Pre-configured creators for common cases

---

## Type System

### Core Types

**Location:** `src/types/index.ts`

```typescript
// Route definition
export interface Route {
  path: string | string[];
  component: JSX.Element;
  children?: Route[];
}

// Router context
export interface RouterContextType {
  path: string;
  fullPathWithParams: string;
  navigate: (to: string, options?: NavigateOptions) => void;
}

// Navigation options
export interface NavigateOptions {
  replace?: boolean;
  state?: any;
}

// Location object
export interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: any;
}

// Error types
export interface RouterError extends Error {
  code: "NAVIGATION_ABORTED" | "ROUTER_NOT_FOUND" | "INVALID_ROUTE";
}
```

### Type Safety Features

1. **Strict Typing:** All functions have explicit return types
2. **Interface Contracts:** Clear API boundaries
3. **Generic Support:** Flexible but type-safe
4. **Null Safety:** Optional chaining and nullish coalescing

---

## Performance Considerations

### Optimization Strategies

**1. Static Route Priority:**

```typescript
// Static routes matched first (O(n) where n = static routes)
// Dynamic routes matched second (O(m) where m = dynamic routes)
// Avoids unnecessary regex operations
```

**2. Memoization:**

```typescript
// Component references are stable
const routes = createRouter([
  { path: "/", component: <Home /> }, // <Home /> created once
]);
```

**3. Minimal Re-renders:**

```typescript
// Only updates when path changes
useEffect(() => {
  setPath(window.location.pathname);
}, []); // Empty dependency array
```

**4. Event Delegation:**

```typescript
// Single listener per event type
window.addEventListener("popstate", handleLocationChange);
window.addEventListener("locationchange", handleLocationChange);
```

### Performance Metrics

| Operation         | Complexity | Notes                                |
| ----------------- | ---------- | ------------------------------------ |
| Route Creation    | O(n)       | Linear in number of routes           |
| Static Match      | O(n)       | Linear search through static routes  |
| Dynamic Match     | O(m)       | Linear search through dynamic routes |
| Nested Resolution | O(d)       | Linear in tree depth                 |
| Navigation        | O(1)       | Direct history API call              |

### Memory Considerations

**Constant Memory:**

- Fixed event listeners (2 per provider)
- Single context instance
- No route caching (stateless matching)

**Linear Memory:**

- Route storage: O(n) where n = number of routes
- Component instances: O(1) (only current route rendered)

---

## Build & Distribution

### Build Process

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

**TypeScript Configuration:**

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "ESNext",
    "jsx": "react-jsx",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true
  }
}
```

**Output Structure:**

```
dist/
  ├── index.js          # Main entry point
  ├── index.d.ts        # Type definitions
  ├── components/       # Component files
  ├── context/          # Context files
  ├── hooks/            # Hook files
  └── ...
```

### Package Distribution

```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"]
}
```

---

## Testing Strategies

### Unit Testing

```typescript
// Test route normalization
describe("createRouter", () => {
  it("removes leading slashes", () => {
    const routes = createRouter([{ path: "/home", component: <Home /> }]);
    expect(routes[0].path).toBe("home");
  });

  it("handles multiple paths", () => {
    const routes = createRouter([
      { path: ["about", "/info"], component: <About /> },
    ]);
    expect(routes[0].path).toBe("about|info");
  });
});
```

### Integration Testing

```typescript
// Test navigation flow
describe("RouterProvider", () => {
  it("renders matched component", () => {
    const routes = createRouter([{ path: "/", component: <Home /> }]);

    render(<RouterProvider routes={routes} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("updates on navigation", () => {
    // Test navigate function
  });
});
```

---

## Future Improvements

### Planned Features

1. **Hash-based Routing:** Support for `#/path` URLs
2. **Regex Matching:** More flexible route patterns
3. **Route Guards:** Built-in authentication/authorization
4. **Lazy Loading:** Native code-splitting support
5. **Transition Hooks:** Animation lifecycle callbacks
6. **Route Metadata:** SEO and meta tag management

### Performance Enhancements

1. **Route Caching:** Memoize matched routes
2. **Virtual Routing:** For extremely large route trees
3. **Suspense Integration:** Better loading state handling

---

**Maintained by:** Mohammed Ben Cheikh  
**Last Updated:** November 9, 2025
