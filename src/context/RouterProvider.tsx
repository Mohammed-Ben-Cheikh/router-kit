import React, {
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
 * Normalize path to string (handles array paths)
 * Preserves '/' as a special case for root path
 */
const normalizePath = (path: string | string[]): string => {
  if (Array.isArray(path)) {
    return path
      .map((p) => {
        // Keep "/" as empty string to represent root
        if (p === "/") return "";
        return p.startsWith("/") ? p.slice(1) : p;
      })
      .join("|");
  }
  // Keep "/" as empty string to represent root
  if (path === "/") return "";
  return path.startsWith("/") ? path.slice(1) : path;
};

/**
 * Get the first path from a path (string or array)
 */
const getFirstPath = (path: string | string[]): string => {
  if (Array.isArray(path)) {
    return path[0] || "";
  }
  // Handle pipe-separated paths (already normalized)
  if (path.includes("|")) {
    return path.split("|")[0];
  }
  return path;
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
  // Special case: root path matching
  const normalizedPattern = pattern === "/" ? "" : pattern;
  const normalizedPathname = pathname === "/" ? "" : pathname;

  const patternParts = normalizedPattern.split("/").filter(Boolean);
  const pathParts = normalizedPathname.split("/").filter(Boolean);

  // Both empty means root path match
  if (patternParts.length === 0 && pathParts.length === 0) {
    return {};
  }

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
 * Result from route matching (pure function result)
 */
interface MatchResult {
  component: React.ReactNode;
  pattern: string;
  params: Record<string, string>;
  matches: RouteMatch[];
  meta: RouteMeta | null;
  redirect?: string;
  loader?: {
    fn: (args: any) => Promise<any> | any;
    params: Record<string, string>;
  };
  page404Component?: ReactNode;
}

/**
 * Match a single path pattern against current pathname (pure function)
 */
const matchPathPattern = (
  routePattern: string,
  currentPath: string
): {
  match: boolean;
  params: Record<string, string>;
  pattern: string;
} | null => {
  const patterns = routePattern.split("|");

  for (const pat of patterns) {
    // Handle root path pattern
    const normalizedPat = pat === "" ? "/" : pat;
    const extractedParams = extractParams(normalizedPat, currentPath);
    if (extractedParams !== null) {
      return { match: true, params: extractedParams, pattern: normalizedPat };
    }
  }
  return null;
};

/**
 * Pure function to match routes and return result without side effects
 */
const matchRoutes = (
  routesList: Route[],
  currentPath: string,
  parentPath: string = "/",
  searchString: string = "",
  collectedMatches: RouteMatch[] = []
): MatchResult => {
  const staticRoutes: Route[] = [];
  const dynamicRoutes: Route[] = [];
  const catchAllRoutes: Route[] = [];
  let page404Component: ReactNode = null;

  for (const route of routesList) {
    const pathArray = Array.isArray(route.path)
      ? route.path
      : route.path.includes("|")
      ? route.path.split("|")
      : [route.path];
    const is404 = pathArray.some((p) => p === "404" || p === "/404");
    if (is404) {
      page404Component = route.component;
      continue;
    }

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
  const orderedRoutes = [...staticRoutes, ...dynamicRoutes, ...catchAllRoutes];

  for (const route of orderedRoutes) {
    const normalizedRoutePath = normalizePath(route.path);
    const firstPath = getFirstPath(route.path);
    // Handle root path correctly
    const fullPath =
      firstPath === "/" || firstPath === ""
        ? parentPath
        : join(parentPath, `/${firstPath}`);
    // Build full pattern for matching (handles multiple paths)
    const fullPattern = normalizedRoutePath.includes("|")
      ? normalizedRoutePath
          .split("|")
          .map((p) => {
            // Handle empty string (root path) correctly
            if (p === "") return parentPath;
            return join(parentPath, `/${p}`);
          })
          .join("|")
      : fullPath;
    const matchResult = matchPathPattern(fullPattern, currentPath);

    if (matchResult) {
      // Handle redirects
      if (route.redirectTo) {
        return {
          component: null,
          pattern: matchResult.pattern,
          params: matchResult.params,
          matches: collectedMatches,
          meta: null,
          redirect: route.redirectTo,
          page404Component,
        };
      }

      // Handle guards
      if (route.guard) {
        const guardResult = route.guard({
          pathname: currentPath,
          params: matchResult.params,
          search: searchString,
        });

        if (typeof guardResult === "string") {
          return {
            component: null,
            pattern: matchResult.pattern,
            params: matchResult.params,
            matches: collectedMatches,
            meta: null,
            redirect: guardResult,
            page404Component,
          };
        }
        if (guardResult === false) {
          continue; // Skip this route
        }
      }

      // Build match object
      const newMatch: RouteMatch = {
        route,
        params: matchResult.params,
        pathname: currentPath,
        pathnameBase: parentPath,
        pattern: matchResult.pattern,
      };

      const newMatches = [...collectedMatches, newMatch];

      // Handle nested routes with Outlet support
      if (route.children && route.children.length > 0) {
        const childResult = matchRoutes(
          route.children,
          currentPath,
          fullPath,
          searchString,
          newMatches
        );

        if (childResult.component || childResult.redirect) {
          // Wrap parent component with OutletProvider to render children via Outlet
          return {
            component: (
              <OutletProvider
                outlet={childResult.component}
                childRoutes={route.children}
                matches={newMatches}
                depth={parentPath.split("/").filter(Boolean).length}
              >
                {route.component}
              </OutletProvider>
            ),
            pattern: matchResult.pattern,
            params: { ...matchResult.params, ...childResult.params },
            matches: childResult.matches,
            meta: route.meta || childResult.meta,
            loader: route.loader
              ? { fn: route.loader, params: matchResult.params }
              : childResult.loader,
            page404Component: page404Component || childResult.page404Component,
          };
        }
      }

      return {
        component: route.component,
        pattern: matchResult.pattern,
        params: matchResult.params,
        matches: newMatches,
        meta: route.meta || null,
        loader: route.loader
          ? { fn: route.loader, params: matchResult.params }
          : undefined,
        page404Component,
      };
    }

    // Check children routes (for routes without matching parent)
    if (route.children) {
      const childResult = matchRoutes(
        route.children,
        currentPath,
        fullPath,
        searchString,
        collectedMatches
      );
      if (childResult.component || childResult.redirect) {
        return {
          ...childResult,
          page404Component: page404Component || childResult.page404Component,
        };
      }
    }
  }

  return {
    component: null,
    pattern: "",
    params: {},
    matches: collectedMatches,
    meta: null,
    page404Component,
  };
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
  const [loaderData, setLoaderData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

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
   * Compute matched route result (pure computation)
   */
  const normalizedPath = normalizePathname(location.pathname);

  const matchResult = useMemo(
    () => matchRoutes(routes, normalizedPath, "/", location.search),
    [routes, normalizedPath, location.search]
  );

  // Handle redirects
  useEffect(() => {
    if (matchResult.redirect) {
      navigate(matchResult.redirect);
    }
  }, [matchResult.redirect, navigate]);

  // Handle loaders
  useEffect(() => {
    if (matchResult.loader) {
      const abortController = new AbortController();
      Promise.resolve(
        matchResult.loader.fn({
          params: matchResult.loader.params,
          request: new Request(window.location.href),
          signal: abortController.signal,
        })
      ).then(setLoaderData);

      return () => abortController.abort();
    }
  }, [matchResult.loader]);

  // Handle meta/title updates
  useEffect(() => {
    if (matchResult.meta?.title && typeof document !== "undefined") {
      document.title = matchResult.meta.title;
    }
  }, [matchResult.meta]);

  const component =
    matchResult.component ?? (matchResult.page404Component || <Page404 />);

  /**
   * Build context value with memoization
   */
  const contextValue = useMemo<RouterContextType>(
    () => ({
      // New API
      pathname: normalizedPath,
      pattern: matchResult.pattern,
      search: location.search,
      hash: location.hash,
      state: location.state,
      params: matchResult.params,
      matches: matchResult.matches,
      navigate,
      back,
      forward,
      isNavigating: isPending || isNavigatingRef.current,
      loaderData,
      meta: matchResult.meta,

      // Legacy aliases for backward compatibility
      path: normalizedPath,
      fullPathWithParams: matchResult.pattern,
    }),
    [
      normalizedPath,
      matchResult.pattern,
      location.search,
      location.hash,
      location.state,
      matchResult.params,
      matchResult.matches,
      navigate,
      back,
      forward,
      isPending,
      loaderData,
      matchResult.meta,
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
