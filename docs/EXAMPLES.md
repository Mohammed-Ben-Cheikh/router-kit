# Router-Kit Examples

Practical examples and use cases for Router-Kit v1.3.1

---

## Table of Contents

1. [Basic Examples](#basic-examples)
2. [E-commerce Application](#e-commerce-application)
3. [Blog Platform](#blog-platform)
4. [Dashboard Application](#dashboard-application)
5. [Multi-language Website](#multi-language-website)
6. [Authentication Flow](#authentication-flow)
7. [Advanced Patterns](#advanced-patterns)

---

## Basic Examples

### Minimal Setup

The simplest possible Router-Kit application:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider, Link } from "router-kit";

const Home = () => <h1>Home</h1>;
const About = () => <h1>About</h1>;

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "about", component: <About /> },
]);

function App() {
  return <RouterProvider routes={routes} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
```

### Navigation Menu

Basic navigation with active states:

```tsx
import { NavLink } from "router-kit";

function Navigation() {
  return (
    <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
      <NavLink to="/" activeClassName="active">
        Home
      </NavLink>
      <NavLink to="/about" activeClassName="active">
        About
      </NavLink>
      <NavLink to="/contact" activeClassName="active">
        Contact
      </NavLink>
    </nav>
  );
}

// CSS
const styles = `
  nav a {
    color: #333;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
  }
  
  nav a.active {
    background-color: #007bff;
    color: white;
  }
`;
```

### Dynamic Route Parameters

Extracting and using route parameters:

```tsx
import { useParams, Link } from "router-kit";

// Routes configuration
const routes = createRouter([
  { path: "/", component: <UserList /> },
  { path: "users/:id", component: <UserProfile /> },
]);

// User list component
function UserList() {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link to={`/users/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// User profile component
function UserProfile() {
  const { id } = useParams();

  return (
    <div>
      <h1>User Profile</h1>
      <p>Viewing profile for user ID: {id}</p>
      <Link to="/">← Back to users</Link>
    </div>
  );
}
```

### Query Parameters

Using query strings for filtering and pagination:

```tsx
import { useQuery, useRouter } from "router-kit";

function ProductList() {
  const query = useQuery();
  const { navigate } = useRouter();

  const category = query.category || "all";
  const page = parseInt(query.page || "1", 10);
  const sort = query.sort || "name";

  const updateFilter = (newCategory: string) => {
    navigate(`/products?category=${newCategory}&page=1&sort=${sort}`);
  };

  const nextPage = () => {
    navigate(`/products?category=${category}&page=${page + 1}&sort=${sort}`);
  };

  return (
    <div>
      <h1>Products - {category}</h1>

      <div>
        <button onClick={() => updateFilter("all")}>All</button>
        <button onClick={() => updateFilter("electronics")}>Electronics</button>
        <button onClick={() => updateFilter("clothing")}>Clothing</button>
      </div>

      <p>Page {page}</p>
      <button onClick={nextPage}>Next Page</button>
    </div>
  );
}
```

---

## E-commerce Application

### Complete E-commerce Structure

```tsx
import {
  createRouter,
  RouterProvider,
  NavLink,
  useParams,
  useRouter,
  useQuery,
} from "router-kit";

// Page Components
function HomePage() {
  return (
    <div>
      <h1>Welcome to Our Store</h1>
      <NavLink to="/products">Browse Products</NavLink>
    </div>
  );
}

function ProductListPage() {
  const query = useQuery();
  const category = query.category || "all";

  const products = [
    { id: 1, name: "Laptop", category: "electronics", price: 999 },
    { id: 2, name: "Phone", category: "electronics", price: 699 },
    { id: 3, name: "T-Shirt", category: "clothing", price: 29 },
  ];

  const filtered = products.filter(
    (p) => category === "all" || p.category === category
  );

  return (
    <div>
      <h1>Products</h1>

      <nav>
        <NavLink to="/products">All</NavLink>
        <NavLink to="/products?category=electronics">Electronics</NavLink>
        <NavLink to="/products?category=clothing">Clothing</NavLink>
      </nav>

      <div className="product-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <NavLink to={`/products/${product.id}`}>View Details</NavLink>
    </div>
  );
}

function ProductDetailPage() {
  const { id } = useParams();
  const { navigate } = useRouter();

  // Simulate fetching product
  const product = {
    id,
    name: "Sample Product",
    price: 99.99,
    description: "This is a great product!",
  };

  const addToCart = () => {
    // Add to cart logic
    navigate("/cart", {
      state: { productAdded: product.name },
    });
  };

  return (
    <div>
      <NavLink to="/products">← Back to Products</NavLink>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
      <p>{product.description}</p>
      <button onClick={addToCart}>Add to Cart</button>
    </div>
  );
}

function CartPage() {
  const location = useLocation();
  const { productAdded } = location.state || {};

  return (
    <div>
      <h1>Shopping Cart</h1>
      {productAdded && (
        <div className="alert">{productAdded} has been added to your cart!</div>
      )}
      {/* Cart items */}
      <NavLink to="/checkout">Proceed to Checkout</NavLink>
    </div>
  );
}

function CheckoutPage() {
  const { navigate } = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process checkout
    navigate("/order-confirmation", {
      replace: true,
      state: { orderId: "ORD-12345" },
    });
  };

  return (
    <div>
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit}>
        {/* Checkout form fields */}
        <button type="submit">Place Order</button>
      </form>
    </div>
  );
}

function OrderConfirmationPage() {
  const location = useLocation();
  const { orderId } = location.state || {};

  return (
    <div>
      <h1>Order Confirmed!</h1>
      <p>Order ID: {orderId}</p>
      <NavLink to="/">Continue Shopping</NavLink>
    </div>
  );
}

// Routes Configuration
const routes = createRouter([
  { path: "/", component: <HomePage /> },
  { path: "products", component: <ProductListPage /> },
  { path: "products/:id", component: <ProductDetailPage /> },
  { path: "cart", component: <CartPage /> },
  { path: "checkout", component: <CheckoutPage /> },
  { path: "order-confirmation", component: <OrderConfirmationPage /> },
  { path: "/404", component: <NotFoundPage /> },
]);

// App Component
function EcommerceApp() {
  return (
    <div className="app">
      <Header />
      <RouterProvider routes={routes} />
      <Footer />
    </div>
  );
}
```

---

## Blog Platform

### Blog with Categories and Tags

```tsx
import {
  createRouter,
  useParams,
  useQuery,
  useDynamicComponents,
} from "router-kit";

// Blog Home
function BlogHome() {
  return (
    <div>
      <h1>Latest Posts</h1>
      <PostList posts={latestPosts} />
    </div>
  );
}

// Category Page
function CategoryPage() {
  const { category } = useParams();
  const posts = getPostsByCategory(category);

  return (
    <div>
      <h1>Category: {category}</h1>
      <PostList posts={posts} />
    </div>
  );
}

// Blog Post Detail
function BlogPost() {
  const { category, slug } = useParams();
  const query = useQuery();
  const highlightComment = query.comment;

  const post = getPost(category, slug);

  useEffect(() => {
    if (highlightComment) {
      const element = document.getElementById(`comment-${highlightComment}`);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  }, [highlightComment]);

  return (
    <article>
      <h1>{post.title}</h1>
      <p className="meta">
        By {post.author} in <Link to={`/category/${category}`}>{category}</Link>
      </p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />

      <section className="comments">
        <h2>Comments</h2>
        {post.comments.map((comment) => (
          <div key={comment.id} id={`comment-${comment.id}`}>
            {comment.text}
          </div>
        ))}
      </section>
    </article>
  );
}

// Author Profile
function AuthorProfile() {
  const { username } = useParams();
  const author = getAuthor(username);

  return (
    <div>
      <h1>{author.name}</h1>
      <img src={author.avatar} alt={author.name} />
      <p>{author.bio}</p>

      <h2>Posts by {author.name}</h2>
      <PostList posts={author.posts} />
    </div>
  );
}

// Search Results
function SearchResults() {
  const query = useQuery();
  const searchTerm = query.q || "";
  const results = searchPosts(searchTerm);

  return (
    <div>
      <h1>Search Results for "{searchTerm}"</h1>
      {results.length > 0 ? (
        <PostList posts={results} />
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
}

// Routes
const blogRoutes = createRouter([
  { path: "/", component: <BlogHome /> },
  { path: "category/:category", component: <CategoryPage /> },
  { path: "posts/:category/:slug", component: <BlogPost /> },
  { path: "author/:username", component: <AuthorProfile /> },
  { path: "search", component: <SearchResults /> },
  { path: "/404", component: <NotFound /> },
]);
```

---

## Dashboard Application

### Admin Dashboard with Dynamic Views

```tsx
import { useDynamicComponents, useParams, NavLink } from "router-kit";

// Dashboard Views
const OverviewView = () => (
  <div>
    <h2>Overview</h2>
    <div className="stats-grid">
      <StatCard title="Users" value="1,234" />
      <StatCard title="Revenue" value="$45,678" />
      <StatCard title="Orders" value="890" />
    </div>
  </div>
);

const AnalyticsView = () => (
  <div>
    <h2>Analytics</h2>
    <Chart data={analyticsData} />
  </div>
);

const ReportsView = () => (
  <div>
    <h2>Reports</h2>
    <ReportTable />
  </div>
);

const SettingsView = () => (
  <div>
    <h2>Settings</h2>
    <SettingsForm />
  </div>
);

// Dashboard Layout
function DashboardLayout() {
  const dashboardViews = {
    overview: <OverviewView />,
    analytics: <AnalyticsView />,
    reports: <ReportsView />,
    settings: <SettingsView />,
  };

  const currentView = useDynamicComponents(dashboardViews, "view");

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <nav>
          <NavLink to="/dashboard/overview" activeClassName="active">
            📊 Overview
          </NavLink>
          <NavLink to="/dashboard/analytics" activeClassName="active">
            📈 Analytics
          </NavLink>
          <NavLink to="/dashboard/reports" activeClassName="active">
            📄 Reports
          </NavLink>
          <NavLink to="/dashboard/settings" activeClassName="active">
            ⚙️ Settings
          </NavLink>
        </nav>
      </aside>

      <main className="dashboard-content">{currentView}</main>
    </div>
  );
}

// User Management
function UserManagement() {
  const { action } = useParams();

  const actions = {
    list: <UserList />,
    create: <CreateUser />,
    edit: <EditUser />,
  };

  return useDynamicComponents(actions, "action");
}

// Routes
const dashboardRoutes = createRouter([
  { path: "dashboard/:view", component: <DashboardLayout /> },
  { path: "users/:action", component: <UserManagement /> },
  { path: "users/:action/:id", component: <UserDetail /> },
]);
```

### Nested Dashboard Routes

```tsx
const routes = createRouter([
  {
    path: "dashboard",
    component: <DashboardLayout />,
    children: [
      { path: "", component: <DashboardHome /> },
      { path: "overview", component: <Overview /> },
      {
        path: "settings",
        component: <SettingsLayout />,
        children: [
          { path: "profile", component: <ProfileSettings /> },
          { path: "security", component: <SecuritySettings /> },
          { path: "notifications", component: <NotificationSettings /> },
        ],
      },
    ],
  },
]);

// Resulting URLs:
// /dashboard → DashboardHome
// /dashboard/overview → Overview
// /dashboard/settings/profile → ProfileSettings
// /dashboard/settings/security → SecuritySettings
```

---

## Multi-language Website

### Language-based Routing

```tsx
import { useParams, useRouter, createRouter } from "router-kit";

// Language Context
const LanguageContext = createContext<{
  language: string;
  setLanguage: (lang: string) => void;
}>({ language: "en", setLanguage: () => {} });

function LanguageProvider({ children }) {
  const { lang } = useParams();
  const [language, setLanguage] = useState(lang || "en");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Translations
const translations = {
  en: {
    home: "Home",
    about: "About Us",
    contact: "Contact",
    welcome: "Welcome to our website",
  },
  fr: {
    home: "Accueil",
    about: "À propos",
    contact: "Contact",
    welcome: "Bienvenue sur notre site",
  },
  es: {
    home: "Inicio",
    about: "Acerca de",
    contact: "Contacto",
    welcome: "Bienvenido a nuestro sitio",
  },
};

// Translation Hook
function useTranslation() {
  const { language } = useContext(LanguageContext);
  return (key: string) => translations[language][key] || key;
}

// Language Selector
function LanguageSelector() {
  const { navigate } = useRouter();
  const { language } = useContext(LanguageContext);
  const location = useLocation();

  const switchLanguage = (newLang: string) => {
    const currentPath = location.pathname.replace(/^\/(en|fr|es)/, "");
    navigate(`/${newLang}${currentPath}`);
  };

  return (
    <div className="language-selector">
      <button
        className={language === "en" ? "active" : ""}
        onClick={() => switchLanguage("en")}
      >
        EN
      </button>
      <button
        className={language === "fr" ? "active" : ""}
        onClick={() => switchLanguage("fr")}
      >
        FR
      </button>
      <button
        className={language === "es" ? "active" : ""}
        onClick={() => switchLanguage("es")}
      >
        ES
      </button>
    </div>
  );
}

// Pages with translations
function HomePage() {
  const t = useTranslation();

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <nav>
        <Link to="#">{t("home")}</Link>
        <Link to="#">{t("about")}</Link>
        <Link to="#">{t("contact")}</Link>
      </nav>
    </div>
  );
}

// Routes with language parameter
const routes = createRouter([
  {
    path: ":lang",
    component: (
      <LanguageProvider>
        <HomePage />
      </LanguageProvider>
    ),
  },
]);

// URLs: /en, /fr, /es
```

---

## Authentication Flow

### Protected Routes with Auth

```tsx
import { useRouter, useLocation } from "router-kit";

// Auth Context
const AuthContext = createContext<{
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}>({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

// Auth Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: Credentials) => {
    const userData = await authenticateUser(credentials);
    setUser(userData);
    localStorage.setItem("token", userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route Component
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: string;
}) {
  const { navigate } = useRouter();
  const location = useLocation();
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: { from: location.pathname },
      });
    } else if (requiredRole && user?.role !== requiredRole) {
      navigate("/unauthorized", { replace: true });
    }
  }, [isAuthenticated, user, requiredRole, navigate, location]);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

// Login Page
function LoginPage() {
  const { navigate } = useRouter();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const from = location.state?.from || "/dashboard";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await login({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });

      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

// Dashboard (Protected)
function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const { navigate } = useRouter();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

// Admin Panel (Role-based Protection)
function AdminPanel() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Admin-only content</p>
    </div>
  );
}

// Routes with Protection
const routes = createRouter([
  { path: "/", component: <HomePage /> },
  { path: "login", component: <LoginPage /> },
  {
    path: "dashboard",
    component: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin",
    component: (
      <ProtectedRoute requiredRole="admin">
        <AdminPanel />
      </ProtectedRoute>
    ),
  },
  { path: "unauthorized", component: <UnauthorizedPage /> },
  { path: "/404", component: <NotFoundPage /> },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider routes={routes} />
    </AuthProvider>
  );
}
```

---

## Advanced Patterns

### Lazy Loading with Suspense

```tsx
import { lazy, Suspense } from "react";

// Lazy load components
const HeavyComponent = lazy(() => import("./HeavyComponent"));
const Dashboard = lazy(() => import("./Dashboard"));

// Loading fallback
function LoadingFallback() {
  return <div className="loading">Loading...</div>;
}

// Routes with lazy loading
const routes = createRouter([
  {
    path: "dashboard",
    component: (
      <Suspense fallback={<LoadingFallback />}>
        <Dashboard />
      </Suspense>
    ),
  },
  {
    path: "heavy",
    component: (
      <Suspense fallback={<LoadingFallback />}>
        <HeavyComponent />
      </Suspense>
    ),
  },
]);
```

### Modal Routes

```tsx
function App() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <RouterProvider routes={routes} />

      {backgroundLocation && (
        <Modal>
          <RouterProvider routes={modalRoutes} />
        </Modal>
      )}
    </>
  );
}

// Open modal with navigation
function ProductGrid() {
  const { navigate } = useRouter();
  const location = useLocation();

  const openProductModal = (id: string) => {
    navigate(`/products/${id}`, {
      state: { backgroundLocation: location },
    });
  };

  return (
    <div>
      {products.map((p) => (
        <div key={p.id} onClick={() => openProductModal(p.id)}>
          {p.name}
        </div>
      ))}
    </div>
  );
}
```

### Breadcrumb Navigation

```tsx
function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);

    return { path, label };
  });

  return (
    <nav className="breadcrumbs">
      <Link to="/">Home</Link>
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.path}>
          <span className="separator">/</span>
          {index === breadcrumbs.length - 1 ? (
            <span>{crumb.label}</span>
          ) : (
            <Link to={crumb.path}>{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
```

### Route Transition Animations

```tsx
import { motion, AnimatePresence } from "framer-motion";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        <RouterProvider routes={routes} />
      </motion.div>
    </AnimatePresence>
  );
}
```

### Error Boundary for Routes

```tsx
class RouteErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Route error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <RouteErrorBoundary>
      <RouterProvider routes={routes} />
    </RouteErrorBoundary>
  );
}
```

---

**More examples coming soon!**

For additional examples and community contributions, visit:

- [GitHub Repository](https://github.com/Mohammed-Ben-Cheikh/router-kit)
- [Issues & Discussions](https://github.com/Mohammed-Ben-Cheikh/router-kit/issues)
