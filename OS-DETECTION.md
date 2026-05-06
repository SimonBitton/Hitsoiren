# OS Detection & Cross-Platform Rendering System

## 📋 Vue d'ensemble

Ce système détecte automatiquement le système d'exploitation du client (macOS, Windows, Linux) et adapte le rendu pour assurer une expérience cohérente et native sur toutes les plateformes.

## 🎯 Fonctionnalités

### Détection d'OS
- ✅ **Fiable** : utilise `navigator.userAgent` + `navigator.platform`
- ✅ **Rapide** : détection au `DOMContentLoaded`
- ✅ **Compatible** : Chrome, Firefox, Safari, Edge, etc.
- ✅ **Sans FOUC** : styles appliqués avant le rendu

### Adaptations automatiques
- 🔤 **Polices** : San Francisco (macOS), Segoe UI (Windows), Ubuntu (Linux)
- 🎨 **Emojis** : Twemoji sur Windows pour cohérence
- 📏 **Espacement** : ajustements typographiques par OS
- 🖱️ **Scrollbars** : rendu natif personnalisé
- ⌨️ **Raccourcis clavier** : Cmd sur macOS, Ctrl sur Windows

## 📁 Structure des fichiers

```
histoiren/
├── src/
│   └── os-detect.js          # Script principal de détection
├── css/
│   └── os-specific.css       # Styles adaptés par OS
└── index.html                 # Intégration dans le HTML
```

## 🚀 Utilisation

### Installation automatique
Le système est intégré dans le HTML et fonctionne automatiquement :

```html
<!-- Dans le <head> -->
<link rel="stylesheet" href="css/os-specific.css">
<script src="src/os-detect.js" type="module"></script>
```

### Dans le JavaScript
```javascript
import { 
  detectOS, 
  getKeyModifier, 
  isMac, 
  isWindows, 
  isLinux 
} from './os-detect.js';

// Déterminer l'OS
const os = detectOS(); // 'mac' | 'windows' | 'linux' | 'unknown'

// Utiliser les helpers
if (isMac()) {
  console.log('L\'utilisateur est sur macOS');
}

// Afficher le bon modificateur de clavier
const modifier = getKeyModifier(); // 'Cmd' | 'Ctrl'
console.log(`Appuyez sur ${modifier}+K`);
```

### Dans le HTML
```html
<!-- Éléments visibles uniquement sur macOS -->
<div class="mac-only">Ceci n'apparaît que sur macOS</div>

<!-- Éléments visibles uniquement sur Windows -->
<div class="windows-only">Ceci n'apparaît que sur Windows</div>

<!-- Éléments visibles uniquement sur Linux -->
<div class="linux-only">Ceci n'apparaît que sur Linux</div>
```

### Dans le CSS
```css
/* Cibler macOS */
html[data-os="mac"],
body.os-mac {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Cibler Windows */
html[data-os="windows"],
body.os-windows {
  font-family: "Segoe UI", sans-serif;
}

/* Cibler Linux */
html[data-os="linux"],
body.os-linux {
  font-family: "Ubuntu", "Roboto", sans-serif;
}
```

## 🔍 Points techniques clés

### Détection d'OS
```javascript
// Patterns utilisés pour détection fiable
- macOS : /mac|iphone|ipad|ipod/ dans platform + /macintosh/ dans UA
- Windows : /win/ dans platform + /windows/ dans UA
- Linux : /linux/ dans platform + /linux/ dans UA
```

### Classes CSS appliquées
- `os-mac` : classe sur body pour macOS
- `os-windows` : classe sur body pour Windows
- `os-linux` : classe sur body pour Linux
- `data-os` : attribut sur html pour plus de spécificité

### Fonts-stack recommandés

**macOS (préféré)**
```css
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

**Windows (préféré)**
```css
"Segoe UI", "Helvetica Neue", Roboto, sans-serif
```

**Linux (recommandé)**
```css
"Ubuntu", "Roboto", "Noto Sans", sans-serif
```

### Twemoji pour Windows
Sur Windows, les emojis sont automatiquement convertis en SVG via la librairie Twemoji pour assurer une cohérence visuelle. Cela se fait silencieusement :

```javascript
// Automatique sur Windows
if (detectedOS === 'windows') {
  loadTwemojiForWindows();
}
```

Les images Twemoji sont servies depuis CDN (jsDelivr) : pas d'installation locale requise.

## 🧪 Tests & Validation

### Sur macOS
```bash
# Ouvrir dans Safari/Chrome
open index.html
# Vérifier dans DevTools : html[data-os="mac"]
```

### Sur Windows
```cmd
# Ouvrir dans Edge/Chrome
start index.html
# Vérifier dans DevTools : html[data-os="windows"]
# Twemoji doit charger automatiquement
```

### Simulation sur un seul OS
**Via DevTools (Chrome/Edge/Firefox)**

1. Ouvrir DevTools (F12)
2. Aller à `More tools > Network conditions`
3. Changer l'User Agent pour simuler un autre OS

**Exemple d'User Agents**
```
macOS:   Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
Windows: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Linux:   Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36
```

## 📊 Checklist d'implémentation

- [x] Script de détection d'OS (`os-detect.js`)
- [x] CSS adapté par OS (`os-specific.css`)
- [x] Intégration dans HTML (`index.html`)
- [x] Helpers JavaScript exportés
- [x] Support Twemoji pour Windows
- [x] Raccourcis clavier adaptés (Cmd vs Ctrl)
- [x] Classes CSS utilitaires (.mac-only, .windows-only, etc.)
- [x] Pas de FOUC (Flash of Unstyled Content)
- [x] SEO-safe (pas de Javascript critique)
- [x] Compatible multinavigateurs

## 🎨 Customisation

### Ajouter des adaptations spécifiques

**CSS**
```css
html[data-os="windows"] .my-element {
  /* Adaptation spécifique Windows */
}
```

**JavaScript**
```javascript
import { isWindows } from './os-detect.js';

if (isWindows()) {
  // Logique spécifique Windows
  document.body.style.backgroundColor = '#f0f0f0';
}
```

### Désactiver Twemoji sur Windows
Si vous ne souhaitez pas utiliser Twemoji, commentez la ligne dans `os-detect.js` :

```javascript
// if (detectedOS === 'windows') {
//   loadTwemojiForWindows();
// }
```

## 🐛 Troubleshooting

### Les emojis ne s'affichent pas correctement sur Windows
- Vérifier que le CDN Twemoji est accessible (jsDelivr)
- Vérifier dans DevTools que `twemoji.parse()` a été appelé
- Vérifier les permissions CORS

### Les styles CSS ne s'appliquent pas
- Vérifier que `os-specific.css` est bien chargé
- Vérifier dans DevTools que `html[data-os="..."]` ou `body.os-...` est présent
- Vérifier l'ordre des CSS (os-specific.css doit être après les autres)

### Raccourcis clavier ne fonctionnent pas sur macOS
- Vérifier que l'événement `keydown` capture bien `event.metaKey` pour Cmd
- Certains navigateurs ne supportent pas Cmd+K (préférer Cmd+/)

### FOUC (Flash of Unstyled Content)
- Assurez-vous que `os-detect.js` se charge **avant** le rendu du contenu
- Le script doit être dans le `<head>` avec `type="module"`

## 📝 Notes importantes

1. **Performance** : Détection < 1ms, Twemoji chargement asynchrone
2. **Accessibilité** : Aucun impact sur l'accessibilité, clavier natif supporté
3. **SEO** : Pas d'impact négatif, détection côté client uniquement
4. **Fallbacks** : Si la détection échoue, l'OS est 'unknown' (pas d'erreur)

## 🔗 Ressources

- **Twemoji** : https://github.com/twitter/twemoji
- **Navigator API** : https://developer.mozilla.org/en-US/docs/Web/API/Navigator
- **User Agent** : https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent
- **CSS Data Attributes** : https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes

## 📦 Version

- Version 1.0
- Dernière mise à jour : Mai 2026
- Compatible avec : Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
