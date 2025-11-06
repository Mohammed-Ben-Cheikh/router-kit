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
    const message =
      "Common hooks and components must be used within the RouterProvider returned by createRouter(). Wrap your app with the RouterProvider.";
    if (typeof window !== "undefined" && window.console && console.error) {
      console.error(
        "%cRouterKit%c " + message,
        "color: #fff; background: #d9534f; font-weight: 700; padding: 2px 6px; border-radius: 3px;",
        "color: #d9534f;"
      );
    } else {
      console.error("RouterKit: " + message);
    }
    throw new Error("RouterKit: " + message);
  }
  return ctx;
}
