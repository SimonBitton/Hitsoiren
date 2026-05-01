/**
 * Importe des evenements depuis un CSV (format C.csv) vers data/timeline.json.
 * Usage: node scripts/import-csv-events.mjs [chemin-csv]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const timelinePath = path.join(__dirname, '../data/timeline.json');
const csvCandidates = [
  process.argv[2],
  path.join(process.cwd(), 'C.csv'),
  path.join(__dirname, '..', 'C.csv'),
  '/Users/simonbitton/Downloads/C.csv'
].filter(Boolean);

const categoryMap = {
  Politique: 'Politique',
  Culture: 'Culture',
  Exploration: 'Exploration',
  Sciences: 'Science'
};

function getEra(year) {
  if (year < 500) return 'antiquite';
  if (year < 1500) return 'moyen-age';
  if (year < 1800) return 'modernes';
  return 'contemporain';
}

function findCsvPath() {
  const csvPath = csvCandidates.find((candidate) => fs.existsSync(candidate));
  if (!csvPath) {
    throw new Error(`CSV introuvable. Chemins testes: ${csvCandidates.join(', ')}`);
  }
  return csvPath;
}

function parseCSV(content) {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(';').map((value) => value.trim());
    return {
      pays: values[0],
      jour: Number.parseInt(values[1], 10),
      mois: values[2],
      annee: Number.parseInt(values[3], 10),
      evenement: values[4],
      categorie: values[5]
    };
  }).filter((event) => event.pays && event.evenement && Number.isFinite(event.annee));
}

function formatDate(day, month, year) {
  if (!Number.isFinite(day)) return `${month} ${year}`;
  return `${day} ${month} ${year}`;
}

function toTimelineEvent(event) {
  const category = categoryMap[event.categorie] || 'Politique';
  return {
    era: getEra(event.annee),
    major: false,
    date: formatDate(event.jour, event.mois, event.annee),
    name: `${event.evenement} (${event.pays})`,
    context: `Evenement historique concernant ${event.pays}.`,
    people: '',
    category,
    catSlug: category.toLowerCase()
  };
}

function dedupeEvents(events) {
  const seen = new Set();
  return events.filter((event) => {
    const key = `${event.date}-${event.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function main() {
  console.log('Import CSV vers timeline...');

  const csvPath = findCsvPath();
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvEvents = parseCSV(csvContent);
  const imported = dedupeEvents(csvEvents.map(toTimelineEvent));

  const timelineData = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
  const existingEvents = timelineData.events || [];
  const merged = dedupeEvents([...existingEvents, ...imported]);

  timelineData.events = merged;
  fs.writeFileSync(timelinePath, JSON.stringify(timelineData, null, 2), 'utf-8');

  console.log(`CSV utilise: ${csvPath}`);
  console.log(`Evenements CSV lus: ${csvEvents.length}`);
  console.log(`Evenements ajoutes (apres dedoublonnage): ${merged.length - existingEvents.length}`);
  console.log(`Total timeline: ${merged.length}`);
}

main();
