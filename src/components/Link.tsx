import { forwardRef, type MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "../hooks/useRouter";
import type { LinkProps } from "../types";

/**
 * Checks if a link should trigger navigation or default browser behavior
 */
const shouldNavigate = (
  event: ReactMouseEvent<HTMLAnchorElement>,
  target?: string
): boolean => {
  return (
    !event.defaultPrevented &&
    event.button === 0 && // Left click
    (!target || target === "_self") &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  );
};

/**
 * Link component for client-side navigation
 *
 * Provides seamless navigation without full page reloads.
 * Supports all standard anchor attributes and navigation options.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Link to="/about">About Us</Link>
 *
 * // With state
 * <Link to="/profile" state={{ from: 'dashboard' }}>Profile</Link>
 *
 * // Replace history entry
 * <Link to="/login" replace>Login</Link>
 *
 * // External link (opens normally)
 * <Link to="https://example.com" target="_blank">External</Link>
 * ```
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      to,
      children,
      className,
      replace = false,
      state,
      preventScrollReset = false,
      target,
      rel,
      title,
      onClick,
      ...rest
    },
    ref
  ) => {
    const { navigate } = useRouter();

    // Determine if link is external
    const isExternal = /^https?:\/\//i.test(to);

    const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
      // Call user's onClick handler first
      onClick?.(event);

      // Handle internal navigation
      if (!isExternal && shouldNavigate(event, target)) {
        event.preventDefault();
        navigate(to, { replace, state, preventScrollReset });
      }
    };

    // Auto-add security attributes for external links
    const computedRel =
      isExternal && target === "_blank" ? rel || "noopener noreferrer" : rel;

    return (
      <a
        ref={ref}
        href={to}
        onClick={handleClick}
        className={className}
        target={target}
        rel={computedRel}
        title={title}
        {...rest}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = "Link";

export default Link;
