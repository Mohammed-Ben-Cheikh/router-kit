import type { Middleware, MiddlewareContext, MiddlewareResult } from "../types";

/**
 * Creates a middleware chain executor using Chain of Responsibility pattern
 * Each middleware can either:
 * - Continue to the next middleware (return { type: "continue" })
 * - Redirect (return { type: "redirect", to: string })
 * - Block the request (return { type: "block" })
 *
 * @param middlewares - Array of middleware functions
 * @param context - Middleware context with route information
 * @returns Promise resolving to middleware result
 */
export async function executeMiddlewareChain(
  middlewares: Middleware[],
  context: MiddlewareContext
): Promise<MiddlewareResult> {
  if (middlewares.length === 0) {
    return { type: "continue" };
  }

  let index = 0;

  /**
   * Next function - calls the next middleware in the chain
   */
  const next = async (): Promise<MiddlewareResult> => {
    if (index >= middlewares.length) {
      return { type: "continue" };
    }

    const middleware = middlewares[index++];
    
    try {
      // Execute middleware - handle both sync and async
      const result = await Promise.resolve(
        middleware(context, next)
      );

      // Normalize result
      if (result && typeof result === "object" && "type" in result) {
        return result;
      }

      // Fallback to continue if invalid result
      return { type: "continue" };
    } catch (error) {
      // On error, block the request
      console.error("[router-kit] Middleware error:", error);
      return { type: "block" };
    }
  };

  return next();
}

/**
 * Helper to create a middleware that checks authentication
 * @example
 * ```ts
 * const authMiddleware: Middleware = createAuthMiddleware({
 *   checkAuth: async () => {
 *     const token = localStorage.getItem('token');
 *     return !!token;
 *   },
 *   redirectTo: '/login'
 * });
 * ```
 */
export function createAuthMiddleware(options: {
  checkAuth: (context: MiddlewareContext) => boolean | Promise<boolean>;
  redirectTo?: string;
}): Middleware {
  return async (context, next) => {
    const isAuthenticated = await Promise.resolve(
      options.checkAuth(context)
    );

    if (!isAuthenticated) {
      return {
        type: "redirect",
        to: options.redirectTo || "/login",
      };
    }

    return next();
  };
}

/**
 * Helper to create a middleware that checks permissions/roles
 * @example
 * ```ts
 * const adminMiddleware: Middleware = createRoleMiddleware({
 *   checkRole: async (context) => {
 *     const user = await getCurrentUser();
 *     return user?.role === 'admin';
 *   },
 *   redirectTo: '/unauthorized'
 * });
 * ```
 */
export function createRoleMiddleware(options: {
  checkRole: (context: MiddlewareContext) => boolean | Promise<boolean>;
  redirectTo?: string;
}): Middleware {
  return async (context, next) => {
    const hasRole = await Promise.resolve(options.checkRole(context));

    if (!hasRole) {
      return {
        type: "redirect",
        to: options.redirectTo || "/unauthorized",
      };
    }

    return next();
  };
}

/**
 * Helper to create a middleware that fetches data before route loads
 * @example
 * ```ts
 * const dataMiddleware: Middleware = createDataMiddleware({
 *   fetchData: async (context) => {
 *     const response = await fetch(`/api/data/${context.params.id}`);
 *     return response.json();
 *   },
 *   onData: (data) => {
 *     // Store data in context or global state
 *   }
 * });
 * ```
 */
export function createDataMiddleware<T = any>(options: {
  fetchData: (context: MiddlewareContext) => Promise<T> | T;
  onData?: (data: T, context: MiddlewareContext) => void | Promise<void>;
  onError?: (error: Error, context: MiddlewareContext) => void;
}): Middleware {
  return async (context, next) => {
    try {
      const data = await Promise.resolve(options.fetchData(context));
      
      if (options.onData) {
        await Promise.resolve(options.onData(data, context));
      }

      return next();
    } catch (error) {
      if (options.onError) {
        options.onError(
          error instanceof Error ? error : new Error(String(error)),
          context
        );
      }
      return { type: "block" };
    }
  };
}

/**
 * Helper to create a middleware that logs route access
 * @example
 * ```ts
 * const loggingMiddleware: Middleware = createLoggingMiddleware({
 *   log: (context) => {
 *     console.log(`Accessing: ${context.pathname}`);
 *   }
 * });
 * ```
 */
export function createLoggingMiddleware(options: {
  log: (context: MiddlewareContext) => void | Promise<void>;
}): Middleware {
  return async (context, next) => {
    await Promise.resolve(options.log(context));
    return next();
  };
}
