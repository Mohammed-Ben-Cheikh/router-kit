import { useEffect, useState } from "react";
import join from "url-join";
import Page404 from "./pages/404";
import RouterContext from "./RouterContext";
import type { GetComponent, Route } from "./types";

const RouterProvider = ({ routes }: { routes: Route[] }) => {
  const [path, setPath] = useState(window.location.pathname);
  let fullPathWithParams = "";

  const pathValidation = (fullPath: string, path: string) => {
    const fakePathArr = path.split("/");
    let fakePath = "/";

    fullPath.split("/").forEach((e, index) => {
      if (e.startsWith(":")) {
        fakePathArr[index] = e;
      }
    });

    fakePathArr.forEach((e) => {
      fakePath = join(fakePath, `/${e}`);
    });

    if (fullPath === fakePath) {
      fakePath = "";
      return true;
    }
    fakePath = "";
    return false;
  };

  const getComponent: GetComponent = (
    routes,
    currentPath,
    parentPath = "/"
  ) => {
    let component = <Page404 />;
    for (const route of routes) {
      if (route.path === "/404" && route.component) component = route.component;
      const fullPath = join(parentPath, `/${route.path}`);
      if (pathValidation(fullPath, currentPath)) {
        fullPathWithParams = fullPath;
        component = route.component;
        break;
      }
      if (route.children) {
        component = getComponent(route.children, currentPath, fullPath);
      }
    }
    return component;
  };
  const component = getComponent(routes, path);

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
