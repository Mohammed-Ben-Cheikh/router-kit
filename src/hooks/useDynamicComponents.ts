import { DynamicComponents } from "../types";
import { useParams } from "./useParams";

export const useDynamicComponents: DynamicComponents = (
  dynamicComponentsObject,
  variationParam
) => {
  const params = useParams();
  const variation = params[variationParam] ?? "";
  return (dynamicComponentsObject as any)[variation] ?? dynamicComponentsObject;
};
