/**
 * Error codes for router-kit
 */
export enum RouterErrorCode {
  // Router context errors
  ROUTER_NOT_INITIALIZED = "ROUTER_NOT_INITIALIZED",

  // Dynamic components errors
  PARAM_NOT_DEFINED = "PARAM_NOT_DEFINED",
  PARAM_INVALID_TYPE = "PARAM_INVALID_TYPE",
  PARAM_EMPTY_STRING = "PARAM_EMPTY_STRING",
  COMPONENT_NOT_FOUND = "COMPONENT_NOT_FOUND",

  // Navigation errors
  NAVIGATION_ABORTED = "NAVIGATION_ABORTED",
  INVALID_ROUTE = "INVALID_ROUTE",
}

/**
 * Custom error class for router-kit
 */
export class RouterKitError extends Error {
  public readonly code: RouterErrorCode;
  public readonly context?: Record<string, any>;

  constructor(
    code: RouterErrorCode,
    message: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = "RouterKitError";
    this.code = code;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, RouterKitError);
    }
  }

  /**
   * Returns a formatted error message for console output
   */
  public toConsoleMessage(): string {
    const contextStr = this.context
      ? `\n\nContext: ${JSON.stringify(this.context, null, 2)}`
      : "";
    return `[router-kit] ${this.code}: ${this.message}${contextStr}`;
  }
}

/**
 * Creates a standardized RouterKitError
 */
export function createRouterError(
  code: RouterErrorCode,
  message: string,
  context?: Record<string, any>
): RouterKitError {
  return new RouterKitError(code, message, context);
}

/**
 * Throws a RouterKitError with optional console styling
 */
export function throwRouterError(
  code: RouterErrorCode,
  message: string,
  context?: Record<string, any>
): never {
  const error = createRouterError(code, message, context);

  // Enhanced console error with styling (if available)
  if (typeof window !== "undefined" && window.console && console.error) {
    console.error(
      `%c[router-kit]%c ${code}`,
      "color: #fff; background: #d9534f; font-weight: 700; padding: 2px 6px; border-radius: 3px;",
      "color: #d9534f; font-weight: 600;"
    );
    console.error(`%c${message}`, "color: #d9534f;");
    if (context) {
      console.error("Context:", context);
    }
  } else {
    console.error(error.toConsoleMessage());
  }

  throw error;
}

/**
 * Pre-configured error creators for common scenarios
 */
export const RouterErrors = {
  routerNotInitialized: (additionalInfo?: string) =>
    throwRouterError(
      RouterErrorCode.ROUTER_NOT_INITIALIZED,
      `Router context is not initialized. ${
        additionalInfo ||
        "Common hooks and components must be used within the RouterProvider returned by createRouter(). Wrap your app with the RouterProvider."
      }`
    ),

  paramNotDefined: (paramName: string, availableParams?: string[]) =>
    throwRouterError(
      RouterErrorCode.PARAM_NOT_DEFINED,
      `Parameter "${paramName}" is not defined in route params`,
      availableParams ? { paramName, availableParams } : { paramName }
    ),

  paramInvalidType: (
    paramName: string,
    expectedType: string,
    receivedType: string
  ) =>
    throwRouterError(
      RouterErrorCode.PARAM_INVALID_TYPE,
      `Parameter "${paramName}" must be a ${expectedType}, got ${receivedType}`,
      { paramName, expectedType, receivedType }
    ),

  paramEmptyString: (paramName: string) =>
    throwRouterError(
      RouterErrorCode.PARAM_EMPTY_STRING,
      `Parameter "${paramName}" cannot be an empty string`,
      { paramName }
    ),

  componentNotFound: (variation: string, availableVariations: string[]) =>
    throwRouterError(
      RouterErrorCode.COMPONENT_NOT_FOUND,
      `Component not found for variation "${variation}". Available variations: ${availableVariations.join(
        ", "
      )}`,
      { variation, availableVariations }
    ),

  navigationAborted: (reason: string) =>
    throwRouterError(
      RouterErrorCode.NAVIGATION_ABORTED,
      `Navigation aborted: ${reason}`
    ),

  invalidRoute: (path: string, reason?: string) =>
    throwRouterError(
      RouterErrorCode.INVALID_ROUTE,
      `Invalid route "${path}"${reason ? `: ${reason}` : ""}`,
      { path }
    ),
};
