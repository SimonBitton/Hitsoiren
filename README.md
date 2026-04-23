# Frise Chronologique Mondiale

Une frise chronologique interactive de l'histoire mondiale, de la Préhistoire à l'ère numérique.

## 🌟 Fonctionnalités

- **5 grandes périodes historiques** : Préhistoire, Antiquité, Moyen Âge, Temps modernes, Époque contemporaine
- **Top 150 des événements indispensables** : Les dates clés à connaître
- **Navigation par pays** : 15 pays avec leurs événements majeurs (France, Royaume-Uni, Allemagne, Chine, Japon, USA, Égypte, Italie, Espagne, Russie, Inde, Brésil, Mexique, Afrique du Sud)
- **Recherche full-text** : Recherchez par mot-clé, date, personnage ou événement
- **Filtres intelligents** : Par période, par type (événements/personnages), par catégorie
- **Fiches détaillées** : Cliquez sur n'importe quel événement pour voir une fiche complète
- **Design responsive** : Compatible desktop, tablette et mobile

## 📁 Structure du projet

```
Histoiren/
├── index.html          # Page principale
├── style.css           # Feuilles de styles
├── script.js           # Logique de l'application
├── data/
│   └── countries.json  # Données des événements par pays
├── utils/
│   └── helpers.js      # Fonctions utilitaires
├── components/         # Dossier pour futurs composants
└── scripts/
    └── generate-countries.mjs  # Script de génération
```

## 🚀 Utilisation

1. Ouvrez `index.html` dans un navigateur web
2. Naviguez entre les périodes via le menu supérieur
3. Cliquez sur un événement pour voir les détails
4. Utilisez la barre de recherche pour trouver un sujet
5. Explorez les pays via la sidebar droite

## 🏷️ Catégories d'événements

- 🔵 **Politique** : Guerres, révolutions, traités, gouvernements
- 🟢 **Science** : Découvertes, inventions, avancées technologiques
- 🟣 **Culture** : Art, religion, philosophie, littérature
- 🟡 **Exploration** : Voyages, découvertes géographiques, migrations

## 📊 Statistiques

- **700+ dates** référencées
- **700+ événements** documentés
- **300+ personnages** historiques
- **15 pays** avec événements dédiés
- **5 périodes** historiques couvertes
- **3,3 millions d'années** d'histoire

## 🛠️ Développement

### Architecture

Le projet utilise une architecture simple :
- **HTML sémantique** pour la structure
- **CSS moderne** avec variables CSS et Flexbox/Grid
- **JavaScript vanilla** sans dépendances externes

### Bonnes pratiques

- Code commenté et documenté
- Séparation des préoccupations (data, utils, main)
- Accessibilité (ARIA, navigation clavier)
- Performance (chargement différé, requêtes minimales)

## 📝 Sources

Les données historiques sont basées sur :
- Consensus académique historique
- Références Wikidata pour les dates et faits
- Sources primaires et secondaires vérifiées

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amélioration`)
3. Committez les changements (`git commit -m 'Ajout fonctionnalité'`)
4. Push (`git push origin feature/amélioration`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est open source et peut être utilisé librement à des fins éducatives.

---

**Développé avec ❤️ pour l'amour de l'histoire**