#!/usr/bin/env node

/**
 * Script to add important historical events to countries with fewer than 10 events
 * Uses a curated list of major historical events
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COUNTRIES_FILE = path.join(__dirname, '../data/countries.json');
const MIN_EVENTS = 10;

// Curated historical events by country QID
const HISTORICAL_EVENTS = {
  'Q183': [ // Allemagne
    { date: '9 novembre 1989', isoDate: '1989-11-09', year: 1989, name: 'Chute du mur de Berlin', context: 'Événement majeur marquant la fin de la Guerre froide et la réunification allemande', category: 'Politique' },
    { date: '3 octobre 1990', isoDate: '1990-10-03', year: 1990, name: 'Réunification allemande', context: 'Réunification de l\'Allemagne de l\'Est et de l\'Ouest après 45 ans de division', category: 'Politique' },
    { date: '1 septembre 1939', isoDate: '1939-09-01', year: 1939, name: 'Invasion de la Pologne', context: 'Début de la Seconde Guerre mondiale en Europe', category: 'Politique' },
    { date: '8 mai 1945', isoDate: '1945-05-08', year: 1945, name: 'Capitulation allemande', context: 'Fin de la Seconde Guerre mondiale en Europe', category: 'Politique' },
    { date: '13 août 1961', isoDate: '1961-08-13', year: 1961, name: 'Construction du mur de Berlin', context: 'Séparation physique de Berlin-Est et Berlin-Ouest', category: 'Politique' },
    { date: '17 juin 1953', isoDate: '1953-06-17', year: 1953, name: 'Soulèvement de 1953 en Allemagne de l\'Est', context: 'Révolte populaire contre le régime communiste', category: 'Politique' },
    { date: '20 juillet 1944', isoDate: '1944-07-20', year: 1944, name: 'Attentat contre Hitler', context: 'Tentative d\'assassinat d\'Adolf Hitler par des officiers allemands', category: 'Politique' },
    { date: '9 novembre 1938', isoDate: '1938-11-09', year: 1938, name: 'Nuit de Cristal', context: 'Pogrom contre les Juifs en Allemagne nazie', category: 'Politique' },
    { date: '30 janvier 1933', isoDate: '1933-01-30', year: 1933, name: 'Hitler devient chancelier', context: 'Adolf Hitler est nommé chancelier d\'Allemagne', category: 'Politique' },
  ],
  'Q889': [ // Afghanistan
    { date: '27 décembre 1979', isoDate: '1979-12-27', year: 1979, name: 'Invasion soviétique de l\'Afghanistan', context: 'Début de la guerre soviéto-afghane qui durera 10 ans', category: 'Politique' },
    { date: '15 février 1989', isoDate: '1989-02-15', year: 1989, name: 'Retrait des troupes soviétiques', context: 'Fin de l\'occupation soviétique après 10 ans de guerre', category: 'Politique' },
    { date: '27 septembre 1996', isoDate: '1996-09-27', year: 1996, name: 'Prise de Kaboul par les Talibans', context: 'Les Talibans prennent le contrôle de la capitale afghane', category: 'Politique' },
    { date: '7 octobre 2001', isoDate: '2001-10-07', year: 2001, name: 'Début de l\'intervention américaine', context: 'Opération Liberté immuable après les attentats du 11 septembre', category: 'Politique' },
  ],
  'Q38': [ // Italie
    { date: '28 octobre 1922', isoDate: '1922-10-28', year: 1922, name: 'Marche sur Rome', context: 'Mussolini prend le pouvoir en Italie', category: 'Politique' },
    { date: '25 juillet 1943', isoDate: '1943-07-25', year: 1943, name: 'Chute de Mussolini', context: 'Arrestation de Benito Mussolini et fin du fascisme', category: 'Politique' },
    { date: '2 juin 1946', isoDate: '1946-06-02', year: 1946, name: 'Référendum sur la monarchie', context: 'L\'Italie devient une république', category: 'Politique' },
    { date: '9 mai 1978', isoDate: '1978-05-09', year: 1978, name: 'Assassinat d\'Aldo Moro', context: 'Enlèvement et assassinat du Premier ministre par les Brigades rouges', category: 'Politique' },
    { date: '23 mai 1992', isoDate: '1992-05-23', year: 1992, name: 'Attentat de Capaci', context: 'Assassinat du juge anti-mafia Giovanni Falcone', category: 'Politique' },
    { date: '6 avril 2009', isoDate: '2009-04-06', year: 2009, name: 'Séisme de L\'Aquila', context: 'Tremblement de terre meurtrier dans les Abruzzes', category: 'Science' },
    { date: '24 août 2016', isoDate: '2016-08-24', year: 2016, name: 'Séisme du centre de l\'Italie', context: 'Tremblement de terre dévastateur à Amatrice', category: 'Science' },
    { date: '14 août 2018', isoDate: '2018-08-14', year: 2018, name: 'Effondrement du pont Morandi', context: 'Effondrement du viaduc autoroutier à Gênes', category: 'Science' },
    { date: '13 janvier 2012', isoDate: '2012-01-13', year: 2012, name: 'Naufrage du Costa Concordia', context: 'Naufrage du paquebot au large de l\'île du Giglio', category: 'Science' },
  ],
  'Q142': [ // France
    { date: '14 juillet 1789', isoDate: '1789-07-14', year: 1789, name: 'Prise de la Bastille', context: 'Événement fondateur de la Révolution française', category: 'Politique' },
    { date: '18 juin 1940', isoDate: '1940-06-18', year: 1940, name: 'Appel du 18 juin', context: 'Appel du général de Gaulle à la résistance', category: 'Politique' },
    { date: '6 juin 1944', isoDate: '1944-06-06', year: 1944, name: 'Débarquement de Normandie', context: 'Opération Overlord, début de la libération de l\'Europe', category: 'Politique' },
    { date: '25 août 1944', isoDate: '1944-08-25', year: 1944, name: 'Libération de Paris', context: 'Paris est libérée de l\'occupation allemande', category: 'Politique' },
    { date: '13 mai 1958', isoDate: '1958-05-13', year: 1958, name: 'Crise du 13 mai', context: 'Début de la crise qui mènera à la Ve République', category: 'Politique' },
    { date: '4 octobre 1958', isoDate: '1958-10-04', year: 1958, name: 'Promulgation de la Constitution', context: 'Naissance de la Ve République française', category: 'Politique' },
    { date: '3 mai 1968', isoDate: '1968-05-03', year: 1968, name: 'Mai 68', context: 'Début des événements de mai 1968', category: 'Politique' },
    { date: '10 mai 1981', isoDate: '1981-05-10', year: 1981, name: 'Élection de François Mitterrand', context: 'Premier président socialiste de la Ve République', category: 'Politique' },
    { date: '13 novembre 2015', isoDate: '2015-11-13', year: 2015, name: 'Attentats de Paris', context: 'Attaques terroristes coordonnées à Paris et Saint-Denis', category: 'Politique' },
    { date: '7 janvier 2015', isoDate: '2015-01-07', year: 2015, name: 'Attentat contre Charlie Hebdo', context: 'Attaque terroriste contre le journal satirique', category: 'Politique' },
  ],
};

/**
 * Main function to add historical events
 */
function addHistoricalEvents() {
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
    
    // Check if we have curated events for this country
    const curatedEvents = HISTORICAL_EVENTS[country.qid];
    
    if (curatedEvents && curatedEvents.length > 0) {
      const neededEvents = MIN_EVENTS - currentEventCount;
      const eventsToAdd = curatedEvents.slice(0, neededEvents).map(event => ({
        ...event,
        source: {
          type: 'curated',
          countryQid: country.qid
        }
      }));
      
      // Filter out duplicates
      const existingKeys = new Set(
        country.events.map(e => `${e.isoDate}-${e.name}`)
      );
      
      const uniqueEvents = eventsToAdd.filter(e => 
        !existingKeys.has(`${e.isoDate}-${e.name}`)
      );
      
      if (uniqueEvents.length > 0) {
        country.events.push(...uniqueEvents);
        country.events.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
        
        console.log(`  ✓ Added ${uniqueEvents.length} curated events`);
        enrichedCount++;
        totalAdded += uniqueEvents.length;
      }
    } else {
      console.log(`  ℹ No curated events available for ${country.qid}`);
    }
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
}

// Run the script
addHistoricalEvents();
