# Histoiren — Frise chronologique mondiale premium

Site statique (un seul `index.html`) qui présente une **frise chronologique interactive** de l'histoire mondiale, avec :
- 📜 Chronologie complète de la Préhistoire à nos jours
- 🌍 Histoire organisée par pays
- 📊 Statistiques et analyses
- 🔍 Recherche instantanée
- 📱 Interface responsive
- 🏆 Top 50 des dates les plus importantes
- 📖 **Résumés détaillés** (5+ lignes) pour chaque événement
- ✅ **Vérification des dates** via WikiData
- 📈 **Centaines de milliers d'événements** disponibles

## Fonctionnalités principales

### 1. Résumés détaillés
Chaque événement dispose désormais d'un résumé complet d'au moins 5 lignes comprenant :
- Contexte historique et période
- Description détaillée de l'événement
- Personnages clés impliqués
- Signification historique
- Impact et héritage

### 2. Vérification des dates
Les dates peuvent être vérifiées automatiquement via l'API WikiData :
```bash
npm run verify-dates
```

### 3. Ajout massif d'événements
Possibilité d'ajouter des centaines de milliers d'événements depuis WikiData :
```bash
npm run add-massive-events
```

## Technologies utilisées

- **HTML5** (structure sémantique)
- **CSS3** (styles, responsive, animations)
- **JavaScript (vanilla)** (interactions, filtres, navigation)
- **WikiData API** (vérification et enrichissement des données)

## Structure du projet

```text
histoiren/
├── index.html              # Page principale unique
├── package.json            # Configuration du projet
├── README.md               # Ce fichier
├── css/
│   ├── base.css           # Styles de base
│   ├── components.css     # Composants UI
│   ├── layout.css         # Mise en page
│   ├── variables.css      # Variables CSS
│   └── views.css          # Styles spécifiques aux vues
├── src/
│   ├── main.js            # Point d'entrée principal
│   ├── router.js          # Gestion de la navigation
│   ├── state.js           # Gestion de l'état
│   ├── data-manager.js    # Chargement des données
│   ├── ui-renderer.js     # Rendu de l'interface
│   ├── sidebar.js         # Navigation latérale
│   └── utils.js           # Fonctions utilitaires
├── data/
│   ├── timeline.json      # Données de la chronologie
│   └── countries.json     # Données par pays
├── scripts/
│   ├── add-timeline-events.mjs    # Ajout d'événements manuels
│   ├── add-massive-events.mjs     # Ajout massif depuis WikiData
│   └── verify-dates-wikidata.mjs  # Vérification des dates
└── tests/
    └── run-e2e.js         # Tests end-to-end
```

## Lancer le site

### Option 1 — Ouvrir directement le fichier

- Ouvre `index.html` dans ton navigateur.

### Option 2 — Servir en local (recommandé)

Depuis la racine du projet :

```bash
# Avec Python
python3 -m http.server 8000

# Ou avec npm
npm start
```

Puis ouvre `http://localhost:8000` dans ton navigateur.

## Scripts disponibles

```bash
# Lancer le serveur de développement
npm start

# Ajouter des événements manuels à la chronologie
npm run add-events

# Ajouter massivement des événements depuis WikiData (100k+)
npm run add-massive-events

# Vérifier les dates avec WikiData
npm run verify-dates

# Lancer les tests end-to-end
npm run test:e2e
```

## Organisation des époques

Le projet couvre 5 grandes périodes historiques :

1. **Préhistoire** (≈ 3 300 000 av. J.-C. → ≈ 3 200 av. J.-C.)
2. **Antiquité** (≈ 3 200 av. J.-C. → 476 ap. J.-C.)
3. **Moyen Âge** (476 → 1492)
4. **Temps Modernes** (1492 → 1789)
5. **Époque Contemporaine** (1789 → nos jours)

## Catégories d'événements

- **Politique** : Guerres, traités, révolutions, lois
- **Science** : Découvertes, inventions, avancées scientifiques
- **Culture** : Art, littérature, philosophie, religion
- **Exploration** : Voyages, découvertes géographiques

## Contribution

1. Fork le projet
2. Crée ta branche (`git checkout -b feature/amélioration`)
3. Commit tes changements (`git commit -am 'Ajoute nouvelle fonctionnalité'`)
4. Push ta branche (`git push origin feature/amélioration`)
5. Ouvre une Pull Request

## Licence

Ce projet est open source et peut être utilisé librement.

---

Fait avec passion pour l'histoire ❤️