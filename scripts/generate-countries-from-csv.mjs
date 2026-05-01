import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvCandidates = [
  process.argv[2],
  path.join(process.cwd(), 'C.csv'),
  path.join(__dirname, '..', 'C.csv'),
  '/Users/simonbitton/Downloads/C.csv'
].filter(Boolean);

function pickCsvPath() {
  const found = csvCandidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(`CSV introuvable. Chemins testes: ${csvCandidates.join(', ')}`);
  }
  return found;
}

const flags = {
  'Afghanistan': '🇦🇫', 'Afrique du Sud': '🇿🇦', 'Albanie': '🇦🇱', 'Algérie': '🇩🇿', 'Allemagne': '🇩🇪', 'Andorre': '🇦🇩', 'Angola': '🇦🇴', 'Antigua-et-Barbuda': '🇦🇬', 'Arabie saoudite': '🇸🇦', 'Argentine': '🇦🇷', 'Arménie': '🇦🇲', 'Australie': '🇦🇺', 'Autriche': '🇦🇹', 'Azerbaïdjan': '🇦🇿', 'Bahamas': '🇧🇸', 'Bahreïn': '🇧🇭', 'Bangladesh': '🇧🇩', 'Barbade': '🇧🇧', 'Belgique': '🇧🇪', 'Belize': '🇧🇿', 'Bénin': '🇧🇯', 'Bhoutan': '🇧🇹', 'Biélorussie': '🇧🇾', 'Birmanie': '🇲🇲', 'Bolivie': '🇧🇴', 'Bosnie-Herzégovine': '🇧🇦', 'Botswana': '🇧🇼', 'Brésil': '🇧🇷', 'Brunei': '🇧🇳', 'Bulgarie': '🇧🇬', 'Burkina Faso': '🇧🇫', 'Burundi': '🇧🇮', 'Cambodge': '🇰🇭', 'Cameroun': '🇨🇲', 'Canada': '🇨🇦', 'Cap-Vert': '🇨🇻', 'Centrafrique': '🇨🇫', 'Chili': '🇨🇱', 'Chine': '🇨🇳', 'Chypre': '🇨🇾', 'Colombie': '🇨🇴', 'Comores': '🇰🇲', 'Congo': '🇨🇬', 'Corée du Nord': '🇰🇵', 'Corée du Sud': '🇰🇷', 'Costa Rica': '🇨🇷', "Côte d'Ivoire": '🇨🇮', 'Croatie': '🇭🇷', 'Cuba': '🇨🇺', 'Danemark': '🇩🇰', 'Djibouti': '🇩🇯', 'Dominique': '🇩🇲', 'Égypte': '🇪🇬', 'Émirats arabes unis': '🇦🇪', 'Équateur': '🇪🇨', 'Érythrée': '🇪🇷', 'Espagne': '🇪🇸', 'Estonie': '🇪🇪', 'Eswatini': '🇸🇿', 'États-Unis': '🇺🇸', 'Éthiopie': '🇪🇹', 'Fidji': '🇫🇯', 'Finlande': '🇫🇮', 'France': '🇫🇷', 'Gabon': '🇬🇦', 'Gambie': '🇬🇲', 'Géorgie': '🇬🇪', 'Ghana': '🇬🇭', 'Grèce': '🇬🇷', 'Grenade': '🇬🇩', 'Guatemala': '🇬🇹', 'Guinée': '🇬🇳', 'Guinée-Bissau': '🇬🇼', 'Guinée équatoriale': '🇬🇶', 'Guyana': '🇬🇾', 'Haïti': '🇭🇹', 'Honduras': '🇭🇳', 'Hongrie': '🇭🇺', 'Inde': '🇮🇳', 'Indonésie': '🇮🇩', 'Irak': '🇮🇶', 'Iran': '🇮🇷', 'Irlande': '🇮🇪', 'Islande': '🇮🇸', 'Israël': '🇮🇱', 'Italie': '🇮🇹', 'Jamaïque': '🇯🇲', 'Japon': '🇯🇵', 'Jordanie': '🇯🇴', 'Kazakhstan': '🇰🇿', 'Kenya': '🇰🇪', 'Kirghizistan': '🇰🇬', 'Kiribati': '🇰🇮', 'Koweït': '🇰🇼', 'Laos': '🇱🇦', 'Lesotho': '🇱🇸', 'Lettonie': '🇱🇻', 'Liban': '🇱🇧', 'Liberia': '🇱🇷', 'Libye': '🇱🇾', 'Liechtenstein': '🇱🇮', 'Lituanie': '🇱🇹', 'Luxembourg': '🇱🇺', 'Macédoine du Nord': '🇲🇰', 'Madagascar': '🇲🇬', 'Malaisie': '🇲🇾', 'Malawi': '🇲🇼', 'Maldives': '🇲🇻', 'Mali': '🇲🇱', 'Malte': '🇲🇹', 'Maroc': '🇲🇦', 'Maurice': '🇲🇺', 'Mauritanie': '🇲🇷', 'Mexique': '🇲🇽', 'Micronésie': '🇫🇲', 'Moldavie': '🇲🇩', 'Monaco': '🇲🇨', 'Mongolie': '🇲🇳', 'Monténégro': '🇲🇪', 'Mozambique': '🇲🇿', 'Namibie': '🇳🇦', 'Nauru': '🇳🇷', 'Népal': '🇳🇵', 'Nicaragua': '🇳🇮', 'Niger': '🇳🇪', 'Nigeria': '🇳🇬', 'Norvège': '🇳🇴', 'Nouvelle-Zélande': '🇳🇿', 'Oman': '🇴🇲', 'Ouganda': '🇺🇬', 'Ouzbékistan': '🇺🇿', 'Pakistan': '🇵🇰', 'Palaos': '🇵🇼', 'Panama': '🇵🇦', 'Papouasie-Nouvelle-Guinée': '🇵🇬', 'Paraguay': '🇵🇾', 'Pays-Bas': '🇳🇱', 'Pérou': '🇵🇪', 'Philippines': '🇵🇭', 'Pologne': '🇵🇱', 'Portugal': '🇵🇹', 'Qatar': '🇶🇦', 'République centrafricaine': '🇨🇫', 'République dominicaine': '🇩🇴', 'République tchèque': '🇨🇿', 'Roumanie': '🇷🇴', 'Royaume-Uni': '🇬🇧', 'Russie': '🇷🇺', 'Rwanda': '🇷🇼', 'Sainte-Lucie': '🇱🇨', 'Samoa': '🇼🇸', 'Sao Tomé-et-Principe': '🇸🇹', 'Sénégal': '🇸🇳', 'Serbie': '🇷🇸', 'Seychelles': '🇸🇨', 'Sierra Leone': '🇸🇱', 'Singapour': '🇸🇬', 'Slovaquie': '🇸🇰', 'Slovénie': '🇸🇮', 'Somalie': '🇸🇴', 'Soudan': '🇸🇩', 'Soudan du Sud': '🇸🇸', 'Sri Lanka': '🇱🇰', 'Suède': '🇸🇪', 'Suisse': '🇨🇭', 'Suriname': '🇸🇷', 'Syrie': '🇸🇾', 'Tadjikistan': '🇹🇯', 'Tanzanie': '🇹🇿', 'Tchad': '🇹🇩', 'Thaïlande': '🇹🇭', 'Timor oriental': '🇹🇱', 'Togo': '🇹🇬', 'Tonga': '🇹🇴', 'Trinité-et-Tobago': '🇹🇹', 'Tunisie': '🇹🇳', 'Turkménistan': '🇹🇲', 'Turquie': '🇹🇷', 'Tuvalu': '🇹🇻', 'Ukraine': '🇺🇦', 'Uruguay': '🇺🇾', 'Vanuatu': '🇻🇺', 'Vatican': '🇻🇦', 'Venezuela': '🇻🇪', 'Viêt Nam': '🇻🇳', 'Yémen': '🇾🇪', 'Zambie': '🇿🇲', 'Zimbabwe': '🇿🇼'
};

const monthMap = {
  janvier: '01', fevrier: '02', février: '02', mars: '03', avril: '04', mai: '05', juin: '06', juillet: '07', aout: '08', août: '08', septembre: '09', octobre: '10', novembre: '11', decembre: '12', décembre: '12'
};

function normalizeMonth(month) {
  return String(month || '').trim().toLowerCase();
}

function toIsoDate(day, month, year) {
  const normalizedMonth = normalizeMonth(month);
  const monthNumber = monthMap[normalizedMonth] || '01';
  const dayNumber = Number.parseInt(day, 10);
  const safeDay = Number.isFinite(dayNumber) ? String(dayNumber).padStart(2, '0') : '01';
  return `${year}-${monthNumber}-${safeDay}`;
}

function formatDate(day, month, year) {
  const dayNumber = Number.parseInt(day, 10);
  if (!Number.isFinite(dayNumber)) return `${month} ${year}`;
  return `${dayNumber} ${month} ${year}`;
}

function toSlug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseCsvLine(row) {
  return row.split(';').map((item) => item.trim());
}

const csvPath = pickCsvPath();
const csvContent = readFileSync(csvPath, 'utf-8').replace(/^\uFEFF/, '');
const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());
const rows = lines.slice(1);
const countriesMap = {};

for (const row of rows) {
  const [countryName, day, month, year, eventName, category] = parseCsvLine(row);
  const numericYear = Number.parseInt(year, 10);
  if (!countryName || !eventName || !Number.isFinite(numericYear)) continue;

  const isoDate = toIsoDate(day, month, numericYear);
  const dateLabel = formatDate(day, month, numericYear);

  if (!countriesMap[countryName]) {
    countriesMap[countryName] = {
      id: `country-${toSlug(countryName)}`,
      name: countryName,
      flag: flags[countryName] || '🏳',
      events: []
    };
  }

  const exists = countriesMap[countryName].events.some((entry) => entry.isoDate === isoDate && entry.name === eventName);
  if (!exists) {
    countriesMap[countryName].events.push({
      date: dateLabel,
      isoDate,
      year: numericYear,
      name: eventName,
      context: '',
      category: category || 'Politique',
      source: { type: 'csv' }
    });
  }
}

for (const country of Object.values(countriesMap)) {
  country.events.sort((left, right) => left.isoDate.localeCompare(right.isoDate));
}

const countries = Object.values(countriesMap).sort((left, right) => left.name.localeCompare(right.name, 'fr'));
const outputPath = path.join(__dirname, '..', 'data', 'countries.json');
writeFileSync(outputPath, JSON.stringify(countries, null, 2), 'utf-8');

console.log(`CSV utilise: ${csvPath}`);
console.log(`Countries generated: ${countries.length}`);
