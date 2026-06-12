/* ══════════════════════════════════════════════════
   CONTINENTS — métadonnées + classement des pays
══════════════════════════════════════════════════ */

export const CONTINENTS = [
  { key: 'amerique-nord', label: 'Amérique du Nord', emoji: '🌎', color: '#2563eb' },
  { key: 'amerique-sud',  label: 'Amérique du Sud',  emoji: '🌎', color: '#0d9488' },
  { key: 'europe',        label: 'Europe',           emoji: '🌍', color: '#7c3aed' },
  { key: 'afrique',       label: 'Afrique',          emoji: '🌍', color: '#d97706' },
  { key: 'asie',          label: 'Asie',             emoji: '🌏', color: '#dc2626' },
  { key: 'oceanie',       label: 'Océanie',          emoji: '🌏', color: '#059669' }
];

const MEMBERSHIP = {
  'amerique-nord': [
    'Antigua-et-Barbuda', 'Bahamas', 'Barbade', 'Belize', 'Canada', 'Costa Rica', 'Cuba',
    'Dominique', 'États-Unis', 'Grenade', 'Guatemala', 'Haïti', 'Honduras', 'Jamaïque',
    'Mexique', 'Nicaragua', 'Panama', 'République dominicaine', 'Saint-Christophe-et-Niévès',
    'Sainte-Lucie', 'Saint-Vincent-et-les-Grenadines', 'Trinité-et-Tobago'
  ],
  'amerique-sud': [
    'Argentine', 'Bolivie', 'Brésil', 'Chili', 'Colombie', 'Équateur', 'Guyana', 'Paraguay',
    'Pérou', 'Suriname', 'Uruguay', 'Venezuela'
  ],
  europe: [
    'Albanie', 'Allemagne', 'Andorre', 'Autriche', 'Belgique', 'Biélorussie', 'Bosnie-Herzégovine',
    'Bulgarie', 'Chypre', 'Croatie', 'Danemark', 'Espagne', 'Estonie', 'Finlande', 'France', 'Grèce',
    'Hongrie', 'Irlande', 'Islande', 'Italie', 'Lettonie', 'Liechtenstein', 'Lituanie', 'Luxembourg',
    'Macédoine du Nord', 'Malte', 'Moldavie', 'Monaco', 'Monténégro', 'Norvège', 'Pays-Bas', 'Pologne',
    'Portugal', 'République tchèque', 'Roumanie', 'Royaume-Uni', 'Russie', 'Serbie', 'Slovaquie',
    'Slovénie', 'Suède', 'Suisse', 'Ukraine', 'Vatican'
  ],
  afrique: [
    'Afrique du Sud', 'Algérie', 'Angola', 'Bénin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroun',
    'Cap-Vert', 'Centrafrique', 'Comores', 'Congo', "Côte d'Ivoire", 'Djibouti', 'Égypte', 'Érythrée',
    'Eswatini', 'Éthiopie', 'Gabon', 'Gambie', 'Ghana', 'Guinée', 'Guinée équatoriale', 'Guinée-Bissau',
    'Kenya', 'Lesotho', 'Liberia', 'Libye', 'Madagascar', 'Malawi', 'Mali', 'Maroc', 'Maurice',
    'Mauritanie', 'Mozambique', 'Namibie', 'Niger', 'Nigeria', 'Ouganda', 'République centrafricaine',
    'Rwanda', 'Sao Tomé-et-Principe', 'Sénégal', 'Seychelles', 'Sierra Leone', 'Somalie', 'Soudan',
    'Soudan du Sud', 'Tanzanie', 'Tchad', 'Togo', 'Tunisie', 'Zambie', 'Zimbabwe'
  ],
  asie: [
    'Afghanistan', 'Arabie saoudite', 'Arménie', 'Azerbaïdjan', 'Bahreïn', 'Bangladesh', 'Bhoutan',
    'Birmanie', 'Brunei', 'Cambodge', 'Chine', 'Corée du Nord', 'Corée du Sud', 'Émirats arabes unis',
    'Géorgie', 'Inde', 'Indonésie', 'Irak', 'Iran', 'Israël', 'Japon', 'Jordanie', 'Kazakhstan',
    'Kirghizistan', 'Koweït', 'Laos', 'Liban', 'Malaisie', 'Maldives', 'Mongolie', 'Népal', 'Oman',
    'Ouzbékistan', 'Pakistan', 'Philippines', 'Qatar', 'Singapour', 'Sri Lanka', 'Syrie', 'Tadjikistan',
    'Thaïlande', 'Timor oriental', 'Turkménistan', 'Turquie', 'Viêt Nam', 'Yémen'
  ],
  oceanie: [
    'Australie', 'Fidji', 'Îles Cook', 'Îles Marshall', 'Îles Salomon', 'Kiribati', 'Micronésie',
    'Nauru', 'Niue', 'Nouvelle-Zélande', 'Palaos', 'Papouasie-Nouvelle-Guinée', 'Samoa', 'Tonga',
    'Tuvalu', 'Vanuatu'
  ]
};

const COUNTRY_TO_CONTINENT = new Map();
for (const [continent, countries] of Object.entries(MEMBERSHIP)) {
  countries.forEach((name) => COUNTRY_TO_CONTINENT.set(name, continent));
}

export function getContinentOf(countryName) {
  return COUNTRY_TO_CONTINENT.get(countryName) || null;
}

export function getContinentMeta(key) {
  return CONTINENTS.find((c) => c.key === key) || null;
}
