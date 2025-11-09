import { useContext } from "react";
import RouterContext from "../context/RouterContext";
import type { RouterContextType } from "../types";
import { RouterErrors } from "../utils/error/errors";

export function useRouter(): RouterContextType {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    RouterErrors.routerNotInitialized();
  }
  return ctx as RouterContextType;
}
