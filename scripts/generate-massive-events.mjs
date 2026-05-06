#!/usr/bin/env node

/**
 * Script to massively add generated historical events
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIMELINE_FILE = path.join(__dirname, '../data/timeline.json');

const ERA_DEFINITIONS = {
  prehist: { start: -3300000, end: -3200, name: 'Préhistoire' },
  antiquite: { start: -3200, end: 476, name: 'Antiquité' },
  'moyen-age': { start: 476, end: 1492, name: 'Moyen Âge' },
  modernes: { start: 1492, end: 1789, name: 'Temps Modernes' },
  contemporain: { start: 1789, end: 2026, name: 'Époque Contemporaine' }
};

const CATEGORIES = ['Politique', 'Culture', 'Science', 'Exploration'];

function getEraForYear(year) {
  for (const [eraId, range] of Object.entries(ERA_DEFINITIONS)) {
    if (year >= range.start && year <= range.end) {
      return eraId;
    }
  }
  return 'contemporain';
}

function generateEvent(id, era, year) {
  const events = {
    prehist: [
      { name: `Découverte d'un site archéologique`, context: `Fouilles révélant des artefacts de l'âge de pierre` },
      { name: `Migration de populations primitives`, context: `Déplacement de groupes humains vers de nouvelles terres` },
      { name: `Développement de techniques de chasse`, context: `Amélioration des outils et méthodes de chasse` }
    ],
    antiquite: [
      { name: `Fondation d'une cité antique`, context: `Établissement d'une nouvelle ville dans le monde antique` },
      { name: `Réforme administrative`, context: `Changements dans l'organisation politique et administrative` },
      { name: `Construction d'un monument`, context: `Édification d'un temple ou d'un palais remarquable` }
    ],
    'moyen-age': [
      { name: `Bataille médiévale`, context: `Conflit armé entre royaumes ou seigneurs` },
      { name: `Charte royale`, context: `Octroi de droits et privilèges par un souverain` },
      { name: `Épidémie régionale`, context: `Propagation d'une maladie affectant une région` }
    ],
    modernes: [
      { name: `Traité international`, context: `Accord diplomatique entre nations européennes` },
      { name: `Révolution populaire`, context: `Soulèvement contre l'autorité établie` },
      { name: `Exploration maritime`, context: `Voyage d'exploration vers de nouvelles terres` }
    ],
    contemporain: [
      { name: `Indépendance nationale`, context: `Proclamation de l'indépendance d'un pays` },
      { name: `Réforme constitutionnelle`, context: `Modification des institutions politiques` },
      { name: `Avancée technologique majeure`, context: `Invention ou découverte scientifique importante` }
    ]
  };

  const eventTemplates = events[era] || events.contemporain;
  const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  // Formater la date de manière réaliste
  let dateStr;
  if (era === 'prehist') {
    dateStr = `≈ ${Math.abs(year)} av. J.-C.`;
  } else if (year < 0) {
    dateStr = `${Math.abs(year)} av. J.-C.`;
  } else {
    dateStr = `${year}`;
  }

  return {
    id: `gen-${id}`,
    era,
    major: Math.random() < 0.1, // 10% major
    date: dateStr,
    name: template.name,
    context: template.context,
    category,
    catSlug: category.toLowerCase()
  };
}

function main() {
  console.log('🚀 Régénération des événements avec dates correctes...');

  const data = JSON.parse(fs.readFileSync(TIMELINE_FILE, 'utf8'));
  
  // Supprimer tous les événements générés (commençant par 'gen-')
  data.events = data.events.filter(e => !e.id || !e.id.startsWith('gen-'));

  const existingIds = new Set(data.events.map(e => e.id));

  let added = 0;
  const targetPerEra = 250; // 250 événements par ère pour une bonne distribution

  // Générer des événements pour chaque ère
  for (const [eraKey, eraRange] of Object.entries(ERA_DEFINITIONS)) {
    let count = 0;
    while (count < targetPerEra) {
      // Générer une année dans la plage de l'ère
      const year = Math.floor(Math.random() * (eraRange.end - eraRange.start + 1)) + eraRange.start;
      const id = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${count}`;

      if (!existingIds.has(id)) {
        const event = generateEvent(id, eraKey, year);
        data.events.push(event);
        existingIds.add(id);
        added++;
        count++;
      }
    }
  }

  fs.writeFileSync(TIMELINE_FILE, JSON.stringify(data, null, 2));
  console.log('✅ Régénération terminée!');
  console.log(`   - Événements supprimés: ${582 - data.events.length + added}`);
  console.log(`   - Événements ajoutés: ${added}`);
  console.log(`   - Total événements: ${data.events.length}`);
}

main();