#!/usr/bin/env node

/**
 * Script to fix incorrect date formatting in countries.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COUNTRIES_FILE = path.join(__dirname, '../data/countries.json');

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

/**
 * Format ISO date to French format
 */
function formatDateFromISO(isoDate) {
  if (!isoDate) return '';
  
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return isoDate; // Return original if invalid
    }
    
    const day = date.getUTCDate();
    const month = MONTHS_FR[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    return isoDate;
  }
}

/**
 * Check if a date string is properly formatted
 */
function isDateProperlyFormatted(dateStr, isoDate) {
  if (!dateStr || !isoDate) return false;
  
  // Check if it's just a year (which is valid)
  if (/^\d{4}$/.test(dateStr)) return true;
  
  // Check if it matches French format
  const frenchDatePattern = /^\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}$/i;
  return frenchDatePattern.test(dateStr);
}

/**
 * Main function to fix dates
 */
function fixCountryDates() {
  console.log('📅 Loading countries data...');
  
  const countriesData = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8'));
  let fixedCount = 0;
  let totalFixed = 0;
  
  console.log(`Found ${countriesData.length} countries\n`);
  
  for (const country of countriesData) {
    let countryFixed = 0;
    
    for (const event of country.events) {
      if (!isDateProperlyFormatted(event.date, event.isoDate)) {
        const oldDate = event.date;
        event.date = formatDateFromISO(event.isoDate);
        
        if (event.date !== oldDate) {
          console.log(`  ✓ ${country.name}: "${oldDate}" → "${event.date}"`);
          countryFixed++;
          totalFixed++;
        }
      }
    }
    
    if (countryFixed > 0) {
      console.log(`✓ ${country.flag} ${country.name}: Fixed ${countryFixed} dates\n`);
      fixedCount++;
    }
  }
  
  if (totalFixed > 0) {
    console.log(`\n💾 Saving fixed data...`);
    fs.writeFileSync(
      COUNTRIES_FILE,
      JSON.stringify(countriesData, null, 2),
      'utf-8'
    );
    
    console.log(`\n✅ Done!`);
    console.log(`   - Fixed ${fixedCount} countries`);
    console.log(`   - Corrected ${totalFixed} dates`);
  } else {
    console.log(`\n✅ All dates are properly formatted!`);
  }
}

// Run the script
fixCountryDates();
