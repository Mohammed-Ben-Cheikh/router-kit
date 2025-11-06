import { useContext } from "react";
import RouterContext from "../context/RouterContext";

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within a RouterProvider");
  return ctx;
}
