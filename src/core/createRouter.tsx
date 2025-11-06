import type { Route } from "../types";

function normalizeRoutes(inputRoutes: Route[]): Route[] {
  return inputRoutes.map((route) => {
    const normalizedPath = route.path?.startsWith("/")
      ? route.path.replace(/^\/+/, "")
      : route.path ?? "";

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

function createRouter(inputRoutes: Route[]) {
  return normalizeRoutes(inputRoutes);
}

export default createRouter;
