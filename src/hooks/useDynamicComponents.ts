import { DynamicComponents } from "../types";
import { RouterErrors } from "../utils/error/errors";
import { useParams } from "./useParams";

export const useDynamicComponents: DynamicComponents = (
  dynamicComponentsObject,
  variationParam
) => {
  const params = useParams();

  const variation = params[variationParam];

  if (variation == null) {
    RouterErrors.paramNotDefined(variationParam, Object.keys(params));
  }

  if (typeof variation !== "string") {
    RouterErrors.paramInvalidType(variationParam, "string", typeof variation);
  }

  if (variation.trim() === "") {
    RouterErrors.paramEmptyString(variationParam);
  }

  const component = dynamicComponentsObject[variation];
  if (!component) {
    RouterErrors.componentNotFound(
      variation,
      Object.keys(dynamicComponentsObject)
    );
  }

  return component;
};
