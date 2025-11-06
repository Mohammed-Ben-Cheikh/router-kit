import type { ReactNode, MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "./useRouter";

function NavLink({
  to,
  children,
  className,
  activeClassName = "active",
}: {
  to: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}) {
  const { navigate, path } = useRouter();
  const isActive = path === to;
  const combinedClass = [className, isActive ? activeClassName : null]
    .filter(Boolean)
    .join(" ");
  return (
    <a
      onClick={(e: ReactMouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate(to);
      }}
      className={combinedClass}
      href={to}
    >
      {children}
    </a>
  );
}
export default NavLink;
