import type { ReactNode } from "react";
import { useRouter } from "./useRouter";

function Link({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  const { navigate } = useRouter();
  return (
    <a
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      className={className}
      href={to}
    >
      {children}
    </a>
  );
}
export default Link;
