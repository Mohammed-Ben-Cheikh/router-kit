import { type ReactNode, Children, isValidElement } from "react";
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
          component: props.element,
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
 * Router component for declarative routing
 * Provides an alternative JSX-based approach to defining routes
 *
 * @example
 * ```tsx
 * <Router>
 *   <Route path="/" element={<Home />} />
 *   <Route path="/about" element={<About />} />
 *   <Route path="/users/:id" element={<UserProfile />} />
 *   <Route path="/dashboard" element={<Dashboard />}>
 *     <Route path="settings" element={<Settings />} />
 *     <Route path="profile" element={<Profile />} />
 *   </Route>
 *   <Route path="/404" element={<NotFound />} />
 * </Router>
 * ```
 */
const Router = ({ children }: { children: ReactNode }) => {
  const routes = extractRoutesFromJSX(children);
  return <RouterProvider routes={createRouter(routes)} />;
};

export default Router;
