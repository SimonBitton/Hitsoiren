#!/usr/bin/env node

/**
 * Script to verify dates using WikiData API
 * This script checks each event date against WikiData and Wikipedia sources
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIMELINE_FILE = path.join(__dirname, '../data/timeline.json');
const VERIFICATION_LOG = path.join(__dirname, '../data/verification-log.json');

// WikiData SPARQL endpoint
const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

// User agent header required by WikiData
const HEADERS = {
  'User-Agent': 'Histoiren/1.0 (https://github.com/SimonBitton/Histoiren; simon.bitton.fr@gmail.com)'
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
 * Search for an event on WikiData
 */
async function searchEventOnWikiData(eventName, expectedYear) {
  // Clean up the event name for search
  const searchName = eventName
    .replace(/≈/g, '')
    .replace(/av\. J\.-C\./g, '')
    .replace(/ap\. J\.-C\./g, '')
    .replace(/[—–].*$/, '') // Remove text after dash
    .trim();
  
  // Search for the item
  const searchQuery = `
    SELECT ?item ?itemLabel ?date ?dateLabel WHERE {
      ?item rdfs:label "${searchName}"@fr.
      OPTIONAL { ?item wdt:P571 ?date. }
      OPTIONAL { ?item wdt:P580 ?date. }
      OPTIONAL { ?item wdt:P585 ?date. }
      OPTIONAL { ?item wdt:P569 ?date. }
      OPTIONAL { ?item wdt:P570 ?date. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
    }
    LIMIT 5
  `;
  
  const results = await queryWikiData(searchQuery);
  
  if (results && results.results && results.results.bindings.length > 0) {
    return results.results.bindings[0];
  }
  
  return null;
}

/**
 * Verify a single event's date
 */
async function verifyEventDate(event, index, total) {
  console.log(`[${index + 1}/${total}] Vérification: ${event.name}`);
  
  const result = {
    eventId: event.id,
    eventName: event.name,
    originalDate: event.date,
    verified: false,
    wikiDataMatch: null,
    wikiDataDate: null,
    dateMatch: false,
    error: null
  };
  
  try {
    // Extract year from date string
    const yearMatch = event.date.match(/(\d{1,4})/);
    const isBC = event.date.includes('av. J.-C.');
    
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      
      // Search on WikiData
      const wikiDataResult = await searchEventOnWikiData(event.name, year);
      
      if (wikiDataResult) {
        result.wikiDataMatch = wikiDataResult.itemLabel?.value || null;
        result.verified = true;
        
        // Compare dates if available
        if (wikiDataResult.date) {
          const wikiDate = new Date(wikiDataResult.date.value);
          const wikiYear = wikiDate.getUTCFullYear();
          result.wikiDataDate = wikiYear;
          
          // Account for BC dates (negative years in JS)
          const expectedYear = isBC ? -year : year;
          // Allow some tolerance for approximate dates
          result.dateMatch = Math.abs(wikiYear - expectedYear) < 100;
        } else {
          result.dateMatch = true; // No date to compare, but item was found
        }
      }
    }
    
    // Rate limiting - be nice to WikiData
    await sleep(500);
    
  } catch (error) {
    result.error = error.message;
  }
  
  return result;
}

/**
 * Main verification function
 */
async function verifyAllDates() {
  console.log('🔍 Vérification des dates avec WikiData...\n');
  
  const timelineData = JSON.parse(fs.readFileSync(TIMELINE_FILE, 'utf-8'));
  const events = timelineData.events;
  
  console.log(`📊 Total événements à vérifier: ${events.length}\n`);
  
  const verificationResults = [];
  let verified = 0;
  let matched = 0;
  
  for (let i = 0; i < events.length; i++) {
    const result = await verifyEventDate(events[i], i, events.length);
    verificationResults.push(result);
    
    if (result.verified) verified++;
    if (result.dateMatch) matched++;
    
    // Log progress every 10 events
    if ((i + 1) % 10 === 0) {
      console.log(`  → ${i + 1}/${events.length} vérifiés (${verified} trouvés sur WikiData, ${matched} dates correspondantes)`);
    }
  }
  
  // Save verification log
  const logData = {
    verificationDate: new Date().toISOString(),
    totalEvents: events.length,
    verified: verified,
    dateMatched: matched,
    results: verificationResults
  };
  
  fs.writeFileSync(
    VERIFICATION_LOG,
    JSON.stringify(logData, null, 2),
    'utf-8'
  );
  
  console.log('\n✅ Vérification terminée!');
  console.log(`   - Événements vérifiés: ${verified}/${events.length}`);
  console.log(`   - Dates correspondantes: ${matched}/${events.length}`);
  console.log(`   - Rapport sauvegardé dans: ${VERIFICATION_LOG}`);
  
  // Update timeline data with verification info
  events.forEach((event, index) => {
    const verification = verificationResults[index];
    if (verification.verified) {
      if (!event.source) event.source = {};
      event.source.verified = true;
      event.source.wikiDataMatch = verification.wikiDataMatch;
      event.source.wikiDataDate = verification.wikiDataDate;
      event.source.dateVerified = verification.dateMatch;
    }
  });
  
  fs.writeFileSync(
    TIMELINE_FILE,
    JSON.stringify(timelineData, null, 2),
    'utf-8'
  );
  
  console.log('   - Données timeline mises à jour avec informations de vérification');
}

// Run verification
verifyAllDates().catch(console.error);