import { useEffect, useState } from "react";
import join from "url-join";
import Page404 from "../pages/404";
import type { GetComponent, Route } from "../types";
import RouterContext from "./RouterContext";

const RouterProvider = ({ routes }: { routes: Route[] }) => {
  const [path, setPath] = useState(window.location.pathname);
  let fullPathWithParams = "";

  const pathValidation = (routeFullPath: string, currentPath: string) => {
    const routeParts = routeFullPath.split("/").filter(Boolean);
    const pathParts = currentPath.split("/").filter(Boolean);

    if (routeParts.length !== pathParts.length) return false;

    for (let i = 0; i < routeParts.length; i++) {
      const r = routeParts[i];
      const p = pathParts[i];
      if (r.startsWith(":")) continue;
      if (r !== p) return false;
    }
    return true;
  };

  const getComponent: GetComponent = (
    routesList,
    currentPath,
    parentPath = "/"
  ) => {
    for (const route of routesList) {
      const is404 = route.path === "404" || route.path === "/404";
      if (is404 && route.component) {
        // don't return here; keep as fallback at top-level
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
  const component = matchedComponent ?? <Page404 />;

  const navigate = (to: string, options?: { replace?: boolean }) => {
    if (options && options.replace) {
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
