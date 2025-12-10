import { useCallback, useSyncExternalStore } from "react";
import type { Location } from "../types";

/**
 * Creates a unique key for location
 */
const createKey = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

/**
 * Get current location snapshot
 */
const getLocationSnapshot = (): Location => {
  if (typeof window === "undefined") {
    return {
      pathname: "",
      search: "",
      hash: "",
      state: null,
      key: "default",
    };
  }

  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: window.history.state,
    key: window.history.state?.key ?? createKey(),
  };
};

/**
 * Subscribe to location changes
 */
const subscribeToLocation = (callback: () => void): (() => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("popstate", callback);
  window.addEventListener("locationchange", callback);

  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("locationchange", callback);
  };
};

/**
 * Server-side location snapshot
 */
const getServerSnapshot = (): Location => ({
  pathname: "",
  search: "",
  hash: "",
  state: null,
  key: "default",
});

/**
 * Hook to access the current location
 *
 * Unlike useRouter, this hook only provides location information
 * and will re-render when the location changes.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const location = useLocation();
 *
 *   console.log(location.pathname); // '/users/123'
 *   console.log(location.search);   // '?tab=profile'
 *   console.log(location.hash);     // '#section1'
 *   console.log(location.state);    // { from: '/home' }
 *   console.log(location.key);      // 'abc123'
 * }
 * ```
 *
 * @returns {Location} Current location object
 */
export function useLocation(): Location {
  const location = useSyncExternalStore(
    subscribeToLocation,
    getLocationSnapshot,
    getServerSnapshot
  );

  return location;
}

/**
 * Hook to get a function that resolves paths relative to current location
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const resolvePath = useResolvedPath();
 *
 *   // Current path: /users/123
 *   console.log(resolvePath('../settings')); // '/users/settings'
 *   console.log(resolvePath('./edit'));      // '/users/123/edit'
 *   console.log(resolvePath('/home'));       // '/home'
 * }
 * ```
 */
export function useResolvedPath(): (to: string) => string {
  const location = useLocation();

  return useCallback(
    (to: string): string => {
      // Absolute paths
      if (to.startsWith("/")) {
        return to;
      }

      const currentParts = location.pathname.split("/").filter(Boolean);

      // Handle relative navigation
      if (to.startsWith("./")) {
        return `/${[...currentParts, to.slice(2)].join("/")}`;
      }

      if (to.startsWith("../")) {
        let relativePath = to;
        const resultParts = [...currentParts];

        while (relativePath.startsWith("../")) {
          resultParts.pop();
          relativePath = relativePath.slice(3);
        }

        if (relativePath) {
          resultParts.push(relativePath);
        }

        return `/${resultParts.join("/")}`;
      }

      // Regular relative path
      return `/${[...currentParts, to].join("/")}`;
    },
    [location.pathname]
  );
}
