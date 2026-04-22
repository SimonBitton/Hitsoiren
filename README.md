# Histoiren — Frise chronologique mondiale

Site statique (un seul `index.html`) qui présente une **frise chronologique interactive** de l’histoire mondiale, avec :
- filtres par période et par type (événements / personnes),
- recherche instantanée,
- navigation latérale “Navigation rapide”,
- vue “fiche” (mode détail) via paramètres d’URL,
- génération automatique d’un **Top 150** des dates.

## Technologies utilisées

- **HTML5** (structure sémantique)
- **CSS3** (styles, responsive)
- **JavaScript (vanilla)** (interactions, filtres, navigation, génération du top)

## Structure du projet

```text
/mon-site
  ├── index.html
  ├── css/
  │    └── style.css
  ├── js/
  │    └── script.js
  ├── assets/
  │    ├── images/
  │    └── fonts/
  └── README.md
```

## Lancer le site

### Option 1 — Ouvrir directement le fichier

- Ouvre `index.html` dans ton navigateur.

### Option 2 — Servir en local (recommandé)

Depuis la racine du projet :

```bash
python3 -m http.server 8000
```

Puis ouvre `http://localhost:8000` dans ton navigateur.