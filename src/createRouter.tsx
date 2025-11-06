import type { Route } from "./types";

// Normalize routes: remove leading slashes from paths and normalize children recursively
function normalizeRoutes(routes: Route[]): Route[] {
  return routes.map((route) => {
    const normalizedPath = route.path.startsWith("/")
      ? route.path.replace(/^\/+/, "")
      : route.path;
    const normalized: Route = {
      ...route,
      path: normalizedPath,
    };
    if (route.children) {
      normalized.children = normalizeRoutes(route.children);
    }
    return normalized;
  });
}

function createRouter(routes: Route[]) {
  return normalizeRoutes(routes);
}

export default createRouter;
