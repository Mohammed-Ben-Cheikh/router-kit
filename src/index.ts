export { default as Link } from "./components/Link";
export { default as NavLink } from "./components/NavLink";
export { default as Route } from "./components/route";
export { default as Router } from "./components/Router";
export { default as RouterProvider } from "./context/RouterProvider";
export { default as createRouter } from "./core/createRouter";
export { useDynamicComponents } from "./hooks/useDynamicComponents";
export { useLocation } from "./hooks/useLocation";
export { useParams } from "./hooks/useParams";
export { useQuery } from "./hooks/useQuery";
export { useRouter } from "./hooks/useRouter";

// Export component types
export type { RouteProps } from "./components/route";

// Export types (avoiding duplicate Route export by using alias)
export type {
  DynamicComponents,
  GetComponent,
  Location,
  NavigateOptions,
  RouterContextType,
  RouterError,
  RouterKitError,
  Routes,
  Route as RouteType,
} from "./types/index";

export {
  createRouterError,
  RouterErrorCode,
  RouterErrors,
} from "./utils/error/errors";
