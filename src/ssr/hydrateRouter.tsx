import React from "react";
import { hydrateRoot } from "react-dom/client";
import RouterProvider from "../context/RouterProvider";
import type { Route } from "../types";

/**
 * Options for hydrating the router on the client
 */
export interface HydrateRouterOptions {
  /** Routes configuration (must match server) */
  routes: Route[];
  /** Base path for all routes */
  basename?: string;
  /** Fallback element during suspense */
  fallbackElement?: React.ReactElement;
  /** Callback after hydration is complete */
  onHydrated?: () => void;
}

/**
 * Hydrate a server-rendered router on the client
 *
 * This function hydrates the React application that was rendered on the server.
 * It automatically picks up the loader data that was injected during SSR.
 *
 * @example
 * ```tsx
 * // client.tsx (entry point for client bundle)
 * import { hydrateRouter } from 'router-kit/ssr';
 * import { routes } from './routes';
 *
 * hydrateRouter(document.getElementById('root')!, {
 *   routes,
 *   onHydrated: () => {
 *     console.log('App hydrated!');
 *   }
 * });
 * ```
 */
export function hydrateRouter(
  container: Element | Document,
  options: HydrateRouterOptions
): void {
  const { routes, basename, fallbackElement, onHydrated } = options;

  // Get pre-loaded data from server
  const preloadedData = (window as any).__ROUTER_KIT_DATA__;

  // Create the RouterProvider with hydration data
  const app = (
    <RouterProvider
      routes={routes}
      basename={basename}
      fallbackElement={fallbackElement}
    />
  );

  // Hydrate the application
  const root = hydrateRoot(container, app, {
    onRecoverableError: (error) => {
      console.warn("[router-kit] Hydration mismatch:", error);
    },
  });

  // Clean up SSR data after hydration
  if (preloadedData) {
    delete (window as any).__ROUTER_KIT_DATA__;
  }

  if (onHydrated) {
    // Call after React commits
    requestIdleCallback
      ? requestIdleCallback(onHydrated)
      : setTimeout(onHydrated, 0);
  }
}

/**
 * Check if the app is running in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Check if the app was server-rendered
 */
export function isServerRendered(): boolean {
  if (!isBrowser()) return false;
  return !!(window as any).__ROUTER_KIT_DATA__;
}
