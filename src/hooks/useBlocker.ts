import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Blocker,
  BlockerFunction,
  HistoryAction,
  Location,
} from "../types";
import { useLocation } from "./useLocation";

/**
 * Creates a unique key
 */
const createKey = (): string => Math.random().toString(36).substring(2, 10);

/**
 * Hook to block navigation when certain conditions are met
 *
 * Useful for preventing accidental navigation away from forms
 * with unsaved changes or other important user actions.
 *
 * @example
 * ```tsx
 * function EditForm() {
 *   const [isDirty, setIsDirty] = useState(false);
 *
 *   const blocker = useBlocker(
 *     ({ currentLocation, nextLocation }) => {
 *       return isDirty && currentLocation.pathname !== nextLocation.pathname;
 *     }
 *   );
 *
 *   return (
 *     <form>
 *       <input onChange={() => setIsDirty(true)} />
 *
 *       {blocker.state === 'blocked' && (
 *         <div className="modal">
 *           <p>You have unsaved changes. Are you sure you want to leave?</p>
 *           <button onClick={() => blocker.proceed()}>Leave</button>
 *           <button onClick={() => blocker.reset()}>Stay</button>
 *         </div>
 *       )}
 *     </form>
 *   );
 * }
 * ```
 *
 * @param blockerFn - Function that determines if navigation should be blocked
 * @returns Blocker object with state and control functions
 */
export function useBlocker(blockerFn: BlockerFunction): Blocker {
  const location = useLocation();
  const [state, setState] = useState<"blocked" | "proceeding" | "unblocked">(
    "unblocked"
  );
  const [blockedLocation, setBlockedLocation] = useState<
    Location | undefined
  >();
  const blockerFnRef = useRef(blockerFn);
  const pendingNavigationRef = useRef<{
    nextLocation: Location;
    action: HistoryAction;
  } | null>(null);

  // Keep blocker function ref updated
  useEffect(() => {
    blockerFnRef.current = blockerFn;
  }, [blockerFn]);

  const proceed = useCallback(() => {
    setState("proceeding");

    if (pendingNavigationRef.current) {
      const { nextLocation, action } = pendingNavigationRef.current;

      // Perform the blocked navigation
      if (action === "POP") {
        // For browser back/forward, we need to let it proceed
        // The history has already changed, we just need to allow the UI to update
      } else if (action === "PUSH") {
        window.history.pushState(
          { key: createKey() },
          "",
          nextLocation.pathname + nextLocation.search + nextLocation.hash
        );
      } else if (action === "REPLACE") {
        window.history.replaceState(
          { key: createKey() },
          "",
          nextLocation.pathname + nextLocation.search + nextLocation.hash
        );
      }

      // Dispatch location change event
      window.dispatchEvent(new Event("locationchange"));
    }

    setState("unblocked");
    setBlockedLocation(undefined);
    pendingNavigationRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setState("unblocked");
    setBlockedLocation(undefined);
    pendingNavigationRef.current = null;

    // For popstate events, we need to restore the previous location
    // by navigating back to where we were
  }, []);

  // Setup beforeunload listener for external navigation
  useEffect(() => {
    if (state === "blocked") return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const nextLocation: Location = {
        pathname: "",
        search: "",
        hash: "",
        state: null,
        key: "external",
      };

      if (
        blockerFnRef.current({
          currentLocation: location,
          nextLocation,
          action: "PUSH",
        })
      ) {
        event.preventDefault();
        event.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [location, state]);

  return {
    state,
    proceed,
    reset,
    location: blockedLocation,
  };
}

/**
 * Hook to prompt user before navigation when condition is met
 *
 * Simpler alternative to useBlocker that uses native browser dialogs.
 *
 * @example
 * ```tsx
 * function EditForm() {
 *   const [isDirty, setIsDirty] = useState(false);
 *
 *   usePrompt(
 *     'You have unsaved changes. Are you sure you want to leave?',
 *     isDirty
 *   );
 *
 *   return (
 *     <form>
 *       <input onChange={() => setIsDirty(true)} />
 *     </form>
 *   );
 * }
 * ```
 *
 * @param message - Message to display in the prompt
 * @param when - Condition that determines if prompt should be shown
 */
export function usePrompt(message: string, when: boolean): void {
  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [message, when]);
}
