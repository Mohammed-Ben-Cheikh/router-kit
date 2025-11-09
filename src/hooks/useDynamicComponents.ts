import { DynamicComponents } from "../types";
import { useParams } from "./useParams";

export const useDynamicComponents: DynamicComponents = (
  dynamicComponentsObject,
  variationParam
) => {
  const params = useParams();

  const variation = params[variationParam];

  if (variation == null) {
    throw new Error(
      `[router-kit] Parameter "${variationParam}" is not defined in route params`
    );
  }

  if (typeof variation !== "string") {
    throw new Error(
      `[router-kit] Parameter "${variationParam}" must be a string, got ${typeof variation}`
    );
  }

  if (variation.trim() === "") {
    throw new Error(
      `[router-kit] Parameter "${variationParam}" cannot be an empty string`
    );
  }

  if (!variation) {
    throw new Error(
      `[router-kit] Parameter "${variationParam}" is required but not found in route params`
    );
  }
  const component = dynamicComponentsObject[variation];
  if (!component) {
    throw new Error(
      `[router-kit] Component not found for variation "${variation}". Available variations: ${Object.keys(
        dynamicComponentsObject
      ).join(", ")}`
    );
  }
  return component;
};
