import { ReactElement } from "react";

/**
 * Route component props for declarative routing
 */
export interface RouteProps {
  path: string | string[];
  element: ReactElement;
  children?: ReactElement<RouteProps> | ReactElement<RouteProps>[];
}

/**
 * Route component - used for declarative route definitions
 * This is a placeholder component that will be processed by the Router
 *
 * @example
 * ```tsx
 * <Route path="/users/:id" element={<UserProfile />} />
 * <Route path={["/about", "/about-us"]} element={<About />} />
 * <Route path="/dashboard" element={<Dashboard />}>
 *   <Route path="settings" element={<Settings />} />
 * </Route>
 * ```
 */
export function Route(props: RouteProps): null {
  // This component doesn't render anything directly
  // It's used as a declarative way to define routes that will be processed by Router
  return null;
}

// Add displayName for better debugging and component recognition
Route.displayName = "Route";

export default Route;
