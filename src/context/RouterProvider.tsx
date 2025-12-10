import {
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import join from "url-join";
import Page404 from "../pages/404";
import type {
  GetComponent,
  Location,
  NavigateFunction,
  NavigateOptions,
  Route,
  RouteMatch,
  RouteMeta,
  RouterContextType,
  RouterProviderProps,
} from "../types";
import {
  createRouterError,
  RouterErrorCode,
  RouterErrors,
} from "../utils/error/errors";
import { OutletProvider } from "./OutletContext";
import RouterContext from "./RouterContext";

/**
 * Validates a URL string
 */
const validateUrl = (url: string): boolean => {
  try {
    new URL(url, window.location.origin);
    return true;
  } catch {
    return false;
  }
};

/**
 * Creates a unique key for location tracking
 */
const createKey = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

/**
 * Gets current location from window
 */
const getCurrentLocation = (): Location => {
  if (typeof window === "undefined") {
    return {
      pathname: "/",
      search: "",
      hash: "",
      state: null,
      key: "default",
    };
  }
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: window.history.state,
    key: createKey(),
  };
};

/**
 * Extracts params from a path using a pattern
 */
const extractParams = (
  pattern: string,
  pathname: string
): Record<string, string> | null => {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    // Check for catch-all pattern
    const hasCatchAll = patternParts.some((p) => p.startsWith("*"));
    if (!hasCatchAll) return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    // Catch-all segment (*splat or **)
    if (patternPart.startsWith("*")) {
      const paramName = patternPart.slice(1) || "splat";
      params[paramName] = pathParts.slice(i).join("/");
      return params;
    }

    // Dynamic segment (:param)
    if (patternPart.startsWith(":")) {
      const paramName = patternPart.slice(1);
      // Handle optional params (:param?)
      if (paramName.endsWith("?")) {
        params[paramName.slice(0, -1)] = pathPart ?? "";
      } else {
        if (pathPart === undefined) return null;
        params[paramName] = pathPart;
      }
      continue;
    }

    // Static segment - must match exactly
    if (patternPart !== pathPart) return null;
  }

  return params;
};

/**
 * RouterProvider - Professional-grade router provider component
 *
 * Features:
 * - Static and dynamic route matching with priority
 * - Route params extraction
 * - Nested routes support
 * - Route guards and redirects
 * - Loader data support
 * - Navigation transitions
 * - Scroll restoration
 * - History management
 */
const RouterProvider = ({
  routes,
  basename = "",
  fallbackElement,
}: RouterProviderProps) => {
  const [location, setLocation] = useState<Location>(getCurrentLocation);
  const [pattern, setPattern] = useState<string>("");
  const [params, setParams] = useState<Record<string, string>>({});
  const [matches, setMatches] = useState<RouteMatch[]>([]);
  const [loaderData, setLoaderData] = useState<any>(null);
  const [meta, setMeta] = useState<RouteMeta | null>(null);
  const [isPending, startTransition] = useTransition();

  const page404Ref = useRef<ReactNode>(null);
  const scrollPositions = useRef<Map<string, number>>(new Map());
  const isNavigatingRef = useRef(false);

  /**
   * Normalize pathname by removing basename
   */
  const normalizePathname = useCallback(
    (pathname: string): string => {
      if (basename && pathname.startsWith(basename)) {
        return pathname.slice(basename.length) || "/";
      }
      return pathname;
    },
    [basename]
  );

  /**
   * Match a single path pattern against current pathname
   */
  const matchPath = useCallback(
    (
      routePattern: string,
      currentPath: string
    ): {
      match: boolean;
      params: Record<string, string>;
      pattern: string;
    } | null => {
      const patterns = routePattern.split("|");

      for (const pat of patterns) {
        const extractedParams = extractParams(pat, currentPath);
        if (extractedParams !== null) {
          return { match: true, params: extractedParams, pattern: pat };
        }
      }
      return null;
    },
    []
  );

  /**
   * Get component and match info from routes
   */
  const getComponent: GetComponent = useCallback(
    (routesList, currentPath, parentPath = "/") => {
      const staticRoutes: Route[] = [];
      const dynamicRoutes: Route[] = [];
      const catchAllRoutes: Route[] = [];

      for (const route of routesList) {
        const is404 = route.path === "404" || route.path === "/404";
        if (is404) {
          page404Ref.current = route.component;
          continue;
        }

        const pathArray = Array.isArray(route.path) ? route.path : [route.path];
        const hasCatchAll = pathArray.some((p) => p.includes("*"));
        const hasDynamicParams = pathArray.some((p) => p.includes(":"));

        if (hasCatchAll) {
          catchAllRoutes.push(route);
        } else if (hasDynamicParams) {
          dynamicRoutes.push(route);
        } else {
          staticRoutes.push(route);
        }
      }

      // Priority: static > dynamic > catch-all
      const orderedRoutes = [
        ...staticRoutes,
        ...dynamicRoutes,
        ...catchAllRoutes,
      ];

      for (const route of orderedRoutes) {
        const fullPath = join(parentPath, `/${route.path}`);
        const matchResult = matchPath(fullPath, currentPath);

        if (matchResult) {
          // Handle redirects
          if (route.redirectTo) {
            // Schedule redirect in next tick to avoid state update during render
            setTimeout(() => navigate(route.redirectTo!), 0);
            return null;
          }

          // Handle guards
          if (route.guard) {
            const guardResult = route.guard({
              pathname: currentPath,
              params: matchResult.params,
              search: location.search,
            });

            if (typeof guardResult === "string") {
              setTimeout(() => navigate(guardResult), 0);
              return null;
            }
            if (guardResult === false) {
              continue; // Skip this route
            }
          }

          // Update matches state
          const newMatch: RouteMatch = {
            route,
            params: matchResult.params,
            pathname: currentPath,
            pathnameBase: parentPath,
            pattern: matchResult.pattern,
          };

          if (pattern !== matchResult.pattern) {
            setPattern(matchResult.pattern);
          }
          if (JSON.stringify(params) !== JSON.stringify(matchResult.params)) {
            setParams(matchResult.params);
          }
          setMatches((prev) => [...prev, newMatch]);

          // Handle route meta
          if (route.meta) {
            setMeta(route.meta);
            if (route.meta.title && typeof document !== "undefined") {
              document.title = route.meta.title;
            }
          }

          // Handle loader
          if (route.loader) {
            const abortController = new AbortController();
            Promise.resolve(
              route.loader({
                params: matchResult.params,
                request: new Request(window.location.href),
                signal: abortController.signal,
              })
            ).then(setLoaderData);
          }

          // Handle nested routes with Outlet support
          if (route.children && route.children.length > 0) {
            const childComponent = getComponent(
              route.children,
              currentPath,
              fullPath
            );

            // Wrap parent component with OutletProvider to render children via Outlet
            return (
              <OutletProvider
                outlet={childComponent}
                childRoutes={route.children}
                matches={matches}
                depth={parentPath.split("/").filter(Boolean).length}
              >
                {route.component}
              </OutletProvider>
            );
          }

          return route.component;
        }

        // Check children routes (for routes without matching parent)
        if (route.children) {
          const childMatch = getComponent(
            route.children,
            currentPath,
            fullPath
          );
          if (childMatch) return childMatch;
        }
      }

      return null;
    },
    [location.search, matchPath, params, pattern]
  );

  /**
   * Navigate to a new location
   */
  const navigate: NavigateFunction = useCallback(
    (to: string | number, options?: NavigateOptions) => {
      // Handle numeric (delta) navigation
      if (typeof to === "number") {
        window.history.go(to);
        return;
      }

      // Normalize path
      let targetPath = to;
      if (!/^https?:\/\//i.test(to)) {
        targetPath = to.startsWith("/") ? to : `/${to}`;
        if (basename) {
          targetPath = join(basename, targetPath);
        }
      }

      // Validate URL
      if (!validateUrl(targetPath)) {
        RouterErrors.invalidRoute(to, "Invalid URL format");
        return;
      }

      try {
        // Save scroll position before navigation
        if (!options?.preventScrollReset) {
          scrollPositions.current.set(location.key, window.scrollY);
        }

        isNavigatingRef.current = true;

        if (options?.replace) {
          window.history.replaceState(
            { ...options?.state, key: createKey() },
            "",
            targetPath
          );
        } else {
          window.history.pushState(
            { ...options?.state, key: createKey() },
            "",
            targetPath
          );
        }

        // Use transition for better UX
        startTransition(() => {
          setLocation(getCurrentLocation());
          setMatches([]); // Reset matches for new route
        });

        // Scroll to top unless prevented
        if (!options?.preventScrollReset) {
          window.scrollTo(0, 0);
        }
      } catch (error) {
        const navError = createRouterError(
          RouterErrorCode.NAVIGATION_ABORTED,
          `Navigation to "${to}" failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
          { to, error }
        );
        console.error(navError.toConsoleMessage());
        throw navError;
      } finally {
        isNavigatingRef.current = false;
      }
    },
    [basename, location.key]
  );

  /**
   * Go back in history
   */
  const back = useCallback(() => {
    window.history.back();
  }, []);

  /**
   * Go forward in history
   */
  const forward = useCallback(() => {
    window.history.forward();
  }, []);

  /**
   * Setup history listeners
   */
  useEffect(() => {
    const handleLocationChange = () => {
      startTransition(() => {
        setLocation(getCurrentLocation());
        setMatches([]); // Reset matches for new route
      });
    };

    // Patch history methods to dispatch custom event
    const patchHistory = (method: "pushState" | "replaceState") => {
      const original = window.history[method];
      return function (
        this: History,
        state: any,
        title: string,
        url?: string | URL | null
      ) {
        const result = original.apply(this, [state, title, url]);
        window.dispatchEvent(
          new CustomEvent("locationchange", {
            detail: { action: method === "pushState" ? "PUSH" : "REPLACE" },
          })
        );
        return result;
      } as typeof original;
    };

    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;
    window.history.pushState = patchHistory("pushState");
    window.history.replaceState = patchHistory("replaceState");

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("locationchange", handleLocationChange);

    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("locationchange", handleLocationChange);
    };
  }, []);

  /**
   * Compute matched component
   */
  const normalizedPath = normalizePathname(location.pathname);
  const matchedComponent = useMemo(
    () => getComponent(routes, normalizedPath),
    [routes, normalizedPath, getComponent]
  );

  const component = matchedComponent ?? (page404Ref.current || <Page404 />);

  /**
   * Build context value with memoization
   */
  const contextValue = useMemo<RouterContextType>(
    () => ({
      // New API
      pathname: normalizedPath,
      pattern,
      search: location.search,
      hash: location.hash,
      state: location.state,
      params,
      matches,
      navigate,
      back,
      forward,
      isNavigating: isPending || isNavigatingRef.current,
      loaderData,
      meta,

      // Legacy aliases for backward compatibility
      path: normalizedPath,
      fullPathWithParams: pattern,
    }),
    [
      normalizedPath,
      pattern,
      location.search,
      location.hash,
      location.state,
      params,
      matches,
      navigate,
      back,
      forward,
      isPending,
      loaderData,
      meta,
    ]
  );

  return (
    <RouterContext.Provider value={contextValue}>
      {fallbackElement && isPending ? (
        <Suspense fallback={fallbackElement}>{component}</Suspense>
      ) : (
        component
      )}
    </RouterContext.Provider>
  );
};

export default RouterProvider;
