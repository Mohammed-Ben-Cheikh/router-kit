import { useMemo } from "react";
import type { RouteMatch } from "../types";
import { useRouter } from "./useRouter";

/**
 * Hook to access current route matches
 *
 * Returns an array of all matched routes from the root down to
 * the current route. Useful for breadcrumbs, nested layouts,
 * and understanding the current route hierarchy.
 *
 * @example
 * ```tsx
 * // Route: /users/123/posts/456
 * // Routes config:
 * // /users/:userId -> UserLayout
 * // /users/:userId/posts/:postId -> PostPage
 *
 * function Breadcrumbs() {
 *   const matches = useMatches();
 *
 *   return (
 *     <nav>
 *       {matches.map((match, index) => (
 *         <span key={index}>
 *           {match.pathname}
 *           {index < matches.length - 1 && ' > '}
 *         </span>
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Access route metadata from matches
 * function PageTitle() {
 *   const matches = useMatches();
 *   const currentMatch = matches[matches.length - 1];
 *
 *   useEffect(() => {
 *     if (currentMatch?.route.meta?.title) {
 *       document.title = currentMatch.route.meta.title;
 *     }
 *   }, [currentMatch]);
 *
 *   return null;
 * }
 * ```
 *
 * @returns {RouteMatch[]} Array of route matches
 */
export function useMatches(): RouteMatch[] {
  const { matches } = useRouter();

  return useMemo(() => matches, [matches]);
}

/**
 * Hook to access the current (leaf) route match
 *
 * @example
 * ```tsx
 * function CurrentRoute() {
 *   const match = useMatch();
 *
 *   if (!match) return null;
 *
 *   return (
 *     <div>
 *       <p>Pattern: {match.pattern}</p>
 *       <p>Params: {JSON.stringify(match.params)}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {RouteMatch | null} The current route match or null
 */
export function useMatch(): RouteMatch | null {
  const matches = useMatches();
  return matches.length > 0 ? matches[matches.length - 1] : null;
}

/**
 * Hook to check if a given path matches the current location
 *
 * @example
 * ```tsx
 * function Navigation() {
 *   const isUsersActive = useMatchPath('/users');
 *   const isExactHome = useMatchPath('/', { end: true });
 *
 *   return (
 *     <nav>
 *       <span className={isExactHome ? 'active' : ''}>Home</span>
 *       <span className={isUsersActive ? 'active' : ''}>Users</span>
 *     </nav>
 *   );
 * }
 * ```
 *
 * @param pattern - Path pattern to match
 * @param options - Matching options
 * @returns Whether the pattern matches the current location
 */
export function useMatchPath(
  pattern: string,
  options?: { end?: boolean; caseSensitive?: boolean }
): boolean {
  const { pathname } = useRouter();
  const { end = false, caseSensitive = false } = options || {};

  const patternPath = caseSensitive ? pattern : pattern.toLowerCase();
  const currentPath = caseSensitive ? pathname : pathname.toLowerCase();

  if (end) {
    return currentPath === patternPath || currentPath === `${patternPath}/`;
  }

  return (
    currentPath.startsWith(patternPath) &&
    (currentPath.length === patternPath.length ||
      currentPath[patternPath.length] === "/")
  );
}
