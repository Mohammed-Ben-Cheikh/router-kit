import React, { ReactNode, useMemo } from "react";
import { OutletProvider } from "../context/OutletContext";
import RouterContext from "../context/RouterContext";
import Page404 from "../pages/404";
import type {
  Location,
  NavigateFunction,
  Route,
  RouteMatch,
  RouteMeta,
  RouterContextType,
} from "../types";

/**
 * Props for StaticRouter - used for SSR
 */
export interface StaticRouterProps {
  /** Routes configuration */
  routes: Route[];
  /** Current URL to render */
  location: string;
  /** Base path for all routes */
  basename?: string;
  /** Pre-fetched loader data from server */
  loaderData?: Record<string, any>;
  /** Context object to collect redirects and status codes */
  context?: StaticRouterContext;
}

/**
 * Context passed to StaticRouter for collecting SSR metadata
 */
export interface StaticRouterContext {
  /** URL to redirect to (if any) */
  url?: string;
  /** HTTP status code */
  statusCode?: number;
  /** Action type (redirect, etc.) */
  action?: "REDIRECT" | "NOT_FOUND" | "OK";
  /** Matched route meta */
  meta?: RouteMeta;
}

/**
 * Parse a URL string into pathname, search, and hash
 */
const parseUrl = (
  url: string
): { pathname: string; search: string; hash: string } => {
  const hashIndex = url.indexOf("#");
  const searchIndex = url.indexOf("?");

  let pathname = url;
  let search = "";
  let hash = "";

  if (hashIndex !== -1) {
    hash = url.slice(hashIndex);
    pathname = url.slice(0, hashIndex);
  }

  if (searchIndex !== -1 && (hashIndex === -1 || searchIndex < hashIndex)) {
    search = pathname.slice(
      searchIndex,
      hashIndex === -1 ? undefined : hashIndex
    );
    pathname = pathname.slice(0, searchIndex);
  }

  return { pathname: pathname || "/", search, hash };
};

/**
 * Extract params from a path using a pattern
 */
const extractParams = (
  pattern: string,
  pathname: string
): Record<string, string> | null => {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    const hasCatchAll = patternParts.some((p) => p.startsWith("*"));
    if (!hasCatchAll) return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith("*")) {
      const paramName = patternPart.slice(1) || "splat";
      params[paramName] = pathParts.slice(i).join("/");
      return params;
    }

    if (patternPart.startsWith(":")) {
      const paramName = patternPart.slice(1);
      if (paramName.endsWith("?")) {
        params[paramName.slice(0, -1)] = pathPart ?? "";
      } else {
        if (pathPart === undefined) return null;
        params[paramName] = pathPart;
      }
      continue;
    }

    if (patternPart !== pathPart) return null;
  }

  return params;
};

/**
 * Join paths safely
 */
const joinPaths = (parent: string, child: string): string => {
  const normalizedParent = parent.endsWith("/") ? parent.slice(0, -1) : parent;
  const normalizedChild = child.startsWith("/") ? child : `/${child}`;
  return `${normalizedParent}${normalizedChild}`;
};

/**
 * Normalize path to string (handles array paths)
 */
const normalizePath = (path: string | string[]): string => {
  if (Array.isArray(path)) {
    return path.map((p) => (p.startsWith("/") ? p.slice(1) : p)).join("|");
  }
  return path;
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
 * StaticRouter - Server-side rendering router
 *
 * This component renders routes on the server without relying on browser APIs.
 * It's designed to work with React's renderToString/renderToPipeableStream.
 *
 * @example
 * ```tsx
 * // server.ts
 * import { renderToString } from 'react-dom/server';
 * import { StaticRouter } from 'router-kit/ssr';
 *
 * app.get('*', async (req, res) => {
 *   const context: StaticRouterContext = {};
 *   const loaderData = await prefetchLoaderData(routes, req.url);
 *
 *   const html = renderToString(
 *     <StaticRouter
 *       routes={routes}
 *       location={req.url}
 *       loaderData={loaderData}
 *       context={context}
 *     />
 *   );
 *
 *   if (context.action === 'REDIRECT') {
 *     return res.redirect(context.statusCode || 302, context.url);
 *   }
 *
 *   res.status(context.statusCode || 200).send(html);
 * });
 * ```
 */
const StaticRouter = ({
  routes,
  location: locationString,
  basename = "",
  loaderData: preloadedData,
  context = {},
}: StaticRouterProps): React.ReactElement => {
  const { pathname, search, hash } = parseUrl(locationString);

  // Normalize pathname by removing basename
  const normalizedPathname =
    basename && pathname.startsWith(basename)
      ? pathname.slice(basename.length) || "/"
      : pathname;

  // Create static location object
  const location: Location = {
    pathname: normalizedPathname,
    search,
    hash,
    state: null,
    key: "static",
  };

  // Match path helper
  const matchPath = (
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
  };

  // Find matching route
  const findMatch = (
    routesList: Route[],
    currentPath: string,
    parentPath: string = "/"
  ): {
    component: ReactNode;
    match: RouteMatch | null;
    pattern: string;
    params: Record<string, string>;
  } | null => {
    let page404Component: ReactNode = null;

    // Sort routes by priority
    const staticRoutes: Route[] = [];
    const dynamicRoutes: Route[] = [];
    const catchAllRoutes: Route[] = [];

    for (const route of routesList) {
      const is404 = route.path === "404" || route.path === "/404";
      if (is404) {
        page404Component = route.component;
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

    const orderedRoutes = [
      ...staticRoutes,
      ...dynamicRoutes,
      ...catchAllRoutes,
    ];

    for (const route of orderedRoutes) {
      const normalizedRoutePath = normalizePath(route.path);
      const firstPath = getFirstPath(route.path);
      const fullPath = joinPaths(parentPath, firstPath);
      const matchResult = matchPath(
        normalizedRoutePath.includes("|")
          ? normalizedRoutePath
              .split("|")
              .map((p) => joinPaths(parentPath, p))
              .join("|")
          : fullPath,
        currentPath
      );

      if (matchResult) {
        // Handle redirects
        if (route.redirectTo) {
          context.action = "REDIRECT";
          context.url = route.redirectTo;
          context.statusCode = 302;
          return null;
        }

        // Handle guards (sync only for SSR)
        if (route.guard) {
          const guardResult = route.guard({
            pathname: currentPath,
            params: matchResult.params,
            search,
          });

          // Only handle sync boolean/string results
          if (typeof guardResult === "string") {
            context.action = "REDIRECT";
            context.url = guardResult;
            context.statusCode = 302;
            return null;
          }
          if (guardResult === false) {
            continue;
          }
        }

        // Set meta in context
        if (route.meta) {
          context.meta = route.meta;
        }

        const routeMatch: RouteMatch = {
          route,
          params: matchResult.params,
          pathname: currentPath,
          pathnameBase: parentPath,
          pattern: matchResult.pattern,
        };

        // Handle nested routes
        if (route.children && route.children.length > 0) {
          const childMatch = findMatch(route.children, currentPath, fullPath);

          if (childMatch) {
            return {
              component: (
                <OutletProvider
                  outlet={childMatch.component}
                  childRoutes={route.children}
                  matches={[routeMatch]}
                  depth={parentPath.split("/").filter(Boolean).length}
                >
                  {route.component}
                </OutletProvider>
              ),
              match: routeMatch,
              pattern: matchResult.pattern,
              params: matchResult.params,
            };
          }
        }

        context.action = "OK";
        context.statusCode = 200;

        return {
          component: route.component,
          match: routeMatch,
          pattern: matchResult.pattern,
          params: matchResult.params,
        };
      }

      // Check children routes
      if (route.children) {
        const firstPath = getFirstPath(route.path);
        const childFullPath = joinPaths(parentPath, firstPath);
        const childMatch = findMatch(
          route.children,
          currentPath,
          childFullPath
        );
        if (childMatch) return childMatch;
      }
    }

    // No match found - 404
    if (page404Component) {
      context.action = "NOT_FOUND";
      context.statusCode = 404;
      return {
        component: page404Component,
        match: null,
        pattern: "",
        params: {},
      };
    }

    return null;
  };

  const result = findMatch(routes, normalizedPathname);

  // Set 404 if no match
  if (!result) {
    context.action = "NOT_FOUND";
    context.statusCode = 404;
  }

  const { component, match, pattern, params } = result || {
    component: <Page404 />,
    match: null,
    pattern: "",
    params: {},
  };

  // Static navigate function (throws error if called during SSR)
  const navigate: NavigateFunction = () => {
    throw new Error(
      "[router-kit] Navigation is not supported during server-side rendering. " +
        "Use redirectTo in route config or return a redirect URL from guards."
    );
  };

  // Build context value
  const contextValue = useMemo<RouterContextType>(
    () => ({
      pathname: normalizedPathname,
      pattern,
      search,
      hash,
      state: null,
      params,
      matches: match ? [match] : [],
      navigate,
      back: () => {
        throw new Error("[router-kit] back() is not supported in SSR");
      },
      forward: () => {
        throw new Error("[router-kit] forward() is not supported in SSR");
      },
      isNavigating: false,
      loaderData: preloadedData || null,
      meta: context.meta || null,

      // Legacy aliases
      path: normalizedPathname,
      fullPathWithParams: pattern,
    }),
    [
      normalizedPathname,
      pattern,
      search,
      hash,
      params,
      match,
      preloadedData,
      context.meta,
    ]
  );

  return (
    <RouterContext.Provider value={contextValue}>
      {component}
    </RouterContext.Provider>
  );
};

export default StaticRouter;
