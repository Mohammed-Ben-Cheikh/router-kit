import type { Route } from "../types";

/**
 * Normalizes a path by removing leading slashes and handling arrays
 * Preserves "/" as empty string for root path matching
 */
const normalizePath = (path: string | string[]): string => {
  const pathArray = Array.isArray(path) ? path : [path];
  const normalized = pathArray.map((p) => {
    if (!p) return "";
    // Root path "/" becomes empty string
    if (p === "/") return "";
    // Remove leading slashes but preserve the path structure
    return p.startsWith("/") ? p.replace(/^\/+/, "") : p;
  });

  // Join with | but don't filter out empty strings (they represent root "/")
  return normalized.join("|");
};

/**
 * Validates a route configuration
 */
const validateRoute = (route: Route, path: string): void => {
  // Check for valid component or lazy
  if (!route.component && !route.lazy && !route.redirectTo) {
    console.warn(
      `[router-kit] Route "${path}" has no component, lazy, or redirectTo defined.`
    );
  }

  // Check for conflicting configurations
  if (route.component && route.lazy) {
    console.warn(
      `[router-kit] Route "${path}" has both component and lazy defined. Component will take precedence.`
    );
  }

  // Validate path patterns
  const pathArray = Array.isArray(route.path) ? route.path : [route.path];
  for (const p of pathArray) {
    // Check for invalid characters
    if (/[<>"|\\]/.test(p)) {
      console.warn(
        `[router-kit] Route path "${p}" contains invalid characters.`
      );
    }

    // Warn about potential issues with catch-all routes
    if (p.includes("*") && !p.endsWith("*") && !p.includes("*/")) {
      console.warn(
        `[router-kit] Catch-all (*) should typically be at the end of a path: "${p}"`
      );
    }
  }
};

/**
 * Recursively normalizes route configurations
 */
function normalizeRoutes(inputRoutes: Route[], parentPath = ""): Route[] {
  return inputRoutes.map((route) => {
    const normalizedPath = normalizePath(route.path);
    const fullPath = parentPath
      ? `${parentPath}/${normalizedPath}`
      : normalizedPath;

    // Validate route in development
    if (typeof window !== "undefined" && (window as any).__DEV__) {
      validateRoute(route, fullPath);
    }

    const normalized: Route = {
      ...route,
      path: normalizedPath,
    };

    // Recursively normalize children
    if (route.children && route.children.length > 0) {
      normalized.children = normalizeRoutes(route.children, fullPath);
    }

    return normalized;
  });
}

/**
 * Creates a router configuration from route definitions
 *
 * Normalizes paths, validates configurations, and prepares routes
 * for use with RouterProvider.
 *
 * @example
 * ```tsx
 * const routes = createRouter([
 *   { path: '/', component: <Home /> },
 *   { path: '/about', component: <About /> },
 *   {
 *     path: '/users/:id',
 *     component: <UserLayout />,
 *     children: [
 *       { path: 'profile', component: <Profile /> },
 *       { path: 'settings', component: <Settings /> },
 *     ]
 *   },
 *   { path: '/404', component: <NotFound /> },
 * ]);
 *
 * // Use with RouterProvider
 * <RouterProvider routes={routes} />
 * ```
 *
 * @example
 * ```tsx
 * // With route guards
 * const routes = createRouter([
 *   {
 *     path: '/dashboard',
 *     component: <Dashboard />,
 *     guard: ({ pathname }) => isAuthenticated() || '/login'
 *   },
 * ]);
 * ```
 *
 * @example
 * ```tsx
 * // With redirects
 * const routes = createRouter([
 *   { path: '/old-path', redirectTo: '/new-path' },
 *   { path: '/new-path', component: <NewPage /> },
 * ]);
 * ```
 *
 * @example
 * ```tsx
 * // With route metadata
 * const routes = createRouter([
 *   {
 *     path: '/about',
 *     component: <About />,
 *     meta: {
 *       title: 'About Us',
 *       description: 'Learn more about our company'
 *     }
 *   },
 * ]);
 * ```
 *
 * @param inputRoutes - Array of route configurations
 * @returns Normalized route configurations
 */
function createRouter(inputRoutes: Route[]): Route[] {
  if (!Array.isArray(inputRoutes)) {
    throw new Error("[router-kit] createRouter expects an array of routes");
  }

  if (inputRoutes.length === 0) {
    console.warn(
      "[router-kit] createRouter was called with an empty routes array"
    );
  }

  return normalizeRoutes(inputRoutes);
}

export default createRouter;
