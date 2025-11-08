import type { Route } from "../types";

function normalizeRoutes(inputRoutes: Route[]): Route[] {
  return inputRoutes.map((route) => {
    const pathArray = Array.isArray(route.path) ? route.path : [route.path];
    const normalizedPath = pathArray
      .map((path) =>
        path?.startsWith("/") ? path.replace(/^\/+/, "") : path ?? ""
      )
      .join("|");

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
