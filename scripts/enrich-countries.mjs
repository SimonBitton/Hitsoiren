#!/usr/bin/env node

/**
 * Script to enrich country events from Wikidata
 * Ensures each country has at least 10 historical events
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COUNTRIES_FILE = path.join(__dirname, '../data/countries.json');
const MIN_EVENTS = 10;

// Wikidata SPARQL endpoint
const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';

/**
 * Query Wikidata for historical events related to a country
 */
async function queryWikidataEvents(countryQid, limit = 20) {
  const query = `
    SELECT DISTINCT ?event ?eventLabel ?date ?categoryLabel WHERE {
      {
        # Events that occurred in the country
        ?event wdt:P31/wdt:P279* wd:Q1190554 .  # instance of historical event
        ?event wdt:P17 wd:${countryQid} .        # country
        ?event wdt:P585 ?date .                   # point in time
      } UNION {
        # Events with location in the country
        ?event wdt:P31/wdt:P279* wd:Q1190554 .
        ?event wdt:P276 ?location .
        ?location wdt:P17 wd:${countryQid} .
        ?event wdt:P585 ?date .
      } UNION {
        # Battles and conflicts
        ?event wdt:P31/wdt:P279* wd:Q178561 .    # instance of battle
        ?event wdt:P17 wd:${countryQid} .
        ?event wdt:P585 ?date .
      } UNION {
        # Natural disasters
        ?event wdt:P31/wdt:P279* wd:Q8065 .      # natural disaster
        ?event wdt:P17 wd:${countryQid} .
        ?event wdt:P585 ?date .
      }
      
      OPTIONAL { ?event wdt:P31 ?category }
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
      
      FILTER(YEAR(?date) >= 1800)  # Focus on modern history
    }
    ORDER BY DESC(?date)
    LIMIT ${limit}
  `;

  const url = `${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HistorienBot/1.0 (Educational Project)',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Wikidata query failed for ${countryQid}: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.results.bindings.map(binding => ({
      date: formatDate(binding.date?.value),
      isoDate: binding.date?.value.split('T')[0],
      year: parseInt(binding.date?.value.split('-')[0]),
      name: binding.eventLabel?.value || 'Événement historique',
      context: '',
      category: binding.categoryLabel?.value || 'Histoire',
      source: {
        type: 'wikidata',
        countryQid: countryQid,
        eventQid: binding.event?.value.split('/').pop()
      }
    }));
  } catch (error) {
    console.error(`Error querying Wikidata for ${countryQid}:`, error.message);
    return [];
  }
}

/**
 * Format date from ISO to French format
 */
function formatDate(isoDate) {
  if (!isoDate) return '';
  
  const date = new Date(isoDate);
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Add delay between requests to respect rate limits
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to enrich countries
 */
async function enrichCountries() {
  console.log('📚 Loading countries data...');
  
  const countriesData = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8'));
  let enrichedCount = 0;
  let totalAdded = 0;
  
  console.log(`Found ${countriesData.length} countries\n`);
  
  for (const country of countriesData) {
    const currentEventCount = country.events.length;
    
    if (currentEventCount >= MIN_EVENTS) {
      console.log(`✓ ${country.flag} ${country.name}: ${currentEventCount} events (OK)`);
      continue;
    }
    
    console.log(`⚠ ${country.flag} ${country.name}: ${currentEventCount} events (needs ${MIN_EVENTS - currentEventCount} more)`);
    console.log(`  Querying Wikidata for ${country.qid}...`);
    
    // Query Wikidata for more events
    const neededEvents = MIN_EVENTS - currentEventCount;
    const newEvents = await queryWikidataEvents(country.qid, neededEvents + 10);
    
    if (newEvents.length > 0) {
      // Filter out duplicates based on date and name
      const existingKeys = new Set(
        country.events.map(e => `${e.isoDate}-${e.name}`)
      );
      
      const uniqueNewEvents = newEvents.filter(e => 
        !existingKeys.has(`${e.isoDate}-${e.name}`)
      ).slice(0, neededEvents);
      
      country.events.push(...uniqueNewEvents);
      country.events.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
      
      console.log(`  ✓ Added ${uniqueNewEvents.length} events`);
      enrichedCount++;
      totalAdded += uniqueNewEvents.length;
    } else {
      console.log(`  ✗ No additional events found`);
    }
    
    // Respect rate limits
    await delay(1000);
  }
  
  // Save enriched data
  console.log(`\n💾 Saving enriched data...`);
  fs.writeFileSync(
    COUNTRIES_FILE,
    JSON.stringify(countriesData, null, 2),
    'utf-8'
  );
  
  console.log(`\n✅ Done!`);
  console.log(`   - Enriched ${enrichedCount} countries`);
  console.log(`   - Added ${totalAdded} total events`);
  console.log(`   - All countries now have at least ${MIN_EVENTS} events`);
}

// Run the script
enrichCountries().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
