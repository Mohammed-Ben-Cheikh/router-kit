import { JSX, useMemo } from "react";
import { RouterErrors } from "../utils/error/errors";
import { useParams } from "./useParams";

/**
 * Type for dynamic components mapping
 */
export type DynamicComponentsMap = Record<string, JSX.Element>;

/**
 * Options for useDynamicComponents hook
 */
export interface UseDynamicComponentsOptions {
  /** Fallback component when variation is not found */
  fallback?: JSX.Element;
  /** Whether to throw error when component not found (default: true) */
  throwOnNotFound?: boolean;
}

/**
 * Hook to dynamically select a component based on a route parameter
 *
 * Useful for rendering different components based on a URL parameter,
 * such as tabs, variations, or conditional views.
 *
 * @example
 * ```tsx
 * // Route: /dashboard/:tab
 * // URL: /dashboard/settings
 *
 * const components = {
 *   overview: <Overview />,
 *   settings: <Settings />,
 *   profile: <Profile />,
 * };
 *
 * function Dashboard() {
 *   const Component = useDynamicComponents(components, 'tab');
 *   return <div>{Component}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With fallback
 * function Dashboard() {
 *   const Component = useDynamicComponents(
 *     components,
 *     'tab',
 *     { fallback: <NotFound />, throwOnNotFound: false }
 *   );
 *   return <div>{Component}</div>;
 * }
 * ```
 *
 * @param dynamicComponentsObject - Object mapping param values to components
 * @param variationParam - The route parameter name to use for selection
 * @param options - Optional configuration
 * @returns The selected component or fallback
 */
export function useDynamicComponents(
  dynamicComponentsObject: DynamicComponentsMap,
  variationParam: string,
  options?: UseDynamicComponentsOptions
): JSX.Element | null {
  const params = useParams();
  const { fallback = null, throwOnNotFound = true } = options || {};

  return useMemo(() => {
    const variation = params[variationParam];

    // Validate parameter exists
    if (variation == null) {
      if (throwOnNotFound) {
        RouterErrors.paramNotDefined(variationParam, Object.keys(params));
      }
      return fallback;
    }

    // Validate parameter type
    if (typeof variation !== "string") {
      if (throwOnNotFound) {
        RouterErrors.paramInvalidType(
          variationParam,
          "string",
          typeof variation
        );
      }
      return fallback;
    }

    // Validate parameter is not empty
    if (variation.trim() === "") {
      if (throwOnNotFound) {
        RouterErrors.paramEmptyString(variationParam);
      }
      return fallback;
    }

    // Get component for variation
    const component = dynamicComponentsObject[variation];

    if (!component) {
      if (throwOnNotFound) {
        RouterErrors.componentNotFound(
          variation,
          Object.keys(dynamicComponentsObject)
        );
      }
      return fallback;
    }

    return component;
  }, [
    params,
    variationParam,
    dynamicComponentsObject,
    fallback,
    throwOnNotFound,
  ]);
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use useDynamicComponents instead
 */
export const DynamicComponents = useDynamicComponents;
