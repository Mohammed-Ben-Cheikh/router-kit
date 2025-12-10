import { createContext, useContext } from "react";
import type { RouterContextType } from "../types";

/**
 * Router context - provides routing state and navigation functions
 * throughout the application
 */
const RouterContext = createContext<RouterContextType | undefined>(undefined);

/**
 * Display name for debugging
 */
RouterContext.displayName = "RouterContext";

/**
 * Internal hook to access router context with validation
 * @internal
 */
export function useRouterContext(): RouterContextType {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error(
      "[router-kit] useRouter must be used within a RouterProvider. " +
        "Wrap your application with <RouterProvider> or use createRouter()."
    );
  }
  return context;
}

export default RouterContext;
