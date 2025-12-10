import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "./useRouter";

/**
 * Subscribe to URL search params changes
 */
const subscribeToSearch = (callback: () => void): (() => void) => {
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
 * Get current search string snapshot
 */
const getSearchSnapshot = (): string => {
  if (typeof window === "undefined") return "";
  return window.location.search;
};

/**
 * Server snapshot for SSR
 */
const getServerSnapshot = (): string => "";

/**
 * Hook to access URL search/query parameters
 *
 * Returns an object containing all query parameters from the current URL.
 * This hook will re-render when query parameters change.
 *
 * @example
 * ```tsx
 * // URL: /search?q=react&page=2&sort=name
 *
 * function SearchPage() {
 *   const query = useQuery();
 *   // query = { q: 'react', page: '2', sort: 'name' }
 *
 *   return <div>Searching for: {query.q}</div>;
 * }
 * ```
 *
 * @returns {Record<string, string>} Object containing query parameters
 */
export function useQuery(): Record<string, string> {
  const search = useSyncExternalStore(
    subscribeToSearch,
    getSearchSnapshot,
    getServerSnapshot
  );

  return useMemo(() => {
    const query: Record<string, string> = {};
    const params = new URLSearchParams(search);
    params.forEach((value, key) => {
      query[key] = value;
    });
    return query;
  }, [search]);
}

/**
 * Hook to access and modify URL search parameters
 *
 * Similar to React Router's useSearchParams, provides both
 * the current search params and a setter function.
 *
 * @example
 * ```tsx
 * function SearchPage() {
 *   const [searchParams, setSearchParams] = useSearchParams();
 *
 *   const handleSort = (sortBy: string) => {
 *     setSearchParams({ ...Object.fromEntries(searchParams), sort: sortBy });
 *   };
 *
 *   return (
 *     <div>
 *       <p>Current query: {searchParams.get('q')}</p>
 *       <button onClick={() => handleSort('name')}>Sort by Name</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns Tuple of [URLSearchParams, setter function]
 */
export function useSearchParams(): [
  URLSearchParams,
  (
    params:
      | Record<string, string>
      | URLSearchParams
      | ((prev: URLSearchParams) => Record<string, string>),
    options?: { replace?: boolean }
  ) => void
] {
  const { navigate } = useRouter();

  const search = useSyncExternalStore(
    subscribeToSearch,
    getSearchSnapshot,
    getServerSnapshot
  );

  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  const setSearchParams = useCallback(
    (
      params:
        | Record<string, string>
        | URLSearchParams
        | ((prev: URLSearchParams) => Record<string, string>),
      options?: { replace?: boolean }
    ) => {
      let newParams: URLSearchParams;

      if (typeof params === "function") {
        const result = params(new URLSearchParams(search));
        newParams = new URLSearchParams(result);
      } else if (params instanceof URLSearchParams) {
        newParams = params;
      } else {
        newParams = new URLSearchParams(params);
      }

      const newSearch = newParams.toString();
      const newUrl = newSearch
        ? `${window.location.pathname}?${newSearch}`
        : window.location.pathname;

      navigate(newUrl, { replace: options?.replace });
    },
    [navigate, search]
  );

  return [searchParams, setSearchParams];
}
