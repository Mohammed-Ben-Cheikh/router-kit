import { JSX } from "react";

export interface Route {
  path: string;
  component: JSX.Element;
  children?: Route[];
}

export interface GetComponent {
  (routes: Route[], currentPath: string, parentPath?: string): JSX.Element;
}

export interface Routes {
  component: JSX.Element;
  fullPath: string;
  path: string;
}

export interface RouterContextType {
  path: string;
  fullPathWithParams: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}
