# Changelog

All notable changes to Router-Kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.1] - 2025-11-09

### Added

- Comprehensive documentation system
  - Complete user documentation (DOCUMENTATION.md)
  - Detailed API reference (API_REFERENCE.md)
  - Real-world examples (EXAMPLES.md)
  - Architecture documentation (ARCHITECTURE.md)
  - Documentation index (docs/README.md)
- Full TypeScript type exports
- Enhanced error handling system
  - `RouterKitError` class with detailed context
  - `RouterErrorCode` enum for standardized error codes
  - Pre-configured error creators (`RouterErrors`)
  - Console styling for better debugging
- New hooks:
  - `useDynamicComponents()` - Conditional component rendering
  - `useLocation()` - Access location with state support
- Export of error utilities
- Navigation state support via `NavigateOptions.state`

### Changed

- Improved error messages with detailed context
- Enhanced type definitions for better IDE support
- Updated exports in index.ts for better discoverability
- Improved README with better documentation structure

### Fixed

- Type safety improvements across all hooks
- Error handling in RouterProvider
- Navigation validation

### Documentation

- Added comprehensive documentation in `/docs` directory
- Added inline code documentation
- Updated README with documentation links
- Added examples for all major features

---

## [1.3.0] - Previous Release

### Added

- Multiple path aliases support
- Nested routes support
- Query parameter parsing hook (`useQuery`)
- Route parameters hook (`useParams`)
- TypeScript support with full type definitions

### Changed

- Improved route matching algorithm
- Better performance with static route prioritization
- Enhanced RouterProvider implementation

---

## [1.2.0] - Earlier Release

### Added

- `NavLink` component with active state
- Custom 404 page support
- History API patching for SPA navigation

### Changed

- Improved Link component
- Better context management

---

## [1.1.0] - Initial Features

### Added

- Basic routing functionality
- `createRouter` function
- `RouterProvider` component
- `Link` component
- `useRouter` hook
- Route matching with dynamic parameters

---

## [1.0.0] - Initial Release

### Added

- Core routing functionality
- Basic route configuration
- Client-side navigation
- React context-based routing

---

## Future Releases

### Planned Features

#### [2.0.0] - Major Update (Planned)

- **Hash-based routing** - Support for `#/path` URLs
- **Regex route matching** - More flexible route patterns
- **Route guards** - Built-in authentication/authorization
- **Lazy loading** - Native code-splitting support
- **Transition hooks** - Animation lifecycle callbacks
- **Route metadata** - SEO and meta tag management
- **Middleware system** - Route-level middleware support
- **Route caching** - Performance optimization

#### [1.4.0] - Next Minor Release (Planned)

- Wildcard routes (`*` and `**`)
- Route priority configuration
- Enhanced error recovery
- Performance improvements
- Additional test coverage
- CI/CD pipeline

---

## Versioning Policy

Router-Kit follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version (X.0.0) - Incompatible API changes
- **MINOR** version (1.X.0) - New features, backward compatible
- **PATCH** version (1.3.X) - Bug fixes, backward compatible

---

## Migration Guides

### Migrating to 1.3.1

No breaking changes. New features are additive.

**New Features:**

```tsx
// Use new error system
import { RouterErrors, RouterErrorCode } from "router-kit";

// Use new hooks
import { useLocation, useDynamicComponents } from "router-kit";

// Navigation with state
navigate("/dashboard", { state: { from: "/login" } });

// Dynamic components
const component = useDynamicComponents(viewsObject, "view");
```

### Migrating to 1.3.0

No breaking changes. Enhanced TypeScript support.

**Improvements:**

```tsx
// Better type inference
const params = useParams(); // Fully typed
const query = useQuery(); // Fully typed
```

---

## Upgrade Instructions

### From 1.2.x to 1.3.1

```bash
npm install router-kit@latest
```

No code changes required. All changes are backward compatible.

### From 1.1.x to 1.3.1

```bash
npm install router-kit@latest
```

Update your imports if using TypeScript:

```tsx
// Add type imports if needed
import type { Route, RouterContextType } from "router-kit";
```

### From 1.0.x to 1.3.1

```bash
npm install router-kit@latest
```

Update `NavLink` usage if applicable:

```tsx
// Old (1.0.x)
<Link to="/about" className={path === "/about" ? "active" : ""}>

// New (1.3.1)
<NavLink to="/about" activeClassName="active">
```

---

## Breaking Changes

### None in 1.3.1

All changes are backward compatible.

### Potential Future Breaking Changes

These are planned for major version 2.0.0:

- Route configuration format changes (more powerful matching)
- Context API restructuring (performance improvements)
- Hook signature changes (additional features)

---

## Deprecation Notices

### None Currently

No features are deprecated in version 1.3.1.

---

## Security Updates

### 1.3.1

- Improved URL validation in navigate function
- Enhanced error handling for invalid routes
- Better input sanitization

### Previous Versions

- Regular dependency updates
- Security patches applied via npm audit

---

## Performance Improvements

### 1.3.1

- Optimized route matching algorithm
- Reduced re-render frequency
- Improved memory usage

### 1.3.0

- Static route prioritization
- Efficient path validation
- Minimal context updates

---

## Bug Fixes

### 1.3.1

- Fixed type definitions export
- Corrected error message formatting
- Improved edge case handling in route matching

### 1.3.0

- Fixed nested route resolution
- Corrected multiple path alias handling
- Fixed history state management

---

## Contributors

### Core Maintainer

- **Mohammed Ben Cheikh** - [GitHub](https://github.com/Mohammed-Ben-Cheikh)

### Contributors

We welcome contributions! See our [Contributing Guide](../README.md#contributing) for details.

---

## Acknowledgments

Thanks to all users who have:

- Reported issues
- Suggested features
- Contributed code
- Improved documentation

---

## Links

- **GitHub Repository:** https://github.com/Mohammed-Ben-Cheikh/router-kit
- **npm Package:** https://www.npmjs.com/package/router-kit
- **Documentation:** [/docs/README.md](./README.md)
- **Issues:** https://github.com/Mohammed-Ben-Cheikh/router-kit/issues
- **Changelog:** You're reading it!

---

## Support

For questions and support:

- **GitHub Issues:** Report bugs or request features
- **GitHub Discussions:** Ask questions and share ideas
- **Email:** mohammed.bencheikh.dev@gmail.com

---

**Last Updated:** November 9, 2025  
**Maintained by:** Mohammed Ben Cheikh
