import { useContext } from "react";
import RouterContext from "../context/RouterContext";
import type { RouterContextType } from "../types";
import { RouterErrors } from "../utils/error/errors";

/**
 * Hook to access the router context
 *
 * Provides access to:
 * - Current pathname and pattern
 * - Route params
 * - Navigation functions (navigate, back, forward)
 * - Location state (search, hash, state)
 * - Route matches and loader data
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     pathname,
 *     params,
 *     navigate,
 *     back,
 *     isNavigating
 *   } = useRouter();
 *
 *   return (
 *     <div>
 *       <p>Current path: {pathname}</p>
 *       <button onClick={() => navigate('/home')}>Go Home</button>
 *       <button onClick={back}>Go Back</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @throws {RouterKitError} If used outside of RouterProvider
 * @returns {RouterContextType} The router context object
 */
export function useRouter(): RouterContextType {
  const ctx = useContext(RouterContext);

  if (!ctx) {
    RouterErrors.routerNotInitialized(
      "useRouter must be used within a RouterProvider or Router component."
    );
  }

  return ctx as RouterContextType;
}
