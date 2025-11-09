import { ReactNode, useEffect, useState } from "react";
import join from "url-join";
import Page404 from "../pages/404";
import type { GetComponent, NavigateOptions, Route } from "../types";
import {
  createRouterError,
  RouterErrorCode,
  RouterErrors,
} from "../utils/error/errors";
import RouterContext from "./RouterContext";

const validateUrl = (url: string): boolean => {
  try {
    new URL(url, window.location.origin);
    return true;
  } catch {
    return false;
  }
};

const RouterProvider = ({ routes }: { routes: Route[] }) => {
  const [path, setPath] = useState<string>("");
  const [fullPathWithParams, setFullPathWithParams] = useState<string>("");
  let page404: ReactNode = null;
  const paths = routes.flatMap((route) => {
    const collectPaths = (r: Route, parentPath = "/"): string[] => {
      const fullPath = join(parentPath, `/${r.path}`);
      const currentPaths = [fullPath];

      if (r.children) {
        const childPaths = r.children.flatMap((child) =>
          collectPaths(child, fullPath)
        );
        return [...currentPaths, ...childPaths];
      }

      return currentPaths;
    };

    return collectPaths(route);
  });

  useEffect(() => {
    setPath(window.location.pathname);

    const patchHistory = (method: "pushState" | "replaceState") => {
      const original = window.history[method];
      return function (
        this: History,
        state: any,
        title: string,
        url?: string | URL | null
      ) {
        const result = original.apply(this, [state, title, url]);
        window.dispatchEvent(new Event("locationchange"));
        return result;
      } as typeof original;
    };

    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;
    window.history.pushState = patchHistory("pushState");
    window.history.replaceState = patchHistory("replaceState");

    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("locationchange", handleLocationChange);

    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("locationchange", handleLocationChange);
    };
  }, []);

  const pathValidation = (
    routeFullPath: string,
    currentPath: string
  ): string | false => {
    const routePaths = routeFullPath.split("|");

    const staticPaths: string[] = [];
    const dynamicPaths: string[] = [];

    for (const routePath of routePaths) {
      if (routePath.includes(":")) {
        dynamicPaths.push(routePath);
      } else {
        staticPaths.push(routePath);
      }
    }

    for (const routePath of staticPaths) {
      if (routePath === currentPath) {
        return routePath;
      }
    }

    for (const routePath of dynamicPaths) {
      const routeParts = routePath.split("/").filter(Boolean);
      const pathParts = currentPath.split("/").filter(Boolean);

      if (routeParts.length !== pathParts.length) continue;

      let isMatch = true;
      for (let i = 0; i < routeParts.length; i++) {
        const r = routeParts[i];
        const p = pathParts[i];
        if (r.startsWith(":")) continue;

        if (r !== p) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) return routePath;
    }

    return false;
  };

  const getComponent: GetComponent = (
    routesList,
    currentPath,
    parentPath = "/"
  ) => {
    for (const route of routesList) {
      const is404 = route.path === "404" || route.path === "/404";
      if (is404) {
        page404 = route.component;
        continue;
      }

      const fullPath = join(parentPath, `/${route.path}`);

      const matchedPath = pathValidation(fullPath, currentPath);
      if (matchedPath) {
        if (matchedPath !== fullPathWithParams) {
          setFullPathWithParams(matchedPath);
        }
        return route.component;
      }

      if (route.children) {
        const childMatch = getComponent(route.children, currentPath, fullPath);
        if (childMatch) return childMatch;
      }
    }

    return null;
  };

  const navigate = (to: string, options?: NavigateOptions) => {
    if (!/^https?:\/\//i.test(to)) {
      to = to.startsWith("/") ? to : `/${to}`;
    }

    if (!validateUrl(to)) {
      RouterErrors.invalidRoute(to, "Invalid URL format");
      return;
    }

    try {
      if (options?.replace) {
        window.history.replaceState(options?.state || {}, "", to);
      } else {
        window.history.pushState(options?.state || {}, "", to);
      }
      setPath(to);
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
    }
  };

  const matchedComponent = getComponent(routes, path);
  const component = matchedComponent ?? (page404 || <Page404 />);

  return (
    <RouterContext.Provider value={{ path, fullPathWithParams, navigate }}>
      {component}
    </RouterContext.Provider>
  );
};

export default RouterProvider;
