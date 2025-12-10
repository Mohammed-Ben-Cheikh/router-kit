import {
  forwardRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useLocation } from "../hooks/useLocation";
import { useRouter } from "../hooks/useRouter";
import type { Location, NavLinkProps, RouteMatch } from "../types";

/**
 * Checks if a link should trigger navigation or default browser behavior
 */
const shouldNavigate = (
  event: ReactMouseEvent<HTMLAnchorElement>,
  target?: string
): boolean => {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    (!target || target === "_self") &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  );
};

/**
 * Default active matching logic
 */
const defaultIsActive = (
  pathname: string,
  to: string,
  end: boolean,
  caseSensitive: boolean
): boolean => {
  const toPath = caseSensitive ? to : to.toLowerCase();
  const currentPath = caseSensitive ? pathname : pathname.toLowerCase();

  if (end) {
    // Exact match (including trailing slash variations)
    return currentPath === toPath || currentPath === `${toPath}/`;
  }

  // Partial match - pathname starts with to
  return (
    currentPath.startsWith(toPath) &&
    (currentPath.length === toPath.length || currentPath[toPath.length] === "/")
  );
};

/**
 * NavLink component for navigation with active state styling
 *
 * Extends Link with automatic active state detection and styling.
 * Perfect for navigation menus, tabs, and breadcrumbs.
 *
 * @example
 * ```tsx
 * // Basic usage with activeClassName
 * <NavLink to="/about" activeClassName="active">About</NavLink>
 *
 * // With activeStyle
 * <NavLink
 *   to="/profile"
 *   activeStyle={{ fontWeight: 'bold', color: 'blue' }}
 * >
 *   Profile
 * </NavLink>
 *
 * // Exact matching with end prop
 * <NavLink to="/" end activeClassName="active">Home</NavLink>
 *
 * // Custom active detection
 * <NavLink
 *   to="/users"
 *   isActive={(match, location) => {
 *     return location.pathname.startsWith('/users');
 *   }}
 * >
 *   Users
 * </NavLink>
 *
 * // Render prop for full control
 * <NavLink to="/dashboard">
 *   {({ isActive }) => (
 *     <span className={isActive ? 'active' : ''}>
 *       Dashboard {isActive && '✓'}
 *     </span>
 *   )}
 * </NavLink>
 * ```
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      to,
      children,
      className,
      activeClassName = "active",
      activeStyle,
      isActive: customIsActive,
      end = false,
      caseSensitive = false,
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
    const { navigate, pathname, matches } = useRouter();
    const location = useLocation();

    // Determine active state
    let isActive: boolean;

    if (customIsActive) {
      // Use custom isActive function
      const currentMatch: RouteMatch | null =
        matches.length > 0 ? matches[matches.length - 1] : null;
      isActive = customIsActive(currentMatch, location as Location);
    } else {
      // Use default matching
      isActive = defaultIsActive(pathname, to, end, caseSensitive);
    }

    // Compute class names
    const computedClassName =
      [className, isActive ? activeClassName : null]
        .filter(Boolean)
        .join(" ") || undefined;

    // Compute styles
    const computedStyle: CSSProperties | undefined = isActive
      ? activeStyle
      : undefined;

    // External link check
    const isExternal = /^https?:\/\//i.test(to);

    const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);

      if (!isExternal && shouldNavigate(event, target)) {
        event.preventDefault();
        navigate(to, { replace, state, preventScrollReset });
      }
    };

    // Security for external links
    const computedRel =
      isExternal && target === "_blank" ? rel || "noopener noreferrer" : rel;

    // Support render prop pattern
    const renderChildren =
      typeof children === "function"
        ? (children as (props: { isActive: boolean }) => React.ReactNode)({
            isActive,
          })
        : children;

    return (
      <a
        ref={ref}
        href={to}
        onClick={handleClick}
        className={computedClassName}
        style={computedStyle}
        target={target}
        rel={computedRel}
        title={title}
        aria-current={isActive ? "page" : undefined}
        {...rest}
      >
        {renderChildren}
      </a>
    );
  }
);

NavLink.displayName = "NavLink";

export default NavLink;
