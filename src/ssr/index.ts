/**
 * Router Kit - Server-Side Rendering Support
 *
 * This module provides SSR capabilities similar to Next.js:
 * - StaticRouter for server-side rendering
 * - Data prefetching utilities
 * - Client hydration support
 *
 * @example Server-side rendering
 * ```tsx
 * // server.ts
 * import express from 'express';
 * import { renderToPipeableStream } from 'react-dom/server';
 * import { StaticRouter, matchServerRoutes, prefetchLoaderData, getLoaderDataScript } from 'router-kit/ssr';
 * import { routes } from './routes';
 *
 * const app = express();
 *
 * // Use '*all' pattern for Express 5.x compatibility (recommended by Vite)
 * app.use('*all', async (req, res, next) => {
 *   const url = req.originalUrl;
 *
 *   try {
 *     // 1. Match routes and check for redirects
 *     const matchResult = matchServerRoutes(routes, url);
 *
 *   if (matchResult.redirect) {
 *     return res.redirect(302, matchResult.redirect);
 *   }
 *
 *   // 2. Prefetch loader data
 *   const loaderResult = await prefetchLoaderData(
 *     matchResult.matches,
 *     `http://${req.headers.host}${req.url}`
 *   );
 *
 *   // 3. Create static router context
 *   const context = {};
 *
 *   // 4. Render to stream
 *   const { pipe } = renderToPipeableStream(
 *     <StaticRouter
 *       routes={routes}
 *       location={req.url}
 *       loaderData={loaderResult.data}
 *       context={context}
 *     />,
 *     {
 *       bootstrapScripts: ['/client.js'],
 *       onShellReady() {
 *         res.setHeader('Content-Type', 'text/html');
 *         res.write('<!DOCTYPE html><html><head>');
 *         res.write(getLoaderDataScript(loaderResult.data));
 *         res.write('</head><body><div id="root">');
 *         pipe(res);
 *       },
 *       onAllReady() {
 *         res.write('</div></body></html>');
 *         res.end();
 *       },
 *       onError(e) {
 *         // Let Vite fix the stack trace
 *         next(e);
 *       }
 *     }
 *   );
 *   } catch (e) {
 *     next(e);
 *   }
 * });
 *
 * app.listen(3000);
 * ```
 *
 * @example Client hydration
 * ```tsx
 * // client.tsx
 * import { hydrateRouter } from 'router-kit/ssr';
 * import { routes } from './routes';
 *
 * hydrateRouter(document.getElementById('root')!, {
 *   routes,
 *   onHydrated: () => console.log('App ready!')
 * });
 * ```
 */

// Static Router for SSR
export { default as StaticRouter } from "./StaticRouter";
export type { StaticRouterContext, StaticRouterProps } from "./StaticRouter";

// Server utilities
export {
  createRequestFromNode,
  getHydratedLoaderData,
  getLoaderDataScript,
  matchServerRoutes,
  prefetchLoaderData,
} from "./serverUtils";
export type { ServerLoaderResult, ServerMatchResult } from "./serverUtils";

// Client hydration
export { hydrateRouter, isBrowser, isServerRendered } from "./hydrateRouter";
export type { HydrateRouterOptions } from "./hydrateRouter";
