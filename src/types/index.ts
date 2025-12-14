import { ComponentType, JSX, LazyExoticComponent, ReactNode } from "react";

/**
 * Route configuration interface
 */
export interface Route {
  /** Path pattern(s) for the route */
  path: string | string[];
  /** Component to render */
  component: JSX.Element;
  /** Nested child routes */
  children?: Route[];
  /** Index route flag - renders when parent path matches exactly */
  index?: boolean;
  /** Lazy-loaded component */
  lazy?: LazyExoticComponent<ComponentType<any>>;
  /** Route loader function for data fetching */
  loader?: RouteLoader;
  /** Error boundary element for this route */
  errorElement?: JSX.Element;
  /** Redirect to another path */
  redirectTo?: string;
  /** Route guard function */
  guard?: RouteGuard;
  /** Middleware chain for route processing (Chain of Responsibility pattern) */
  middleware?: Middleware[];
  /** Route metadata */
  meta?: RouteMeta;
}

/**
 * Route loader function type
 */
export type RouteLoader<T = any> = (args: LoaderArgs) => Promise<T> | T;

/**
 * Loader function arguments
 */
export interface LoaderArgs {
  params: Record<string, string>;
  request: Request;
  signal: AbortSignal;
}

/**
 * Middleware context passed to middleware functions
 */
export interface MiddlewareContext {
  pathname: string;
  params: Record<string, string>;
  search: string;
  request?: Request;
  signal?: AbortSignal;
}

/**
 * Middleware result - can redirect, block, or continue
 */
export type MiddlewareResult =
  | { type: "continue" }
  | { type: "redirect"; to: string }
  | { type: "block" };

/**
 * Middleware function type - supports both sync and async
 * Returns MiddlewareResult or Promise<MiddlewareResult>
 */
export type Middleware = (
  context: MiddlewareContext,
  next: () => Promise<MiddlewareResult>
) => MiddlewareResult | Promise<MiddlewareResult>;

/**
 * Route guard function type - supports both sync and async
 * Can return boolean, Promise<boolean>, or redirect string
 */
export type RouteGuard = (
  args: GuardArgs
) => boolean | Promise<boolean> | string | Promise<string>;

/**
 * Guard function arguments
 */
export interface GuardArgs {
  pathname: string;
  params: Record<string, string>;
  search: string;
  request?: Request;
  signal?: AbortSignal;
}

/**
 * Route metadata
 */
export interface RouteMeta {
  title?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Match result from route matching
 */
export interface RouteMatch {
  route: Route;
  params: Record<string, string>;
  pathname: string;
  pathnameBase: string;
  pattern: string;
}

export interface GetComponent {
  (
    routes: Route[],
    currentPath: string,
    parentPath?: string
  ): JSX.Element | null;
}

export interface Routes {
  component: JSX.Element;
  fullPath: string;
  path: string;
}

/**
 * Navigation options
 */
export interface NavigateOptions {
  /** Replace current history entry instead of pushing */
  replace?: boolean;
  /** State to pass with navigation */
  state?: any;
  /** Prevent scroll reset after navigation */
  preventScrollReset?: boolean;
  /** Relative navigation base */
  relative?: "route" | "path";
}

/**
 * Navigation function type
 */
export type NavigateFunction = {
  (to: string, options?: NavigateOptions): void;
  (delta: number): void;
};

/**
 * Router context type
 */
export interface RouterContextType {
  /** Current pathname */
  pathname: string;
  /** Full path pattern with params (e.g., /users/:id) */
  pattern: string;
  /** Current search string */
  search: string;
  /** Current hash */
  hash: string;
  /** History state */
  state: any;
  /** Route parameters */
  params: Record<string, string>;
  /** Current route match */
  matches: RouteMatch[];
  /** Navigate function */
  navigate: NavigateFunction;
  /** Go back in history */
  back: () => void;
  /** Go forward in history */
  forward: () => void;
  /** Navigation in progress */
  isNavigating: boolean;
  /** Loader data from current route */
  loaderData: any;
  /** Current route meta */
  meta: RouteMeta | null;

  // Legacy aliases for backward compatibility
  /** @deprecated Use pathname instead */
  path: string;
  /** @deprecated Use pattern instead */
  fullPathWithParams: string;
}

/**
 * Location object
 */
export interface Location {
  /** Current pathname */
  pathname: string;
  /** Query string including leading ? */
  search: string;
  /** Hash including leading # */
  hash: string;
  /** History state */
  state: any;
  /** Unique key for this location */
  key: string;
}

/**
 * History action types
 */
export type HistoryAction = "POP" | "PUSH" | "REPLACE";

/**
 * Navigation blocker function
 */
export type BlockerFunction = (args: {
  currentLocation: Location;
  nextLocation: Location;
  action: HistoryAction;
}) => boolean;

/**
 * Blocker state
 */
export interface Blocker {
  state: "blocked" | "proceeding" | "unblocked";
  proceed: () => void;
  reset: () => void;
  location?: Location;
}

export interface RouterError extends Error {
  code: "NAVIGATION_ABORTED" | "ROUTER_NOT_FOUND" | "INVALID_ROUTE";
}

export interface DynamicComponents {
  (
    dynamicComponentsObject: Record<string, JSX.Element>,
    variationParam: string
  ): JSX.Element;
}

/**
 * Link component props
 */
export interface LinkProps {
  /** Target path */
  to: string;
  /** Children to render */
  children: ReactNode;
  /** CSS class name */
  className?: string;
  /** Navigation options */
  replace?: boolean;
  /** State to pass */
  state?: any;
  /** Prevent scroll reset */
  preventScrollReset?: boolean;
  /** Target attribute */
  target?: string;
  /** Rel attribute */
  rel?: string;
  /** Title attribute */
  title?: string;
  /** onClick handler */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * NavLink component props
 */
export interface NavLinkProps extends LinkProps {
  /** Class name when active */
  activeClassName?: string;
  /** Style when active */
  activeStyle?: React.CSSProperties;
  /** Custom active check function */
  isActive?: (match: RouteMatch | null, location: Location) => boolean;
  /** Match end of path (exact matching) */
  end?: boolean;
  /** Case sensitive matching */
  caseSensitive?: boolean;
}

/**
 * Router provider props
 */
export interface RouterProviderProps {
  routes: Route[];
  /** Base path for all routes */
  basename?: string;
  /** Initial entries for memory history (SSR) */
  initialEntries?: string[];
  /** Fallback element during suspense */
  fallbackElement?: JSX.Element;
}

/**
 * Scroll restoration options
 */
export interface ScrollRestorationProps {
  /** Custom scroll key generator */
  getKey?: (location: Location, matches: RouteMatch[]) => string;
  /** Storage key for scroll positions */
  storageKey?: string;
}

// Export error utilities
export type { RouterKitError } from "../utils/error/errors";
