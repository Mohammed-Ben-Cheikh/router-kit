# Server-Side Rendering (SSR) Guide

Router Kit provides full SSR support similar to Next.js. This guide covers how to implement server-side rendering with data fetching.

## Table of Contents

- [Quick Start](#quick-start)
- [StaticRouter](#staticrouter)
- [Data Fetching](#data-fetching)
- [Client Hydration](#client-hydration)
- [Complete Example](#complete-example)
- [API Reference](#api-reference)

## Quick Start

### 1. Define Your Routes

```tsx
// routes.ts
import { createRouter, RouteType } from "router-kit";

export const routes = createRouter([
  {
    path: "/",
    component: <Home />,
    loader: async () => {
      const data = await fetch("/api/home").then((r) => r.json());
      return data;
    },
    meta: { title: "Home" },
  },
  {
    path: "/users/:id",
    component: <UserProfile />,
    loader: async ({ params }) => {
      const user = await fetch(`/api/users/${params.id}`).then((r) => r.json());
      return user;
    },
  },
  {
    path: "/404",
    component: <NotFound />,
  },
]);
```

### 2. Server Setup

```tsx
// server.ts
import express from "express";
import { renderToPipeableStream } from "react-dom/server";
import {
  StaticRouter,
  matchServerRoutes,
  prefetchLoaderData,
  getLoaderDataScript,
} from "router-kit/ssr";
import { routes } from "./routes";

const app = express();

app.use(express.static("public"));

// Use '*all' pattern for Express 5.x compatibility (recommended by Vite)
app.use("*all", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    // 1. Match routes
    const matchResult = matchServerRoutes(routes, url);

    // 2. Handle redirects
    if (matchResult.redirect) {
      return res.redirect(302, matchResult.redirect);
    }

    // 3. Prefetch all loader data
    const loaderResult = await prefetchLoaderData(
      matchResult.matches,
      `http://${req.headers.host}${url}`,
      { headers: { cookie: req.headers.cookie || "" } }
    );

    // 4. Create context for collecting status codes
    const context = {};

    // 5. Render the app
    const { pipe } = renderToPipeableStream(
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>{matchResult.meta?.title || "My App"}</title>
        </head>
        <body>
          <div id="root">
            <StaticRouter
              routes={routes}
              location={url}
              loaderData={loaderResult.data}
              context={context}
            />
          </div>
          {/* Inject loader data for hydration */}
          <script
            dangerouslySetInnerHTML={{
              __html: getLoaderDataScript(loaderResult.data),
            }}
          />
          <script src="/client.js" />
        </body>
      </html>,
      {
        onShellReady() {
          res.status(context.statusCode || 200);
          res.setHeader("Content-Type", "text/html");
          pipe(res);
        },
        onError(error) {
          console.error("SSR Error:", error);
          next(error);
        },
      }
    );
  } catch (error) {
    next(error);
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

### 3. Client Hydration

```tsx
// client.tsx
import { hydrateRouter } from "router-kit/ssr";
import { routes } from "./routes";

hydrateRouter(document.getElementById("root")!, {
  routes,
  onHydrated: () => {
    console.log("App hydrated successfully!");
  },
});
```

## StaticRouter

The `StaticRouter` component renders routes on the server without browser APIs.

### Props

| Prop         | Type                   | Description                                    |
| ------------ | ---------------------- | ---------------------------------------------- |
| `routes`     | `Route[]`              | Route configuration                            |
| `location`   | `string`               | URL to render                                  |
| `basename`   | `string?`              | Base path for all routes                       |
| `loaderData` | `Record<string, any>?` | Pre-fetched data from loaders                  |
| `context`    | `StaticRouterContext?` | Context object for collecting redirects/status |

### Context Object

The `context` object is populated during rendering:

```ts
interface StaticRouterContext {
  url?: string; // Redirect URL (if any)
  statusCode?: number; // HTTP status code (200, 302, 404, etc.)
  action?: "REDIRECT" | "NOT_FOUND" | "OK";
  meta?: RouteMeta; // Matched route metadata
}
```

## Data Fetching

### Route Loaders

Define loaders in your route configuration:

```tsx
{
  path: '/posts/:id',
  component: <Post />,
  loader: async ({ params, request, signal }) => {
    const response = await fetch(`/api/posts/${params.id}`, {
      signal,
      headers: request.headers
    });

    if (!response.ok) {
      throw new Response('Not Found', { status: 404 });
    }

    return response.json();
  }
}
```

### Using Loader Data

```tsx
import { useLoaderData } from "router-kit";

function Post() {
  const post = useLoaderData<{ title: string; content: string }>();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### Parallel Data Fetching

`prefetchLoaderData` runs all loaders in parallel for optimal performance:

```ts
const loaderResult = await prefetchLoaderData(matches, url);

// Result structure:
{
  data: { '/posts/:id': { title: '...' } },
  errors: { '/users/:id': Error },
  loadTime: 123 // milliseconds
}
```

## Client Hydration

### Basic Hydration

```tsx
import { hydrateRouter } from "router-kit/ssr";

hydrateRouter(document.getElementById("root")!, {
  routes,
  fallbackElement: <Loading />,
  onHydrated: () => {
    // Called after hydration is complete
    analytics.trackPageLoad();
  },
});
```

### Conditional Rendering

```tsx
import { isBrowser, isServerRendered } from "router-kit/ssr";

function MyComponent() {
  if (!isBrowser()) {
    return <ServerPlaceholder />;
  }

  if (isServerRendered()) {
    // App was SSR'd
    return <HydratedContent />;
  }

  // Client-only render
  return <ClientContent />;
}
```

## Complete Example

### Project Structure

```
my-app/
├── src/
│   ├── routes.ts
│   ├── server.tsx
│   ├── client.tsx
│   └── components/
│       ├── Home.tsx
│       ├── UserProfile.tsx
│       └── NotFound.tsx
├── package.json
└── tsconfig.json
```

### routes.ts

```tsx
import { createRouter } from "router-kit";
import Home from "./components/Home";
import UserProfile from "./components/UserProfile";
import NotFound from "./components/NotFound";

export const routes = createRouter([
  {
    path: "/",
    component: <Home />,
    loader: async () => {
      return fetch("/api/featured").then((r) => r.json());
    },
    meta: { title: "Home - My App" },
  },
  {
    path: "/users/:id",
    component: <UserProfile />,
    loader: async ({ params }) => {
      const res = await fetch(`/api/users/${params.id}`);
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    meta: { title: "User Profile" },
  },
  {
    path: "/login",
    component: <Login />,
    guard: ({ pathname }) => {
      // Redirect if already logged in
      if (isAuthenticated()) return "/dashboard";
      return true;
    },
  },
  {
    path: "/old-page",
    redirectTo: "/new-page",
  },
  {
    path: "/404",
    component: <NotFound />,
  },
]);
```

### server.tsx

```tsx
import express from "express";
import { renderToPipeableStream } from "react-dom/server";
import {
  StaticRouter,
  StaticRouterContext,
  matchServerRoutes,
  prefetchLoaderData,
  getLoaderDataScript,
  createRequestFromNode,
} from "router-kit/ssr";
import { routes } from "./routes";

const app = express();

// Serve static files
app.use(express.static("dist/client"));

// SSR handler - Use '*all' for Express 5.x (recommended by Vite)
app.use("*all", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    // Match routes
    const matchResult = matchServerRoutes(routes, url);

    // Handle redirects
    if (matchResult.redirect) {
      return res.redirect(matchResult.statusCode || 302, matchResult.redirect);
    }

    // Prefetch data
    const loaderResult = await prefetchLoaderData(
      matchResult.matches,
      `${req.protocol}://${req.headers.host}${url}`,
      {
        headers: {
          cookie: req.headers.cookie || "",
          authorization: req.headers.authorization || "",
        },
      }
    );

    // Check for loader errors
    if (Object.keys(loaderResult.errors).length > 0) {
      console.error("Loader errors:", loaderResult.errors);
    }

    const context: StaticRouterContext = {};

    // Render
    const { pipe } = renderToPipeableStream(
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{matchResult.meta?.title || "My App"}</title>
          {matchResult.meta?.description && (
            <meta name="description" content={matchResult.meta.description} />
          )}
          <link rel="stylesheet" href="/styles.css" />
        </head>
        <body>
          <div id="root">
            <StaticRouter
              routes={routes}
              location={url}
              loaderData={loaderResult.data}
              context={context}
            />
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: getLoaderDataScript(loaderResult.data),
            }}
          />
          <script type="module" src="/client.js" />
        </body>
      </html>,
      {
        bootstrapModules: ["/client.js"],
        onShellReady() {
          const status = context.statusCode || matchResult.statusCode || 200;
          res.status(status);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          pipe(res);
        },
        onShellError(error) {
          console.error("Shell error:", error);
          res
            .status(500)
            .send("<!DOCTYPE html><html><body><h1>Error</h1></body></html>");
        },
        onError(error) {
          console.error("Render error:", error);
        },
      }
    );
  } catch (error) {
    console.error("SSR error:", error);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

### client.tsx

```tsx
import { hydrateRouter } from "router-kit/ssr";
import { routes } from "./routes";

// Hydrate when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", hydrate);
} else {
  hydrate();
}

function hydrate() {
  hydrateRouter(document.getElementById("root")!, {
    routes,
    fallbackElement: <div className="loading">Loading...</div>,
    onHydrated: () => {
      console.log("App hydrated!");
      // Initialize analytics, etc.
    },
  });
}
```

## API Reference

### SSR Exports

```ts
import {
  // Components
  StaticRouter,

  // Server utilities
  matchServerRoutes,
  prefetchLoaderData,
  createRequestFromNode,
  getLoaderDataScript,
  getHydratedLoaderData,

  // Client utilities
  hydrateRouter,
  isBrowser,
  isServerRendered,

  // Types
  StaticRouterProps,
  StaticRouterContext,
  ServerMatchResult,
  ServerLoaderResult,
  HydrateRouterOptions,
} from "router-kit/ssr";
```

### matchServerRoutes

```ts
function matchServerRoutes(
  routes: Route[],
  pathname: string,
  parentPath?: string
): ServerMatchResult;

interface ServerMatchResult {
  matches: RouteMatch[];
  params: Record<string, string>;
  redirect?: string;
  statusCode: number;
  meta?: RouteMeta;
}
```

### prefetchLoaderData

```ts
function prefetchLoaderData(
  matches: RouteMatch[],
  url: string,
  requestInit?: RequestInit
): Promise<ServerLoaderResult>;

interface ServerLoaderResult<T = any> {
  data: Record<string, T>;
  errors: Record<string, Error>;
  loadTime: number;
}
```

### hydrateRouter

```ts
function hydrateRouter(
  container: Element | Document,
  options: HydrateRouterOptions
): void;

interface HydrateRouterOptions {
  routes: Route[];
  basename?: string;
  fallbackElement?: JSX.Element;
  onHydrated?: () => void;
}
```

## Best Practices

1. **Always prefetch data** - Run loaders on the server to avoid loading states
2. **Handle errors gracefully** - Check `loaderResult.errors` and handle appropriately
3. **Set proper status codes** - Use the `context` object to get the correct HTTP status
4. **Inject data for hydration** - Use `getLoaderDataScript` to pass data to the client
5. **Match routes first** - Check for redirects before rendering
6. **Use streaming** - `renderToPipeableStream` provides better TTFB than `renderToString`

## Framework Integration

### With Express

See examples above.

### With Fastify

```ts
import Fastify from "fastify";
import { renderToPipeableStream } from "react-dom/server";
import {
  StaticRouter,
  matchServerRoutes,
  prefetchLoaderData,
} from "router-kit/ssr";

const fastify = Fastify();

fastify.get("*", async (request, reply) => {
  const matchResult = matchServerRoutes(routes, request.url);

  if (matchResult.redirect) {
    return reply.redirect(matchResult.statusCode, matchResult.redirect);
  }

  // ... render similar to Express example
});
```

### With Hono

```ts
import { Hono } from "hono";
import { renderToReadableStream } from "react-dom/server";
import {
  StaticRouter,
  matchServerRoutes,
  prefetchLoaderData,
} from "router-kit/ssr";

const app = new Hono();

app.get("*", async (c) => {
  const matchResult = matchServerRoutes(routes, c.req.url);

  if (matchResult.redirect) {
    return c.redirect(matchResult.redirect, matchResult.statusCode);
  }

  const stream = await renderToReadableStream(
    <StaticRouter routes={routes} location={c.req.url} />
  );

  return new Response(stream, {
    headers: { "Content-Type": "text/html" },
  });
});
```
