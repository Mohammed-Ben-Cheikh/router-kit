import { useCallback } from "react";
import type { NavigateFunction, NavigateOptions } from "../types";
import { useRouter } from "./useRouter";

/**
 * Hook to get the navigate function for programmatic navigation
 *
 * Returns a function that can be used to navigate to different routes.
 * This is the recommended way to perform programmatic navigation.
 *
 * @example
 * ```tsx
 * function LoginButton() {
 *   const navigate = useNavigate();
 *
 *   const handleLogin = async () => {
 *     await login();
 *     navigate('/dashboard');
 *   };
 *
 *   return <button onClick={handleLogin}>Login</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Navigate with options
 * function FormComponent() {
 *   const navigate = useNavigate();
 *
 *   const handleSubmit = () => {
 *     // Replace history entry
 *     navigate('/success', { replace: true });
 *
 *     // Pass state
 *     navigate('/results', { state: { formData } });
 *
 *     // Prevent scroll reset
 *     navigate('/next-section', { preventScrollReset: true });
 *   };
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Navigate back/forward
 * function Navigation() {
 *   const navigate = useNavigate();
 *
 *   return (
 *     <div>
 *       <button onClick={() => navigate(-1)}>Back</button>
 *       <button onClick={() => navigate(1)}>Forward</button>
 *       <button onClick={() => navigate(-2)}>Back 2 pages</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {NavigateFunction} The navigate function
 */
export function useNavigate(): NavigateFunction {
  const { navigate } = useRouter();

  return useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === "number") {
        navigate(to);
      } else {
        navigate(to, options);
      }
    },
    [navigate]
  ) as NavigateFunction;
}
