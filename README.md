# Histoiren

Histoiren est un atlas temporel francophone : frise mondiale zoomable, index par époque, 194 chronologies nationales, fiches enrichies et atelier de mémorisation.

## Expérience

- Accueil éditorial avec une chronosphère WebGL en vraie 3D, pilotée par le pointeur et mise en pause hors écran.
- Frise à échelle logarithmique, zoomable au clavier, aux boutons, au geste et à la molette modifiée.
- Index filtrable par époque, thème, texte, date ou personnage.
- Carte des continents et chronologies par pays.
- Quiz et flashcards générés depuis le fonds local.
- Thèmes clair et sombre, navigation mobile dédiée et prise en charge de `prefers-reduced-motion`.

## Stack

Le produit reste volontairement léger : HTML sémantique, CSS, modules JavaScript natifs et WebGL, sans framework ni code serveur applicatif. Les données sont des fichiers JSON versionnés. L’enrichissement des fiches passe uniquement par l’API publique de Wikipédia.

Il n’existe actuellement ni authentification, ni compte, ni base de données distante, ni API privée, ni upload.

## Lancer le projet

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm start
```

Le serveur local écoute par défaut sur `http://127.0.0.1:8000`. Les variables `PORT` et `HOST` permettent de modifier cette adresse. Le serveur applique localement les mêmes protections essentielles que le déploiement.

## Vérifier le projet

```bash
npm run build
```

Cette commande exécute ESLint puis les tests Node : analyse des dates historiques, échappement HTML, filtrage des URL, politique de scripts, en-têtes de sécurité et bornes des jeux de données.

Commandes séparées :

```bash
npm run lint
npm test
npm audit
```

## Structure

```text
index.html               structure des cinq vues et de la fiche détail
css/editorial.css        direction artistique et responsive final
css/*.css                styles fonctionnels historiques conservés
src/main.js              initialisation et interactions globales
src/chronosphere.js      scène WebGL 3D performante
src/data-manager.js      chargement borné et validation des données
src/frise.js             frise logarithmique interactive
src/ui-renderer.js       rendu des index, pays et statistiques
src/detail-view.js       fiches, relations et enrichissement Wikipédia
src/quiz.js              quiz et flashcards
data/*.json              fonds historique local
tests/*.mjs              tests fonctionnels et de sécurité
vercel.json              réécritures SPA et en-têtes de production
```

## Sécurité

Le JavaScript tiers a été supprimé. La production n’autorise que les scripts du même origin via CSP. Les contenus injectés sont échappés, les URL externes sont limitées à HTTP(S), les réponses JSON sont bornées et validées, les identifiants sont dédupliqués et les routes restent sur liste blanche.

Le détail de l’audit et les limites du périmètre figurent dans [SECURITY.md](SECURITY.md).

## Accessibilité et performance

Les événements sont de vrais boutons, les dialogues piègent et restaurent le focus, les états actifs sont exposés aux technologies d’assistance et toutes les fonctions essentielles sont disponibles sans pointeur. La 3D limite le ratio de pixels, utilise un seul buffer GPU, suspend sa boucle hors écran et se fige en mode mouvement réduit.

Les visuels Wikipédia et les drapeaux sont chargés à la demande. Le favicon a été dimensionné pour le Web et les fichiers JSON bénéficient d’un cache avec revalidation.
