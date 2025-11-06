import { createContext } from "react";
import type { RouterContextType } from "../types";

const RouterContext = createContext<RouterContextType | undefined>(undefined);
export default RouterContext;
