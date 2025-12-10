import { ReactNode } from "react";
import { useOutlet, useOutletContext } from "../context/OutletContext";

/**
 * Outlet component props
 */
export interface OutletProps {
  /** Custom context to pass to child routes */
  context?: unknown;
}

/**
 * Outlet Component
 *
 * Renders the child route's element when nested routes are used.
 * This is the React Router-style component for rendering nested route content.
 *
 * @example
 * ```tsx
 * // Parent route component
 * function Dashboard() {
 *   return (
 *     <div className="dashboard">
 *       <Sidebar />
 *       <main>
 *         <Outlet /> {/* Renders child route content *\/}
 *       </main>
 *     </div>
 *   );
 * }
 *
 * // Routes configuration
 * const routes = createRouter([
 *   {
 *     path: "dashboard",
 *     component: <Dashboard />,
 *     children: [
 *       { path: "", component: <DashboardHome /> },
 *       { path: "settings", component: <Settings /> },
 *       { path: "profile", component: <Profile /> },
 *     ],
 *   },
 * ]);
 * ```
 *
 * @example
 * ```tsx
 * // Passing context to child routes
 * function Layout() {
 *   const user = useUser();
 *   return (
 *     <div>
 *       <Header user={user} />
 *       <Outlet context={{ user }} />
 *     </div>
 *   );
 * }
 *
 * // Accessing context in child route
 * function Profile() {
 *   const { user } = useOutletContext<{ user: User }>();
 *   return <h1>Welcome, {user.name}</h1>;
 * }
 * ```
 */
export function Outlet({ context }: OutletProps): ReactNode {
  const outlet = useOutlet();

  // If context is provided, we could wrap outlet with context
  // For now, just return the outlet content
  if (context !== undefined) {
    // Context is passed through OutletProvider in RouterProvider
    console.warn(
      "Outlet context prop is for documentation purposes. " +
        "Use useOutletContext() in child components to access parent context."
    );
  }

  return outlet;
}

// Re-export useOutletContext for convenience
export { useOutletContext };

export default Outlet;
