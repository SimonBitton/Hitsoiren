#!/usr/bin/env node
/**
 * Imports events from the CSV file into countries.json
 * Replaces all existing events with the CSV data (only non-empty rows)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COUNTRIES_FILE = path.join(__dirname, '../data/countries.json');
const CSV_FILE = path.join(__dirname, '../data/events-by-country.csv');

// Name mapping: CSV name → JSON name (for mismatches)
const NAME_MAP = {
  'Centrafrique': 'République centrafricaine',
  'République tchèque': 'Tchéquie',
  'Chine': 'République populaire de Chine',
  'Pays-Bas': 'Royaume des Pays-Bas',
  'Viêt Nam': 'Vietnam',
  'Micronésie': 'États fédérés de Micronésie',
};

function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const byCountry = {};

  for (const line of lines.slice(1)) { // skip header
    const parts = line.split(';');
    if (parts.length < 4) continue;
    const [country, , date, event, category] = parts;
    if (!country || !date || !event) continue;
    const c = country.trim();
    const d = date.trim();
    const e = event.trim();
    const cat = (category || 'Politique').trim();
    if (!d || !e) continue;

    if (!byCountry[c]) byCountry[c] = [];
    byCountry[c].push({ date: d, event: e, category: cat });
  }
  return byCountry;
}

function dateToISO(dateStr) {
  // Handle "Vers 600 av. J.-C." style
  if (/av\.\s*J\.-C\./i.test(dateStr)) {
    const m = dateStr.match(/-?\d+/);
    if (m) {
      const y = Math.abs(parseInt(m[0]));
      return `-${String(y).padStart(4, '0')}-01-01`;
    }
  }
  // Handle "1804-1806" ranges → take first year
  const rangeMatch = dateStr.match(/^(\d{4})/);
  if (rangeMatch) return `${rangeMatch[1]}-01-01`;
  // Plain year
  if (/^\d{4}$/.test(dateStr)) return `${dateStr}-01-01`;
  return `${dateStr}-01-01`;
}

function main() {
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const csvData = parseCSV(csvContent);
  const countries = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8'));

  let updated = 0;
  let notFound = [];

  for (const [csvName, events] of Object.entries(csvData)) {
    const jsonName = NAME_MAP[csvName] || csvName;
    const country = countries.find(c =>
      c.name === jsonName ||
      c.name.toLowerCase() === jsonName.toLowerCase()
    );

    if (!country) {
      notFound.push(csvName);
      continue;
    }

    // Build new events array from CSV (skip empty)
    const newEvents = events.map(ev => ({
      date: ev.date,
      isoDate: dateToISO(ev.date),
      year: parseInt(ev.date.match(/\d{4}/)?.[0] || '0'),
      name: ev.event,
      context: '',
      category: ev.category,
      source: { type: 'csv' }
    }));

    if (newEvents.length > 0) {
      country.events = newEvents;
      updated++;
    }
  }

  fs.writeFileSync(COUNTRIES_FILE, JSON.stringify(countries, null, 2), 'utf-8');
  console.log(`✅ Updated ${updated} countries`);
  if (notFound.length) console.log(`⚠ Not found in JSON: ${notFound.join(', ')}`);
}

main();
