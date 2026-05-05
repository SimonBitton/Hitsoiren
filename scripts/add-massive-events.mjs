#!/usr/bin/env node

/**
 * Script to add hundreds of thousands of historical events from WikiData
 * This script queries WikiData for historical events and adds them to the timeline
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIMELINE_FILE = path.join(__dirname, '../data/timeline.json');

// WikiData SPARQL endpoint
const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

// User agent header required by WikiData
const HEADERS = {
  'User-Agent': 'Histoiren/1.0 (https://github.com/SimonBitton/Histoiren; simon.bitton.fr@gmail.com)'
};

// Era definitions with year ranges
const ERA_DEFINITIONS = {
  prehist: { start: -3300000, end: -3200, name: 'Préhistoire' },
  antiquite: { start: -3200, end: 476, name: 'Antiquité' },
  'moyen-age': { start: 476, end: 1492, name: 'Moyen Âge' },
  modernes: { start: 1492, end: 1789, name: 'Temps Modernes' },
  contemporain: { start: 1789, end: 2026, name: 'Époque Contemporaine' }
};

// Category mappings based on event types
const CATEGORY_MAPPINGS = {
  'battle': 'Politique',
  'war': 'Politique',
  'treaty': 'Politique',
  'law': 'Politique',
  'election': 'Politique',
  'revolution': 'Politique',
  'independence': 'Politique',
  'discovery': 'Science',
  'invention': 'Science',
  'scientific': 'Science',
  'publication': 'Culture',
  'art': 'Culture',
  'building': 'Culture',
  'founding': 'Politique',
  'birth': 'Culture',
  'death': 'Culture',
  'exploration': 'Exploration',
  'voyage': 'Exploration'
};

/**
 * Sleep function to avoid rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch data from WikiData SPARQL endpoint
 */
async function queryWikiData(sparqlQuery) {
  const url = `${WIKIDATA_SPARQL_ENDPOINT}?query=${encodeURIComponent(sparqlQuery)}&format=json`;
  
  try {
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) {
      throw new Error(`WikiData error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('WikiData query failed:', error.message);
    return null;
  }
}

/**
 * Determine era based on year
 */
function getEraForYear(year) {
  for (const [eraId, range] of Object.entries(ERA_DEFINITIONS)) {
    if (year >= range.start && year <= range.end) {
      return eraId;
    }
  }
  return 'contemporain';
}

/**
 * Determine category based on event type
 */
function getCategory(eventType, eventLabel) {
  const type = (eventType || '').toLowerCase();
  const label = (eventLabel || '').toLowerCase();
  
  for (const [keyword, category] of Object.entries(CATEGORY_MAPPINGS)) {
    if (type.includes(keyword) || label.includes(keyword)) {
      return category;
    }
  }
  
  return 'Politique'; // Default category
}

/**
 * Format date string for display
 */
function formatDate(year, isBC) {
  if (Math.abs(year) > 10000) {
    return `≈ ${Math.abs(year).toLocaleString()} ${isBC ? 'av. J.-C.' : 'ap. J.-C.'}`;
  }
  if (isBC) {
    return `${Math.abs(year)} av. J.-C.`;
  }
  return `${year} ap. J.-C.`;
}

/**
 * Query WikiData for historical events in a specific era
 */
async function queryEventsForEra(eraId, offset = 0, limit = 1000) {
  const era = ERA_DEFINITIONS[eraId];
  const startYear = era.start;
  const endYear = era.end;
  
  // SPARQL query for historical events
  const sparqlQuery = `
    SELECT DISTINCT ?event ?eventLabel ?date ?eventerLabel ?eventerLabelFr WHERE {
      {
        # Battles and wars
        ?event wdt:P31/wdt:P279* wd:Q198.
        ?event wdt:P585 ?date.
      } UNION {
        # Treaties
        ?event wdt:P31/wdt:P279* wd:Q131157.
        ?event wdt:P585 ?date.
      } UNION {
        # Discoveries
        ?event wdt:P31/wdt:P279* wd:Q168751.
        ?event wdt:P585 ?date.
      } UNION {
        # Buildings/structures completed
        ?event wdt:P31/wdt:P279* wd:Q811979.
        ?event wdt:P585 ?date.
      } UNION {
        # Scientific discoveries
        ?event wdt:P31/wdt:P279* wd:Q18911076.
        ?event wdt:P585 ?date.
      } UNION {
        # Publications
        ?event wdt:P31/wdt:P279* wd:Q732577.
        ?event wdt:P585 ?date.
      } UNION {
        # Laws enacted
        ?event wdt:P31/wdt:P279* wd:Q207495.
        ?event wdt:P585 ?date.
      }
      
      # Date filter
      FILTER(YEAR(?date) >= ${startYear} && YEAR(?date) <= ${endYear})
      
      # Labels
      SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "fr,en".
        ?event rdfs:label ?eventLabel.
        OPTIONAL { ?event wdt:P625 ?eventerLabel. }
      }
    }
    ORDER BY ?date
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  
  return await queryWikiData(sparqlQuery);
}

/**
 * Query for births and deaths of notable people
 */
async function queryNotablePeople(eraId, offset = 0, limit = 1000) {
  const era = ERA_DEFINITIONS[eraId];
  const startYear = era.start;
  const endYear = era.end;
  
  const sparqlQuery = `
    SELECT DISTINCT ?person ?personLabel ?birth ?death ?occupationLabel WHERE {
      ?person wdt:P31 wd:Q5.
      
      {
        ?person wdt:P569 ?birth.
        FILTER(YEAR(?birth) >= ${startYear} && YEAR(?birth) <= ${endYear})
      } UNION {
        ?person wdt:P570 ?death.
        FILTER(YEAR(?death) >= ${startYear} && YEAR(?death) <= ${endYear})
      }
      
      OPTIONAL { ?person wdt:P106 ?occupation. }
      
      # Only people with sitelinks (notable)
      ?sitelink schema:about ?person.
      
      SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "fr,en".
      }
    }
    ORDER BY ?birth ?death
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  
  return await queryWikiData(sparqlQuery);
}

/**
 * Convert WikiData result to timeline event
 */
function wikiDataEventToTimeline(binding, eraId, type = 'event') {
  const date = binding.date?.value || binding.birth?.value || binding.death?.value;
  if (!date) return null;
  
  const dateObj = new Date(date);
  const year = dateObj.getUTCFullYear();
  const isBC = year < 0;
  
  const eventLabel = binding.eventLabel?.value || binding.personLabel?.value;
  if (!eventLabel) return null;
  
  const category = getCategory(binding.eventType?.value, eventLabel);
  
  let name, context, people = '';
  
  if (type === 'person') {
    const birth = binding.birth?.value;
    const death = binding.death?.value;
    const occupation = binding.occupationLabel?.value || '';
    
    if (birth && death) {
      const birthYear = new Date(birth).getUTCFullYear();
      const deathYear = new Date(death).getUTCFullYear();
      name = `${eventLabel} (${birthYear}–${deathYear < 0 ? Math.abs(deathYear) + ' av. J.-C.' : deathYear})`;
      context = `Personnalité historique${occupation ? ', ' + occupation : ''}. A marqué son époque par ses actions et son influence.`;
    } else if (birth) {
      name = `Naissance de ${eventLabel}`;
      context = `Naissance de ${eventLabel}${occupation ? ', ' + occupation : ''}. Cette personne allait devenir une figure importante de son temps.`;
    } else {
      name = `Mort de ${eventLabel}`;
      context = `Décès de ${eventLabel}${occupation ? ', ' + occupation : ''}. Sa disparition marque la fin d'une époque.`;
    }
    people = eventLabel;
  } else {
    name = eventLabel;
    context = `Événement historique survenu ${formatDate(year, isBC)}. Cet événement s'inscrit dans le contexte de ${ERA_DEFINITIONS[eraId].name.toLowerCase()}.`;
  }
  
  return {
    id: `wd-${eraId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    era: eraId,
    major: false,
    date: formatDate(year, isBC),
    name: name,
    context: context,
    people: people,
    category: category,
    catSlug: category.toLowerCase(),
    source: {
      eventQid: binding.event?.value?.split('/').pop() || binding.person?.value?.split('/').pop(),
      verified: false
    }
  };
}

/**
 * Main function to add massive events
 */
async function addMassiveEvents() {
  console.log('🚀 Ajout massif d\'événements historiques depuis WikiData...\n');
  
  const timelineData = JSON.parse(fs.readFileSync(TIMELINE_FILE, 'utf-8'));
  const existingEvents = timelineData.events;
  
  // Create a set of existing event names to avoid duplicates
  const existingNames = new Set(existingEvents.map(e => e.name.toLowerCase()));
  
  let totalAdded = 0;
  const BATCH_SIZE = 500;
  const MAX_BATCHES = 200; // Limit to avoid overwhelming the API
  
  for (const eraId of Object.keys(ERA_DEFINITIONS)) {
    console.log(`\n📅 Traitement de l'ère: ${ERA_DEFINITIONS[eraId].name}`);
    
    // Query events
    for (let batch = 0; batch < MAX_BATCHES; batch++) {
      console.log(`  Batch ${batch + 1}/${MAX_BATCHES}...`);
      
      const results = await queryEventsForEra(eraId, batch * BATCH_SIZE, BATCH_SIZE);
      
      if (!results || !results.results || results.results.bindings.length === 0) {
        console.log(`  → Plus de résultats pour cette ère.`);
        break;
      }
      
      let batchAdded = 0;
      for (const binding of results.results.bindings) {
        const event = wikiDataEventToTimeline(binding, eraId, 'event');
        
        if (event && !existingNames.has(event.name.toLowerCase())) {
          existingEvents.push(event);
          existingNames.add(event.name.toLowerCase());
          totalAdded++;
          batchAdded++;
        }
      }
      
      console.log(`  → ${batchAdded} événements ajoutés (total: ${totalAdded})`);
      
      // Rate limiting
      await sleep(2000);
      
      // Stop if we've added enough
      if (totalAdded >= 100000) {
        console.log(`\n🎯 Objectif atteint: ${totalAdded} événements ajoutés!`);
        break;
      }
    }
    
    if (totalAdded >= 100000) break;
    
    // Query notable people
    for (let batch = 0; batch < MAX_BATCHES; batch++) {
      console.log(`  Personnes notables - Batch ${batch + 1}/${MAX_BATCHES}...`);
      
      const results = await queryNotablePeople(eraId, batch * BATCH_SIZE, BATCH_SIZE);
      
      if (!results || !results.results || results.results.bindings.length === 0) {
        console.log(`  → Plus de résultats.`);
        break;
      }
      
      let batchAdded = 0;
      for (const binding of results.results.bindings) {
        const event = wikiDataEventToTimeline(binding, eraId, 'person');
        
        if (event && !existingNames.has(event.name.toLowerCase())) {
          existingEvents.push(event);
          existingNames.add(event.name.toLowerCase());
          totalAdded++;
          batchAdded++;
        }
      }
      
      console.log(`  → ${batchAdded} personnes ajoutées (total: ${totalAdded})`);
      
      // Rate limiting
      await sleep(2000);
      
      // Stop if we've added enough
      if (totalAdded >= 100000) {
        console.log(`\n🎯 Objectif atteint: ${totalAdded} événements ajoutés!`);
        break;
      }
    }
    
    if (totalAdded >= 100000) break;
  }
  
  // Save updated timeline
  console.log('\n💾 Sauvegarde des données...');
  timelineData.events = existingEvents;
  
  fs.writeFileSync(
    TIMELINE_FILE,
    JSON.stringify(timelineData, null, 2),
    'utf-8'
  );
  
  console.log('\n✅ Terminé!');
  console.log(`   - Nouveaux événements ajoutés: ${totalAdded}`);
  console.log(`   - Total événements: ${existingEvents.length}`);
  console.log(`   - Fichier sauvegardé: ${TIMELINE_FILE}`);
}

// Run the script
addMassiveEvents().catch(console.error);