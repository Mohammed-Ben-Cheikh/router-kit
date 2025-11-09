import { JSX } from "react";

export interface Route {
  path: string | string[];
  component: JSX.Element;
  children?: Route[];
}

export interface GetComponent {
  (
    routes: Route[],
    currentPath: string,
    parentPath?: string
  ): JSX.Element | null;
}

export interface Routes {
  component: JSX.Element;
  fullPath: string;
  path: string;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: any;
}

export interface RouterContextType {
  path: string;
  fullPathWithParams: string;
  navigate: (to: string, options?: NavigateOptions) => void;
}

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: any;
}

export interface RouterError extends Error {
  code: "NAVIGATION_ABORTED" | "ROUTER_NOT_FOUND" | "INVALID_ROUTE";
}

export interface DynamicComponents {
  (
    dynamicComponentsObject: Record<string, JSX.Element>,
    variationParam: string
  ): JSX.Element;
}

// Export error utilities
export type { RouterKitError } from "../utils/error/errors";
