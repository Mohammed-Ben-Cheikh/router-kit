import type { LoaderArgs, Route, RouteMatch, RouteMeta } from "../types";

/**
 * Result from matching routes on the server
 */
export interface ServerMatchResult {
  /** Matched route path */
  matches: RouteMatch[];
  /** Extracted route params */
  params: Record<string, string>;
  /** Redirect URL if route redirects */
  redirect?: string;
  /** HTTP status code */
  statusCode: number;
  /** Route metadata */
  meta?: RouteMeta;
}

/**
 * Result from data loading on the server
 */
export interface ServerLoaderResult<T = any> {
  /** Loaded data keyed by route path */
  data: Record<string, T>;
  /** Errors encountered during loading */
  errors: Record<string, Error>;
  /** Time taken to load data (ms) */
  loadTime: number;
}

/**
 * Extract params from a path using a pattern
 */
const extractParams = (
  pattern: string,
  pathname: string,
  partialMatch: boolean = false
): Record<string, string> | null => {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  if (partialMatch) {
    if (patternParts.length > pathParts.length) return null;
  } else if (patternParts.length !== pathParts.length) {
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
const normalizePath = (path: string | string[] | undefined): string => {
  if (path === undefined) return "";
  if (Array.isArray(path)) {
    return path.map((p) => (p.startsWith("/") ? p.slice(1) : p)).join("|");
  }
  return path;
};

/**
 * Get the first path from a path (string or array)
 */
const getFirstPath = (path: string | string[] | undefined): string => {
  if (path === undefined) return "";
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
 * Match routes for a given URL on the server
 *
 * @example
 * ```ts
 * const result = matchServerRoutes(routes, '/users/123');
 * if (result.redirect) {
 *   return res.redirect(result.redirect);
 * }
 * console.log(result.params); // { id: '123' }
 * ```
 */
export function matchServerRoutes(
  routes: Route[],
  pathname: string,
  parentPath: string = "/"
): ServerMatchResult {
  const matches: RouteMatch[] = [];

  // Sort routes by priority
  const staticRoutes: Route[] = [];
  const dynamicRoutes: Route[] = [];
  const catchAllRoutes: Route[] = [];

  for (const route of routes) {
    const is404 = route.path === "404" || route.path === "/404";
    if (is404) continue;

    const pathArray = Array.isArray(route.path)
      ? route.path
      : route.path
      ? [route.path]
      : [];
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

  const orderedRoutes = [...staticRoutes, ...dynamicRoutes, ...catchAllRoutes];

  for (const route of orderedRoutes) {
    const normalizedRoutePath = normalizePath(route.path);
    const firstPath = getFirstPath(route.path);
    const fullPath = joinPaths(parentPath, firstPath);
    const patterns = normalizedRoutePath.split("|");

    for (const pattern of patterns) {
      const fullPattern = joinPaths(parentPath, pattern);
      const isParent = route.children && route.children.length > 0;
      const extractedParams = extractParams(fullPattern, pathname, isParent);

      if (extractedParams !== null) {
        // Handle redirects
        if (route.redirectTo) {
          return {
            matches: [],
            params: extractedParams,
            redirect: route.redirectTo,
            statusCode: 302,
            meta: route.meta,
          };
        }

        const match: RouteMatch = {
          route,
          params: extractedParams,
          pathname,
          pathnameBase: parentPath,
          pattern: fullPattern,
        };
        matches.push(match);

        // Check nested routes
        if (route.children && route.children.length > 0) {
          const childResult = matchServerRoutes(
            route.children,
            pathname,
            fullPath
          );
          if (childResult.redirect) {
            return childResult;
          }
          if (childResult.matches.length > 0) {
            return {
              matches: [...matches, ...childResult.matches],
              params: { ...extractedParams, ...childResult.params },
              statusCode: childResult.statusCode,
              meta: childResult.meta || route.meta,
            };
          }
        }

        return {
          matches,
          params: extractedParams,
          statusCode: 200,
          meta: route.meta,
        };
      }
    }

    // Check children even if parent doesn't match
    if (route.children) {
      const firstPath = getFirstPath(route.path);
      const childFullPath = joinPaths(parentPath, firstPath);
      const childResult = matchServerRoutes(
        route.children,
        pathname,
        childFullPath
      );
      if (childResult.matches.length > 0 || childResult.redirect) {
        return childResult;
      }
    }
  }

  // No match found
  return {
    matches: [],
    params: {},
    statusCode: 404,
  };
}

/**
 * Prefetch loader data for matched routes
 *
 * This function runs all route loaders in parallel and returns
 * the combined data. Use this on the server before rendering.
 *
 * @example
 * ```ts
 * // server.ts
 * app.get('*', async (req, res) => {
 *   const matchResult = matchServerRoutes(routes, req.url);
 *
 *   if (matchResult.redirect) {
 *     return res.redirect(matchResult.redirect);
 *   }
 *
 *   const loaderResult = await prefetchLoaderData(
 *     matchResult.matches,
 *     req.url,
 *     { headers: req.headers }
 *   );
 *
 *   const html = renderToString(
 *     <StaticRouter
 *       routes={routes}
 *       location={req.url}
 *       loaderData={loaderResult.data}
 *     />
 *   );
 *
 *   // Inject loader data for hydration
 *   const finalHtml = html.replace(
 *     '</head>',
 *     `<script>window.__LOADER_DATA__ = ${JSON.stringify(loaderResult.data)}</script></head>`
 *   );
 *
 *   res.send(finalHtml);
 * });
 * ```
 */
export async function prefetchLoaderData(
  matches: RouteMatch[],
  url: string,
  requestInit?: RequestInit
): Promise<ServerLoaderResult> {
  const startTime = Date.now();
  const data: Record<string, any> = {};
  const errors: Record<string, Error> = {};

  const loaderPromises = matches
    .filter((match) => match.route.loader)
    .map(async (match) => {
      const routePath = match.pattern;
      const abortController = new AbortController();

      try {
        // Create a Request object for the loader
        const request = new Request(url, {
          ...requestInit,
          signal: abortController.signal,
        });

        const loaderArgs: LoaderArgs = {
          params: match.params,
          request,
          signal: abortController.signal,
        };

        const result = await match.route.loader!(loaderArgs);
        data[routePath] = result;
      } catch (error) {
        errors[routePath] =
          error instanceof Error ? error : new Error(String(error));
      }
    });

  await Promise.all(loaderPromises);

  return {
    data,
    errors,
    loadTime: Date.now() - startTime,
  };
}

/**
 * Create a Request object from Node.js IncomingMessage
 *
 * @example
 * ```ts
 * import { createRequestFromNode } from 'router-kit/ssr';
 *
 * app.get('*', (req, res) => {
 *   const request = createRequestFromNode(req);
 *   // Use request with loaders
 * });
 * ```
 */
export function createRequestFromNode(
  nodeRequest: {
    url?: string;
    method?: string;
    headers?: Record<string, string | string[] | undefined>;
  },
  baseUrl: string = "http://localhost"
): Request {
  const url = new URL(nodeRequest.url || "/", baseUrl);

  const headers = new Headers();
  if (nodeRequest.headers) {
    for (const [key, value] of Object.entries(nodeRequest.headers)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }
    }
  }

  return new Request(url.toString(), {
    method: nodeRequest.method || "GET",
    headers,
  });
}

/**
 * Generate script tag for hydrating loader data on the client
 */
export function getLoaderDataScript(data: Record<string, any>): string {
  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script>window.__ROUTER_KIT_DATA__ = ${serialized}</script>`;
}

/**
 * Get loader data from window on the client side
 */
export function getHydratedLoaderData(): Record<string, any> | null {
  if (typeof window === "undefined") return null;
  return (window as any).__ROUTER_KIT_DATA__ || null;
}
