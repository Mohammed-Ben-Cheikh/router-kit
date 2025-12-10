import { type ReactNode, Children, isValidElement, Suspense } from "react";
import RouterProvider from "../context/RouterProvider";
import createRouter from "../core/createRouter";
import type { Route as RouteType } from "../types";
import { Route, RouteProps } from "./route";

/**
 * Extracts route configurations from JSX Route elements
 * @param children React children containing Route elements
 * @returns Array of route configurations
 */
function extractRoutesFromJSX(children: ReactNode): RouteType[] {
  const routes: RouteType[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      // Check if this is a Route component
      const isRouteComponent =
        child.type === Route ||
        (child.type as any)?.displayName === "Route" ||
        (typeof child.type === "function" && child.type.name === "Route");

      if (isRouteComponent) {
        const props = child.props as RouteProps;

        const route: RouteType = {
          path: props.path,
          component: props.component,
          // Pass through all route configuration options
          index: props.index,
          lazy: props.lazy,
          loader: props.loader,
          errorElement: props.errorElement,
          redirectTo: props.redirectTo,
          guard: props.guard,
          meta: props.meta,
        };

        // Handle nested routes
        if (props.children) {
          const childRoutes = extractRoutesFromJSX(props.children);
          if (childRoutes.length > 0) {
            route.children = childRoutes;
          }
        }

        routes.push(route);
      }
    }
  });

  return routes;
}

/**
 * Router props
 */
interface RouterProps {
  /** Route children as JSX */
  children: ReactNode;
  /** Base path for all routes */
  basename?: string;
  /** Fallback element shown during lazy loading */
  fallback?: ReactNode;
}

/**
 * Router component for declarative routing
 *
 * Provides an alternative JSX-based approach to defining routes.
 * Supports all route configuration options through props.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Router>
 *   <Route path="/" component={<Home />} />
 *   <Route path="/about" component={<About />} />
 *   <Route path="/users/:id" component={<UserProfile />} />
 *   <Route path="/dashboard" component={<Dashboard />}>
 *     <Route path="settings" component={<Settings />} />
 *     <Route path="profile" component={<Profile />} />
 *   </Route>
 *   <Route path="/404" component={<NotFound />} />
 * </Router>
 * ```
 *
 * @example
 * ```tsx
 * // With basename
 * <Router basename="/app">
 *   <Route path="/" component={<Home />} />
 * </Router>
 * ```
 *
 * @example
 * ```tsx
 * // With lazy loading
 * const LazyAbout = lazy(() => import('./pages/About'));
 *
 * <Router fallback={<Loading />}>
 *   <Route path="/about" component={<LazyAbout />} />
 * </Router>
 * ```
 *
 * @example
 * ```tsx
 * // With guards and loaders
 * <Router>
 *   <Route
 *     path="/admin"
 *     component={<Admin />}
 *     guard={() => isAdmin() || '/login'}
 *     loader={async () => fetchAdminData()}
 *   />
 * </Router>
 * ```
 */
const Router = ({ children, basename, fallback }: RouterProps) => {
  const routes = extractRoutesFromJSX(children);

  const content = (
    <RouterProvider
      routes={createRouter(routes)}
      basename={basename}
      fallbackElement={fallback as any}
    />
  );

  // Wrap in Suspense if fallback is provided
  if (fallback) {
    return <Suspense fallback={fallback}>{content}</Suspense>;
  }

  return content;
};

Router.displayName = "Router";

export default Router;
