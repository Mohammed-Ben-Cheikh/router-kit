import { ComponentType, LazyExoticComponent, ReactElement } from "react";
import type { RouteGuard, RouteLoader, RouteMeta } from "../types";

/**
 * Route component props for declarative routing
 */
export interface RouteProps {
  /** Path pattern(s) for the route */
  path: string | string[];
  /** Component to render when route matches */
  component: ReactElement;
  /** Nested route children */
  children?: ReactElement<RouteProps> | ReactElement<RouteProps>[];
  /** Index route - renders when parent path matches exactly */
  index?: boolean;
  /** Lazy-loaded component */
  lazy?: LazyExoticComponent<ComponentType<any>>;
  /** Route loader for data fetching */
  loader?: RouteLoader;
  /** Error boundary element */
  errorElement?: ReactElement;
  /** Redirect to another path */
  redirectTo?: string;
  /** Route guard function */
  guard?: RouteGuard;
  /** Route metadata */
  meta?: RouteMeta;
  /** Case-sensitive matching */
  caseSensitive?: boolean;
}

/**
 * Route component - used for declarative route definitions
 * This is a placeholder component that will be processed by the Router
 *
 * @example
 * ```tsx
 * // Basic route
 * <Route path="/users/:id" component={<UserProfile />} />
 *
 * // Multiple paths
 * <Route path={["/about", "/about-us"]} component={<About />} />
 *
 * // Nested routes
 * <Route path="/dashboard" component={<Dashboard />}>
 *   <Route path="settings" component={<Settings />} />
 *   <Route path="profile" component={<Profile />} />
 * </Route>
 *
 * // With loader
 * <Route
 *   path="/user/:id"
 *   component={<UserPage />}
 *   loader={async ({ params }) => fetchUser(params.id)}
 * />
 *
 * // With guard
 * <Route
 *   path="/admin"
 *   component={<AdminPanel />}
 *   guard={() => isAdmin() || '/login'}
 * />
 *
 * // With metadata
 * <Route
 *   path="/about"
 *   component={<About />}
 *   meta={{ title: 'About Us', description: 'Learn about us' }}
 * />
 *
 * // Catch-all route
 * <Route path="*" component={<NotFound />} />
 * ```
 */
export function Route(_props: RouteProps): null {
  // This component doesn't render anything directly
  // It's used as a declarative way to define routes that will be processed by Router
  return null;
}

// Add displayName for better debugging and component recognition
Route.displayName = "Route";

export default Route;
