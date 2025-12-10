import { createContext, ReactNode, useContext } from "react";
import type { Route, RouteMatch } from "../types";

/**
 * Outlet context for nested route rendering
 */
export interface OutletContextType {
  /** Current outlet content to render */
  outlet: ReactNode;
  /** Remaining child routes */
  childRoutes: Route[];
  /** Current route matches */
  matches: RouteMatch[];
  /** Current depth in route tree */
  depth: number;
  /** Custom context data passed to outlet */
  context?: unknown;
}

/**
 * Context for outlet data
 */
export const OutletDataContext = createContext<OutletContextType | null>(null);

/**
 * Hook to access outlet context
 */
export function useOutletContext<T = unknown>(): T {
  const context = useContext(OutletDataContext);
  if (!context) {
    throw new Error("useOutletContext must be used within a route component");
  }
  return context.context as T;
}

/**
 * Hook to check if there's an outlet available
 */
export function useOutlet(): ReactNode {
  const context = useContext(OutletDataContext);
  return context?.outlet ?? null;
}

/**
 * Provider for outlet context
 */
export function OutletProvider({
  children,
  outlet,
  childRoutes = [],
  matches = [],
  depth = 0,
  context,
}: {
  children: ReactNode;
  outlet: ReactNode;
  childRoutes?: Route[];
  matches?: RouteMatch[];
  depth?: number;
  context?: unknown;
}) {
  return (
    <OutletDataContext.Provider
      value={{ outlet, childRoutes, matches, depth, context }}
    >
      {children}
    </OutletDataContext.Provider>
  );
}

export default OutletDataContext;
