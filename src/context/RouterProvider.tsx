import { ReactNode, useEffect, useState } from "react";
import join from "url-join";
import Page404 from "../pages/404";
import type { GetComponent, NavigateOptions, Route } from "../types";
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

  useEffect(() => {
    setPath(window.location.pathname);

    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("pushState", handleLocationChange);
    window.addEventListener("replaceState", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("pushState", handleLocationChange);
      window.removeEventListener("replaceState", handleLocationChange);
    };
  }, []);

  const pathValidation = (routeFullPath: string, currentPath: string) => {
    const routePaths = routeFullPath.split("|");

    for (const routePath of routePaths) {
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
      if (isMatch) return true;
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

      if (pathValidation(fullPath, currentPath)) {
        if (fullPath !== fullPathWithParams) {
          setFullPathWithParams(fullPath);
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
    if (!validateUrl(to)) {
      console.error(`RouterKit: Invalid URL "${to}"`);
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
      console.error("RouterKit: Navigation failed", error);
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
