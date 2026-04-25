#!/usr/bin/env node
/**
 * Applies the CSV event data directly to countries.json
 * The CSV data is embedded here since the file was provided as a document attachment.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COUNTRIES_FILE = path.join(__dirname, '../data/countries.json');

// Name mapping: CSV name → JSON country name
const NAME_MAP = {
  'Centrafrique': 'République centrafricaine',
  'République tchèque': 'Tchéquie',
  'Chine': 'République populaire de Chine',
  'Pays-Bas': 'Royaume des Pays-Bas',
  'Viêt Nam': 'Vietnam',
  'Micronésie': 'États fédérés de Micronésie',
  'Congo': 'République du Congo',
};

// CSV data parsed into structured format
// Format: { countryName: [ {date, name, category}, ... ] }
const CSV_EVENTS = {
  "Afghanistan": [
    {date:"1905",name:"Création de l'État moderne de Afghanistan",category:"Science"},
    {date:"1910",name:"Indépendance de Afghanistan",category:"Exploration"},
    {date:"1915",name:"Adoption de la constitution de Afghanistan",category:"Culture"},
    {date:"1920",name:"Première élection démocratique de Afghanistan",category:"Politique"},
    {date:"1925",name:"Participation de Afghanistan à la Première Guerre mondiale",category:"Science"},
    {date:"1930",name:"Participation de Afghanistan à la Seconde Guerre mondiale",category:"Exploration"},
    {date:"1935",name:"Création de la monnaie nationale de Afghanistan",category:"Culture"},
    {date:"1940",name:"Construction d'un monument ou site emblématique de Afghanistan",category:"Politique"},
    {date:"1945",name:"Lancement d'un programme spatial ou scientifique majeur",category:"Science"},
    {date:"1950",name:"Découverte archéologique majeure dans Afghanistan",category:"Exploration"},
    {date:"1955",name:"Première visite d'un dirigeant étranger dans Afghanistan",category:"Culture"},
    {date:"1960",name:"Adhésion de Afghanistan à une organisation internationale majeure",category:"Politique"},
    {date:"1965",name:"Fondation d'une institution culturelle ou éducative majeure",category:"Science"},
    {date:"1970",name:"Première diffusion d'un média national ou international depuis Afghanistan",category:"Exploration"},
    {date:"1975",name:"Inauguration d'un projet d'infrastructure majeur",category:"Culture"},
  ],
  "États-Unis": [
    {date:"1492",name:"Arrivée de Christophe Colomb en Amérique",category:"Exploration"},
    {date:"1607",name:"Fondation de Jamestown (première colonie anglaise permanente)",category:"Exploration"},
    {date:"1620",name:"Arrivée des Pèlerins à Plymouth (Mayflower)",category:"Exploration"},
    {date:"1776",name:"Déclaration d'Indépendance",category:"Politique"},
    {date:"1783",name:"Traité de Paris (fin de la guerre d'Indépendance)",category:"Politique"},
    {date:"1787",name:"Adoption de la Constitution",category:"Politique"},
    {date:"1803",name:"Achat de la Louisiane",category:"Politique"},
    {date:"1804",name:"Expédition Lewis et Clark (exploration de l'Ouest américain)",category:"Exploration"},
    {date:"1861",name:"Guerre de Sécession",category:"Politique"},
    {date:"1863",name:"Proclamation d'émancipation (abolition de l'esclavage)",category:"Politique"},
    {date:"1920",name:"Adoption du 19e amendement (droit de vote pour les femmes)",category:"Politique"},
    {date:"1929",name:"Krach boursier (début de la Grande Dépression)",category:"Politique"},
    {date:"1941",name:"Attaque de Pearl Harbor",category:"Politique"},
    {date:"1945",name:"Bombes atomiques sur Hiroshima et Nagasaki",category:"Science"},
    {date:"1963",name:"Assassinat de John F. Kennedy",category:"Politique"},
    {date:"1969",name:"Premier pas sur la Lune (Neil Armstrong)",category:"Science"},
    {date:"1971",name:"Premier email envoyé (Ray Tomlinson)",category:"Science"},
    {date:"1990",name:"Lancement du télescope Hubble",category:"Science"},
    {date:"2001",name:"Attaques du 11 septembre",category:"Politique"},
    {date:"2008",name:"Élection de Barack Obama",category:"Politique"},
  ],
  "France": [
    {date:"Vers 600 av. J.-C.",name:"Fondation de Marseille (Massalia) par les Grecs",category:"Exploration"},
    {date:"52 av. J.-C.",name:"Victoire de Jules César à Alésia, fin de la guerre des Gaules",category:"Politique"},
    {date:"496",name:"Baptême de Clovis, conversion au christianisme",category:"Culture"},
    {date:"800",name:"Couronnement de Charlemagne comme empereur d'Occident",category:"Politique"},
    {date:"1214",name:"Fondation de l'Université de Paris",category:"Science"},
    {date:"1415",name:"Bataille d'Azincourt",category:"Politique"},
    {date:"1515",name:"Victoire de François Ier à Marignan",category:"Politique"},
    {date:"1598",name:"Édit de Nantes (tolérance religieuse pour les protestants)",category:"Politique"},
    {date:"1643",name:"Louis XIV devient roi à 5 ans",category:"Politique"},
    {date:"1682",name:"Installation de la cour à Versailles",category:"Culture"},
    {date:"1789",name:"Révolution française (prise de la Bastille)",category:"Politique"},
    {date:"1799",name:"Coup d'État du 18 Brumaire (Napoléon prend le pouvoir)",category:"Politique"},
    {date:"1804",name:"Napoléon Ier se couronne empereur",category:"Politique"},
    {date:"1889",name:"Construction de la Tour Eiffel",category:"Culture"},
    {date:"1903",name:"Premier vol des frères Wright (avion à moteur)",category:"Science"},
    {date:"1914",name:"Première Guerre mondiale",category:"Politique"},
    {date:"1944",name:"Libération de Paris",category:"Politique"},
    {date:"1958",name:"Fondation de la Cinquième République",category:"Politique"},
    {date:"1968",name:"Mai 68 (mouvements sociaux et étudiants)",category:"Culture"},
  ],
  "Japon": [
    {date:"660 av. J.-C.",name:"Fondation mythique du Japon par l'empereur Jimmu",category:"Culture"},
    {date:"710",name:"Fondation de la capitale Heijō-kyō (Nara)",category:"Politique"},
    {date:"794",name:"Transfert de la capitale à Heian-kyō (Kyoto)",category:"Politique"},
    {date:"1185",name:"Début du shogunat (période Kamakura)",category:"Politique"},
    {date:"1543",name:"Arrivée des Portugais (introduction des armes à feu)",category:"Exploration"},
    {date:"1603",name:"Début du shogunat Tokugawa (période Edo)",category:"Politique"},
    {date:"1853",name:"Arrivée des 'navires noirs' du commodore Perry",category:"Exploration"},
    {date:"1868",name:"Restauration Meiji (modernisation du Japon)",category:"Politique"},
    {date:"1894",name:"Guerre sino-japonaise (victoire du Japon)",category:"Politique"},
    {date:"1904",name:"Guerre russo-japonaise (victoire du Japon)",category:"Politique"},
    {date:"1910",name:"Annexion de la Corée par le Japon",category:"Politique"},
    {date:"1923",name:"Séisme de Kantō (destruction de Tokyo et Yokohama)",category:"Science"},
    {date:"1931",name:"Invasion de la Mandchourie",category:"Politique"},
    {date:"1941",name:"Attaque de Pearl Harbor",category:"Politique"},
    {date:"1945",name:"Bombes atomiques sur Hiroshima et Nagasaki",category:"Science"},
    {date:"1947",name:"Adoption de la Constitution pacifique",category:"Politique"},
    {date:"1964",name:"Jeux Olympiques de Tokyo",category:"Culture"},
    {date:"1981",name:"Lancement du premier shinkansen (TGV japonais)",category:"Science"},
    {date:"1995",name:"Séisme de Kobe",category:"Science"},
    {date:"2011",name:"Séisme et tsunami de Tōhoku (accident de Fukushima)",category:"Science"},
  ],
};

// For all other countries in the CSV, generate from the template pattern
const TEMPLATE_COUNTRIES = [
  "Afrique du Sud","Albanie","Algérie","Allemagne","Andorre","Angola","Antigua-et-Barbuda",
  "Arabie saoudite","Argentine","Arménie","Australie","Autriche","Azerbaïdjan","Bahamas",
  "Bahreïn","Bangladesh","Barbade","Belgique","Belize","Bénin","Bhoutan","Biélorussie",
  "Birmanie","Bolivie","Bosnie-Herzégovine","Botswana","Brésil","Brunei","Bulgarie",
  "Burkina Faso","Burundi","Cambodge","Cameroun","Canada","Cap-Vert","Centrafrique",
  "Chili","Chine","Chypre","Colombie","Comores","Congo","Corée du Nord","Corée du Sud",
  "Costa Rica","Côte d'Ivoire","Croatie","Cuba","Danemark","Djibouti","Dominique",
  "Égypte","Émirats arabes unis","Équateur","Érythrée","Espagne","Estonie","Eswatini",
  "Éthiopie","Fidji","Finlande","Gabon","Gambie","Géorgie","Ghana","Grèce","Grenade",
  "Guatemala","Guinée","Guinée équatoriale","Guinée-Bissau","Guyana","Haïti","Honduras",
  "Hongrie","Îles Cook","Îles Marshall","Îles Salomon","Inde","Indonésie","Irak","Iran",
  "Irlande","Islande","Israël","Italie","Jamaïque","Jordanie","Kazakhstan","Kenya",
  "Kirghizistan","Kiribati","Koweït","Laos","Lesotho","Lettonie","Liban","Liberia",
  "Libye","Liechtenstein","Lituanie","Luxembourg","Macédoine du Nord","Madagascar",
  "Malaisie","Malawi","Maldives","Mali","Malte","Maroc","Mauritanie","Maurice","Mexique",
  "Micronésie","Moldavie","Monaco","Mongolie","Monténégro","Mozambique","Namibie","Nauru",
  "Népal","Nicaragua","Niger","Nigeria","Niue","Norvège","Nouvelle-Zélande","Oman",
  "Ouganda","Ouzbékistan","Pakistan","Palaos","Panama","Papouasie-Nouvelle-Guinée",
  "Paraguay","Pays-Bas","Pérou","Philippines","Pologne","Portugal","Qatar",
  "République centrafricaine","République tchèque","République dominicaine","Roumanie",
  "Royaume-Uni","Russie","Rwanda","Saint-Christophe-et-Niévès","Sainte-Lucie",
  "Saint-Vincent-et-les-Grenadines","Samoa","Sao Tomé-et-Principe","Sénégal","Serbie",
  "Seychelles","Sierra Leone","Singapour","Slovaquie","Slovénie","Somalie","Soudan",
  "Soudan du Sud","Sri Lanka","Suède","Suisse","Suriname","Syrie","Tadjikistan",
  "Tanzanie","Tchad","Thaïlande","Timor oriental","Togo","Tonga","Trinité-et-Tobago",
  "Tunisie","Turkménistan","Turquie","Tuvalu","Ukraine","Uruguay","Vanuatu","Vatican",
  "Venezuela","Viêt Nam","Yémen","Zambie","Zimbabwe"
];

const TEMPLATE_EVENTS = [
  {offset:0, name:"Création de l'État moderne", category:"Politique"},
  {offset:5, name:"Indépendance nationale", category:"Politique"},
  {offset:10, name:"Adoption de la constitution", category:"Politique"},
  {offset:15, name:"Première élection démocratique", category:"Politique"},
  {offset:20, name:"Participation à la Première Guerre mondiale", category:"Politique"},
  {offset:25, name:"Participation à la Seconde Guerre mondiale", category:"Politique"},
  {offset:30, name:"Création de la monnaie nationale", category:"Politique"},
  {offset:35, name:"Construction d'un monument ou site emblématique", category:"Culture"},
  {offset:40, name:"Lancement d'un programme scientifique majeur", category:"Science"},
  {offset:45, name:"Découverte archéologique majeure", category:"Science"},
  {offset:50, name:"Première visite d'un dirigeant étranger", category:"Politique"},
  {offset:55, name:"Adhésion à une organisation internationale majeure", category:"Politique"},
  {offset:60, name:"Fondation d'une institution culturelle ou éducative majeure", category:"Culture"},
  {offset:65, name:"Première diffusion d'un média national", category:"Culture"},
  {offset:70, name:"Inauguration d'un projet d'infrastructure majeur", category:"Science"},
];

function dateToISO(dateStr) {
  if (!dateStr) return '1900-01-01';
  const avMatch = dateStr.match(/(\d+)\s*av\.\s*J\.-C\./i);
  if (avMatch) return `-${String(avMatch[1]).padStart(4,'0')}-01-01`;
  const yearMatch = dateStr.match(/(\d{4})/);
  if (yearMatch) return `${yearMatch[1]}-01-01`;
  return '1900-01-01';
}

function buildTemplateEvents(countryName, baseYear = 1905) {
  return TEMPLATE_EVENTS.map(t => {
    const year = baseYear + t.offset;
    return {
      date: String(year),
      isoDate: `${year}-01-01`,
      year,
      name: `${t.name} de ${countryName}`,
      context: '',
      category: t.category,
      source: { type: 'generated' }
    };
  });
}

function main() {
  const countries = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8'));
  let updated = 0;

  for (const country of countries) {
    const csvName = Object.keys(NAME_MAP).find(k => NAME_MAP[k] === country.name) || country.name;

    // Check if we have specific CSV data for this country
    if (CSV_EVENTS[csvName] || CSV_EVENTS[country.name]) {
      const events = CSV_EVENTS[csvName] || CSV_EVENTS[country.name];
      country.events = events.map(ev => ({
        date: ev.date,
        isoDate: dateToISO(ev.date),
        year: parseInt(ev.date.match(/\d{4}/)?.[0] || '0'),
        name: ev.name,
        context: '',
        category: ev.category,
        source: { type: 'csv' }
      }));
      updated++;
      console.log(`✓ ${country.flag} ${country.name}: ${country.events.length} events (specific)`);
    } else if (TEMPLATE_COUNTRIES.includes(csvName) || TEMPLATE_COUNTRIES.includes(country.name)) {
      // Use template events
      const name = csvName || country.name;
      country.events = buildTemplateEvents(country.name);
      updated++;
      console.log(`✓ ${country.flag} ${country.name}: ${country.events.length} events (template)`);
    }
  }

  fs.writeFileSync(COUNTRIES_FILE, JSON.stringify(countries, null, 2), 'utf-8');
  console.log(`\n✅ Updated ${updated} countries`);
}

main();
