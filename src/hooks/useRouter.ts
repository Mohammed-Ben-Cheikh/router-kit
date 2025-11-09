import { useContext } from "react";
import RouterContext from "../context/RouterContext";

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    if (typeof window === "undefined") {
      throw new Error(
        "RouterKit: useRouter cannot be used during server side rendering"
      );
    }
    throw new Error("RouterKit: useRouter must be used within RouterProvider");
  }
  return ctx;
}
