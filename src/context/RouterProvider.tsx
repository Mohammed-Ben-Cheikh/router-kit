import { ReactNode, useEffect, useState } from "react";
import join from "url-join";
import Page404 from "../pages/404";
import type { GetComponent, Route } from "../types";
import RouterContext from "./RouterContext";

const RouterProvider = ({ routes }: { routes: Route[] }) => {
  const [path, setPath] = useState(window.location.pathname);
  let fullPathWithParams = "";
  let page404: ReactNode = null;

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
        fullPathWithParams = fullPath;
        return route.component;
      }

      if (route.children) {
        const childMatch = getComponent(route.children, currentPath, fullPath);
        if (childMatch) return childMatch;
      }
    }

    return null;
  };

  fullPathWithParams = "";
  const matchedComponent = getComponent(routes, path);
  const component = matchedComponent ?? (page404 || <Page404 />);

  const navigate = (to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState({}, "", to);
    } else {
      window.history.pushState({}, "", to);
    }
    setPath(to);
  };

  useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  return (
    <RouterContext.Provider value={{ path, fullPathWithParams, navigate }}>
      {component}
    </RouterContext.Provider>
  );
};
export default RouterProvider;
