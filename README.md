# Router Kit

Un petit fournisseur de routing pour React, minimal et léger, créé par Mohammed Ben Cheikh.

Ce README documente l'utilisation publique du package `router-kit` : installation, API, exemples d'utilisation et bonnes pratiques.

## Table des matières

- Introduction
- Installation
- Concepts clés
- API publique
  - `createRouter(routes)`
  - `<RouterProvider routes={...} />`
  - `<Link to="...">` et `<NavLink to="...">`
  - Hooks : `useParams()`, `useQuery()` et `useRouter()`
- Exemple d'utilisation
- Routes et 404
- Développement
- Contribuer
- Licence

## Introduction

`router-kit` fournit un routeur côté client très simple pour les applications React. Il ne dépend que de React et d'une petite utilité `url-join` pour composer les chemins.

Le routeur :

- Résout les composants en fonction du `window.location.pathname`.
- Expose un contexte pour naviguer (`navigate`) et connaître le `path` courant.
- Prend en charge des paramètres de route de type `/:id` et l'extraction via `useParams()`.
- Fournit un 404 configurable.

## Installation

Installer en tant que dépendance (ex : npm) :

```bash
npm install router-kit
```

N.B. `react` et `react-dom` sont des peerDependencies ; installez-les dans votre projet si nécessaire.

## Important

⚠️ Tous les hooks et composants de router-kit doivent être utilisés à l'intérieur du `RouterProvider`. Assurez-vous de wrapper votre application avec le `RouterProvider` au plus haut niveau possible.

Si vous utilisez des composants ou hooks en dehors du `RouterProvider`, vous obtiendrez une erreur explicite :

```
RouterKit: Common hooks and components must be used within the RouterProvider returned by createRouter(). Wrap your app with the RouterProvider.
```

## Concepts clés

- Route : objet avec `path` (string) et `component` (JSX.Element). Les `children` sont supportés pour construire des arborescences.
- `createRouter(routes)` : normalise les chemins (supprime les slashs initiaux) et retourne la structure de routes.
- `RouterProvider` : fournit le contexte et rend le composant correspondant au `path` courant.
- `navigate(to, { replace })` : change l'URL en utilisant l'API History et met à jour le rendu.

## API publique

Voici l'API exposée par le package (extraits depuis `src/index.ts`).

- export { default as Link } from "./components/Link";
- export { default as NavLink } from "./components/NavLink";
- export { default as RouterProvider } from "./context/RouterProvider";
- export { default as createRouter } from "./core/createRouter";
- export { useParams, useQuery } from "./hooks/hook";

### createRouter(routes)

Fonction d'aide qui normalise une liste de routes. Elle supprime les slashs initiaux dans les `path` et renvoie la structure prête à être passée à `RouterProvider`.

Signature :

```ts
createRouter(routes: Route[]): Route[]
```

### RouterProvider

Composant qui prend une prop `routes` (Route[]) et rend le composant correspondant à l'URL actuelle.

Usage :

```tsx
import { RouterProvider } from "router-kit";

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "users/:id", component: <User /> },
  { path: "/404", component: <NotFound /> },
]);

function App() {
  return <RouterProvider routes={routes} />;
}
```

Le provider expose via le contexte :

- `path` : le pathname courant (ex: `/users/42`)
- `fullPathWithParams` : le chemin défini dans la route incluant les paramètres (ex: `/users/:id`)
- `navigate(to: string, options?: { replace?: boolean })`

### Link et NavLink

`<Link to="...">` : rend un lien <a> qui empêche le comportement par défaut et appelle `navigate(to)`.

`<NavLink to="..." activeClassName="...">` : comme `Link` mais ajoute `activeClassName` quand la route est active (comparaison stricte `path === to`).

Exemple :

```tsx
<Link to="/about">À propos</Link>
<NavLink to="/">Accueil</NavLink>
```

### Hooks

- `useRouter()` : hook interne retournant le contexte `{ path, fullPathWithParams, navigate }`. Lance une erreur si utilisé hors du provider.
- `useParams()` : renvoie un objet clé/valeur pour les segments paramétrés de la route (ex: `{ id: "42" }`). Se base sur `fullPathWithParams` et `path`.
- `useQuery()` : parse `window.location.search` et renvoie un objet `{ [key]: value }`.
- `useLocation()` : renvoie un objet avec les informations de localisation courante : `{ pathname, search, hash, state }`. Utile pour accéder aux détails de l'URL actuelle.

## Exemple complet

```tsx
import React from "react";
import { createRouter, RouterProvider } from "router-kit";

const Home = () => <div>Accueil</div>;
const About = () => <div>À propos</div>;

const routes = createRouter([
  { path: "/", component: <Home /> },
  { path: "about", component: <About /> },
  { path: "/404", component: <div>Not Found</div> },
]);

// Les composants de navigation doivent être à l'intérieur du RouterProvider
function App() {
  return <RouterProvider routes={routes} />;
}

export default App;
```

## Routes et 404

Le provider recherche les routes et compare le `fullPath` de chaque route avec le pathname courant en remplaçant dynamiquement les segments commençant par `:` (ex: `/:id`).

Pour afficher une page 404 personnalisée, ajoutez une route avec `path: "/404"` et `component` : elle sera utilisée par défaut quand aucune route ne matche.

## Développement

Scripts disponibles (définis dans `package.json`) :

- `npm run build` : compile TypeScript vers `dist/` (utilise `tsc`).
- `npm run typecheck` : vérifie les types sans émettre de fichiers.
- `npm run clean` : supprime `dist`.

Pour développer localement :

1. Cloner le dépôt et installer les dépendances.
2. Lancer `npm run build:watch` si vous modifiez le package et voulez recompiler automatiquement.

## Contribuer

Les contributions sont bienvenues. Pour des petites améliorations :

1. Ouvrir une issue décrivant le problème ou la fonctionnalité.
2. Soumettre une PR avec un seul changement logique par PR.

Propositions d'améliorations possibles :

- Support d'URL basées sur hash (/#/path).
- Support plus riche du matching (wildcards, regex, exact/partial).
- Tests unitaires et CI.

## Licence

MIT — voir le fichier `LICENSE`.

---
