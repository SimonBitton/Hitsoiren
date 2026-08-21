# Audit de sécurité — 21 août 2026

## Périmètre

Histoiren est une application statique. Il n’y a ni authentification, ni session, ni cookie applicatif, ni OAuth, ni base de données, ni rôle administrateur, ni route d’écriture, ni upload, ni prix ou logique de paiement. Les scénarios IDOR, élévation de privilèges, reset de mot de passe, RLS, SSRF serveur et accès inter-utilisateurs sont donc non applicables dans l’architecture actuelle.

Surfaces auditées : HTML et modules JavaScript, rendu des deux jeux JSON, URL externes, API Wikipédia, stockage local, dépendances npm, historique Git, déploiement Vercel et serveur local.

## Score après correction : 94/100

| Sévérité | Confirmé avant correction | Restant |
| --- | ---: | ---: |
| Critical | 0 | 0 |
| High | 1 | 0 |
| Medium | 2 | 0 |
| Low | 1 | 0 |
| Informational | 3 | 2 |

## Vulnérabilités corrigées

### High · P1 — JavaScript tiers non maîtrisé

- Fichier : `index.html`
- Cause : un script d’analytics distant s’exécutait avec les mêmes droits que l’application, sans SRI ni isolation.
- Impact : une compromission du fournisseur pouvait lire et modifier toute la page et le stockage local.
- Exploitation : remplacement du script distant par un contenu malveillant, puis exécution automatique chez chaque visiteur.
- Correction : suppression du script et CSP `script-src 'self'`.

### Medium · P2 — Application intégrable dans une iframe

- Fichier : `vercel.json`
- Cause : aucune protection anti-framing.
- Impact : clickjacking sur les interactions de navigation et de quiz.
- Exploitation : superposition de l’interface transparente sur une page hostile.
- Correction : `frame-ancestors 'none'` et `X-Frame-Options: DENY`.

### Medium · P2 — En-têtes de sécurité absents

- Fichier : `vercel.json`
- Cause : seule la réécriture SPA était configurée.
- Impact : protections navigateur insuffisantes face aux injections, au sniffing MIME, aux fuites de référent et aux permissions inutiles.
- Correction : CSP, HSTS, `nosniff`, Referrer-Policy, Permissions-Policy, COOP, CORP et désactivation de l’ancien filtre XSS.

### Low · P3 — Données et recherches sans bornes explicites

- Fichiers : `src/data-manager.js`, `src/main.js`
- Cause : parsing JSON direct et recherche sans longueur maximale.
- Impact : blocage du thread principal en cas de ressource locale anormalement volumineuse.
- Correction : plafond de 5 millions de caractères, limites d’entrées, validation structurelle et champs bornés ; recherche limitée à 120 caractères.

## Hardening effectué

- Échappement systématique des données de chronologie, d’époque et de pays utilisées dans les templates HTML.
- Filtrage HTTP(S) des liens externes, refus des URL comportant des identifiants et validation des identifiants Wikidata.
- Validation de la vue persistée et gestion défensive de `localStorage`.
- Déduplication des identifiants d’événements avant exposition dans le DOM.
- Serveur local sur liste blanche de méthodes, protégé contre la traversée de chemin et les fichiers excessifs.
- Suppression des scripts npm cassés et de Playwright, devenu inutilisé ; ESLint est la seule dépendance de développement.
- Recherche de secrets dans le dépôt courant et l’historique Git : aucun secret privé, fichier `.env`, clé, certificat ou variable publique sensible trouvé.
- `npm audit` : 0 vulnérabilité connue.

## Risques résiduels

### Informational · P3 — Styles inline autorisés

La CSP conserve `style-src 'unsafe-inline'` car les positions de la frise et de l’onboarding sont calculées dynamiquement. `script-src` reste strict, les données placées en styles sont numériques ou statiques, et aucun contenu utilisateur distant n’y est injecté. Une migration vers des classes/CSSOM pré-enregistrées permettrait de retirer cette exception.

### Informational · P3 — Dépendances de contenu externes

Les fiches appellent l’API Wikipédia et peuvent afficher des images Wikimedia ; les drapeaux proviennent du CDN jsDelivr. La CSP limite précisément ces origines. Une mise en cache locale supprimerait la disponibilité dépendante de ces services, au prix d’un dépôt beaucoup plus lourd.

## Tests négatifs

- Route inconnue : ramenée vers une vue valide par liste blanche ; aucune ressource privée n’existe.
- Protocole `javascript:`/`data:` et URL avec identifiants : refusés par le filtre d’URL.
- HTML malveillant dans une valeur : échappé avant rendu ; les scripts non locaux sont en plus bloqués par CSP.
- Payload JSON excessif, structure invalide, époque inconnue ou ID pays dupliqué : chargement refusé.
- Méthodes locales autres que GET/HEAD : réponse 405.
- Traversée de chemin sur le serveur local : réponse 403/404.
- Accès utilisateur A/B, non connecté et admin : non applicable, aucune donnée privée ou identité n’existe.
