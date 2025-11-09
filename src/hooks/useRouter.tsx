/* 
  Router-Kit — Common hooks and components (reference)

  Hooks:
    - useRouter        : access router context and helpers
    - useLocation      : current location (pathname, search, hash)
    - useNavigate      : imperative navigation function
    - useParams        : route params for the current route
    - useSearchParams  : read/update URL query params
    - useRouteMatch    : match the current location against a pattern
    - useBlocker/usePrompt : block navigation with a confirmation

  Components / APIs:
    - createRouter     : factory to create a router instance and Provider
    - RouterProvider   : provider component returned by createRouter()
    - Routes           : route collection wrapper
    - Route            : single route declaration
    - Link             : declarative link component
    - NavLink          : link with active styling
    - Outlet           : render child route content
    - Redirect         : declarative redirect helper (if provided)

  Note: Exact names may vary between versions — update this list to match your installed Router-Kit exports.
*/

import { useContext } from "react";
import RouterContext from "../context/RouterContext";

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    if (typeof window === "undefined") {
      throw new Error(
        "RouterKit: useRouter cannot be used during server side rendering"
      );
    }
    throw new Error("RouterKit: useRouter must be used within RouterProvider");
  }
  return ctx;
}
