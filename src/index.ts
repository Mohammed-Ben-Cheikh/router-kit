// Components
export { default as Link } from "./components/Link";
export { default as NavLink } from "./components/NavLink";
export { default as Outlet, useOutletContext } from "./components/Outlet";
export { default as Route } from "./components/route";
export { default as Router } from "./components/Router";

// Context
export { OutletProvider, useOutlet } from "./context/OutletContext";
export { default as RouterContext } from "./context/RouterContext";
export { default as RouterProvider } from "./context/RouterProvider";

// Core
export { default as createRouter } from "./core/createRouter";

// Hooks - Core navigation
export { useLocation, useResolvedPath } from "./hooks/useLocation";
export { useNavigate } from "./hooks/useNavigate";
export { useRouter } from "./hooks/useRouter";

// Hooks - Route data
export { useMatch, useMatches, useMatchPath } from "./hooks/useMatches";
export { useParam, useParams } from "./hooks/useParams";
export { useQuery, useSearchParams } from "./hooks/useQuery";

// Hooks - Advanced
export { useBlocker, usePrompt } from "./hooks/useBlocker";
export { useDynamicComponents } from "./hooks/useDynamicComponents";
export {
  useIsNavigating,
  useLoaderData,
  useRouteMeta,
} from "./hooks/useLoaderData";

// Component types
export type { OutletProps } from "./components/Outlet";
export type { RouteProps } from "./components/route";

// Core types
export type {
  Blocker,
  // Blocking
  BlockerFunction,
  DynamicComponents,
  // Legacy/Internal
  GetComponent,
  GuardArgs,
  HistoryAction,
  // Components
  LinkProps,
  LoaderArgs,
  // Location
  Location,
  NavigateFunction,
  // Navigation
  NavigateOptions,
  NavLinkProps,
  RouteGuard,
  RouteLoader,
  RouteMatch,
  RouteMeta,
  // Context
  RouterContextType,
  RouterError,
  RouterKitError,
  RouterProviderProps,
  Routes,
  // Route configuration
  Route as RouteType,
  ScrollRestorationProps,
} from "./types/index";

// Error utilities
export {
  createRouterError,
  RouterErrorCode,
  RouterErrors,
  RouterKitError as RouterKitErrorClass,
} from "./utils/error/errors";

// SSR - Server-Side Rendering
export {
  createRequestFromNode,
  getHydratedLoaderData,
  getLoaderDataScript,
  hydrateRouter,
  isBrowser,
  isServerRendered,
  matchServerRoutes,
  prefetchLoaderData,
  StaticRouter,
} from "./ssr";

export type {
  HydrateRouterOptions,
  ServerLoaderResult,
  ServerMatchResult,
  StaticRouterContext,
  StaticRouterProps,
} from "./ssr";
