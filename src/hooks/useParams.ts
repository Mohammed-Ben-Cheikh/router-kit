import { useMemo } from "react";
import { useRouter } from "./useRouter";

/**
 * Type-safe params with generic support
 */
export type Params<Key extends string = string> = {
  readonly [key in Key]: string | undefined;
};

/**
 * Hook to access route parameters
 *
 * Returns an object containing the dynamic params from the current URL
 * that were matched by the route path pattern.
 *
 * @example
 * ```tsx
 * // Route: /users/:userId/posts/:postId
 * // URL: /users/123/posts/456
 *
 * function PostPage() {
 *   const params = useParams();
 *   // params = { userId: '123', postId: '456' }
 *
 *   return <div>Post {params.postId} by User {params.userId}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With TypeScript generics for type safety
 * interface PostParams {
 *   userId: string;
 *   postId: string;
 * }
 *
 * function PostPage() {
 *   const { userId, postId } = useParams<keyof PostParams>();
 *   return <div>Post {postId} by User {userId}</div>;
 * }
 * ```
 *
 * @template ParamKey - Union of parameter names for type safety
 * @returns {Params<ParamKey>} Object containing route parameters
 */
export function useParams<
  ParamKey extends string = string
>(): Params<ParamKey> {
  const { params } = useRouter();

  // Return memoized params to prevent unnecessary re-renders
  return useMemo(() => params as Params<ParamKey>, [params]);
}

/**
 * Hook to access a single route parameter
 *
 * @example
 * ```tsx
 * function UserPage() {
 *   const userId = useParam('userId');
 *   return <div>User ID: {userId}</div>;
 * }
 * ```
 *
 * @param name - The parameter name to retrieve
 * @returns The parameter value or undefined
 */
export function useParam(name: string): string | undefined {
  const params = useParams();
  return params[name];
}
