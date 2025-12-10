import type { RouteMeta } from "../types";
import { useRouter } from "./useRouter";

/**
 * Hook to access the current route's loader data
 *
 * Returns data loaded by the route's loader function.
 *
 * @example
 * ```tsx
 * // Route configuration
 * const routes = createRouter([
 *   {
 *     path: '/user/:id',
 *     component: <UserProfile />,
 *     loader: async ({ params }) => {
 *       const user = await fetchUser(params.id);
 *       return user;
 *     }
 *   }
 * ]);
 *
 * // Component
 * function UserProfile() {
 *   const user = useLoaderData<User>();
 *
 *   return (
 *     <div>
 *       <h1>{user.name}</h1>
 *       <p>{user.email}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @template T - Type of the loader data
 * @returns The loader data or null if no loader exists
 */
export function useLoaderData<T = any>(): T | null {
  const { loaderData } = useRouter();
  return loaderData as T | null;
}

/**
 * Hook to access the current route's metadata
 *
 * Returns metadata defined on the matched route.
 *
 * @example
 * ```tsx
 * // Route configuration
 * const routes = createRouter([
 *   {
 *     path: '/about',
 *     component: <About />,
 *     meta: {
 *       title: 'About Us',
 *       description: 'Learn about our company',
 *       requiresAuth: false
 *     }
 *   }
 * ]);
 *
 * // Component
 * function About() {
 *   const meta = useRouteMeta();
 *
 *   useEffect(() => {
 *     if (meta?.title) {
 *       document.title = meta.title;
 *     }
 *   }, [meta]);
 *
 *   return <div>About page</div>;
 * }
 * ```
 *
 * @returns The route metadata or null
 */
export function useRouteMeta(): RouteMeta | null {
  const { meta } = useRouter();
  return meta;
}

/**
 * Hook to check if navigation is in progress
 *
 * Useful for showing loading indicators during navigation.
 *
 * @example
 * ```tsx
 * function App() {
 *   const isNavigating = useIsNavigating();
 *
 *   return (
 *     <div>
 *       {isNavigating && <LoadingBar />}
 *       <Router>
 *         {/* routes *\/}
 *       </Router>
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns Whether navigation is in progress
 */
export function useIsNavigating(): boolean {
  const { isNavigating } = useRouter();
  return isNavigating;
}
