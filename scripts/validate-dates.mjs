/**
 * Validateur de dates chronologiques
 * Vérifie toutes les dates et signale les problèmes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIMELINE_FILE = path.join(__dirname, '../data/timeline.json');

function estimateYearFromText(text) {
  if (!text) return null;
  const clean = text
    .toLowerCase()
    .replace(/≈|vers|ca\.?|env\.?/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  const firstYear = clean.match(/(\d[\d\s]*)/);
  if (!firstYear) return null;
  const numeric = parseInt(firstYear[1].replace(/\s/g, ''), 10);
  if (Number.isNaN(numeric)) return null;
  return clean.includes('av. j.-c') ? -numeric : numeric;
}

function validateDate(event, index) {
  const issues = [];

  if (!event.date || typeof event.date !== 'string') {
    issues.push('date manquante ou invalide');
  }

  if (!event.name || typeof event.name !== 'string') {
    issues.push('name manquant ou invalide');
  }

  if (!event.era || !['prehist', 'antiquite', 'moyen-age', 'modernes', 'contemporain'].includes(event.era)) {
    issues.push(`era invalide: ${event.era}`);
  }

  if (!event.category || typeof event.category !== 'string') {
    issues.push('category manquée ou invalide');
  }

  const year = estimateYearFromText(event.date);
  if (year === null) {
    issues.push(`date non parsable: "${event.date}"`);
  }

  // Vérifier la cohérence era/année
  if (year !== null) {
    const eraRanges = {
      prehist: { min: -3300000, max: -3200 },
      antiquite: { min: -3200, max: 476 },
      'moyen-age': { min: 476, max: 1492 },
      modernes: { min: 1492, max: 1789 },
      contemporain: { min: 1789, max: 2026 }
    };

    const range = eraRanges[event.era];
    if (range && (year < range.min || year > range.max)) {
      issues.push(`année ${year} incompatible avec era ${event.era} (${range.min}-${range.max})`);
    }
  }

  return issues;
}

function main() {
  console.log('📋 Validation des dates...\n');

  const data = JSON.parse(fs.readFileSync(TIMELINE_FILE, 'utf8'));
  const events = data.events || [];

  let totalIssues = 0;
  const problemsByType = {};

  events.forEach((event, index) => {
    const issues = validateDate(event, index);
    if (issues.length > 0) {
      totalIssues += issues.length;
      issues.forEach((issue) => {
        problemsByType[issue] = (problemsByType[issue] || 0) + 1;
      });

      // Afficher les premiers problèmes seulement
      if (index < 10) {
        console.log(`❌ Event #${index}: ${event.name}`);
        console.log(`   Date: "${event.date}" (parsed: ${estimateYearFromText(event.date)})`);
        issues.forEach((issue) => console.log(`   ⚠️  ${issue}`));
      }
    }
  });

  console.log('\n📊 Résumé:');
  console.log(`   Total événements: ${events.length}`);
  console.log(`   Total problèmes trouvés: ${totalIssues}`);
  console.log(`   Taux de validité: ${((events.length - Object.keys(problemsByType).length) / events.length * 100).toFixed(1)}%`);

  if (Object.keys(problemsByType).length > 0) {
    console.log('\n🔍 Problèmes par type:');
    Object.entries(problemsByType).forEach(([issue, count]) => {
      console.log(`   - ${issue}: ${count} occurrence(s)`);
    });
  }

  // Afficher les ères et leurs événements
  console.log('\n📅 Distribution par ère:');
  const byEra = {};
  events.forEach((event) => {
    byEra[event.era] = (byEra[event.era] || 0) + 1;
  });
  Object.entries(byEra).forEach(([era, count]) => {
    console.log(`   ${era}: ${count} événements`);
  });

  // Afficher les catégories
  console.log('\n🏷️  Distribution par catégorie:');
  const byCategory = {};
  events.forEach((event) => {
    byCategory[event.category] = (byCategory[event.category] || 0) + 1;
  });
  Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} événements`);
  });

  // Chercher les dates déplicates
  const dateMap = new Map();
  const duplicates = [];
  events.forEach((event, index) => {
    const key = `${event.date}|${event.name}`;
    if (dateMap.has(key)) {
      duplicates.push({ event: event.name, indices: [dateMap.get(key), index] });
    } else {
      dateMap.set(key, index);
    }
  });

  if (duplicates.length > 0) {
    console.log(`\n⚠️  ${duplicates.length} événements dupliqués détectés:`);
    duplicates.slice(0, 5).forEach((dup) => {
      console.log(`   - ${dup.event} (indices ${dup.indices.join(', ')})`);
    });
  }

  console.log('\n✅ Validation terminée!\n');

  if (totalIssues === 0) {
    console.log('🎉 Aucun problème trouvé!');
  }
}

main();
