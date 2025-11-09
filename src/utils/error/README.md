# Router-Kit Error System

## Overview

Router-Kit utilise un système d'erreurs standardisé et personnalisé pour fournir des messages d'erreur clairs et cohérents avec un contexte détaillé.

## Classe RouterKitError

Toutes les erreurs de router-kit héritent de la classe `RouterKitError` qui étend l'objet `Error` natif.

### Propriétés

- `code`: `RouterErrorCode` - Code d'erreur standardisé
- `message`: `string` - Message d'erreur descriptif
- `context`: `Record<string, any>` - Contexte additionnel (optionnel)
- `name`: `"RouterKitError"` - Nom de l'erreur

## Codes d'erreur disponibles

```typescript
enum RouterErrorCode {
  ROUTER_NOT_INITIALIZED    // Router context non initialisé
  PARAM_NOT_DEFINED         // Paramètre de route non défini
  PARAM_INVALID_TYPE        // Type de paramètre invalide
  PARAM_EMPTY_STRING        // Paramètre est une chaîne vide
  COMPONENT_NOT_FOUND       // Composant dynamique introuvable
  NAVIGATION_ABORTED        // Navigation interrompue
  INVALID_ROUTE             // Route invalide
}
```

## Utilisation

### Option 1: Utiliser RouterErrors (Recommandé)

```typescript
import { RouterErrors } from "router-kit";

// Exemple: Paramètre non défini
if (variation == null) {
  RouterErrors.paramNotDefined("variationParam", Object.keys(params));
}

// Exemple: Type invalide
if (typeof variation !== "string") {
  RouterErrors.paramInvalidType("variationParam", "string", typeof variation);
}

// Exemple: Composant introuvable
if (!component) {
  RouterErrors.componentNotFound(variation, Object.keys(components));
}
```

### Option 2: Créer une erreur personnalisée

```typescript
import { createRouterError, RouterErrorCode } from "router-kit";

const error = createRouterError(
  RouterErrorCode.PARAM_NOT_DEFINED,
  "Custom error message",
  { additionalContext: "value" }
);

throw error;
```

### Option 3: Utiliser throwRouterError

```typescript
import { throwRouterError, RouterErrorCode } from "router-kit";

throwRouterError(RouterErrorCode.INVALID_ROUTE, "This route is invalid", {
  path: "/invalid",
  reason: "Missing component",
});
```

## Affichage console

Les erreurs sont automatiquement affichées dans la console avec un style amélioré :

- **Browser**: Messages stylés avec couleurs et badges
- **Node.js**: Messages formatés en texte simple

### Format console (Browser)

```
[router-kit] PARAM_NOT_DEFINED
Parameter "variationParam" is not defined in route params
Context: {
  paramName: "variationParam",
  availableParams: ["id", "slug"]
}
```

## Gestion des erreurs

### Catch d'erreurs

```typescript
import { RouterKitError, RouterErrorCode } from "router-kit";

try {
  useDynamicComponents(components, "variant");
} catch (error) {
  if (error instanceof RouterKitError) {
    console.log("Error code:", error.code);
    console.log("Context:", error.context);

    // Gestion spécifique par code
    switch (error.code) {
      case RouterErrorCode.PARAM_NOT_DEFINED:
        // Gérer paramètre manquant
        break;
      case RouterErrorCode.COMPONENT_NOT_FOUND:
        // Afficher composant de fallback
        break;
    }
  }
}
```

## Erreurs pré-configurées

### RouterErrors.routerNotInitialized()

Levée quand un hook/composant est utilisé en dehors du RouterProvider.

### RouterErrors.paramNotDefined(paramName, availableParams?)

Levée quand un paramètre de route requis n'existe pas.

### RouterErrors.paramInvalidType(paramName, expectedType, receivedType)

Levée quand le type d'un paramètre est incorrect.

### RouterErrors.paramEmptyString(paramName)

Levée quand un paramètre est une chaîne vide.

### RouterErrors.componentNotFound(variation, availableVariations)

Levée quand un composant dynamique n'est pas trouvé.

### RouterErrors.navigationAborted(reason)

Levée quand une navigation est interrompue.

### RouterErrors.invalidRoute(path, reason?)

Levée quand une route est invalide.

## Bonnes pratiques

1. **Toujours inclure du contexte** : Ajoutez des informations pertinentes au contexte
2. **Messages descriptifs** : Les messages doivent être clairs et actionnables
3. **Utiliser les erreurs pré-configurées** : Préférez `RouterErrors.*` pour la cohérence
4. **Documenter les codes d'erreur** : Ajoutez de nouveaux codes au enum quand nécessaire
5. **Catch approprié** : Gérez les erreurs RouterKit spécifiquement dans votre code

## Extension

Pour ajouter un nouveau type d'erreur :

1. Ajoutez un code dans `RouterErrorCode` enum
2. Créez une fonction helper dans `RouterErrors`
3. Documentez le nouveau code d'erreur
4. Exportez depuis `index.ts` si nécessaire

```typescript
// Dans errors.ts
export enum RouterErrorCode {
  // ... codes existants
  NEW_ERROR_CODE = "NEW_ERROR_CODE",
}

export const RouterErrors = {
  // ... erreurs existantes
  newError: (param: string) =>
    throwRouterError(
      RouterErrorCode.NEW_ERROR_CODE,
      `Description de l'erreur avec ${param}`,
      { param }
    ),
};
```
